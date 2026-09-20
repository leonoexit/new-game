import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ACTION_COSTS, AREAS, CARD_DEFS, CROPS, GAME, weatherForDay } from "./data.js";
import {
  buySeeds,
  cardArea,
  cardLabel,
  carriedItem,
  createGame,
  dropAction,
  endDay,
  equipFromHand,
  farmerArea,
  findCard,
  freeHands,
  handItems,
  handStacks,
  hydrateGame,
  interactionSourceId,
  playFromHand,
  resolveDrop,
  shipmentTotals,
  continueFarm,
  returnToHand,
  tapDecision,
  validTargets,
} from "./engine.js";

for (const definition of Object.values(CARD_DEFS)) {
  assert.ok(definition.art, `${definition.name} must have artwork`);
  await access(fileURLToPath(new URL(definition.art, import.meta.url)));
  if (definition.filledArt) await access(fileURLToPath(new URL(definition.filledArt, import.meta.url)));
}

const cardsOfType = (state, typeId) => state.cards.filter((item) => item.typeId === typeId);
const oneCard = (state, typeId) => {
  const cards = cardsOfType(state, typeId);
  assert.equal(cards.length, 1, `${typeId} must have exactly one card`);
  return cards[0];
};
const equip = (state, cardId) => {
  const result = equipFromHand(state, cardId);
  assert.equal(result.ok, true, `expected ${cardId} to play from the Hand`);
  return result.state;
};

const legacyQuantityState = createGame();
legacyQuantityState.version = 16;
legacyQuantityState.cards.push({ id: "legacy-seeds-a", typeId: "carrot_seeds", x: 0, y: 0, meta: { amount: 1, inHand: true } });
legacyQuantityState.cards.push({ id: "legacy-seeds-b", typeId: "carrot_seeds", x: 0, y: 0, meta: { amount: 2, inHand: true } });
const migratedQuantityState = hydrateGame(legacyQuantityState);
assert.equal(cardsOfType(migratedQuantityState, "carrot_seeds").length, 1, "saved visual stacks migrate into one quantity card");
assert.equal(oneCard(migratedQuantityState, "carrot_seeds").meta.amount, 3);

const legacyRemainsState = createGame();
legacyRemainsState.version = 17;
legacyRemainsState.phase = "season_cleanup";
legacyRemainsState.day = 7;
findCard(legacyRemainsState, "soil").typeId = "crop_remains";
const migratedWeekState = hydrateGame(legacyRemainsState);
assert.equal(migratedWeekState.phase, "playing", "old cleanup saves migrate back into play");
assert.equal(migratedWeekState.week, 2);
assert.equal(migratedWeekState.day, 1);
assert.equal(findCard(migratedWeekState, "soil").typeId, "empty_plot", "unrecoverable old remains migrate to a usable Plot");

const twoLandSave = createGame();
twoLandSave.version = 18;
twoLandSave.cards = twoLandSave.cards.filter((item) => item.id !== "soil3");
const migratedThreeLandState = hydrateGame(twoLandSave);
assert.equal(findCard(migratedThreeLandState, "soil3").typeId, "wild_soil", "v18 saves gain the new persistent Wild Soil card");
assert.equal(migratedThreeLandState.cards.filter((item) => item.meta.isLand).length, 3);

