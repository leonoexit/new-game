import { AREAS, CARD_DEFS, GAME } from "./data.js";

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
    day: 1,
    nextId: 1,
    coins: 2,
    cards: [
      card("farmer", "farmer", 4, 96, { areaId: "farm" }),
      card("farm-landmark", "home_farm_landmark", 0, 0, { areaId: "farm", inHand: true, fixed: true }),
      card("town-landmark", "valley_town_landmark", 0, 0, { areaId: "town", inHand: true, fixed: true }),
      card("soil", "wild_soil", 35, 270, { areaId: "farm" }),
      card("soil2", "wild_soil", 4, 296, { areaId: "farm" }),
      card("well", "well", 67, 306, { areaId: "farm" }),
      card("hoe", "hoe", 0, 0, { inHand: true }),
      card("watering-can", "watering_can", 0, 0, { charges: 0, inHand: true }),
      card("sickle", "sickle", 0, 0, { inHand: true }),
      card("store", "general_store", 35, 330, { areaId: "town" }),
      card("shipping", "shipping_bin", 67, 548, { amount: 0, areaId: "farm" }),
    ],
    milestones: { firstSixCoins: false },
    lastMessage: "Day 1 begins. Play a card from the Hand.",
  };
}

export function hydrateGame(raw) {
  if (!raw || raw.version !== GAME.version || !Array.isArray(raw.cards)) return createGame();
  const state = clone(raw);
  if (!Number.isFinite(state.day)) state.day = 1;
  if (!Number.isFinite(state.coins)) state.coins = 0;
  state.milestones ??= { firstSixCoins: state.coins >= GAME.goalCoins };
  return state;
}

export function findCard(state, cardId) {
  return state.cards.find((item) => item.id === cardId) ?? null;
}

export function carriedItem(state, actorId) {
  return state.cards.find((item) => item.meta.parentId === actorId && !item.meta.inHand) ?? null;
}

export function isPortable(item) {
  return Boolean(CARD_DEFS[item?.typeId]?.portable);
}

export function handItems(state) {
  return state.cards.filter((item) => item.meta.inHand);
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

  if (source.typeId === "carrots" && target.typeId === "shipping_bin") return "ship";

  if (source.typeId !== "farmer") return null;
  const carried = carriedItem(state, source.id);
  if (carried?.typeId === "carrot_seeds" && target.typeId === "empty_plot") return "sow";
  if (carried?.typeId === "carrot_seeds" && target.typeId === "watered_empty_plot") return "sow_watered";
  if (carried?.typeId === "sickle" && target.typeId === "wild_soil") return "clear_grass";
  if (carried?.typeId === "hoe" && target.typeId === "cleared_ground") return "till_soil";
  if (carried?.typeId === "watering_can" && target.typeId === "well"
    && (carried.meta.charges ?? 0) < GAME.wateringCanCapacity) return "refill_watering_can";
  if (carried?.typeId === "watering_can" && (carried.meta.charges ?? 0) > 0
    && target.typeId === "empty_plot") return "water_plot";
  if (carried?.typeId === "watering_can" && (carried.meta.charges ?? 0) > 0
    && target.typeId === "planted_carrots") return "water_crop";
  if (carried?.typeId === "carrots" && target.typeId === "shipping_bin") return "ship_carried";
  if (carried) return null;
  if (canCarry(target)) return "pick_up_item";
  if (target.typeId === "ready_carrots") return "harvest";
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

export function detachItem(state, itemId) {
  const next = clone(state);
  const item = findCard(next, itemId);
  if (!item || !item.meta.parentId) return next;
  const parent = findCard(next, item.meta.parentId);
  const itemName = CARD_DEFS[item.typeId].name;
  const parentName = parent ? CARD_DEFS[parent.typeId].name : "Actor";
  item.meta.areaId = cardArea(next, parent);
  delete item.meta.parentId;
  next.lastMessage = `${itemName} detached from ${parentName}.`;
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
  if (CARD_DEFS[item.typeId].kind === "Landmark") return travelToArea(state, item.meta.areaId);
  return equipFromHand(state, itemId);
}

export function travelToArea(state, areaId) {
  const next = clone(state);
  const destination = AREAS.find((area) => area.id === areaId);
  const farmer = next.cards.find((item) => item.typeId === "farmer");
  if (!destination || !farmer) {
    return { state: next, ok: false, message: "That Area is not available." };
  }
  if (farmer.meta.areaId === areaId) {
    return { state: next, ok: false, message: `Farmer is already at ${destination.name}.` };
  }
  farmer.meta.areaId = areaId;
  farmer.x = 4;
  farmer.y = 96;
  const carried = carriedItem(next, farmer.id);
  if (carried) {
    carried.x = clamp(farmer.x + 15, 1, 70);
    carried.y = clamp(farmer.y + 32, 30, BOARD_MAX_Y);
  }
  next.lastMessage = `Farmer travelled to ${destination.name}. Travel does not advance time in this Area UI experiment.`;
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
  const item = card(`${typeId}-${state.nextId++}`, typeId, clamp(x, 1, 70), clamp(y, 30, BOARD_MAX_Y), meta);
  state.cards.push(item);
  return item;
}

export function buySeeds(state) {
  const next = clone(state);
  if (next.phase !== "playing" || farmerArea(next) !== "town") {
    return { state: next, ok: false, message: "Farmer must be in Valley Town to buy Seeds." };
  }
  if (next.coins < GAME.seedBundleCost) {
    return { state: next, ok: false, message: "The farm needs two coins for a Seed bundle." };
  }
  next.coins -= GAME.seedBundleCost;
  spawn(next, "carrot_seeds", 35, 500, { amount: GAME.seedBundleAmount, inHand: true });
  next.lastMessage = `Two coins bought ${GAME.seedBundleAmount} Carrot Seeds. They entered the Hand.`;
  return { state: next, ok: true, action: "buy_seeds", message: next.lastMessage };
}

export function resolveDrop(state, sourceId, targetId) {
  const action = dropAction(state, sourceId, targetId);
  if (!action) return { state: clone(state), ok: false, message: "Those cards do not work together right now." };

  const next = clone(state);
  const source = findCard(next, sourceId);
  const target = findCard(next, targetId);
  const events = [];

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
    removeCard(next, source.id);
    target.meta.amount = (target.meta.amount ?? 0) + amount;
    events.push(`${amount} carrots are packed for tonight's shipment.`);
  }

  if (action === "ship_carried") {
    const produce = carriedItem(next, source.id);
    const amount = produce?.meta.amount ?? 1;
    if (produce) removeCard(next, produce.id);
    target.meta.amount = (target.meta.amount ?? 0) + amount;
    events.push(`${amount} carried carrots are packed for tonight's shipment.`);
  }

  if (["clear_grass", "till_soil", "refill_watering_can", "water_plot", "sow", "sow_watered", "water_crop", "harvest"].includes(action)) {
    finishJob(next, {
      kind: action,
      workerId: source.id,
      targetId: target.id,
      sourceId: carriedItem(next, source.id)?.id,
    }, events);
  }

  next.lastMessage = events.join(" ");
  return { state: next, ok: true, action, message: next.lastMessage, events };
}

