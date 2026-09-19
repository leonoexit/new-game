import { CARD_DEFS, GAME } from "./data.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function card(id, typeId, x, y, meta = {}) {
  return { id, typeId, x, y, meta };
}

export function createGame() {
  return {
    version: GAME.version,
    phase: "playing",
    started: false,
    paused: false,
    remainingMs: GAME.dayLengthMs,
    nextId: 1,
    cards: [
      card("farmer", "farmer", 4, 72),
      card("seeds", "carrot_seeds", 66, 72, { amount: 2 }),
      card("soil", "wild_soil", 35, 258),
      card("well", "well", 67, 286),
      card("market", "roadside_market", 7, 526),
    ],
    jobs: [],
    lastMessage: "Drag Farmer onto Wild Soil.",
  };
}

export function hydrateGame(raw) {
  if (!raw || raw.version !== GAME.version || !Array.isArray(raw.cards) || !Array.isArray(raw.jobs)) return createGame();
  const state = clone(raw);
  if (typeof state.started !== "boolean") state.started = false;
  state.paused = false;
  return state;
}

export function findCard(state, cardId) {
  return state.cards.find((item) => item.id === cardId) ?? null;
}

export function isBusy(state, cardId) {
  const item = findCard(state, cardId);
  const actorId = item?.meta.parentId ?? cardId;
  return state.jobs.some((job) => job.workerId === actorId || job.targetId === cardId);
}

export function carriedItem(state, actorId) {
  return state.cards.find((item) => item.meta.parentId === actorId) ?? null;
}

function canCarry(item) {
  return item?.typeId === "carrot_seeds" || item?.typeId === "water";
}

export function dropAction(state, sourceId, targetId) {
  if (state.phase !== "playing" || sourceId === targetId) return null;
  const source = findCard(state, sourceId);
  const target = findCard(state, targetId);
  if (!source || !target || isBusy(state, sourceId) || isBusy(state, targetId)) return null;

  if (canCarry(source) && target.typeId === "farmer" && !carriedItem(state, target.id)) return "attach_item";
  if (source.typeId === "carrots" && target.typeId === "roadside_market") return "sell";

  if (source.typeId !== "farmer") return null;
  const carried = carriedItem(state, source.id);
  if (carried?.typeId === "carrot_seeds" && target.typeId === "empty_plot") return "sow";
  if (carried?.typeId === "water" && target.typeId === "planted_carrots") return "water_crop";
  if (carried) return null;
  if (target.typeId === "wild_soil") return "clear_soil";
  if (target.typeId === "well") return "draw_water";
  if (target.typeId === "ready_carrots") return "harvest";
  return null;
}

export function validTargets(state, sourceId) {
  return state.cards
    .filter((target) => dropAction(state, sourceId, target.id))
    .map((target) => target.id);
}

export function moveCard(state, cardId, x, y) {
  const next = clone(state);
  const item = findCard(next, cardId);
  if (!item || isBusy(next, cardId)) return next;
  item.x = clamp(x, 1, 70);
  item.y = clamp(y, 20, 600);
  const carried = carriedItem(next, item.id);
  if (carried) {
    carried.x = clamp(item.x + 15, 1, 70);
    carried.y = clamp(item.y + 32, 30, 600);
  }
  return next;
}

export function detachItem(state, itemId) {
  const next = clone(state);
  const item = findCard(next, itemId);
  if (!item || !item.meta.parentId || isBusy(next, itemId)) return next;
  const itemName = CARD_DEFS[item.typeId].name;
  delete item.meta.parentId;
  next.lastMessage = `${itemName} detached from Farmer.`;
  return next;
}

function startJob(state, kind, worker, target, durationMs, sourceId = null) {
  worker.x = clamp(target.x + 4, 1, 70);
  worker.y = target.y + 18;
  state.jobs.push({
    id: `job-${state.nextId++}`,
    kind,
    workerId: worker.id,
    targetId: target.id,
    sourceId,
    durationMs,
    remainingMs: durationMs,
  });
}