let game = createGame();
assert.equal(game.version, 22);
assert.equal(game.day, 1);
assert.equal(game.coins, 3);
assert.equal(game.actionPoints, 8);
assert.equal(GAME.actionPointsPerDay, 8);
assert.equal(GAME.seasonName, "Spring");
assert.equal(GAME.seasonLengthDays, 7);
assert.equal(weatherForDay(1), "sunny");
assert.equal(weatherForDay(6), "rainy");
assert.equal(GAME.cropGrowthDays, 2);
assert.equal(GAME.farmFieldCapacity, 3);
assert.equal(CROPS.carrot.growthDays, 2);
assert.equal(CROPS.carrot.seedBundleCost, 1);
assert.equal(CROPS.carrot.seedBundleAmount, 1);
assert.equal(CROPS.green_bean.growthDays, 3);
assert.equal(CROPS.green_bean.regrowDays, 2);
assert.equal(CROPS.potato.growthDays, 2);
assert.equal(CROPS.potato.harvestTool, "hoe");
assert.deepEqual(CROPS.potato.harvestSteps, [2, 2]);
assert.equal(ACTION_COSTS.travel, 1);
assert.equal(ACTION_COSTS.remove_crop, 1);
assert.deepEqual(AREAS.map((area) => area.id), ["farm", "town"]);
assert.equal(farmerArea(game), "farm");
assert.equal(cardArea(game, findCard(game, "store")), "town");
assert.equal(cardArea(game, findCard(game, "shipping")), "farm");
assert.equal(findCard(game, "farm-landmark").meta.fixed, true);
assert.equal(findCard(game, "town-landmark").meta.fixed, true);
assert.equal(findCard(game, "farm-landmark").meta.inHand, undefined, "Home Farm Landmark begins face-up on the Farm table");
assert.equal(findCard(game, "town-landmark").meta.inHand, true, "the destination Landmark begins in the Hand");
assert.equal(cardsOfType(game, "coin_purse").length, 0, "money is not a card");
assert.equal(CARD_DEFS.coin_purse, undefined, "Coin Purse is not part of the runtime card catalog");
assert.equal(findCard(game, "soil").typeId, "empty_plot", "the starting farm includes one prepared Plot");
assert.equal(findCard(game, "soil2").typeId, "wild_soil", "one Wild Soil patch still teaches land preparation");
assert.equal(findCard(game, "soil3").typeId, "wild_soil", "the third persistent Land begins as Wild Soil");
assert.equal(game.cards.filter((item) => item.meta.isLand).length, 3, "the Farm begins at its finite three-field capacity");
assert.deepEqual(handItems(game).map((item) => item.id), ["town-landmark", "hoe", "watering-can", "sickle"]);
assert.deepEqual(handStacks(game).map((stack) => stack.length), [1, 1, 1, 1]);
assert.deepEqual(validTargets(game, "farmer"), ["hoe", "watering-can", "sickle"]);

assert.deepEqual(tapDecision(game, null, "farmer"), { kind: "select", cardId: "farmer" });
assert.deepEqual(tapDecision(game, "farmer", "hoe"), {
  kind: "resolve",
  sourceId: "farmer",
  targetId: "hoe",
});

let purchase = buySeeds(game);
assert.equal(purchase.ok, false, "Seeds cannot be bought remotely from Home Farm");
assert.equal(game.coins, 3);
assert.equal(purchase.state.actionPoints, 8, "failed actions do not spend AP");
assert.equal(dropAction(game, "farmer", "store"), null, "cross-Area card interactions are invalid");

let exhausted = createGame();
exhausted.actionPoints = 0;
exhausted = equip(exhausted, "sickle");
assert.equal(exhausted.actionPoints, 0, "equipping remains free with no AP");
const blockedWork = resolveDrop(exhausted, "farmer", "soil2");
assert.equal(blockedWork.ok, false, "work is blocked with no AP");
assert.equal(findCard(blockedWork.state, "soil2").typeId, "wild_soil", "blocked work does not mutate its target");
assert.equal(blockedWork.state.actionPoints, 0);

let stableFarmer = createGame();
stableFarmer = equip(stableFarmer, "sickle");
const farmerBeforeWork = { x: findCard(stableFarmer, "farmer").x, y: findCard(stableFarmer, "farmer").y };
stableFarmer = resolveDrop(stableFarmer, "farmer", "soil2").state;
assert.deepEqual(
  { x: findCard(stableFarmer, "farmer").x, y: findCard(stableFarmer, "farmer").y },
  farmerBeforeWork,
  "resolving work preserves the player's Farmer layout",
);

let cropRemoval = createGame();
cropRemoval = equip(cropRemoval, "sickle");
findCard(cropRemoval, "soil").typeId = "watered_green_beans";
findCard(cropRemoval, "soil").meta = { areaId: "farm", isLand: true, cropId: "green_bean", growthRemainingDays: 2, growthTotalDays: 3 };
assert.equal(dropAction(cropRemoval, "farmer", "soil"), "remove_crop", "the Sickle targets planted crops");
cropRemoval = resolveDrop(cropRemoval, "farmer", "soil").state;
assert.equal(findCard(cropRemoval, "soil").typeId, "empty_plot");
assert.equal(cardsOfType(cropRemoval, "green_beans").length, 0, "cutting a crop yields no Produce");
assert.equal(cropRemoval.actionPoints, 7, "removing a crop costs 1 AP");

let dryingSoil = createGame();
dryingSoil = equip(dryingSoil, "watering-can");
dryingSoil = resolveDrop(dryingSoil, "farmer", "well").state;
dryingSoil = resolveDrop(dryingSoil, "farmer", "soil").state;
assert.equal(findCard(dryingSoil, "soil").typeId, "watered_empty_plot");
dryingSoil = endDay(dryingSoil);
assert.equal(findCard(dryingSoil, "soil").typeId, "empty_plot", "unplanted watered soil dries overnight");