function releaseWorker(state, worker, target) {
  worker.x = clamp(target.x - 28, 1, 70);
  worker.y = clamp(target.y + 76, 30, BOARD_MAX_Y);
}

function spendWaterCharge(state, wateringCan) {
  if (!wateringCan) return 0;
  wateringCan.meta.charges = Math.max(0, (wateringCan.meta.charges ?? 0) - 1);
  return wateringCan.meta.charges;
}

function finishJob(state, job, events) {
  const worker = findCard(state, job.workerId);
  const target = findCard(state, job.targetId);
  if (!worker || !target) return;
  const areaId = target.meta.areaId;

  if (job.kind === "clear_grass") {
    target.typeId = "cleared_ground";
    target.meta = { areaId };
    events.push("The Sickle cuts away the grass. Cleared Ground remains.");
  }

  if (job.kind === "till_soil") {
    target.typeId = "empty_plot";
    target.meta = { areaId };
    events.push("The Hoe tills the Cleared Ground into an Empty Plot.");
  }

  if (job.kind === "refill_watering_can") {
    const wateringCan = findCard(state, job.sourceId);
    if (wateringCan) wateringCan.meta.charges = GAME.wateringCanCapacity;
    events.push(`The Watering Can is filled to ${GAME.wateringCanCapacity} charges.`);
  }

  if (job.kind === "water_plot") {
    const wateringCan = findCard(state, job.sourceId);
    const remaining = spendWaterCharge(state, wateringCan);
    target.typeId = "watered_empty_plot";
    target.meta = { areaId };
    events.push(`The Empty Plot is watered. The Watering Can has ${remaining} charge${remaining === 1 ? "" : "s"} left.`);
  }

  if (job.kind === "sow" || job.kind === "sow_watered") {
    const seeds = findCard(state, job.sourceId);
    if (seeds) {
      seeds.meta.amount = (seeds.meta.amount ?? 1) - 1;
      if (seeds.meta.amount <= 0) removeCard(state, seeds.id);
      else seeds.meta.parentId = worker.id;
    }
    if (job.kind === "sow_watered") {
      target.typeId = "watered_carrots";
      target.meta = { areaId, growthRemainingDays: GAME.cropGrowthDays };
      events.push("Seeds settle into watered soil. The crop will grow overnight.");
    } else {
      target.typeId = "planted_carrots";
      target.meta = { areaId };
      events.push("Tiny carrot shoots settle into the plot, ready for water.");
    }
  }

  if (job.kind === "water_crop") {
    const wateringCan = findCard(state, job.sourceId);
    const remaining = spendWaterCharge(state, wateringCan);
    target.typeId = "watered_carrots";
    target.meta = { areaId, growthRemainingDays: GAME.cropGrowthDays };
    events.push(`The crop is watered. The Watering Can has ${remaining} charge${remaining === 1 ? "" : "s"} left.`);
  }

  if (job.kind === "harvest") {
    target.typeId = "empty_plot";
    target.meta = { areaId };
    spawn(state, "carrots", target.x + 28, target.y + 54, { amount: 3, inHand: true });
    events.push("Farmer pulls three carrots by hand and adds them to the Hand.");
  }

  releaseWorker(state, worker, target);
  const carried = carriedItem(state, worker.id);
  if (carried) {
    carried.x = clamp(worker.x + 15, 1, 70);
    carried.y = clamp(worker.y + 32, 30, BOARD_MAX_Y);
  }
}