function removeCard(state, cardId) {
  state.cards = state.cards.filter((item) => item.id !== cardId);
}

function spawn(state, typeId, x, y, meta = {}) {
  const item = card(`${typeId}-${state.nextId++}`, typeId, clamp(x, 1, 70), clamp(y, 30, 600), meta);
  state.cards.push(item);
  return item;
}

export function resolveDrop(state, sourceId, targetId) {
  const action = dropAction(state, sourceId, targetId);
  if (!action) return { state: clone(state), ok: false, message: "Those cards do not work together yet." };

  const next = clone(state);
  next.started = true;
  const source = findCard(next, sourceId);
  const target = findCard(next, targetId);

  if (action === "attach_item") {
    source.meta.parentId = target.id;
    source.x = clamp(target.x + 15, 1, 70);
    source.y = clamp(target.y + 32, 30, 600);
    next.lastMessage = `Farmer is carrying ${CARD_DEFS[source.typeId].name}. Drag the stack to its destination.`;
  }

  if (action === "water_crop") {
    startJob(next, action, source, target, 2_500, carriedItem(next, source.id).id);
    next.lastMessage = "Farmer is watering the carrot plot.";
  }

  if (action === "sell") {
    const amount = source.meta.amount ?? 1;
    removeCard(next, source.id);
    let purse = next.cards.find((item) => item.typeId === "coin_purse");
    if (!purse) purse = spawn(next, "coin_purse", target.x + 27, target.y + 18, { amount: 0 });
    purse.meta.amount += amount;
    next.lastMessage = `${amount} carrots sold. The first farm income is real.`;
    if (purse.meta.amount >= GAME.goalCoins) next.phase = "won";
  }

  if (action === "clear_soil") {
    startJob(next, action, source, target, 3_500);
    next.lastMessage = "Farmer is clearing the ground.";
  }

  if (action === "draw_water") {
    startJob(next, action, source, target, 2_500);
    next.lastMessage = "Farmer is drawing water.";
  }

  if (action === "sow") {
    startJob(next, action, source, target, 3_000, carriedItem(next, source.id).id);
    next.lastMessage = "Farmer is sowing carrot seed.";
  }

  if (action === "harvest") {
    startJob(next, action, source, target, 3_500);
    next.lastMessage = "Farmer is pulling the carrots.";
  }

  return { state: next, ok: true, action, message: next.lastMessage };
}

function releaseWorker(state, worker, target) {
  worker.x = clamp(target.x - 28, 1, 70);
  worker.y = clamp(target.y + 76, 30, 600);
}

function finishJob(state, job, events) {
  const worker = findCard(state, job.workerId);
  const target = findCard(state, job.targetId);
  if (!worker || !target) return;

  if (job.kind === "clear_soil") {
    target.typeId = "empty_plot";
    target.meta = {};
    events.push("The wild patch is now an Empty Plot.");
  }

  if (job.kind === "draw_water") {
    const water = spawn(state, "water", worker.x + 15, worker.y + 32, { parentId: worker.id });
    water.x = clamp(worker.x + 15, 1, 70);
    events.push("Farmer is now carrying Water.");
  }

  if (job.kind === "sow") {
    const seeds = findCard(state, job.sourceId);
    if (seeds) {
      seeds.meta.amount = (seeds.meta.amount ?? 1) - 1;
      if (seeds.meta.amount <= 0) removeCard(state, seeds.id);
      else {
        seeds.meta.parentId = worker.id;
      }
    }
    target.typeId = "planted_carrots";
    target.meta = {};
    events.push("Tiny carrot shoots settle into the plot.");
  }

  if (job.kind === "water_crop") {
    removeCard(state, job.sourceId);
    target.typeId = "watered_carrots";
    target.meta = { growthRemainingMs: 7_000 };
    events.push("The crop is watered. Time will do the rest.");
  }

  if (job.kind === "harvest") {
    target.typeId = "empty_plot";
    target.meta = {};
    spawn(state, "carrots", target.x + 28, target.y + 54, { amount: 3 });
    events.push("Three carrots bounce out of the earth.");
  }

  releaseWorker(state, worker, target);
  const carried = carriedItem(state, worker.id);
  if (carried) {
    carried.x = clamp(worker.x + 15, 1, 70);
    carried.y = clamp(worker.y + 32, 30, 600);
  }
}