let rainyMorning = createGame();
rainyMorning.day = 5;
findCard(rainyMorning, "soil2").typeId = "planted_carrots";
findCard(rainyMorning, "soil2").meta = { areaId: "farm", isLand: true, cropId: "carrot", growthRemainingDays: 2, growthTotalDays: 2 };
rainyMorning = endDay(rainyMorning);
assert.equal(rainyMorning.day, 6);
assert.equal(rainyMorning.weather, "rainy");
assert.equal(findCard(rainyMorning, "soil").typeId, "watered_empty_plot", "rain waters an Empty Plot when the day begins");
assert.equal(findCard(rainyMorning, "soil2").typeId, "watered_carrots", "rain waters a thirsty crop without spending AP");
assert.equal(rainyMorning.actionPoints, 8);

let shortTrip = createGame();
shortTrip.actionPoints = 1;
const finalApTrip = playFromHand(shortTrip, "town-landmark");
assert.equal(finalApTrip.ok, true, "the final AP can be used to travel");
assert.equal(farmerArea(finalApTrip.state), "town");
assert.equal(findCard(finalApTrip.state, "farm-landmark").meta.inHand, true, "the previous Area Landmark returns to the Hand");
assert.equal(findCard(finalApTrip.state, "town-landmark").meta.inHand, undefined, "the played Landmark becomes the Town table card");
assert.equal(finalApTrip.state.actionPoints, 0);
const townSleep = endDay(finalApTrip.state);
assert.equal(townSleep.day, 2, "the day can end outside Home Farm");
assert.equal(townSleep.actionPoints, 8);
assert.equal(farmerArea(townSleep), "farm", "ending the day anywhere wakes Farmer at Home Farm");
assert.equal(findCard(townSleep, "farm-landmark").meta.inHand, undefined, "Home Farm Landmark is restored to the morning table");
assert.equal(findCard(townSleep, "town-landmark").meta.inHand, true, "Valley Town returns to the Hand overnight");

let travel = playFromHand(game, "town-landmark");
assert.equal(travel.ok, true);
game = travel.state;
assert.equal(farmerArea(game), "town");
assert.equal(game.day, 1, "travel spends AP rather than advancing the day");
assert.equal(game.actionPoints, 7);
assert.equal(dropAction(game, "farmer", "store"), "browse_store", "Farmer can physically target the General Store");
assert.deepEqual(tapDecision(game, "farmer", "store"), {
  kind: "resolve",
  sourceId: "farmer",
  targetId: "store",
});
const browsedStore = resolveDrop(game, "farmer", "store");
assert.equal(browsedStore.ok, true);
assert.equal(browsedStore.action, "browse_store");
assert.equal(browsedStore.state.actionPoints, 7, "opening the Store's Seed cards is free");
const townEndDay = endDay(game);
assert.equal(townEndDay.day, 2, "End Day is available in Town");
assert.equal(townEndDay.actionPoints, 8, "End Day in Town resets AP");
assert.equal(farmerArea(townEndDay), "farm");

purchase = buySeeds(game);
assert.equal(purchase.ok, true);
game = purchase.state;
assert.equal(game.coins, 2, "one coin buys exactly one Carrot Seed");
purchase = buySeeds(game);
assert.equal(purchase.ok, true);
game = purchase.state;
assert.equal(game.coins, 1);
assert.equal(game.actionPoints, 7, "buying Seeds is free");
let seeds = cardsOfType(game, "carrot_seeds");
assert.equal(seeds.length, 1, "repeat purchases consolidate into one Seed card");
assert.equal(seeds[0].meta.inHand, true);
assert.equal(seeds[0].meta.amount, 2, "the consolidated Seed card exposes its quantity");
assert.equal(handStacks(game).find((stack) => stack[0].typeId === "carrot_seeds").length, 1);

travel = playFromHand(game, "farm-landmark");
assert.equal(travel.ok, true);
game = travel.state;
assert.equal(farmerArea(game), "farm");
assert.equal(game.actionPoints, 6);

game = equip(game, "sickle");
assert.equal(carriedItem(game, "farmer").typeId, "sickle");
travel = playFromHand(game, "town-landmark");
assert.equal(travel.ok, true);
game = travel.state;
assert.equal(cardArea(game, carriedItem(game, "farmer")), "town", "carried cards travel with Farmer");
assert.equal(game.actionPoints, 5);
game = playFromHand(game, "farm-landmark").state;
assert.equal(game.actionPoints, 4);
let stored = returnToHand(game, "sickle");
assert.equal(stored.ok, true);
game = stored.state;
assert.equal(carriedItem(game, "farmer"), null);
assert.equal(findCard(game, "sickle").meta.inHand, true);
game = equip(game, "sickle");
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(game.actionPoints, 3);
assert.equal(findCard(game, "soil").typeId, "empty_plot");
assert.equal(findCard(game, "soil2").typeId, "cleared_ground");
oneCard(game, "sickle");
assert.equal(game.cards.filter((item) => item.meta.isLand).length, 3, "crop cycles never create or destroy Land cards");

