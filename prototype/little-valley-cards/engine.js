import { ACTION_COSTS, AREAS, CARD_DEFS, CROPS, GAME, cropForType, weatherForDay } from "./data.js";
import { advanceGrowingCrops, applyCropJob, applyRainToFarm, cropActionFor } from "./crop-system.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const BOARD_MAX_Y = 620;

function card(id, typeId, x, y, meta = {}) {
  return { id, typeId, x, y, meta };
}

export function createGame() {
  return {
    version: GAME.version,
    phase: "playing",
    week: 1,
    day: 1,
    weather: weatherForDay(1),
    actionPoints: GAME.actionPointsPerDay,
    nextId: 1,
    coins: 2,
    seasonStats: { coinsEarned: 0, harvestCount: 0 },
    seasonSummary: null,
    cards: [
      card("farmer", "farmer", 4, 38, { areaId: "farm" }),
      card("farm-landmark", "home_farm_landmark", 67, 30, { areaId: "farm", fixed: true }),
      card("town-landmark", "valley_town_landmark", 0, 0, { areaId: "town", inHand: true, fixed: true }),
      card("soil", "empty_plot", 35, 150, { areaId: "farm", isLand: true }),
      card("soil2", "wild_soil", 4, 230, { areaId: "farm", isLand: true }),
      card("soil3", "wild_soil", 35, 310, { areaId: "farm", isLand: true }),
      card("well", "well", 67, 230, { areaId: "farm" }),
      card("hoe", "hoe", 0, 0, { inHand: true }),
      card("watering-can", "watering_can", 0, 0, { charges: 0, inHand: true }),
      card("sickle", "sickle", 0, 0, { inHand: true }),
      card("store", "general_store", 35, 160, { areaId: "town" }),
      card("shipping", "shipping_bin", 67, 350, { amount: 0, areaId: "farm" }),
    ],
    milestones: { firstSixCoins: false },
    lastMessage: `Day 1 begins with ${GAME.actionPointsPerDay} AP. One Plot is ready; two patches are still wild.`,
  };
}

export function hydrateGame(raw) {
  if (!raw || ![16, 17, 18, 19, GAME.version].includes(raw.version) || !Array.isArray(raw.cards)) return createGame();
  const state = clone(raw);
  state.version = GAME.version;
  if (!Number.isFinite(state.day)) state.day = 1;
  if (!Number.isFinite(state.week)) state.week = 1;
  state.weather ??= weatherForDay(state.day);
  if (!Number.isFinite(state.coins)) state.coins = 0;
  if (!Number.isFinite(state.actionPoints)) state.actionPoints = GAME.actionPointsPerDay;
  state.actionPoints = clamp(state.actionPoints, 0, GAME.actionPointsPerDay);
  state.milestones ??= { firstSixCoins: state.coins >= GAME.goalCoins };
  state.seasonStats ??= { coinsEarned: 0, harvestCount: 0 };
  state.seasonSummary ??= null;
  const hadOldSeasonBoundary = ["season_summary", "season_cleanup"].includes(state.phase)
    || state.cards.some((item) => item.typeId === "crop_remains");
  if (hadOldSeasonBoundary) {
    state.cards.forEach((item) => {
      if (item.typeId !== "crop_remains") return;
      item.typeId = "empty_plot";
      item.meta = { areaId: item.meta.areaId ?? "farm", isLand: true };
    });
    state.phase = "playing";
    state.week += 1;
    state.day = 1;
    state.weather = weatherForDay(1);
    state.actionPoints = GAME.actionPointsPerDay;
    state.seasonStats = { coinsEarned: 0, harvestCount: 0 };
    state.seasonSummary = null;
  }
  if (!state.cards.some((item) => item.id === "soil3")) {
    state.cards.push(card("soil3", "wild_soil", 35, 310, { areaId: "farm", isLand: true }));
  }
  consolidateStackableCards(state);
  return state;
}

function consolidateStackableCards(state) {
  Object.entries(CARD_DEFS)
    .filter(([, definition]) => definition.stackable)
    .forEach(([typeId]) => {
      const matches = state.cards.filter((item) => item.typeId === typeId);
      if (matches.length < 2) return;
      const keeper = matches.find((item) => item.meta.parentId)
        ?? matches.find((item) => item.meta.inHand)
        ?? matches[0];
      keeper.meta.amount = matches.reduce((total, item) => total + (item.meta.amount ?? 1), 0);
      const removedIds = new Set(matches.filter((item) => item !== keeper).map((item) => item.id));
      state.cards = state.cards.filter((item) => !removedIds.has(item.id));
    });
}

