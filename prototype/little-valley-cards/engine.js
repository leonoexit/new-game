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
      card("soil", "wild_soil", 35, 250),
      card("soil2", "wild_soil", 4, 276),
      card("well", "well", 67, 286),
      card("market", "roadside_market", 7, 526),
    ],
    lastMessage: "Two plots, one Farmer. Choose which Wild Soil to clear first.",
  };
}

export function hydrateGame(raw) {
  if (!raw || raw.version !== GAME.version || !Array.isArray(raw.cards)) return createGame();
  const state = clone(raw);
  if (typeof state.started !== "boolean") state.started = false;
  state.paused = false;
  return state;
}

export function findCard(state, cardId) {
  return state.cards.find((item) => item.id === cardId) ?? null;
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
  if (!source || !target) return null;

  if (source.typeId === "carrots" && target.typeId === "roadside_market") return "sell";

  if (source.typeId !== "farmer") return null;
  const carried = carriedItem(state, source.id);
  if (carried?.typeId === "carrot_seeds" && target.typeId === "empty_plot") return "sow";
  if (carried?.typeId === "water" && target.typeId === "planted_carrots") return "water_crop";
  if (carried) return null;
  if (canCarry(target)) return "pick_up_item";
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
  if (!item) return next;
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
  if (!item || !item.meta.parentId) return next;
  const itemName = CARD_DEFS[item.typeId].name;
  delete item.meta.parentId;
  next.lastMessage = `${itemName} detached from Farmer.`;
  return next;
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

  if (action === "pick_up_item") {
    target.meta.parentId = source.id;
    target.x = clamp(source.x + 15, 1, 70);
    target.y = clamp(source.y + 32, 30, 600);
    next.lastMessage = `Farmer picked up ${CARD_DEFS[target.typeId].name}. Drag the stack to its destination.`;
  }

  if (action === "water_crop") {
    const events = [];
    finishJob(next, { kind: action, workerId: source.id, targetId: target.id, sourceId: carriedItem(next, source.id).id }, events);
    next.lastMessage = events.at(-1);
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
    const events = [];
    finishJob(next, { kind: action, workerId: source.id, targetId: target.id }, events);
    next.lastMessage = events.at(-1);
  }

  if (action === "draw_water") {
    const events = [];
    finishJob(next, { kind: action, workerId: source.id, targetId: target.id }, events);
    next.lastMessage = events.at(-1);
  }

  if (action === "sow") {
    const events = [];
    finishJob(next, { kind: action, workerId: source.id, targetId: target.id, sourceId: carriedItem(next, source.id).id }, events);
    next.lastMessage = events.at(-1);
  }

  if (action === "harvest") {
    const events = [];
    finishJob(next, { kind: action, workerId: source.id, targetId: target.id }, events);
    next.lastMessage = events.at(-1);
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
  if (state.phase === "won") return "You managed two plots through a full farm day.";
  if (state.phase === "lost") return "Reset the day and try a shorter route.";
  const farmer = state.cards.find((item) => item.typeId === "farmer");
  const carried = farmer && carriedItem(state, farmer.id);
  if (carried) return `Farmer is carrying ${CARD_DEFS[carried.typeId].name}.`;
  if (state.cards.some((item) => item.typeId === "carrots")) return "Fresh produce is waiting on the board.";
  if (state.cards.some((item) => item.typeId === "ready_carrots")) return "A crop is ready for work.";
  if (state.cards.some((item) => item.typeId === "planted_carrots")) return "Some planted crops are still thirsty.";
  if (state.cards.some((item) => item.typeId === "watered_carrots")) return "Some crops are growing; the rest of the farm is still available.";
  if (state.cards.some((item) => item.typeId === "empty_plot")) return "Cleared soil is available for the next decision.";
  if (state.cards.some((item) => item.typeId === "wild_soil")) return "Two plots, one Farmer. Organize the day your way.";
  return "The farm is waiting for your next move.";
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
