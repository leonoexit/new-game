import { CARD_DEFS, GAME, PROTOTYPE_2, cropForType } from "./data.js";
import {
  harvestQuality,
  produceTypeForHarvest,
  recordCropDiscovery,
  recordHarvestMemory,
} from "./quality-system.js";

const landMeta = (item) => ({ areaId: item.meta.areaId, isLand: true });
const removableCropStates = new Set(["thirsty", "watered", "early_ready", "ready"]);

export function harvestStageFor(crop, cropState) {
  return crop?.harvestStages?.find((stage) => stage.state === cropState) ?? null;
}

export function cropActionFor(carried, target) {
  const targetState = CARD_DEFS[target?.typeId]?.cropState;
  if (carried?.typeId === "sickle" && removableCropStates.has(targetState)) return "remove_crop";
  if (CARD_DEFS[carried?.typeId]?.cropState === "seeds" && target.typeId === "empty_plot") return "sow";
  if (CARD_DEFS[carried?.typeId]?.cropState === "seeds" && target.typeId === "watered_empty_plot") return "sow_watered";
  if (carried?.typeId === "watering_can" && (carried.meta.charges ?? 0) > 0 && target.typeId === "empty_plot") return "water_plot";
  if (carried?.typeId === "watering_can" && (carried.meta.charges ?? 0) > 0
    && ["thirsty", "early_ready"].includes(targetState)) return "water_crop";

  const targetCrop = cropForType(target?.typeId);
  const harvestStage = harvestStageFor(targetCrop, targetState);
  if (!harvestStage) return null;
  if (targetCrop.harvestTool) return carried?.typeId === targetCrop.harvestTool ? "harvest_crop" : null;
  return carried ? null : "harvest_crop";
}

export function applyCropJob(state, job, helpers, events) {
  const { findCard, removeCard } = helpers;
  const worker = findCard(state, job.workerId);
  const target = findCard(state, job.targetId);
  if (!worker || !target) return false;
  const meta = landMeta(target);

  if (job.kind === "remove_crop") {
    const crop = cropForType(target.typeId);
    target.typeId = "empty_plot";
    target.meta = meta;
    events.push(`The Sickle removes the ${crop?.name ?? "crop"}. The Land returns to an Empty Plot.`);
    return true;
  }

  if (job.kind === "water_plot") {
    const remaining = spendWaterCharge(findCard(state, job.sourceId));
    target.typeId = "watered_empty_plot";
    target.meta = meta;
    events.push(`The Empty Plot is watered. The Watering Can has ${remaining} charge${remaining === 1 ? "" : "s"} left.`);
    return true;
  }
  if (job.kind === "sow" || job.kind === "sow_watered") {
    const seeds = findCard(state, job.sourceId);
    const crop = cropForType(seeds?.typeId);
    if (!crop) return false;
    seeds.meta.amount = (seeds.meta.amount ?? 1) - 1;
    if (seeds.meta.amount <= 0) removeCard(state, seeds.id);
    else seeds.meta.parentId = worker.id;
    target.typeId = job.kind === "sow_watered" ? crop.wateredTypeId : crop.plantedTypeId;
    target.meta = { ...meta, cropId: crop.id, growthRemainingDays: crop.growthDays, growthTotalDays: crop.growthDays };
    recordCropDiscovery(state, crop.id, events);
    events.push(job.kind === "sow_watered"
      ? `${crop.name} Seeds settle into watered soil. They need ${crop.growthDays} watered nights.`
      : `${crop.name} settle into the plot, ready for water.`);
    return true;
  }
  if (job.kind === "water_crop") {
    const crop = cropForType(target.typeId);
    if (!crop) return false;
    const remaining = spendWaterCharge(findCard(state, job.sourceId));
    const growthRemainingDays = target.meta.growthRemainingDays ?? crop.growthDays;
    target.typeId = crop.wateredTypeId;
    target.meta = {
      ...target.meta,
      ...meta,
      cropId: crop.id,
      growthRemainingDays,
      growthTotalDays: target.meta.growthTotalDays ?? crop.growthDays,
    };
    events.push(`The crop is watered. The Watering Can has ${remaining} charge${remaining === 1 ? "" : "s"} left.`);
    return true;
  }
  if (job.kind === "harvest_crop") return applyHarvest(state, target, helpers, events);
  return false;
}