export function advance(state, deltaMs) {
  const next = clone(state);
  const events = [];
  if (next.phase !== "playing" || !next.started || next.paused || deltaMs <= 0) return { state: next, events };

  next.remainingMs = Math.max(0, next.remainingMs - deltaMs);

  next.cards.forEach((item) => {
    if (item.typeId !== "watered_carrots") return;
    item.meta.growthRemainingMs = Math.max(0, item.meta.growthRemainingMs - deltaMs);
    if (item.meta.growthRemainingMs === 0) {
      item.typeId = "ready_carrots";
      delete item.meta.growthRemainingMs;
      events.push("The carrots are ready to harvest.");
    }
  });

  next.jobs.forEach((job) => { job.remainingMs = Math.max(0, job.remainingMs - deltaMs); });
  const finished = next.jobs.filter((job) => job.remainingMs === 0);
  next.jobs = next.jobs.filter((job) => job.remainingMs > 0);
  finished.forEach((job) => finishJob(next, job, events));

  if (events.length) next.lastMessage = events.at(-1);
  if (next.remainingMs === 0 && next.phase === "playing") {
    next.phase = "lost";
    next.lastMessage = "Dusk arrived before the first sale.";
  }
  return { state: next, events };
}

export function togglePause(state) {
  const next = clone(state);
  if (next.phase === "playing" && !next.started) next.started = true;
  else if (next.phase === "playing") next.paused = !next.paused;
  return next;
}

export function currentHint(state) {
  if (state.phase === "won") return "You completed one full farm loop.";
  if (state.phase === "lost") return "Reset the day and try a shorter route.";
  if (state.cards.some((item) => item.typeId === "carrots")) return "Drag Carrots onto Roadside Market.";
  if (state.cards.some((item) => item.typeId === "ready_carrots")) return "Drag Farmer onto Mature Carrots.";
  if (state.cards.some((item) => item.typeId === "watered_carrots")) return "The crop is growing. Time pauses while you hold a card.";
  if (state.cards.some((item) => item.typeId === "planted_carrots")) {
    const farmer = state.cards.find((item) => item.typeId === "farmer");
    const carried = farmer && carriedItem(state, farmer.id);
    if (carried?.typeId === "water") return "Drag Farmer · Carrying Water onto the Carrot Plot.";
    if (carried) return `Pull ${CARD_DEFS[carried.typeId].name} away from Farmer, then visit the Stone Well.`;
    if (state.cards.some((item) => item.typeId === "water")) return "Give Water to Farmer.";
    return "Drag Farmer onto the Stone Well.";
  }
  const plot = state.cards.find((item) => item.typeId === "empty_plot");
  if (plot) {
    const farmer = state.cards.find((item) => item.typeId === "farmer");
    const carried = farmer && carriedItem(state, farmer.id);
    return carried?.typeId === "carrot_seeds"
      ? "Drag Farmer · Carrying Carrot Seeds onto the Empty Plot."
      : "Give Carrot Seeds to Farmer.";
  }
  return "Drag Farmer onto Wild Soil.";
}

export function cardLabel(state, item) {
  const definition = CARD_DEFS[item.typeId];
  if (definition.kind === "Person") {
    const carried = carriedItem(state, item.id);
    if (carried) return `${definition.name} · Carrying ${CARD_DEFS[carried.typeId].name}`;
  }
  if ((item.meta.amount ?? 1) > 1) return `${definition.name} ×${item.meta.amount}`;
  return definition.name;
}