game = equip(game, "hoe");
assert.equal(findCard(game, "sickle").meta.inHand, true, "playing another Tool returns the previous Tool to the Hand");
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(game.actionPoints, 2);
assert.equal(findCard(game, "soil").typeId, "empty_plot");
assert.equal(findCard(game, "soil2").typeId, "empty_plot");
oneCard(game, "hoe");

game = endDay(game);
assert.equal(game.day, 2);
assert.equal(game.actionPoints, 8, "End Day restores the daily AP budget");

game = equip(game, "watering-can");
assert.equal(findCard(game, "hoe").meta.inHand, true);
game = resolveDrop(game, "farmer", "well").state;
assert.equal(game.actionPoints, 7);
assert.equal(findCard(game, "watering-can").meta.charges, 2);
game = resolveDrop(game, "farmer", "soil").state;
assert.equal(game.actionPoints, 6);
assert.equal(findCard(game, "soil").typeId, "watered_empty_plot", "cleared soil can be watered before sowing");
assert.equal(findCard(game, "watering-can").meta.charges, 1);

game = equip(game, seeds[0].id);
assert.equal(findCard(game, "watering-can").meta.inHand, true);
assert.equal(interactionSourceId(game, seeds[0].id), "farmer", "dragging carried Seeds uses Farmer as the action source");
game = resolveDrop(game, "farmer", "soil").state;
assert.equal(game.actionPoints, 5);
assert.equal(findCard(game, "soil").typeId, "watered_carrots", "sowing watered soil creates a watered crop");
assert.equal(findCard(game, "soil").meta.growthRemainingDays, 2);
assert.equal(findCard(game, seeds[0].id).meta.amount, 1, "sowing consumes one unit from the Seed card");
const remainingSeed = oneCard(game, "carrot_seeds");
assert.equal(remainingSeed.meta.amount, 1, "one Seed remains on the carried quantity card");
assert.equal(remainingSeed.meta.parentId, "farmer");
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(game.actionPoints, 4);
assert.equal(findCard(game, "soil2").typeId, "planted_carrots", "sowing first remains valid");
assert.equal(cardsOfType(game, "carrot_seeds").length, 0);

game = equip(game, "watering-can");
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(game.actionPoints, 3);
assert.equal(findCard(game, "soil2").typeId, "watered_carrots", "a sown crop can be watered afterward");
assert.equal(findCard(game, "watering-can").meta.charges, 0);
assert.equal(cardLabel(game, findCard(game, "watering-can")), "Watering Can · Empty");
assert.equal(findCard(game, "soil").typeId, "watered_carrots", "crops do not grow from unrelated actions");

game = endDay(game);
assert.equal(game.day, 3);
assert.equal(game.actionPoints, 8);
assert.equal(findCard(game, "soil").typeId, "planted_carrots", "watered crops dry after growing overnight");
assert.equal(findCard(game, "soil2").typeId, "planted_carrots");
assert.equal(findCard(game, "soil").meta.growthRemainingDays, 1);
assert.equal(game.coins, 1, "ending a growth day does not invent income");

game = resolveDrop(game, "farmer", "well").state;
game = resolveDrop(game, "farmer", "soil").state;
game = endDay(game);
assert.equal(game.day, 4);
assert.equal(findCard(game, "soil").typeId, "ready_carrots");
assert.equal(findCard(game, "soil2").typeId, "planted_carrots", "an unwatered crop pauses instead of withering");
assert.equal(findCard(game, "soil2").meta.growthRemainingDays, 1);

game = resolveDrop(game, "farmer", "soil2").state;
game = endDay(game);
assert.equal(game.day, 5);
assert.equal(findCard(game, "soil2").typeId, "ready_carrots");

