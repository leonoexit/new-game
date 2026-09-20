import { ACTION_COSTS, CROPS, GAME, weatherForDay } from "./data.js";

export const BALANCE_STRATEGIES = Object.freeze({
  fast: Object.freeze({ name: "Fast Carrots", crops: Object.freeze(["carrot"]), quality: false }),
  regrow: Object.freeze({ name: "Green Bean Regrow", crops: Object.freeze(["green_bean"]), quality: false }),
  slow: Object.freeze({ name: "Slow Cauliflower", crops: Object.freeze(["cauliflower"]), quality: false }),
  potato: Object.freeze({ name: "Potato Digging", crops: Object.freeze(["potato"]), quality: false }),
  radish_baby: Object.freeze({ name: "Baby Radish Turnover", crops: Object.freeze(["radish"]), quality: false, radishHarvest: "baby" }),
  radish_full: Object.freeze({ name: "Full Radish", crops: Object.freeze(["radish"]), quality: false, radishHarvest: "full" }),
  mixed: Object.freeze({ name: "Mixed Five-Crop Farm", crops: Object.freeze(["carrot", "green_bean", "potato", "cauliflower", "radish"]), quality: false, radishHarvest: "full" }),
  quality: Object.freeze({ name: "Quality-Focused Mixed Farm", crops: Object.freeze(["carrot", "green_bean", "potato", "cauliflower", "radish"]), quality: true, radishHarvest: "full" }),
});

const emptyPlot = (ground = "empty") => ({ ground, soilWatered: false, crop: null });

export function simulateBalance(strategyId, options = {}) {
  const strategy = BALANCE_STRATEGIES[strategyId];
  if (!strategy) throw new Error(`Unknown balance strategy: ${strategyId}`);
  const weeks = options.weeks ?? 8;
  const state = {
    coins: options.startingCoins ?? 3,
    plots: [emptyPlot(), emptyPlot("wild"), emptyPlot("wild")],
    seeds: Object.fromEntries(Object.keys(CROPS).map((cropId) => [cropId, 0])),
    wateringCharges: 0,
    plantCursor: 0,
    pendingCoins: 0,
    stats: {
      coinsEarned: 0,
      seedCoinsSpent: 0,
      harvests: 0,
      choiceHarvests: 0,
      choiceCropMemories: [],
      apUsed: 0,
      availableAp: weeks * GAME.seasonLengthDays * GAME.actionPointsPerDay,
      saturatedDays: 0,
      occupiedLandDays: 0,
      cropHarvests: Object.fromEntries(Object.keys(CROPS).map((cropId) => [cropId, 0])),
      cropProduce: Object.fromEntries(Object.keys(CROPS).map((cropId) => [cropId, 0])),
      bottlenecks: {},
      storeTrips: 0,
      waterRefills: 0,
    },
  };

  for (let absoluteDay = 1; absoluteDay <= weeks * GAME.seasonLengthDays; absoluteDay += 1) {
    runDay(state, strategy, absoluteDay);
  }

  return {
    strategyId,
    strategy: strategy.name,
    weeks,
    endingCoins: state.coins,
    ...state.stats,
    coinsPerWeek: round(state.stats.coinsEarned / weeks),
    netCoinsPerWeek: round((state.stats.coinsEarned - state.stats.seedCoinsSpent) / weeks),
    harvestsPerWeek: round(state.stats.harvests / weeks),
    careMemories: state.stats.choiceCropMemories.length,
    apUsePercent: round(100 * state.stats.apUsed / state.stats.availableAp),
    landUsePercent: round(100 * state.stats.occupiedLandDays / (weeks * GAME.seasonLengthDays * GAME.farmFieldCapacity)),
  };
}

function runDay(state, strategy, absoluteDay) {
  const dayOfWeek = ((absoluteDay - 1) % GAME.seasonLengthDays) + 1;
  const budget = { remaining: GAME.actionPointsPerDay, used: 0 };
  applyMorningRain(state, dayOfWeek);

  state.plots.forEach((plot) => harvestReadyPlot(state, strategy, plot, budget));
  state.plots.forEach((plot) => tendGrowingPlot(state, strategy, plot, budget));
  state.plots.forEach((plot) => waterGrowingPlot(state, strategy, plot, budget));
  prepareWildLand(state, budget);
  plantEmptyLand(state, strategy, budget);
  state.plots.forEach((plot) => tendGrowingPlot(state, strategy, plot, budget));
  state.plots.forEach((plot) => waterGrowingPlot(state, strategy, plot, budget));

  state.stats.apUsed += budget.used;
  if (budget.remaining === 0) state.stats.saturatedDays += 1;
  state.stats.occupiedLandDays += state.plots.filter((plot) => plot.crop).length;
  advanceNight(state);
  state.coins += state.pendingCoins;
  state.stats.coinsEarned += state.pendingCoins;
  state.pendingCoins = 0;
}

function spendAp(state, budget, amount, bottleneck) {
  if (budget.remaining < amount) {
    state.stats.bottlenecks[bottleneck] = (state.stats.bottlenecks[bottleneck] ?? 0) + 1;
    return false;
  }
  budget.remaining -= amount;
  budget.used += amount;
  return true;
}

