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
  isBusy,
  moveCard,
  resolveDrop,
  validTargets,
} from "./engine.js";

for (const definition of Object.values(CARD_DEFS)) {
  assert.ok(definition.art, `${definition.name} must have generated artwork`);
  await access(fileURLToPath(new URL(definition.art, import.meta.url)));
}

let game = createGame();
assert.equal(game.version, 4);
assert.equal(game.cards.length, 5);
assert.deepEqual(validTargets(game, "farmer"), ["soil", "well"]);
assert.equal(dropAction(game, "seeds", "soil"), null);

game = resolveDrop(game, "farmer", "soil").state;
assert.equal(game.jobs[0].kind, "clear_soil");
game = advance(game, 3_500).state;
assert.equal(findCard(game, "soil").typeId, "empty_plot");

assert.equal(dropAction(game, "seeds", "farmer"), "attach_item");
game = resolveDrop(game, "seeds", "farmer").state;
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
game = resolveDrop(game, "seeds", "farmer").state;
game = resolveDrop(game, "farmer", "soil").state;
assert.equal(isBusy(game, "farmer"), true);
assert.equal(isBusy(game, "seeds"), true, "an item carried by a busy actor must be busy");
game = advance(game, 3_000).state;
assert.equal(findCard(game, "soil").typeId, "planted_carrots");
assert.equal(findCard(game, "seeds").meta.amount, 1);
assert.equal(findCard(game, "seeds").meta.parentId, "farmer", "remaining seeds stay carried");
assert.match(currentHint(game), /Pull Carrot Seeds away/);

game = detachItem(game, "seeds");
assert.equal(carriedItem(game, "farmer"), null);

game = resolveDrop(game, "farmer", "well").state;
game = advance(game, 2_500).state;
const water = game.cards.find((item) => item.typeId === "water");
assert.ok(water, "well work must create Water");
assert.equal(water.meta.parentId, "farmer", "drawn Water must attach to Farmer");
assert.equal(dropAction(game, water.id, "soil"), null, "Water cannot act without its carrier");
assert.equal(dropAction(game, "farmer", "soil"), "water_crop");
game = resolveDrop(game, "farmer", "soil").state;
assert.equal(isBusy(game, water.id), true);
game = advance(game, 2_500).state;
assert.equal(findCard(game, "soil").typeId, "watered_carrots");
assert.equal(findCard(game, water.id), null, "Water is consumed after watering");
game = advance(game, 7_000).state;
assert.equal(findCard(game, "soil").typeId, "ready_carrots");

game = resolveDrop(game, "farmer", "soil").state;
game = advance(game, 3_500).state;
const carrots = game.cards.find((item) => item.typeId === "carrots");
assert.equal(carrots.meta.amount, 3);
assert.equal(findCard(game, "soil").typeId, "empty_plot");
assert.match(currentHint(game), /Market/);

game = resolveDrop(game, carrots.id, "market").state;
assert.equal(game.phase, "won");
assert.equal(game.cards.find((item) => item.typeId === "coin_purse").meta.amount, GAME.goalCoins);

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");
assert.match(app, /pointerdown/);
assert.match(app, /validTargets/);
assert.match(app, /work-overlay/);
assert.match(app, /companionId/);
assert.match(app, /companionOffsetX/);
assert.doesNotMatch(app, /hand|drawPile|playsPerDay/);
assert.match(styles, /person-card\.worker-busy/);
assert.match(styles, /actor-glyph/);
assert.match(styles, /Pull to detach/);

console.log("Actor Stack v0.2 smoke test passed: attach, compound movement, detach, targeting, item lifecycle, busy state, growth, harvest, trade, and victory.");
