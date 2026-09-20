import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BALANCE_STRATEGIES, simulateBalance } from "./balance-model.js";
import { CARD_DEFS, CROPS, GAME } from "./data.js";
import {
  buySeeds,
  carriedItem,
  continueFarm,
  createGame,
  dropAction,
  endDay,
  equipFromHand,
  findCard,
  freeHands,
  hydrateGame,
  playFromHand,
  resolveDrop,
  shipmentTotals,
  tapDecision,
} from "./engine.js";

const cropIds = Object.keys(CROPS);
assert.deepEqual(cropIds, ["carrot", "green_bean", "potato", "cauliflower", "radish"], "Spring v1 has exactly five crop behaviors");
assert.equal(GAME.farmFieldCapacity, 3);
assert.equal(createGame().cards.filter((item) => item.meta.isLand).length, 3, "the runtime starts with exactly three persistent Land cards");

for (const crop of Object.values(CROPS)) {
  assert.equal(CARD_DEFS[crop.seedTypeId].cropState, "seeds");
  assert.equal(CARD_DEFS[crop.seedTypeId].stackable, true);
  assert.equal(CARD_DEFS[crop.produceTypeId].cropState, "produce");
  assert.equal(CARD_DEFS[crop.choiceProduceTypeId].quality, "choice");
  assert.equal(CARD_DEFS[crop.choiceProduceTypeId].sellPrice, CARD_DEFS[crop.produceTypeId].sellPrice, "Quality value is memory, not a required coin multiplier");
}

let store = createGame();
store.coins = 99;
store = playFromHand(store, "town-landmark").state;
for (const cropId of cropIds) {
  const before = store.coins;
  const purchase = buySeeds(store, cropId);
  assert.equal(purchase.ok, true, `${cropId} is sold through the physical Store flow`);
  store = purchase.state;
  assert.equal(store.coins, before - CROPS[cropId].seedBundleCost);
  assert.equal(store.cards.find((item) => item.typeId === CROPS[cropId].seedTypeId)?.meta.inHand, true);
}

for (const cropId of cropIds) {
  const crop = CROPS[cropId];
  const dryFirst = sowCrop(cropId, false);
  assert.equal(findCard(dryFirst, "soil").typeId, crop.wateredTypeId, `${cropId} supports sow then water`);
  assert.ok(dryFirst.memoryBook.discoveries.includes(cropId), `${cropId} sowing records a persistent crop discovery`);
  const waterFirst = sowCrop(cropId, true);
  assert.equal(findCard(waterFirst, "soil").typeId, crop.wateredTypeId, `${cropId} supports water then sow`);

  let rainy = createGame();
  rainy.day = 5;
  findCard(rainy, "soil").typeId = crop.plantedTypeId;
  findCard(rainy, "soil").meta = { areaId: "farm", isLand: true, cropId, growthRemainingDays: crop.growthDays, growthTotalDays: crop.growthDays };
  rainy = endDay(rainy);
  assert.equal(findCard(rainy, "soil").typeId, crop.wateredTypeId, `rain waters thirsty ${cropId}`);

  let removed = createGame();
  findCard(removed, "soil").typeId = crop.readyTypeId;
  findCard(removed, "soil").meta = { areaId: "farm", isLand: true, cropId, tended: true };
  removed = equipFromHand(removed, "sickle").state;
  removed = resolveDrop(removed, "farmer", "soil").state;
  assert.equal(findCard(removed, "soil").typeId, "empty_plot", `Sickle removal clears ${cropId}`);
  assert.equal(removed.cards.some((item) => [crop.produceTypeId, crop.choiceProduceTypeId].includes(item.typeId)), false, "removal never produces a harvest");
  assert.equal(removed.cards.filter((item) => item.meta.isLand).length, 3, "removal preserves finite Land identity");
}