export function findCard(state, cardId) {
  return state.cards.find((item) => item.id === cardId) ?? null;
}

export function carriedItem(state, actorId) {
  return state.cards.find((item) => item.meta.parentId === actorId && !item.meta.inHand) ?? null;
}

export function interactionSourceId(state, cardId) {
  const item = findCard(state, cardId);
  const parent = item?.meta.parentId ? findCard(state, item.meta.parentId) : null;
  return parent?.typeId === "farmer" ? parent.id : cardId;
}

export function isPortable(item) {
  return Boolean(CARD_DEFS[item?.typeId]?.portable);
}

export function handItems(state) {
  return state.cards.filter((item) => item.meta.inHand);
}

export function handStacks(state) {
  const stacks = new Map();
  handItems(state).forEach((item) => {
    const stack = stacks.get(item.typeId) ?? [];
    stack.push(item);
    stacks.set(item.typeId, stack);
  });
  return [...stacks.values()];
}

export function cardArea(state, item) {
  if (!item) return null;
  if (item.meta.areaId) return item.meta.areaId;
  if (item.meta.parentId) return cardArea(state, findCard(state, item.meta.parentId));
  return null;
}

export function farmerArea(state) {
  return cardArea(state, state.cards.find((item) => item.typeId === "farmer"));
}

function activateAreaLandmark(state, areaId) {
  AREAS.forEach((area) => {
    const landmark = findCard(state, area.landmarkId);
    if (!landmark) return;
    delete landmark.meta.parentId;
    landmark.meta.fixed = true;
    landmark.meta.areaId = area.id;
    if (area.id === areaId) {
      delete landmark.meta.inHand;
      landmark.x = 67;
      landmark.y = 30;
    } else {
      landmark.meta.inHand = true;
      landmark.x = 0;
      landmark.y = 0;
    }
  });
}

function canCarry(item) {
  return isPortable(item);
}

export function dropAction(state, sourceId, targetId) {
  if (state.phase !== "playing" || sourceId === targetId) return null;
  const source = findCard(state, sourceId);
  const target = findCard(state, targetId);
  if (!source || !target) return null;

  const sourceArea = cardArea(state, source);
  const targetArea = cardArea(state, target);
  if (sourceArea && targetArea && sourceArea !== targetArea) return null;
  if (source.typeId === "farmer" && targetArea && targetArea !== farmerArea(state)) return null;

  if (CARD_DEFS[source.typeId]?.cropState === "produce" && target.typeId === "shipping_bin") return "ship";

  if (source.typeId !== "farmer") return null;
  const carried = carriedItem(state, source.id);
  if (target.typeId === "general_store") return "browse_store";
  const cropAction = cropActionFor(carried, target);
  if (cropAction) return cropAction;
  if (carried?.typeId === "sickle" && target.typeId === "wild_soil") return "clear_grass";
  if (carried?.typeId === "hoe" && target.typeId === "cleared_ground") return "till_soil";
  if (carried?.typeId === "watering_can" && target.typeId === "well"
    && (carried.meta.charges ?? 0) < GAME.wateringCanCapacity) return "refill_watering_can";
  if (CARD_DEFS[carried?.typeId]?.cropState === "produce" && target.typeId === "shipping_bin") return "ship_carried";
  if (carried) return null;
  if (canCarry(target)) return "pick_up_item";
  return null;
}

export function validTargets(state, sourceId) {
  return state.cards
    .filter((target) => dropAction(state, sourceId, target.id))
    .map((target) => target.id);
}

export function tapDecision(state, selectedId, tappedId) {
  if (state.phase !== "playing") return { kind: "none" };
  if (selectedId) {
    if (selectedId === tappedId) return { kind: "clear" };
    if (dropAction(state, selectedId, tappedId)) {
      return { kind: "resolve", sourceId: selectedId, targetId: tappedId };
    }
    if (validTargets(state, tappedId).length) return { kind: "select", cardId: tappedId };
    return { kind: "none" };
  }
  if (validTargets(state, tappedId).length) return { kind: "select", cardId: tappedId };
  return { kind: "none" };
}