let stowed = freeHands(game);
assert.equal(stowed.ok, true);
game = stowed.state;
assert.equal(carriedItem(game, "farmer"), null, "Farmer must harvest with free hands");
game = resolveDrop(game, "farmer", "soil").state;
let harvests = cardsOfType(game, "carrots");
assert.equal(harvests.length, 1);
assert.equal(harvests[0].meta.inHand, true, "harvest goes directly into the Hand");
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(game.actionPoints, 6, "each hand harvest costs 1 AP");
harvests = cardsOfType(game, "carrots");
assert.equal(harvests.length, 1, "matching harvests consolidate into one Produce card");
assert.equal(harvests[0].meta.inHand, true);
const carrotHandStack = handStacks(game).find((stack) => stack[0].typeId === "carrots");
assert.equal(carrotHandStack.length, 1, "Produce uses quantity instead of visual card stacking");
assert.equal(carrotHandStack.reduce((total, item) => total + item.meta.amount, 0), 6, "the Hand stack preserves total quantity");

game = equip(game, harvests[0].id);
assert.equal(carriedItem(game, "farmer").typeId, "carrots");
game = resolveDrop(game, "farmer", "shipping").state;
assert.equal(carriedItem(game, "farmer"), null);
assert.deepEqual(shipmentTotals(game), { amount: 6, value: 6 });
assert.equal(game.coins, 1, "Shipping Bin pays only overnight");
assert.equal(game.actionPoints, 6, "depositing produce is free");

game = endDay(game);
assert.equal(game.day, 6);
assert.equal(game.actionPoints, 8);
assert.equal(game.coins, 7);
assert.equal(game.phase, "playing");
assert.equal(game.milestones.firstSixCoins, true);
assert.deepEqual(shipmentTotals(game), { amount: 0, value: 0 });

assert.equal(game.seasonStats.coinsEarned, 6, "the season tracks shipment income");
assert.equal(game.seasonStats.harvestCount, 2, "the season tracks harvest actions");

let boundaryGame = createGame();
boundaryGame = playFromHand(boundaryGame, "town-landmark").state;
boundaryGame = equip(boundaryGame, "sickle");
boundaryGame.day = 7;
findCard(boundaryGame, "soil").typeId = "ready_carrots";
findCard(boundaryGame, "soil").meta = { areaId: "farm", isLand: true, cropId: "carrot" };
findCard(boundaryGame, "soil2").typeId = "watered_green_beans";
findCard(boundaryGame, "soil2").meta = { areaId: "farm", isLand: true, cropId: "green_bean", growthRemainingDays: 1, growthTotalDays: 3 };
findCard(boundaryGame, "shipping").meta.shipments = [{ cropId: "carrot", quality: null, amount: 3, unitPrice: 1 }];
boundaryGame = endDay(boundaryGame);
assert.equal(boundaryGame.day, 7, "the final night ends Spring instead of creating day 8");
assert.equal(boundaryGame.phase, "weekly_journal");
assert.equal(boundaryGame.coins, 6, "the final shipment settles before the summary");
assert.equal(boundaryGame.seasonSummary.coinsEarned, 3);
assert.equal(boundaryGame.seasonSummary.harvestCount, 0);
assert.equal(boundaryGame.seasonSummary.cropsGrowing, 2, "the journal counts crops continuing on the farm");
assert.equal(farmerArea(boundaryGame), "farm", "the final night still wakes Farmer at Home Farm");
assert.equal(carriedItem(boundaryGame, "farmer").typeId, "sickle", "the carried Tool survives the season boundary");
assert.equal(findCard(boundaryGame, "soil").typeId, "ready_carrots", "unharvested mature crops persist across weeks");
assert.equal(findCard(boundaryGame, "soil2").typeId, "ready_green_beans", "the final watered night can mature Green Beans before the journal");
assert.equal(endDay(boundaryGame).phase, "weekly_journal", "the journal pauses further day progression");
boundaryGame = continueFarm(boundaryGame);
assert.equal(boundaryGame.phase, "playing");
assert.equal(boundaryGame.week, 2);
assert.equal(boundaryGame.day, 1);
assert.equal(boundaryGame.actionPoints, 8);
assert.equal(boundaryGame.seasonSummary, null);
assert.deepEqual(boundaryGame.seasonStats, { coinsEarned: 0, harvestCount: 0, memories: [] });
assert.equal(findCard(boundaryGame, "soil").typeId, "ready_carrots", "Continue Farm preserves mature crops");
assert.equal(findCard(boundaryGame, "soil2").typeId, "ready_green_beans", "Continue Farm preserves regrowing crops");
assert.equal(boundaryGame.cards.filter((item) => item.meta.isLand).length, 3, "weekly journals preserve Land identity");