for (const cropId of cropIds) {
  const crop = CROPS[cropId];
  let harvest = createGame();
  for (const landId of ["soil", "soil2"]) {
    findCard(harvest, landId).typeId = crop.readyTypeId;
    findCard(harvest, landId).meta = { areaId: "farm", isLand: true, cropId };
  }
  if (crop.harvestTool) harvest = equipFromHand(harvest, crop.harvestTool).state;
  for (const landId of ["soil", "soil2"]) {
    harvest = resolveDrop(harvest, "farmer", landId).state;
    if (crop.partialTypeId) harvest = resolveDrop(harvest, "farmer", landId).state;
  }
  const produceCards = harvest.cards.filter((item) => item.typeId === crop.produceTypeId);
  const fullStage = crop.harvestStages.find((stage) => stage.state === "ready");
  const perCropYield = crop.harvestStages.reduce((sum, stage) => sum + stage.amount, 0);
  assert.equal(produceCards.length, 1, `${cropId} harvests consolidate into one physical quantity card`);
  const expectedAmount = crop.partialTypeId ? perCropYield * 2 : fullStage.amount * 2;
  assert.equal(produceCards[0].meta.amount, expectedAmount);
  assert.equal(produceCards[0].meta.inHand, true);
  assert.equal(harvest.cards.filter((item) => item.meta.isLand).length, 3, `${cropId} harvest preserves the three Land identities`);
  harvest = equipFromHand(harvest, produceCards[0].id).state;
  harvest = resolveDrop(harvest, "farmer", "shipping").state;
  assert.deepEqual(shipmentTotals(harvest), { amount: expectedAmount, value: expectedAmount }, `${cropId} ships through the shared crop-aware queue`);
}

let cauliflower = createGame();
findCard(cauliflower, "soil").typeId = "watered_cauliflowers";
findCard(cauliflower, "soil").meta = { areaId: "farm", isLand: true, cropId: "cauliflower", growthRemainingDays: 4, growthTotalDays: 4 };
for (let night = 0; night < 4; night += 1) {
  cauliflower = endDay(cauliflower);
  if (night < 3) findCard(cauliflower, "soil").typeId = "watered_cauliflowers";
}
assert.equal(findCard(cauliflower, "soil").typeId, "ready_cauliflowers", "Cauliflower occupies Land for four watered nights");
cauliflower = resolveDrop(cauliflower, "farmer", "soil").state;
assert.equal(findCard(cauliflower, "soil").typeId, "empty_plot");
assert.equal(cauliflower.cards.find((item) => item.typeId === "cauliflowers").meta.amount, 9, "slow Cauliflower has the large payoff");

let babyRadish = createGame();
findCard(babyRadish, "soil").typeId = "watered_radishes";
findCard(babyRadish, "soil").meta = { areaId: "farm", isLand: true, cropId: "radish", growthRemainingDays: 3, growthTotalDays: 3 };
babyRadish = endDay(babyRadish);
assert.equal(findCard(babyRadish, "soil").typeId, "baby_radishes", "Radish exposes a real early harvest after one watered night");
const babySave = JSON.parse(JSON.stringify(babyRadish));
babyRadish = resolveDrop(babyRadish, "farmer", "soil").state;
assert.equal(babyRadish.cards.find((item) => item.typeId === "radishes").meta.amount, 2, "baby harvest releases Land for two Radishes");
assert.equal(findCard(babyRadish, "soil").typeId, "empty_plot");

let fullRadish = hydrateGame(babySave);
fullRadish = equipFromHand(fullRadish, "watering-can").state;
findCard(fullRadish, "watering-can").meta.charges = 2;
for (let night = 0; night < 2; night += 1) {
  fullRadish = resolveDrop(fullRadish, "farmer", "soil").state;
  fullRadish = endDay(fullRadish);
}
assert.equal(findCard(fullRadish, "soil").typeId, "ready_radishes", "deliberate watering grows Baby Radishes to full maturity");
fullRadish = freeHands(fullRadish).state;
fullRadish = resolveDrop(fullRadish, "farmer", "soil").state;
assert.equal(fullRadish.cards.find((item) => item.typeId === "radishes").meta.amount, 5, "full Radish harvest pays five");