export function moveCard(state, cardId, x, y) {
  const next = clone(state);
  const item = findCard(next, cardId);
  if (!item || item.meta.inHand || item.meta.fixed) return next;
  item.x = clamp(x, 1, 70);
  item.y = clamp(y, 20, BOARD_MAX_Y);
  const carried = carriedItem(next, item.id);
  if (carried) {
    carried.x = clamp(item.x + 15, 1, 70);
    carried.y = clamp(item.y + 32, 30, BOARD_MAX_Y);
  }
  return next;
}

export function returnToHand(state, itemId) {
  const next = clone(state);
  const item = findCard(next, itemId);
  if (!item || !isPortable(item)) {
    return { state: next, ok: false, message: "Only portable cards can return to the Hand." };
  }
  delete item.meta.parentId;
  delete item.meta.areaId;
  item.meta.inHand = true;
  next.lastMessage = `${CARD_DEFS[item.typeId].name} returned to the Hand.`;
  return { state: next, ok: true, message: next.lastMessage };
}

export function freeHands(state) {
  const farmer = state.cards.find((item) => item.typeId === "farmer");
  const carried = farmer && carriedItem(state, farmer.id);
  if (!carried) {
    return { state: clone(state), ok: false, message: "Farmer's hands are already free." };
  }
  return returnToHand(state, carried.id);
}

export function equipFromHand(state, itemId) {
  const next = clone(state);
  const farmer = next.cards.find((item) => item.typeId === "farmer");
  const item = findCard(next, itemId);
  if (!farmer || !item?.meta.inHand || !isPortable(item)) {
    return { state: next, ok: false, message: "That card is not playable from the Hand." };
  }
  const previous = carriedItem(next, farmer.id);
  if (previous) {
    delete previous.meta.parentId;
    previous.meta.inHand = true;
  }
  delete item.meta.inHand;
  delete item.meta.areaId;
  item.meta.parentId = farmer.id;
  item.x = clamp(farmer.x + 15, 1, 70);
  item.y = clamp(farmer.y + 32, 30, BOARD_MAX_Y);
  next.lastMessage = previous
    ? `${CARD_DEFS[previous.typeId].name} returned to the Hand. Farmer played ${CARD_DEFS[item.typeId].name}.`
    : `Farmer played ${CARD_DEFS[item.typeId].name} from the Hand.`;
  return { state: next, ok: true, message: next.lastMessage };
}

export function playFromHand(state, itemId) {
  const item = findCard(state, itemId);
  if (!item?.meta.inHand) {
    return { state: clone(state), ok: false, message: "That card is not in the Hand." };
  }
  if (CARD_DEFS[item.typeId].kind === "Landmark") return travelToArea(state, item.meta.areaId, item.id);
  return equipFromHand(state, itemId);
}

export function travelToArea(state, areaId, landmarkId = null) {
  const next = clone(state);
  if (next.phase !== "playing") {
    return { state: next, ok: false, message: "Travel is closed after the Spring Week." };
  }
  const destination = AREAS.find((area) => area.id === areaId);
  const farmer = next.cards.find((item) => item.typeId === "farmer");
  if (!destination || !farmer) {
    return { state: next, ok: false, message: "That Area is not available." };
  }
  if (farmer.meta.areaId === areaId) {
    return { state: next, ok: false, message: `Farmer is already at ${destination.name}.` };
  }
  if (landmarkId && destination.landmarkId !== landmarkId) {
    return { state: next, ok: false, message: "That Landmark does not lead to this Area." };
  }
  const cost = ACTION_COSTS.travel;
  if (next.actionPoints < cost) {
    return { state: next, ok: false, message: "Not enough AP to travel." };
  }
  activateAreaLandmark(next, areaId);
  farmer.meta.areaId = areaId;
  farmer.x = 4;
  farmer.y = 38;
  const carried = carriedItem(next, farmer.id);
  if (carried) {
    carried.x = clamp(farmer.x + 15, 1, 70);
    carried.y = clamp(farmer.y + 32, 30, BOARD_MAX_Y);
  }
  next.actionPoints -= cost;
  next.lastMessage = `Farmer travelled to ${destination.name}. ${cost} AP spent · ${next.actionPoints}/${GAME.actionPointsPerDay} AP left.`;
  return { state: next, ok: true, action: "travel", message: next.lastMessage };
}

