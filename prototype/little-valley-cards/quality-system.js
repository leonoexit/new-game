import { CARD_DEFS, CROPS, cropForType } from "./data.js";

export const QUALITY = Object.freeze({
  choice: Object.freeze({
    id: "choice",
    name: "Choice",
    shipmentMultiplier: 1,
  }),
});

const cropCareStates = new Set(["thirsty", "watered", "early_ready"]);

export function ensureFarmMemory(state) {
  state.memoryBook ??= {};
  state.memoryBook.discoveries = Array.isArray(state.memoryBook.discoveries)
    ? state.memoryBook.discoveries.filter((cropId) => CROPS[cropId])
    : [];
  state.memoryBook.firstHarvest ??= null;
  state.memoryBook.firstQuality ??= null;
  state.memoryBook.choiceCrops = Array.isArray(state.memoryBook.choiceCrops)
    ? state.memoryBook.choiceCrops.filter((cropId) => CROPS[cropId])
    : [];
  state.memoryBook.milestones = Array.isArray(state.memoryBook.milestones)
    ? state.memoryBook.milestones
    : [];
  state.seasonStats ??= {};
  state.seasonStats.memories = Array.isArray(state.seasonStats.memories)
    ? state.seasonStats.memories
    : [];
  return state.memoryBook;
}

function rememberThisWeek(state, memory) {
  ensureFarmMemory(state);
  if (!state.seasonStats.memories.some((entry) => entry.id === memory.id)) {
    state.seasonStats.memories.push(memory);
  }
}

export function recordCropDiscovery(state, cropId, events = []) {
  const crop = CROPS[cropId];
  if (!crop) return false;
  const memoryBook = ensureFarmMemory(state);
  if (memoryBook.discoveries.includes(cropId)) return false;
  memoryBook.discoveries.push(cropId);
  const memory = {
    id: `discovery:${cropId}`,
    kind: "discovery",
    cropId,
    week: state.week,
    day: state.day,
    text: `${crop.name} joined the farm for the first time.`,
  };
  rememberThisWeek(state, memory);
  events.push(memory.text);
  return true;
}

export function recordHarvestMemory(state, cropId, quality, events = []) {
  const crop = CROPS[cropId];
  if (!crop) return;
  const memoryBook = ensureFarmMemory(state);
  if (!memoryBook.firstHarvest) {
    memoryBook.firstHarvest = { cropId, week: state.week, day: state.day };
    const memory = {
      id: "first-harvest",
      kind: "first_harvest",
      cropId,
      week: state.week,
      day: state.day,
      text: `${crop.name} became the farm's first harvest.`,
    };
    rememberThisWeek(state, memory);
    events.push(memory.text);
  }
  if (quality === "choice" && !memoryBook.firstQuality) {
    memoryBook.firstQuality = { cropId, week: state.week, day: state.day };
    const memory = {
      id: "first-quality",
      kind: "first_quality",
      cropId,
      week: state.week,
      day: state.day,
      text: `Care transformed ${crop.name} into the farm's first Choice harvest.`,
    };
    rememberThisWeek(state, memory);
    events.push(memory.text);
  }
  if (quality === "choice" && !memoryBook.choiceCrops.includes(cropId)) {
    memoryBook.choiceCrops.push(cropId);
    const firstChoice = memoryBook.choiceCrops.length === 1;
    if (!firstChoice) {
      const memory = {
        id: `choice:${cropId}`,
        kind: "quality_discovery",
        cropId,
        week: state.week,
        day: state.day,
        text: `Choice ${crop.name} joined the farm's care memories.`,
      };
      rememberThisWeek(state, memory);
      events.push(memory.text);
    }
  }
}

export function recordMilestoneMemory(state, id, text) {
  const memoryBook = ensureFarmMemory(state);
  if (memoryBook.milestones.includes(id)) return false;
  memoryBook.milestones.push(id);
  rememberThisWeek(state, {
    id: `milestone:${id}`,
    kind: "milestone",
    week: state.week,
    day: state.day,
    text,
  });
  return true;
}

export function canTendCrop(item) {
  const definition = CARD_DEFS[item?.typeId];
  return Boolean(cropForType(item?.typeId)
    && cropCareStates.has(definition?.cropState)
    && !item.meta.tended);
}

export function tendCrop(item) {
  if (!canTendCrop(item)) return false;
  item.meta.tended = true;
  return true;
}

export function harvestQuality(item) {
  return item?.meta.tended ? "choice" : null;
}

export function produceTypeForHarvest(crop, item) {
  return harvestQuality(item) === "choice" ? crop.choiceProduceTypeId : crop.produceTypeId;
}

export function qualityNameFor(item) {
  const quality = CARD_DEFS[item?.typeId]?.quality;
  return quality ? QUALITY[quality]?.name ?? quality : null;
}