let emptyBoundary = createGame();
emptyBoundary.day = 7;
emptyBoundary = endDay(emptyBoundary);
assert.equal(findCard(emptyBoundary, "soil").typeId, "empty_plot", "an Empty Plot stays empty at the season boundary");
assert.equal(findCard(emptyBoundary, "soil2").typeId, "wild_soil", "uncultivated Land persists across the week boundary");
assert.equal(findCard(emptyBoundary, "soil3").typeId, "wild_soil", "the third uncultivated Land persists across the week boundary");

let beanGame = createGame();
beanGame = playFromHand(beanGame, "town-landmark").state;
const beanPurchase = buySeeds(beanGame, "green_bean");
assert.equal(beanPurchase.ok, true, "Green Bean Seeds can be chosen at the General Store");
beanGame = beanPurchase.state;
assert.equal(beanGame.coins, 1);
const beanSeeds = oneCard(beanGame, "green_bean_seeds");
assert.equal(beanSeeds.meta.amount, 1, "a Green Bean purchase creates exactly one Seed card");
beanGame = playFromHand(beanGame, "farm-landmark").state;
beanGame = equip(beanGame, beanSeeds.id);
beanGame = resolveDrop(beanGame, "farmer", "soil").state;
assert.equal(findCard(beanGame, "soil").typeId, "planted_green_beans");
assert.equal(findCard(beanGame, "soil").meta.growthRemainingDays, 3);
beanGame = equip(beanGame, "watering-can");
beanGame = resolveDrop(beanGame, "farmer", "well").state;
beanGame = resolveDrop(beanGame, "farmer", "soil").state;
assert.equal(findCard(beanGame, "soil").typeId, "watered_green_beans");
beanGame = endDay(beanGame);
assert.equal(findCard(beanGame, "soil").typeId, "planted_green_beans");
assert.equal(findCard(beanGame, "soil").meta.growthRemainingDays, 2);
beanGame = resolveDrop(beanGame, "farmer", "soil").state;
beanGame = endDay(beanGame);
assert.equal(findCard(beanGame, "soil").meta.growthRemainingDays, 1);
beanGame = resolveDrop(beanGame, "farmer", "well").state;
beanGame = resolveDrop(beanGame, "farmer", "soil").state;
beanGame = endDay(beanGame);
assert.equal(findCard(beanGame, "soil").typeId, "ready_green_beans", "Green Beans mature after three watered nights");
beanGame = freeHands(beanGame).state;
beanGame = resolveDrop(beanGame, "farmer", "soil").state;
assert.equal(findCard(beanGame, "soil").typeId, "planted_green_beans", "harvesting Green Beans preserves the vines");
assert.equal(findCard(beanGame, "soil").meta.growthRemainingDays, 2, "Green Beans begin a two-night regrow cycle");
const beanProduce = oneCard(beanGame, "green_beans");
assert.equal(beanProduce.meta.amount, 3);
beanGame = equip(beanGame, "watering-can");
beanGame = resolveDrop(beanGame, "farmer", "soil").state;
beanGame = endDay(beanGame);
beanGame = resolveDrop(beanGame, "farmer", "well").state;
beanGame = resolveDrop(beanGame, "farmer", "soil").state;
beanGame = endDay(beanGame);
assert.equal(findCard(beanGame, "soil").typeId, "ready_green_beans", "Green Beans mature again after two watered regrow nights");

let potatoGame = createGame();
potatoGame = playFromHand(potatoGame, "town-landmark").state;
const potatoPurchase = buySeeds(potatoGame, "potato");
assert.equal(potatoPurchase.ok, true, "Potato Seeds can be chosen at the General Store");
potatoGame = potatoPurchase.state;
assert.equal(potatoGame.coins, 2);
const potatoSeeds = oneCard(potatoGame, "potato_seeds");
potatoGame = playFromHand(potatoGame, "farm-landmark").state;
potatoGame = equip(potatoGame, potatoSeeds.id);
potatoGame = resolveDrop(potatoGame, "farmer", "soil").state;
assert.equal(findCard(potatoGame, "soil").typeId, "planted_potatoes");
assert.equal(findCard(potatoGame, "soil").meta.growthRemainingDays, 2);
potatoGame = equip(potatoGame, "watering-can");
potatoGame = resolveDrop(potatoGame, "farmer", "well").state;
potatoGame = resolveDrop(potatoGame, "farmer", "soil").state;
potatoGame = endDay(potatoGame);
potatoGame = resolveDrop(potatoGame, "farmer", "soil").state;
potatoGame = endDay(potatoGame);
assert.equal(findCard(potatoGame, "soil").typeId, "ready_potatoes", "Potatoes mature after two watered nights");
assert.equal(dropAction(potatoGame, "farmer", "soil"), null, "Potatoes cannot be harvested by hand");
potatoGame = equip(potatoGame, "hoe");
let potatoDig = resolveDrop(potatoGame, "farmer", "soil");
assert.equal(potatoDig.ok, true);
potatoGame = potatoDig.state;
assert.equal(findCard(potatoGame, "soil").typeId, "potato_mounds", "the first Hoe dig leaves visible Potato Mounds");
assert.equal(oneCard(potatoGame, "potatoes").meta.amount, 2, "the first dig yields two Potatoes");
assert.equal(potatoGame.seasonStats.harvestCount, 0, "a partial dig does not count as a finished harvest");
potatoGame = resolveDrop(potatoGame, "farmer", "soil").state;
assert.equal(findCard(potatoGame, "soil").typeId, "empty_plot", "the second Hoe dig returns the same Land to an Empty Plot");
assert.equal(oneCard(potatoGame, "potatoes").meta.amount, 4, "the second dig consolidates the full deterministic yield");
assert.equal(potatoGame.seasonStats.harvestCount, 1, "the completed two-dig crop counts as one harvest");
potatoGame = equip(potatoGame, oneCard(potatoGame, "potatoes").id);
potatoGame = resolveDrop(potatoGame, "farmer", "shipping").state;
assert.deepEqual(shipmentTotals(potatoGame), { amount: 4, value: 4 }, "all four Potatoes can be shipped from one quantity card");

