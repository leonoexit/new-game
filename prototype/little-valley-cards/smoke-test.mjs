import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { AREAS, CARD_DEFS, GAME } from "./data.js";
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
  playFromHand,
  resolveDrop,
  returnToHand,
  tapDecision,
  validTargets,
} from "./engine.js";

for (const definition of Object.values(CARD_DEFS)) {
  assert.ok(definition.art, `${definition.name} must have artwork`);
  await access(fileURLToPath(new URL(definition.art, import.meta.url)));
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

let game = createGame();
assert.equal(game.version, 12);
assert.equal(game.day, 1);
assert.equal(game.coins, 2);
assert.deepEqual(AREAS.map((area) => area.id), ["farm", "town"]);
assert.equal(farmerArea(game), "farm");
assert.equal(cardArea(game, findCard(game, "store")), "town");
assert.equal(cardArea(game, findCard(game, "shipping")), "farm");
assert.equal(findCard(game, "farm-landmark").meta.fixed, true);
assert.equal(findCard(game, "town-landmark").meta.fixed, true);
assert.equal(cardsOfType(game, "coin_purse").length, 0, "money is not a card");
assert.equal(CARD_DEFS.coin_purse, undefined, "Coin Purse is not part of the runtime card catalog");
assert.deepEqual(handItems(game).map((item) => item.id), ["farm-landmark", "town-landmark", "hoe", "watering-can", "sickle"]);
assert.deepEqual(validTargets(game, "farmer"), ["hoe", "watering-can", "sickle"]);

assert.deepEqual(tapDecision(game, null, "farmer"), { kind: "select", cardId: "farmer" });
assert.deepEqual(tapDecision(game, "farmer", "hoe"), {
  kind: "resolve",
  sourceId: "farmer",
  targetId: "hoe",
});

let purchase = buySeeds(game);
assert.equal(purchase.ok, false, "Seeds cannot be bought remotely from Home Farm");
assert.equal(game.coins, 2);
assert.equal(dropAction(game, "farmer", "store"), null, "cross-Area card interactions are invalid");

let travel = playFromHand(game, "town-landmark");
assert.equal(travel.ok, true);
game = travel.state;
assert.equal(farmerArea(game), "town");
assert.equal(game.day, 1, "travel does not advance the day in this experiment");
const townEndDay = endDay(game);
assert.equal(townEndDay.day, 1, "the day can only end at Home Farm");
assert.match(townEndDay.lastMessage, /return to Home Farm/);

purchase = buySeeds(game);
assert.equal(purchase.ok, true);
game = purchase.state;
assert.equal(game.coins, 0);
let seeds = oneCard(game, "carrot_seeds");
assert.equal(seeds.meta.inHand, true, "purchased Seeds go directly into the Hand");
assert.equal(seeds.meta.amount, 2);

travel = playFromHand(game, "farm-landmark");
assert.equal(travel.ok, true);
game = travel.state;
assert.equal(farmerArea(game), "farm");

game = equip(game, "sickle");
assert.equal(carriedItem(game, "farmer").typeId, "sickle");
travel = playFromHand(game, "town-landmark");
assert.equal(travel.ok, true);
game = travel.state;
assert.equal(cardArea(game, carriedItem(game, "farmer")), "town", "carried cards travel with Farmer");
game = playFromHand(game, "farm-landmark").state;
let stored = returnToHand(game, "sickle");
assert.equal(stored.ok, true);
game = stored.state;
assert.equal(carriedItem(game, "farmer"), null);
assert.equal(findCard(game, "sickle").meta.inHand, true);
game = equip(game, "sickle");
game = resolveDrop(game, "farmer", "soil").state;
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(findCard(game, "soil").typeId, "cleared_ground");
assert.equal(findCard(game, "soil2").typeId, "cleared_ground");
oneCard(game, "sickle");

game = equip(game, "hoe");
assert.equal(findCard(game, "sickle").meta.inHand, true, "playing another Tool returns the previous Tool to the Hand");
game = resolveDrop(game, "farmer", "soil").state;
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(findCard(game, "soil").typeId, "empty_plot");
assert.equal(findCard(game, "soil2").typeId, "empty_plot");
oneCard(game, "hoe");

game = equip(game, "watering-can");
assert.equal(findCard(game, "hoe").meta.inHand, true);
game = resolveDrop(game, "farmer", "well").state;
assert.equal(findCard(game, "watering-can").meta.charges, 2);
game = resolveDrop(game, "farmer", "soil").state;
assert.equal(findCard(game, "soil").typeId, "watered_empty_plot", "cleared soil can be watered before sowing");
assert.equal(findCard(game, "watering-can").meta.charges, 1);

game = equip(game, seeds.id);
assert.equal(findCard(game, "watering-can").meta.inHand, true);
game = resolveDrop(game, "farmer", "soil").state;
assert.equal(findCard(game, "soil").typeId, "watered_carrots", "sowing watered soil creates a watered crop");
assert.equal(findCard(game, "soil").meta.growthRemainingDays, 1);
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(findCard(game, "soil2").typeId, "planted_carrots", "sowing first remains valid");
assert.equal(cardsOfType(game, "carrot_seeds").length, 0);

game = equip(game, "watering-can");
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(findCard(game, "soil2").typeId, "watered_carrots", "a sown crop can be watered afterward");
assert.equal(findCard(game, "watering-can").meta.charges, 0);
assert.equal(cardLabel(game, findCard(game, "watering-can")), "Watering Can · Empty");
assert.equal(findCard(game, "soil").typeId, "watered_carrots", "crops do not grow from unrelated actions");

game = endDay(game);
assert.equal(game.day, 2);
assert.equal(findCard(game, "soil").typeId, "ready_carrots");
assert.equal(findCard(game, "soil2").typeId, "ready_carrots");
assert.equal(game.coins, 0, "ending a growth day does not invent income");

let stowed = freeHands(game);
assert.equal(stowed.ok, true);
game = stowed.state;
assert.equal(carriedItem(game, "farmer"), null, "Farmer must harvest with free hands");
game = resolveDrop(game, "farmer", "soil").state;
let harvests = cardsOfType(game, "carrots");
assert.equal(harvests.length, 1);
assert.equal(harvests[0].meta.inHand, true, "harvest goes directly into the Hand");
game = resolveDrop(game, "farmer", "soil2").state;
harvests = cardsOfType(game, "carrots");
assert.equal(harvests.length, 2);
assert.equal(harvests.every((item) => item.meta.inHand), true);

game = equip(game, harvests[0].id);
assert.equal(carriedItem(game, "farmer").typeId, "carrots");
game = resolveDrop(game, "farmer", "shipping").state;
assert.equal(carriedItem(game, "farmer"), null);
game = equip(game, harvests[1].id);
game = resolveDrop(game, "farmer", "shipping").state;
assert.equal(findCard(game, "shipping").meta.amount, 6);
assert.equal(game.coins, 0, "Shipping Bin pays only overnight");

game = endDay(game);
assert.equal(game.day, 3);
assert.equal(game.coins, 6);
assert.equal(game.phase, "playing");
assert.equal(game.milestones.firstSixCoins, true);
assert.equal(findCard(game, "shipping").meta.amount, 0);

travel = playFromHand(game, "town-landmark");
assert.equal(travel.ok, true);
game = travel.state;
purchase = buySeeds(game);
assert.equal(purchase.ok, true, "the second Seed purchase remains available");
game = purchase.state;
assert.equal(game.coins, 4);
seeds = oneCard(game, "carrot_seeds");
game = playFromHand(game, "farm-landmark").state;
game = equip(game, seeds.id);
game = resolveDrop(game, "farmer", "soil").state;
game = resolveDrop(game, "farmer", "soil2").state;
game = equip(game, "watering-can");
game = resolveDrop(game, "farmer", "well").state;
game = resolveDrop(game, "farmer", "soil").state;
game = resolveDrop(game, "farmer", "soil2").state;
game = endDay(game);
assert.equal(game.day, 4);
assert.equal(findCard(game, "soil").typeId, "ready_carrots");

stowed = freeHands(game);
assert.equal(stowed.ok, true);
game = stowed.state;
game = resolveDrop(game, "farmer", "soil").state;
game = resolveDrop(game, "farmer", "soil2").state;
for (const carrots of [...cardsOfType(game, "carrots")]) {
  game = equip(game, carrots.id);
  game = resolveDrop(game, "farmer", "shipping").state;
}
game = endDay(game);
assert.equal(game.day, 5);
assert.equal(game.coins, 10);
assert.equal(game.phase, "playing");
oneCard(game, "hoe");
oneCard(game, "watering_can");
oneCard(game, "sickle");

assert.notEqual(CARD_DEFS.cleared_ground.art, CARD_DEFS.wild_soil.art);
assert.notEqual(CARD_DEFS.watered_empty_plot.art, CARD_DEFS.empty_plot.art);
assert.notEqual(CARD_DEFS.watered_carrots.art, CARD_DEFS.planted_carrots.art);
assert.notEqual(CARD_DEFS.general_store.art, CARD_DEFS.home_farm_landmark.art);

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");
assert.match(app, /handItems/);
assert.match(app, /returnToHand/);
assert.match(app, /playFromHand/);
assert.match(app, /freeHands/);
assert.match(app, /money-unit/);
assert.match(app, /data-buy-seeds/);
assert.match(app, /endDay/);
assert.match(app, /renderHand/);
assert.match(app, /data-hand-id/);
assert.doesNotMatch(app, /renderAreaCarousel|data-area-step|viewedAreaId/);
assert.doesNotMatch(app, /Backpack|backpack/);
assert.doesNotMatch(app, /Coin Purse|DAY_PHASES|timeOfDay|advancePhase|day-card/);
assert.doesNotMatch(app, /requestAnimationFrame|remainingMs|togglePause/);
assert.match(app, /pointerdown/);
assert.match(app, /tapDecision/);
assert.match(app, /selectedCardId/);
assert.match(app, /companionId/);
assert.doesNotMatch(app, /drawPile|playsPerDay/i);
assert.match(styles, /\.hand/);
assert.match(styles, /\.money-unit/);
assert.match(styles, /\.day-strip/);
assert.match(styles, /\.hand-landmark/);
assert.doesNotMatch(styles, /\.area-carousel/);
assert.match(styles, /\.world-board\.area-town/);
assert.match(styles, /Pull to detach/);

console.log("Hand/Landmark/day-cycle smoke test passed: Landmark cards travel between Farm and Town, item cards stay grouped in Hand, Tools work, hand-harvest resolves, and the repeat economy remains valid.");