function removeCard(state, cardId) {
  const item = findCard(state, cardId);
  if (CARD_DEFS[item?.typeId]?.kind === "Tool") return;
  state.cards = state.cards.filter((candidate) => candidate.id !== cardId);
}

function spawn(state, typeId, x, y, meta = {}) {
  if (CARD_DEFS[typeId]?.kind === "Tool") {
    const existingTool = state.cards.find((item) => item.typeId === typeId);
    if (existingTool) return existingTool;
  }
  if (CARD_DEFS[typeId]?.stackable) {
    const existingStack = state.cards.find((item) => item.typeId === typeId);
    if (existingStack) {
      existingStack.meta.amount = (existingStack.meta.amount ?? 1) + (meta.amount ?? 1);
      return existingStack;
    }
  }
  const item = card(`${typeId}-${state.nextId++}`, typeId, clamp(x, 1, 70), clamp(y, 30, BOARD_MAX_Y), meta);
  state.cards.push(item);
  return item;
}

export function buySeeds(state, cropId = "carrot") {
  const next = clone(state);
  const crop = CROPS[cropId];
  if (next.phase !== "playing" || farmerArea(next) !== "town") {
    return { state: next, ok: false, message: "Farmer must be in Valley Town to buy Seeds." };
  }
  if (!crop) {
    return { state: next, ok: false, message: "That Seed is not available." };
  }
  if (next.coins < crop.seedBundleCost) {
    return { state: next, ok: false, message: `The farm needs ${crop.seedBundleCost} coins for ${crop.name} Seeds.` };
  }
  next.coins -= crop.seedBundleCost;
  spawn(next, crop.seedTypeId, 35, 500, { amount: crop.seedBundleAmount, inHand: true });
  const coinLabel = crop.seedBundleCost === 1 ? "coin" : "coins";
  next.lastMessage = `${crop.seedBundleCost} ${coinLabel} bought one ${crop.name} Seed. It entered the Hand.`;
  return { state: next, ok: true, action: "buy_seeds", message: next.lastMessage };
}

export function resolveDrop(state, sourceId, targetId) {
  const action = dropAction(state, sourceId, targetId);
  if (!action) return { state: clone(state), ok: false, message: "Those cards do not work together right now." };

  const cost = ACTION_COSTS[action] ?? 0;
  if ((state.actionPoints ?? 0) < cost) {
    return {
      state: clone(state),
      ok: false,
      action,
      message: "Not enough AP for that work. End the day to recover.",
    };
  }

  const next = clone(state);
  const source = findCard(next, sourceId);
  const target = findCard(next, targetId);
  const events = [];

  if (action === "browse_store") {
    events.push("The General Store lays out its Spring Seed cards.");
  }

  if (action === "pick_up_item") {
    delete target.meta.inHand;
    delete target.meta.areaId;
    target.meta.parentId = source.id;
    target.x = clamp(source.x + 15, 1, 70);
    target.y = clamp(source.y + 32, 30, BOARD_MAX_Y);
    events.push(`Farmer picked up ${CARD_DEFS[target.typeId].name}.`);
  }

  if (action === "ship") {
    const amount = source.meta.amount ?? 1;
    const produceName = CARD_DEFS[source.typeId].name;
    removeCard(next, source.id);
    target.meta.amount = (target.meta.amount ?? 0) + amount;
    events.push(`${amount} ${produceName} packed for tonight's shipment.`);
  }

  if (action === "ship_carried") {
    const produce = carriedItem(next, source.id);
    const amount = produce?.meta.amount ?? 1;
    const produceName = produce ? CARD_DEFS[produce.typeId].name : "produce";
    if (produce) removeCard(next, produce.id);
    target.meta.amount = (target.meta.amount ?? 0) + amount;
    events.push(`${amount} carried ${produceName} packed for tonight's shipment.`);
  }

  if (["clear_grass", "till_soil", "refill_watering_can", "water_plot", "sow", "sow_watered", "water_crop", "harvest", "dig_potatoes", "remove_crop"].includes(action)) {
    finishJob(next, {
      kind: action,
      workerId: source.id,
      targetId: target.id,
      sourceId: carriedItem(next, source.id)?.id,
    }, events);
  }

  if (cost > 0) {
    next.actionPoints -= cost;
    events.push(`${cost} AP spent · ${next.actionPoints}/${GAME.actionPointsPerDay} AP left.`);
  }

  next.lastMessage = events.join(" ");
  return { state: next, ok: true, action, message: next.lastMessage, events };
}