function applyHarvest(state, target, helpers, events) {
  const crop = cropForType(target.typeId);
  const cropState = CARD_DEFS[target.typeId]?.cropState;
  const stage = harvestStageFor(crop, cropState);
  if (!crop || !stage) return false;
  const quality = harvestQuality(target);
  const produceTypeId = produceTypeForHarvest(crop, target);
  const meta = landMeta(target);

  helpers.spawn(state, produceTypeId, target.x + 28, target.y + 54, { amount: stage.amount, inHand: true });
  recordHarvestMemory(state, crop.id, quality, events);

  if (stage.next === "regrow") {
    target.typeId = crop.plantedTypeId;
    target.meta = { ...meta, cropId: crop.id, growthRemainingDays: crop.regrowDays, growthTotalDays: crop.regrowDays };
  } else if (stage.next === "partial") {
    target.typeId = crop.partialTypeId;
    target.meta = { ...target.meta, ...meta, cropId: crop.id };
  } else {
    target.typeId = "empty_plot";
    target.meta = meta;
  }

  if (stage.complete) state.seasonStats.harvestCount += 1;
  const qualityLabel = quality === "choice" ? " Choice" : "";
  if (stage.next === "partial") {
    events.push(`Farmer digs up ${stage.amount}${qualityLabel} ${crop.name} with the Hoe. Closed mounds remain for a second dig.`);
  } else if (crop.harvestTool) {
    events.push(`Farmer digs up ${stage.amount} more${qualityLabel} ${crop.name}. The Land returns to an Empty Plot.`);
  } else if (stage.next === "regrow") {
    events.push(`Farmer harvests ${stage.amount}${qualityLabel} ${crop.name}. The vines remain and can regrow in ${crop.regrowDays} watered nights.`);
  } else {
    const timing = stage.label ? `${stage.label} ` : "";
    events.push(`Farmer harvests ${stage.amount} ${timing}${qualityLabel} ${crop.name} by hand. The Land returns to an Empty Plot.`);
  }
  return true;
}

export function advanceGrowingCrops(state, events) {
  state.cards.forEach((item) => {
    if (item.typeId === "watered_empty_plot") {
      item.typeId = "empty_plot";
      item.meta = landMeta(item);
      return;
    }
    if (CARD_DEFS[item.typeId]?.cropState !== "watered") return;
    const crop = cropForType(item.typeId);
    if (!crop) return;
    item.meta.growthRemainingDays = Math.max(0, (item.meta.growthRemainingDays ?? crop.growthDays) - 1);
    if (item.meta.growthRemainingDays === 0) {
      item.typeId = crop.readyTypeId;
      delete item.meta.growthRemainingDays;
      delete item.meta.growthTotalDays;
      events.push(`${crop.name} grew overnight and are ready to harvest.`);
    } else if (crop.earlyTypeId && item.meta.growthRemainingDays === crop.earlyReadyRemainingDays) {
      item.typeId = crop.earlyTypeId;
      events.push(`${crop.name} reached a baby harvest. Harvest now or water deliberately to keep growing.`);
    } else {
      item.typeId = crop.plantedTypeId;
      const nights = item.meta.growthRemainingDays;
      events.push(`${crop.name} grew overnight and need ${nights} more watered night${nights === 1 ? "" : "s"}.`);
    }
  });
}

export function applyRainToFarm(state, events = []) {
  let watered = 0;
  state.cards.forEach((item) => {
    if (item.meta.areaId !== "farm") return;
    if (item.typeId === "empty_plot") {
      item.typeId = "watered_empty_plot";
      item.meta = landMeta(item);
      watered += 1;
      return;
    }
    if (CARD_DEFS[item.typeId]?.cropState !== "thirsty") return;
    const crop = cropForType(item.typeId);
    if (!crop) return;
    item.typeId = crop.wateredTypeId;
    watered += 1;
  });
  if (watered > 0) events.push(`Spring rain watered ${watered} farm plot${watered === 1 ? "" : "s"}.`);
  else events.push("Spring rain fell softly across Home Farm.");
  return watered;
}

function spendWaterCharge(wateringCan) {
  if (!wateringCan) return 0;
  wateringCan.meta.charges = Math.max(0, (wateringCan.meta.charges ?? 0) - 1);
  return wateringCan.meta.charges;
}

export function seasonLabel(state) {
  if (state.prototype === 2) return `${GAME.seasonName} · Day ${Math.min(state.day, PROTOTYPE_2.totalDays)}/${PROTOTYPE_2.totalDays}`;
  return `${GAME.seasonName} W${state.week ?? 1} · Day ${Math.min(state.day, GAME.seasonLengthDays)}/${GAME.seasonLengthDays}`;
}