let rainyPotatoes = createGame();
rainyPotatoes.day = 5;
findCard(rainyPotatoes, "soil").typeId = "planted_potatoes";
findCard(rainyPotatoes, "soil").meta = { areaId: "farm", isLand: true, cropId: "potato", growthRemainingDays: 2, growthTotalDays: 2 };
rainyPotatoes = endDay(rainyPotatoes);
assert.equal(findCard(rainyPotatoes, "soil").typeId, "watered_potatoes", "Spring rain waters thirsty Potatoes");

let removedPotatoes = createGame();
findCard(removedPotatoes, "soil").typeId = "ready_potatoes";
findCard(removedPotatoes, "soil").meta = { areaId: "farm", isLand: true, cropId: "potato" };
removedPotatoes = equip(removedPotatoes, "sickle");
removedPotatoes = resolveDrop(removedPotatoes, "farmer", "soil").state;
assert.equal(findCard(removedPotatoes, "soil").typeId, "empty_plot", "the Sickle can remove mature Potatoes without Produce");

let moundBoundary = createGame();
moundBoundary.day = 7;
findCard(moundBoundary, "soil").typeId = "potato_mounds";
findCard(moundBoundary, "soil").meta = { areaId: "farm", isLand: true, cropId: "potato" };
moundBoundary = endDay(moundBoundary);
assert.equal(moundBoundary.seasonSummary.cropsGrowing, 1, "the Weekly Journal counts a partially dug Potato crop");
moundBoundary = continueFarm(moundBoundary);
assert.equal(findCard(moundBoundary, "soil").typeId, "potato_mounds", "Potato Mounds persist into the next week");