function finishJob(state, job, events) {
  const worker = findCard(state, job.workerId);
  const target = findCard(state, job.targetId);
  if (!worker || !target) return;
  const areaId = target.meta.areaId;
  const landMeta = { areaId, isLand: true };

  if (["water_plot", "sow", "sow_watered", "water_crop", "harvest", "dig_potatoes", "remove_crop"].includes(job.kind)) {
    applyCropJob(state, job, { findCard, removeCard, spawn }, events);
  }

  if (job.kind === "clear_grass") {
    target.typeId = "cleared_ground";
    target.meta = landMeta;
    events.push("The Sickle cuts away the grass. Cleared Ground remains.");
  }

  if (job.kind === "till_soil") {
    target.typeId = "empty_plot";
    target.meta = landMeta;
    events.push("The Hoe tills the Cleared Ground into an Empty Plot.");
  }

  if (job.kind === "refill_watering_can") {
    const wateringCan = findCard(state, job.sourceId);
    if (wateringCan) wateringCan.meta.charges = GAME.wateringCanCapacity;
    events.push(`The Watering Can is filled to ${GAME.wateringCanCapacity} charges.`);
  }


  const carried = carriedItem(state, worker.id);
  if (carried) {
    carried.x = clamp(worker.x + 15, 1, 70);
    carried.y = clamp(worker.y + 32, 30, BOARD_MAX_Y);
  }
}

function collectShipment(state) {
  const shippingBin = state.cards.find((item) => item.typeId === "shipping_bin");
  const amount = shippingBin?.meta.amount ?? 0;
  if (shippingBin) shippingBin.meta.amount = 0;
  state.coins += amount;
  return amount;
}

export function endDay(state) {
  const next = clone(state);
  if (next.phase !== "playing") return next;
  const events = [];
  advanceGrowingCrops(next, events);
  const earned = collectShipment(next);
  next.seasonStats.coinsEarned += earned;
  const reachedFirstMilestone = !next.milestones.firstSixCoins && next.coins >= GAME.goalCoins;
  if (reachedFirstMilestone) next.milestones.firstSixCoins = true;
  const seasonEnded = next.day >= GAME.seasonLengthDays;
  if (!seasonEnded) {
    next.day += 1;
    next.weather = weatherForDay(next.day);
    if (next.weather === "rainy") applyRainToFarm(next, events);
  }
  next.actionPoints = GAME.actionPointsPerDay;
  const farmer = next.cards.find((item) => item.typeId === "farmer");
  if (farmer) {
    activateAreaLandmark(next, "farm");
    farmer.meta.areaId = "farm";
    farmer.x = 4;
    farmer.y = 38;
    const carried = carriedItem(next, farmer.id);
    if (carried) {
      carried.x = clamp(farmer.x + 15, 1, 70);
      carried.y = clamp(farmer.y + 32, 30, BOARD_MAX_Y);
    }
  }
  if (earned > 0) events.push(`${earned} shipment coins arrived.`);
  if (reachedFirstMilestone) events.push("The farm reached its first six-coin milestone.");
  if (seasonEnded) {
    next.phase = "weekly_journal";
    next.actionPoints = 0;
    const cropsGrowing = next.cards.filter((item) => ["thirsty", "watered", "ready", "partial_harvest"].includes(CARD_DEFS[item.typeId]?.cropState)).length;
    next.seasonSummary = { ...next.seasonStats, cropsGrowing };
    events.push(`${GAME.seasonName} Week ${next.week} is complete. The farm carries on.`);
  } else {
    events.push(`Day ${next.day} begins at Home Farm with ${GAME.actionPointsPerDay} AP.`);
  }
  next.lastMessage = events.join(" ");
  return next;
}