function advanceGrowingCrops(state, events) {
  state.cards.forEach((item) => {
    if (item.typeId !== "watered_carrots") return;
    item.meta.growthRemainingDays = Math.max(0, (item.meta.growthRemainingDays ?? GAME.cropGrowthDays) - 1);
    if (item.meta.growthRemainingDays === 0) {
      item.typeId = "ready_carrots";
      delete item.meta.growthRemainingDays;
      events.push("The carrots grew overnight and are ready to harvest.");
    }
  });
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
  if (farmerArea(next) !== "farm") {
    next.lastMessage = "Farmer must return to Home Farm before ending the day.";
    return next;
  }
  const events = [];
  advanceGrowingCrops(next, events);
  const earned = collectShipment(next);
  const reachedFirstMilestone = !next.milestones.firstSixCoins && next.coins >= GAME.goalCoins;
  if (reachedFirstMilestone) next.milestones.firstSixCoins = true;
  next.day += 1;
  if (earned > 0) events.push(`${earned} shipment coins arrived.`);
  if (reachedFirstMilestone) events.push("The farm reached its first six-coin milestone.");
  events.push(`Day ${next.day} begins.`);
  next.lastMessage = events.join(" ");
  return next;
}

export function currentHint(state) {
  const farmer = state.cards.find((item) => item.typeId === "farmer");
  const carried = farmer && carriedItem(state, farmer.id);
  const bin = state.cards.find((item) => item.typeId === "shipping_bin");
  if (farmerArea(state) === "town") {
    if (state.coins >= GAME.seedBundleCost) return "The General Store has Seeds for two coins. Travel home when ready.";
    return "Valley Town is open to inspect. Travel home through the Home Farm Landmark.";
  }
  if (state.cards.some((item) => item.typeId === "ready_carrots")) return carried
    ? "Mature carrots are ready. Free Farmer's hands to harvest them."
    : "Mature carrots are ready to pull by hand.";
  if (carried) return `Farmer is carrying ${CARD_DEFS[carried.typeId].name}. Play another item card to swap.`;
  if ((bin?.meta.amount ?? 0) > 0) return `${bin.meta.amount} carrots will become coins when the day ends.`;
  if (state.cards.some((item) => item.typeId === "carrots" && !item.meta.inHand)) return "Fresh produce is waiting for the Shipping Bin or Hand.";
  if (state.cards.some((item) => item.typeId === "planted_carrots")) return "A planted crop still needs water.";
  if (state.cards.some((item) => item.typeId === "watered_carrots")) return "End the day when ready; watered crops grow overnight.";
  if (state.cards.some((item) => item.typeId === "watered_empty_plot")) return "Watered soil is ready for Seeds.";
  if (!state.cards.some((item) => item.typeId === "carrot_seeds") && state.coins >= GAME.seedBundleCost) return "The General Store has Seeds for two coins.";
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
    return `${definition.name} · ${item.meta.amount} carrots`;
  }
  if (item.typeId === "watering_can") {
    const charges = item.meta.charges ?? 0;
    return charges > 0
      ? `${definition.name} · ${charges}/${GAME.wateringCanCapacity}`
      : `${definition.name} · Empty`;
  }
  if ((item.meta.amount ?? 1) > 1) return `${definition.name} ×${item.meta.amount}`;
  return definition.name;
}