let quality = createGame();
findCard(quality, "soil").typeId = "planted_cauliflowers";
findCard(quality, "soil").meta = { areaId: "farm", isLand: true, cropId: "cauliflower", growthRemainingDays: 4, growthTotalDays: 4 };
assert.equal(dropAction(quality, "soil", "farmer"), "tend_crop", "Quality has a visible crop-to-Farmer source interaction");
assert.deepEqual(tapDecision(quality, null, "soil"), { kind: "select", cardId: "soil" }, "tap selects the same Quality source used by drag");
assert.deepEqual(tapDecision(quality, "soil", "farmer"), { kind: "resolve", sourceId: "soil", targetId: "farmer" });
quality = resolveDrop(quality, "soil", "farmer").state;
assert.equal(findCard(quality, "soil").meta.tended, true);
assert.equal(quality.actionPoints, 7, "Tend has an explicit AP opportunity cost");
const persistedCare = hydrateGame(JSON.parse(JSON.stringify(quality)));
assert.equal(findCard(persistedCare, "soil").meta.tended, true, "care survives save hydration");
findCard(quality, "soil").typeId = "ready_cauliflowers";
delete findCard(quality, "soil").meta.growthRemainingDays;
quality = resolveDrop(quality, "farmer", "soil").state;
assert.equal(quality.cards.find((item) => item.typeId === "choice_cauliflowers").meta.amount, 9, "Tend transforms the harvested card into visible Choice Produce");
assert.equal(quality.memoryBook.firstQuality.cropId, "cauliflower");
assert.deepEqual(quality.memoryBook.choiceCrops, ["cauliflower"]);
assert.equal(quality.memoryBook.firstHarvest.cropId, "cauliflower");

const deterministicSave = JSON.parse(JSON.stringify(persistedCare));
findCard(persistedCare, "soil").typeId = "ready_cauliflowers";
findCard(deterministicSave, "soil").typeId = "ready_cauliflowers";
const deterministicA = resolveDrop(persistedCare, "farmer", "soil").state;
const deterministicB = resolveDrop(hydrateGame(deterministicSave), "farmer", "soil").state;
assert.equal(deterministicA.cards.find((item) => item.typeId === "choice_cauliflowers").meta.amount, deterministicB.cards.find((item) => item.typeId === "choice_cauliflowers").meta.amount, "reloading cannot reroll Quality or yield");

let caredBeans = createGame();
findCard(caredBeans, "soil").typeId = "ready_green_beans";
findCard(caredBeans, "soil").meta = { areaId: "farm", isLand: true, cropId: "green_bean", tended: true };
caredBeans = resolveDrop(caredBeans, "farmer", "soil").state;
assert.equal(findCard(caredBeans, "soil").typeId, "planted_green_beans");
assert.equal(findCard(caredBeans, "soil").meta.tended, undefined, "regrowing Beans ask for a new care decision each cycle");
assert.equal(caredBeans.cards.find((item) => item.typeId === "choice_green_beans").meta.amount, 3);

let caredPotatoes = createGame();
findCard(caredPotatoes, "soil").typeId = "ready_potatoes";
findCard(caredPotatoes, "soil").meta = { areaId: "farm", isLand: true, cropId: "potato", tended: true };
caredPotatoes = equipFromHand(caredPotatoes, "hoe").state;
caredPotatoes = resolveDrop(caredPotatoes, "farmer", "soil").state;
assert.equal(findCard(caredPotatoes, "soil").meta.tended, true, "Potato care survives the first dig");
caredPotatoes = resolveDrop(caredPotatoes, "farmer", "soil").state;
assert.equal(caredPotatoes.cards.find((item) => item.typeId === "choice_potatoes").meta.amount, 4);
assert.equal(caredPotatoes.seasonStats.harvestCount, 1);

const choiceCauliflower = quality.cards.find((item) => item.typeId === "choice_cauliflowers");
quality = equipFromHand(quality, choiceCauliflower.id).state;
quality = resolveDrop(quality, "farmer", "shipping").state;
assert.deepEqual(shipmentTotals(quality), { amount: 9, value: 9 }, "Choice Produce stays visible as Quality but does not force an economy multiplier");

let journal = createGame();
journal.day = 7;
findCard(journal, "soil").typeId = "baby_radishes";
findCard(journal, "soil").meta = { areaId: "farm", isLand: true, cropId: "radish", growthRemainingDays: 2, growthTotalDays: 3, tended: true };
journal.memoryBook.discoveries.push("radish");
journal.seasonStats.memories.push({ id: "discovery:radish", kind: "discovery", cropId: "radish", week: 1, day: 2, text: "Radishes joined the farm for the first time." });
journal = endDay(journal);
assert.equal(journal.phase, "weekly_journal");
assert.equal(findCard(journal, "soil").typeId, "baby_radishes", "early Radish state persists across the Week boundary");
assert.equal(findCard(journal, "soil").meta.tended, true, "pending care persists across the Week boundary");
assert.ok(journal.seasonSummary.memories.some((memory) => memory.kind === "discovery"));
assert.ok(journal.seasonSummary.memories.some((memory) => memory.id === "milestone:week-1"), "the Journal carries story milestones instead of only scores");
journal = continueFarm(journal);
assert.equal(journal.week, 2);
assert.equal(findCard(journal, "soil").typeId, "baby_radishes");
assert.ok(journal.memoryBook.discoveries.includes("radish"));

