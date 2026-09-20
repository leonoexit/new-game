import { CARD_DEFS, CROPS, PEOPLE, PROTOTYPE_2, prototype2ConditionForSeed } from "./data.js";
import { ensureFarmMemory } from "./quality-system.js";
import { ensurePeopleMemory, relationshipStateFor } from "./person-system.js";

const actionCategories = Object.freeze({
  travel: "travel",
  spend_time: "people",
  share_produce: "people",
});

export function normalizeRunSeed(seed) {
  const numeric = Math.trunc(Number(seed));
  return Number.isFinite(numeric) && numeric !== 0 ? Math.abs(numeric) : 1;
}

export function createRunRecord(seed) {
  const normalizedSeed = normalizeRunSeed(seed);
  return {
    seed: normalizedSeed,
    conditionId: prototype2ConditionForSeed(normalizedSeed).id,
    telemetry: { apSpent: { farming: 0, travel: 0, people: 0 } },
    chronicle: null,
  };
}

export function ensureRunRecord(state) {
  state.run = state.run && typeof state.run === "object" ? state.run : createRunRecord(1);
  state.run.seed = normalizeRunSeed(state.run.seed);
  if (!PROTOTYPE_2.conditions[state.run.conditionId]) {
    state.run.conditionId = prototype2ConditionForSeed(state.run.seed).id;
  }
  delete state.run.goalId;
  state.run.telemetry ??= {};
  state.run.telemetry.apSpent ??= {};
  for (const category of ["farming", "travel", "people"]) {
    const value = state.run.telemetry.apSpent[category];
    state.run.telemetry.apSpent[category] = Number.isFinite(value) && value >= 0 ? value : 0;
  }
  state.run.chronicle ??= null;
  return state.run;
}

export function recordActionPointUse(state, action, cost) {
  if (state.prototype !== 2 || cost <= 0) return;
  const run = ensureRunRecord(state);
  const category = actionCategories[action] ?? "farming";
  run.telemetry.apSpent[category] += cost;
}

export function lifePathProgress(state, pathId) {
  const path = PROTOTYPE_2.paths[pathId];
  if (!path) return null;
  ensureFarmMemory(state);
  ensurePeopleMemory(state);
  if (path.id === "care_for_land") {
    const cropIds = [...new Set(state.memoryBook.choiceCrops.filter((cropId) => CROPS[cropId]))];
    return {
      id: path.id,
      name: path.name,
      description: path.description,
      current: cropIds.length,
      target: path.target,
      complete: cropIds.length >= path.target,
      detail: cropIds.length
        ? cropIds.map((cropId) => CROPS[cropId].name).join(" · ")
        : "No Choice crop memory yet.",
    };
  }
  const relationships = Object.keys(PEOPLE).map((personId) => ({
    personId,
    name: PEOPLE[personId].name,
    relationship: relationshipStateFor(state, personId),
  }));
  const close = relationships.filter((entry) => entry.relationship === "Close");
  const familiarOrClose = relationships.filter((entry) => ["Familiar", "Close"].includes(entry.relationship));
  const complete = close.length >= 1 && familiarOrClose.length >= 2;
  const current = (close.length >= 1 ? 1 : 0) + (familiarOrClose.length >= 2 ? 1 : 0);
  return {
    id: path.id,
    name: path.name,
    description: path.description,
    current,
    target: path.target,
    complete,
    detail: familiarOrClose.length
      ? familiarOrClose.map((entry) => `${entry.name} · ${entry.relationship}`).join(" · ")
      : "Every resident is still New.",
  };
}

export function lifePathProgresses(state) {
  return Object.keys(PROTOTYPE_2.paths).map((pathId) => lifePathProgress(state, pathId));
}

function livingCropCount(state) {
  return state.cards.filter((item) => ["thirsty", "watered", "early_ready", "ready", "partial_harvest"]
    .includes(CARD_DEFS[item.typeId]?.cropState)).length;
}

function farmParagraph(state) {
  ensureFarmMemory(state);
  const discoveries = state.memoryBook.discoveries.length;
  const choice = state.memoryBook.choiceCrops.length;
  const living = livingCropCount(state);
  if (discoveries === 0) return `The three fields stayed close to their starting shape, with ${living} living crop${living === 1 ? "" : "s"} at Spring's end.`;
  const cropWord = discoveries === 1 ? "crop family" : "crop families";
  const care = choice > 0 ? ` Care left ${choice} Choice ${choice === 1 ? "memory" : "memories"}.` : " No Choice harvest entered the farm's memory.";
  return `The farm discovered ${discoveries} ${cropWord} and ended with ${living} living crop${living === 1 ? "" : "s"} on its Land.${care}`;
}

function peopleParagraph(state) {
  ensurePeopleMemory(state);
  const relationships = Object.keys(PEOPLE).map((personId) => ({
    name: PEOPLE[personId].name,
    relationship: relationshipStateFor(state, personId),
    moments: state.memoryBook.people[personId].moments.length,
  }));
  const remembered = relationships.filter((entry) => entry.moments > 0);
  if (!remembered.length) return "No shared Person moment entered this Spring's memory.";
  return `${remembered.map((entry) => `${entry.name} became ${entry.relationship}`).join("; ")}.`;
}

function timeParagraph(state) {
  const entries = Object.entries(ensureRunRecord(state).telemetry.apSpent);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total === 0) return "The Spring ended without spending AP.";
  const max = Math.max(...entries.map(([, value]) => value));
  const leaders = entries.filter(([, value]) => value === max).map(([category]) => category);
  if (leaders.length > 1) return `The Spring's ${total} spent AP were shared most evenly between ${leaders.join(" and ")}.`;
  return `Of ${total} AP spent, ${leaders[0]} received the largest share.`;
}

export function buildSpringChronicle(state) {
  const [land, neighbors] = lifePathProgresses(state);
  const condition = PROTOTYPE_2.conditions[ensureRunRecord(state).conditionId];
  const landWeight = land.current / land.target;
  const neighborWeight = neighbors.current / neighbors.target;
  let pathParagraph = "No single path claimed this Spring; its shape stayed open until the end.";
  if (landWeight > neighborWeight) pathParagraph = `Care for the Land became the clearer thread: ${land.detail}`;
  if (neighborWeight > landWeight) pathParagraph = `Knowing the neighbors became the clearer thread: ${neighbors.detail}`;
  if (landWeight > 0 && landWeight === neighborWeight) {
    pathParagraph = `Care for the Land and life with the neighbors grew side by side: ${land.detail}; ${neighbors.detail}`;
  }
  return {
    title: "This Spring became yours",
    condition: condition.name,
    paths: [land, neighbors],
    paragraphs: [farmParagraph(state), peopleParagraph(state), timeParagraph(state), pathParagraph],
  };
}