export function continueFarm(state) {
  const next = clone(state);
  if (next.phase === "weekly_journal") {
    next.phase = "playing";
    next.week += 1;
    next.day = 1;
    next.weather = weatherForDay(1);
    next.actionPoints = GAME.actionPointsPerDay;
    next.seasonStats = { coinsEarned: 0, harvestCount: 0 };
    next.seasonSummary = null;
    next.lastMessage = `${GAME.seasonName} Week ${next.week} begins. The same farm continues with ${GAME.actionPointsPerDay} AP.`;
  }
  return next;
}

export function currentHint(state) {
  const farmer = state.cards.find((item) => item.typeId === "farmer");
  const carried = farmer && carriedItem(state, farmer.id);
  const bin = state.cards.find((item) => item.typeId === "shipping_bin");
  if (farmerArea(state) === "town") {
    if (state.coins >= Math.min(...Object.values(CROPS).map((crop) => crop.seedBundleCost))) return "The General Store has Spring Seeds to choose from. Drag Home Farm onto the table when ready.";
    return "Valley Town is open to inspect. Drag the Home Farm Landmark onto the table to return.";
  }
  if (state.actionPoints <= 0) return "No AP remains. Free actions still work; end the day when ready to recover.";
  if (state.cards.some((item) => CARD_DEFS[item.typeId]?.cropState === "partial_harvest")) return "Potato Mounds remain. Equip the Hoe to finish digging.";
  if (state.cards.some((item) => CARD_DEFS[item.typeId]?.cropState === "ready" && cropForType(item.typeId)?.harvestTool)) return "Mature Potatoes are ready. Equip the Hoe to dig them.";
  if (state.cards.some((item) => CARD_DEFS[item.typeId]?.cropState === "ready")) return carried
    ? "A crop is ready. Free Farmer's hands to harvest it."
    : "A mature crop is ready to harvest by hand.";
  if (carried) return `Farmer is carrying ${CARD_DEFS[carried.typeId].name}. Play another item card to swap.`;
  if ((bin?.meta.amount ?? 0) > 0) return `${bin.meta.amount} produce will become coins when the day ends.`;
  if (state.cards.some((item) => CARD_DEFS[item.typeId]?.cropState === "produce" && !item.meta.inHand)) return "Fresh produce is waiting for the Shipping Bin or Hand.";
  if (state.cards.some((item) => CARD_DEFS[item.typeId]?.cropState === "thirsty")) return "A planted crop still needs water.";
  if (state.cards.some((item) => CARD_DEFS[item.typeId]?.cropState === "watered")) return "End the day when ready; watered crops grow overnight.";
  if (state.cards.some((item) => item.typeId === "watered_empty_plot")) return "Watered soil is ready for Seeds.";
  if (!state.cards.some((item) => CARD_DEFS[item.typeId]?.cropState === "seeds") && state.coins >= 2) return "The General Store has Carrot, Green Bean and Potato Seeds.";
  if (state.cards.some((item) => item.typeId === "empty_plot")) return "Cleared soil can be watered or sown first.";
  if (state.cards.some((item) => item.typeId === "cleared_ground")) return "Equip the Hoe to till the Cleared Ground.";
  if (state.cards.some((item) => item.typeId === "wild_soil")) return "Equip the Sickle to cut the grass.";
  return "The farm is waiting for your next move.";
}

export function cardLabel(state, item) {
  const definition = CARD_DEFS[item.typeId];
  if (definition.kind === "Person") {
    const carried = carriedItem(state, item.id);
    if (carried) return `${definition.name} · Carrying ${CARD_DEFS[carried.typeId].name}`;
  }
  if (item.typeId === "shipping_bin" && (item.meta.amount ?? 0) > 0) {
    return `${definition.name} · ${item.meta.amount} produce`;
  }
  if (item.typeId === "watering_can") {
    const charges = item.meta.charges ?? 0;
    return charges > 0
      ? `${definition.name} · ${charges}/${GAME.wateringCanCapacity}`
      : `${definition.name} · Empty`;
  }
  if (["thirsty", "watered"].includes(definition.cropState)) {
    const crop = cropForType(item.typeId);
    const days = item.meta.growthRemainingDays ?? crop?.growthDays ?? GAME.cropGrowthDays;
    return `${definition.name} · ${days}d`;
  }
  if ((item.meta.amount ?? 1) > 1) return `${definition.name} ×${item.meta.amount}`;
  return definition.name;
}
