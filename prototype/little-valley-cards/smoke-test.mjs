import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CARD_DEFS, GAME } from "./data.js";
import {
  advance,
  cardLabel,
  carriedItem,
  createGame,
  currentHint,
  detachItem,
  dropAction,
  findCard,
  moveCard,
  resolveDrop,
  validTargets,
} from "./engine.js";

for (const definition of Object.values(CARD_DEFS)) {
  assert.ok(definition.art, `${definition.name} must have generated artwork`);
  await access(fileURLToPath(new URL(definition.art, import.meta.url)));
}

let game = createGame();
assert.equal(game.version, 6);
assert.equal(game.cards.length, 6);
assert.deepEqual(validTargets(game, "farmer"), ["seeds", "soil", "soil2", "well"]);
assert.equal(dropAction(game, "seeds", "soil"), null);
assert.equal(dropAction(game, "seeds", "farmer"), null, "items are never the active verb");
assert.equal(dropAction(game, "farmer", "seeds"), "pick_up_item", "items can be carried before a destination exists");
assert.equal(dropAction(game, "farmer", "well"), "draw_water", "the Well remains usable before a crop needs Water");

game = resolveDrop(game, "farmer", "soil").state;
assert.equal(findCard(game, "soil").typeId, "empty_plot");
assert.equal("jobs" in game, false, "the casting-job state has been removed");
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(findCard(game, "soil2").typeId, "empty_plot");

assert.equal(dropAction(game, "farmer", "seeds"), "pick_up_item");
game = resolveDrop(game, "farmer", "seeds").state;
assert.equal(findCard(game, "seeds").meta.parentId, "farmer");
assert.equal(carriedItem(game, "farmer").id, "seeds");
assert.equal(cardLabel(game, findCard(game, "farmer")), "Farmer · Carrying Carrot Seeds");
assert.equal(dropAction(game, "farmer", "soil"), "sow");

const beforeMove = findCard(game, "seeds");
game = moveCard(game, "farmer", 20, 180);
assert.equal(findCard(game, "farmer").x, 20);
assert.equal(findCard(game, "seeds").x, 35, "carried item must move with actor");
assert.notEqual(findCard(game, "seeds").y, beforeMove.y, "compound stack must move as one unit");

game = detachItem(game, "seeds");
assert.equal(carriedItem(game, "farmer"), null);
assert.match(game.lastMessage, /detached from Farmer/);
assert.equal(dropAction(game, "farmer", "soil"), null);
game = resolveDrop(game, "farmer", "seeds").state;
game = resolveDrop(game, "farmer", "soil").state;
assert.equal(findCard(game, "soil").typeId, "planted_carrots");
assert.equal(findCard(game, "seeds").meta.amount, 1);
assert.equal(findCard(game, "seeds").meta.parentId, "farmer", "remaining seeds stay carried");
assert.match(currentHint(game), /Farmer is carrying Carrot Seeds/);

game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(findCard(game, "soil2").typeId, "planted_carrots");
assert.equal(findCard(game, "seeds"), null, "second sow consumes the final seed");
assert.equal(carriedItem(game, "farmer"), null);

game = resolveDrop(game, "farmer", "well").state;
let water = game.cards.find((item) => item.typeId === "water");
assert.ok(water, "well work must create Water");
assert.equal(water.meta.parentId, "farmer", "drawn Water must attach to Farmer");
assert.equal(dropAction(game, water.id, "soil"), null, "Water cannot act without its carrier");
assert.equal(dropAction(game, "farmer", "soil"), "water_crop");
game = resolveDrop(game, "farmer", "soil").state;
assert.equal(findCard(game, "soil").typeId, "watered_carrots");
assert.equal(findCard(game, water.id), null, "Water is consumed after watering");

game = resolveDrop(game, "farmer", "well").state;
water = game.cards.find((item) => item.typeId === "water");
assert.equal(dropAction(game, "farmer", "soil2"), "water_crop");
game = resolveDrop(game, "farmer", "soil2").state;
assert.equal(findCard(game, "soil2").typeId, "watered_carrots");
assert.equal(findCard(game, water.id), null);

game = advance(game, 7_000).state;
assert.equal(findCard(game, "soil").typeId, "ready_carrots");
assert.equal(findCard(game, "soil2").typeId, "ready_carrots");

game = resolveDrop(game, "farmer", "soil").state;
let carrots = game.cards.find((item) => item.typeId === "carrots");
assert.equal(carrots.meta.amount, 3);
assert.equal(findCard(game, "soil").typeId, "empty_plot");
assert.match(currentHint(game), /Fresh produce/);

game = resolveDrop(game, carrots.id, "market").state;
assert.equal(game.phase, "playing", "one harvest is no longer enough to win");
assert.equal(game.cards.find((item) => item.typeId === "coin_purse").meta.amount, 3);

game = resolveDrop(game, "farmer", "soil2").state;
carrots = game.cards.find((item) => item.typeId === "carrots");
game = resolveDrop(game, carrots.id, "market").state;
assert.equal(game.phase, "won");
assert.equal(game.cards.find((item) => item.typeId === "coin_purse").meta.amount, GAME.goalCoins);

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");
assert.match(app, /pointerdown/);
assert.match(app, /validTargets/);
assert.doesNotMatch(app, /work-overlay|data-work-time|job-progress/);
assert.match(app, /companionId/);
assert.match(app, /companionOffsetX/);
assert.doesNotMatch(app, /\bhand\b|drawPile|playsPerDay/i);
assert.doesNotMatch(styles, /worker-busy|work-overlay/);
assert.match(styles, /actor-glyph/);
assert.match(styles, /Pull to detach/);

console.log("Fast two-plot smoke test passed: instant work, actor stacks, crop growth, two harvests, trade, and victory.");