function applyMorningRain(state, dayOfWeek) {
  if (weatherForDay(dayOfWeek) !== "rainy") return;
  state.plots.forEach((plot) => {
    if (plot.ground === "empty" && !plot.crop) plot.soilWatered = true;
    if (plot.crop?.stage === "growing" && !plot.crop.watered) plot.crop.watered = true;
  });
}

function prepareWildLand(state, budget) {
  state.plots.forEach((plot) => {
    if (plot.ground !== "wild") return;
    if (!spendAp(state, budget, ACTION_COSTS.clear_grass + ACTION_COSTS.till_soil, "land_preparation")) return;
    plot.ground = "empty";
  });
}

function plantEmptyLand(state, strategy, budget) {
  const emptyPlots = state.plots.filter((plot) => plot.ground === "empty" && !plot.crop);
  if (!emptyPlots.length) return;
  let travelled = false;
  emptyPlots.forEach((plot) => {
    const cropId = chooseCrop(strategy, state);
    const crop = CROPS[cropId];
    if (state.seeds[cropId] < 1) {
      if (state.coins < crop.seedBundleCost) {
        state.stats.bottlenecks.seed_affordability = (state.stats.bottlenecks.seed_affordability ?? 0) + 1;
        return;
      }
      if (!travelled) {
        if (!spendAp(state, budget, ACTION_COSTS.travel * 2, "store_travel")) return;
        travelled = true;
        state.stats.storeTrips += 1;
      }
      state.coins -= crop.seedBundleCost;
      state.stats.seedCoinsSpent += crop.seedBundleCost;
      state.seeds[cropId] += crop.seedBundleAmount;
    }
    if (!spendAp(state, budget, ACTION_COSTS.sow, "sowing")) return;
    state.seeds[cropId] -= 1;
    plot.crop = {
      cropId,
      remaining: crop.growthDays,
      stage: "growing",
      watered: plot.soilWatered,
      tended: false,
      potatoDig: 0,
    };
    plot.soilWatered = false;
    state.plantCursor += 1;
  });
}

function chooseCrop(strategy, state) {
  return strategy.crops[state.plantCursor % strategy.crops.length];
}

function tendGrowingPlot(state, strategy, plot, budget) {
  if (!strategy.quality || !plot.crop || plot.crop.tended || plot.crop.stage === "ready" || plot.crop.stage === "partial") return;
  if (!spendAp(state, budget, ACTION_COSTS.tend_crop, "quality_tending")) return;
  plot.crop.tended = true;
}

function waterGrowingPlot(state, strategy, plot, budget) {
  const planted = plot.crop;
  if (!planted || planted.watered || planted.stage === "ready" || planted.stage === "partial") return;
  if (planted.stage === "baby" && strategy.radishHarvest !== "full") return;
  if (state.wateringCharges === 0) {
    if (!spendAp(state, budget, ACTION_COSTS.refill_watering_can, "water_refill")) return;
    state.wateringCharges = GAME.wateringCanCapacity;
    state.stats.waterRefills += 1;
  }
  if (!spendAp(state, budget, ACTION_COSTS.water_crop, "watering")) return;
  state.wateringCharges -= 1;
  planted.watered = true;
  planted.stage = "growing";
}

function harvestReadyPlot(state, strategy, plot, budget) {
  const planted = plot.crop;
  if (!planted) return;
  if (planted.stage === "baby" && strategy.radishHarvest !== "baby") return;
  if (!["baby", "ready", "partial"].includes(planted.stage)) return;
  const crop = CROPS[planted.cropId];
  const stage = crop.harvestStages.find((candidate) => candidate.state === balanceCropState(planted));
  if (!stage) return;
  if (!spendAp(state, budget, ACTION_COSTS.harvest_crop, "harvesting")) return;
  state.pendingCoins += stage.amount;
  state.stats.cropProduce[crop.id] += stage.amount;
  if (stage.next === "partial") {
    planted.stage = "partial";
    planted.potatoDig = 1;
    harvestReadyPlot(state, strategy, plot, budget);
    return;
  }
  state.stats.harvests += 1;
  state.stats.cropHarvests[crop.id] += 1;
  if (planted.tended) {
    state.stats.choiceHarvests += 1;
    if (!state.stats.choiceCropMemories.includes(crop.id)) state.stats.choiceCropMemories.push(crop.id);
  }
  if (stage.next === "regrow") {
    plot.crop = {
      cropId: crop.id,
      remaining: crop.regrowDays,
      stage: "growing",
      watered: false,
      tended: false,
      potatoDig: 0,
    };
  } else {
    plot.crop = null;
    plot.ground = "empty";
  }
}

function balanceCropState(planted) {
  if (planted.stage === "baby") return "early_ready";
  if (planted.stage === "partial") return "partial_harvest";
  return "ready";
}

function advanceNight(state) {
  state.plots.forEach((plot) => {
    const planted = plot.crop;
    if (!planted?.watered) {
      plot.soilWatered = false;
      return;
    }
    planted.remaining = Math.max(0, planted.remaining - 1);
    planted.watered = false;
    const crop = CROPS[planted.cropId];
    if (planted.remaining === 0) planted.stage = "ready";
    else if (crop.earlyTypeId && planted.remaining === crop.earlyReadyRemainingDays) planted.stage = "baby";
    else planted.stage = "growing";
  });
}

function round(value) {
  return Math.round(value * 10) / 10;
}