for (const cropId of cropIds) {
  const crop = CROPS[cropId];
  let persistent = createGame();
  persistent.day = 7;
  findCard(persistent, "soil").typeId = crop.plantedTypeId;
  findCard(persistent, "soil").meta = { areaId: "farm", isLand: true, cropId, growthRemainingDays: crop.growthDays, growthTotalDays: crop.growthDays, tended: true };
  persistent = endDay(persistent);
  assert.equal(persistent.phase, "weekly_journal");
  persistent = continueFarm(persistent);
  assert.equal(findCard(persistent, "soil").typeId, crop.plantedTypeId, `${cropId} survives a Weekly Journal without state replacement`);
  assert.equal(findCard(persistent, "soil").meta.tended, true, `${cropId} care survives the Weekly Journal`);
  assert.equal(persistent.cards.filter((item) => item.meta.isLand).length, 3);
}

for (const version of [16, 17, 18, 19, 20]) {
  const old = createGame();
  old.version = version;
  delete old.memoryBook;
  delete old.seasonStats.memories;
  const bin = findCard(old, "shipping");
  delete bin.meta.shipments;
  bin.meta.amount = 4;
  const migrated = hydrateGame(old);
  assert.equal(migrated.version, GAME.version, `v${version} save migrates to the current schema`);
  assert.equal(migrated.cards.filter((item) => item.meta.isLand).length, 3);
  assert.deepEqual(shipmentTotals(migrated), { amount: 4, value: 4 });
  assert.deepEqual(migrated.memoryBook.choiceCrops, []);
  assert.deepEqual(migrated.seasonStats.memories, []);
}

for (const strategyId of ["fast", "regrow", "slow", "mixed", "quality"]) {
  assert.ok(BALANCE_STRATEGIES[strategyId], `${strategyId} balance policy exists`);
  const first = simulateBalance(strategyId, { weeks: 4 });
  const second = simulateBalance(strategyId, { weeks: 4 });
  assert.deepEqual(first, second, `${strategyId} balance simulation is deterministic`);
  assert.equal(first.availableAp, 4 * 7 * 8);
  assert.ok(first.landUsePercent <= 100);
}
assert.ok(simulateBalance("quality", { weeks: 4 }).apUsePercent > simulateBalance("mixed", { weeks: 4 }).apUsePercent, "Quality policy exposes its AP bottleneck");
assert.equal(simulateBalance("quality", { weeks: 4 }).careMemories, 5, "the Quality policy can complete all five persistent crop-care memories");

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");
assert.match(app, /quality-choice/);
assert.match(app, /tended-crop/);
assert.match(app, /journal-memories/);
assert.match(app, /crop\.choiceProduceTypeId/);
assert.match(app, /Object\.values\(CROPS\)/, "Store and Hand derive their five-crop roster from shared data");
assert.match(styles, /\.world-card\.quality-choice/);
assert.match(styles, /\.world-card\.tended-crop/);

console.log("Spring Farming v1 tests passed: five crops, shared Quality, memory Journal, deterministic balance, finite Land, migration, rain, shipping and Week persistence are covered.");

function sowCrop(cropId, waterFirst) {
  const crop = CROPS[cropId];
  let state = createGame();
  state.coins = 99;
  state = playFromHand(state, "town-landmark").state;
  state = buySeeds(state, cropId).state;
  state = playFromHand(state, "farm-landmark").state;
  if (waterFirst) {
    state = equipFromHand(state, "watering-can").state;
    state = resolveDrop(state, "farmer", "well").state;
    state = resolveDrop(state, "farmer", "soil").state;
  }
  const seeds = state.cards.find((item) => item.typeId === crop.seedTypeId);
  state = equipFromHand(state, seeds.id).state;
  state = resolveDrop(state, "farmer", "soil").state;
  if (!waterFirst) {
    state = equipFromHand(state, "watering-can").state;
    state = resolveDrop(state, "farmer", "well").state;
    state = resolveDrop(state, "farmer", "soil").state;
  }
  return state;
}