assert.notEqual(CARD_DEFS.cleared_ground.art, CARD_DEFS.wild_soil.art);
assert.notEqual(CARD_DEFS.watered_empty_plot.art, CARD_DEFS.empty_plot.art);
assert.notEqual(CARD_DEFS.watered_carrots.art, CARD_DEFS.planted_carrots.art);
assert.notEqual(CARD_DEFS.watered_green_beans.art, CARD_DEFS.planted_green_beans.art);
assert.notEqual(CARD_DEFS.green_bean_seeds.art, CARD_DEFS.green_beans.art);
assert.notEqual(CARD_DEFS.potato_seeds.art, CARD_DEFS.potatoes.art);
assert.notEqual(CARD_DEFS.ready_potatoes.art, CARD_DEFS.potato_mounds.art);
assert.notEqual(CARD_DEFS.general_store.art, CARD_DEFS.home_farm_landmark.art);

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");
assert.match(app, /returnToHand/);
assert.match(app, /playFromHand/);
assert.match(app, /freeHands/);
assert.match(app, /money-unit/);
assert.match(app, /ap-unit/);
assert.match(app, /artFor/);
assert.match(app, /filledArt/);
assert.match(app, /implicitSourceId/);
assert.match(app, /renderCardFace/);
assert.match(app, /inspectedCardId/);
assert.match(app, /data-buy-seeds/);
assert.match(app, /renderStore/);
assert.match(app, /storeOpen/);
assert.match(app, /Choose a Seed card/);
assert.doesNotMatch(app, /card-actions/);
assert.match(app, /endDay/);
assert.match(app, /renderHand/);
assert.match(app, /renderInspection/);
assert.match(app, /startHandInspect/);
assert.match(app, /Tap to play · hold to inspect/);
assert.match(app, /First harvest:/);
assert.match(app, /afterHarvestLabel/);
assert.match(app, /inspection-fields/);
assert.match(app, /inspection-card/);
assert.match(app, /inspection-backdrop/);
assert.match(app, /<dt>Cost<\/dt>/);
assert.match(app, /<dt>First harvest<\/dt>/);
assert.match(app, /<dt>Yield<\/dt>/);
assert.match(app, /<dt>After harvest<\/dt>/);
assert.match(app, /id="reset">New Spring/);
assert.match(app, />Return item<\/button>/);
assert.doesNotMatch(app, /detachItem/);
assert.match(app, /handStacks/);
assert.match(app, /hand-stack-layer/);
assert.match(app, /data-hand-id/);
assert.match(app, /data-hand-kind="\$\{landmark \? "landmark" : "item"\}"/);
assert.match(app, /startHandDrag/);
assert.match(app, /cleanupHandDrag/);
assert.match(app, /lostpointercapture/);
assert.match(app, /window\.addEventListener\("pointerup", endHandDrag, true\)/);
assert.match(app, /querySelectorAll\("\.hand-card-ghost"\)/);
assert.match(app, /Drag this Landmark onto the table to travel/);
assert.match(app, /compact-hud/);
assert.match(app, /renderWeeklyJournal/);
assert.match(app, /continue-week/);
assert.doesNotMatch(app, /renderRunSetup|data-life-goal|renderGoalInspection/);
assert.match(app, /renderWeatherCard/);
assert.match(app, /renderWeatherInspection/);
assert.match(app, /summary-scroll/);
assert.match(app, /summary-actions/);
assert.match(app, /capturePersonBubble/);
assert.match(app, /person-speech/);
assert.match(app, /renderSpringChronicle/);
assert.match(app, /review-spring/);
assert.match(app, /PROTOTYPE_2\.storageKey/);
assert.match(app, /seasonLabel/);
assert.doesNotMatch(app, /renderAreaCarousel|data-area-step|viewedAreaId/);
assert.doesNotMatch(app, /Backpack|backpack/);
assert.doesNotMatch(app, /zone meadow|zone road|Farm lane/);
assert.doesNotMatch(app, /Coin Purse|DAY_PHASES|timeOfDay|advancePhase|day-card/);
assert.doesNotMatch(app, /requestAnimationFrame|remainingMs|togglePause/);
assert.match(app, /pointerdown/);
assert.match(app, /tapDecision/);
assert.match(app, /selectedCardId/);
assert.match(app, /Wild Soil still has grass\. Use the Sickle first/);
assert.match(app, /resultFeedback/);
assert.doesNotMatch(app, /season_cleanup|crop_remains|reviewSeasonFarm/);
assert.match(app, /companionId/);
assert.doesNotMatch(app, /drawPile|playsPerDay/i);
assert.match(styles, /\.hand/);
assert.match(styles, /\.hand-stack-layer/);
assert.match(styles, /\.money-unit/);
assert.match(styles, /\.compact-hud/);
assert.match(styles, /\.season-summary/);
assert.match(styles, /\.hand-landmark/);
assert.match(styles, /\.hand-card-ghost/);
assert.match(styles, /\.card-inspection/);
assert.match(styles, /\.inspection-card/);
assert.match(styles, /\.inspection-backdrop/);
assert.match(styles, /\.inspection-fields/);
assert.match(styles, /\.store-seed-card/);
assert.match(styles, /\.store-seed-grid/);
assert.match(styles, /home-farm-background\.png/);
assert.match(styles, /home-farm-rain-background\.png/);
assert.match(styles, /valley-town-background\.png/);
assert.doesNotMatch(styles, /\.day-strip|\.area-ribbon|\.status-bar|\.hint\s*\{/);
assert.doesNotMatch(styles, /\.area-carousel/);
assert.match(styles, /\.world-board\.area-town/);
assert.match(styles, /\.world-board\.area-farm/);
assert.match(styles, /--card-shadow/);
assert.match(styles, /0 5px 0 var\(--card-shadow/);
assert.match(styles, /\.card-title/);
assert.doesNotMatch(styles, /\.card-description|:hover \.card-description|:focus-visible \.card-description|Pull to detach/);

console.log("Crop/AP/Week smoke test passed: finite Land persists, crops grow and regrow correctly, the Weekly Journal pauses after day 7, and Continue Farm preserves the world into the next week.");
