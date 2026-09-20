import assert from "node:assert/strict";
import { cardFamilyFor, cardPresentation, primaryStatusFor } from "./card-presentation.js";
import { CARD_DEFS, GAME, PEOPLE } from "./data.js";
import {
  cardArea,
  carriedItem,
  continueFarm,
  createGame,
  dropAction,
  endDay,
  equipFromHand,
  findCard,
  hydrateGame,
  resolveDrop,
  tapDecision,
} from "./engine.js";
import {
  availablePersonAction,
  personDetails,
  relationshipStateFor,
  syncPeopleForDate,
} from "./person-system.js";

const expectedSchedule = {
  1: { mira: "town" },
  2: { bram: "farm", nell: "town" },
  3: { nell: "town" },
  4: { mira: "town", bram: "town" },
  5: { nell: "town" },
  6: { bram: "farm" },
  7: { mira: "town" },
};

for (let day = 1; day <= 7; day += 1) {
  const state = createGame();
  state.day = day;
  syncPeopleForDate(state);
  const present = Object.values(PEOPLE).filter((person) => !findCard(state, person.cardId).meta.absent);
  assert.ok(present.length <= 2, `day ${day} has no more than two residents`);
  assert.deepEqual(
    Object.fromEntries(present.map((person) => [person.id, cardArea(state, findCard(state, person.cardId))])),
    expectedSchedule[day],
    `day ${day} uses the shared weekly schedule`,
  );
}

let spend = createGame();
findCard(spend, "farmer").meta.areaId = "town";
const mira = findCard(spend, "person-mira");
assert.equal(dropAction(spend, "farmer", mira.id), "spend_time");
assert.deepEqual(tapDecision(spend, null, "farmer"), { kind: "select", cardId: "farmer" });
assert.deepEqual(tapDecision(spend, "farmer", mira.id), { kind: "resolve", sourceId: "farmer", targetId: mira.id });
const spendResult = resolveDrop(spend, "farmer", mira.id);
assert.equal(spendResult.ok, true, "tap and drag share the same successful resolver");
assert.equal(spendResult.action, "spend_time");
assert.equal(spendResult.state.actionPoints, 7);
assert.equal(spendResult.state.memoryBook.people.mira.moments.length, 1);
assert.equal(spendResult.state.memoryBook.people.mira.moments[0].firstMeeting, true);
assert.match(spendResult.events[0], /Mira .*remembered/, "a successful Person interaction returns visible short feedback");

const onceOnly = resolveDrop(spendResult.state, "farmer", mira.id);
assert.equal(onceOnly.ok, false, "a Person accepts only one moment each day");
assert.equal(onceOnly.state.actionPoints, 7);
assert.equal(onceOnly.state.memoryBook.people.mira.moments.length, 1);

let invalidShare = createGame();
invalidShare.day = 2;
syncPeopleForDate(invalidShare);
invalidShare = equipFromHand(invalidShare, "hoe").state;
const bram = findCard(invalidShare, "person-bram");
assert.equal(dropAction(invalidShare, "farmer", bram.id), null, "Tools cannot be shared");
assert.equal(invalidShare.actionPoints, 8);
assert.equal(carriedItem(invalidShare, "farmer").typeId, "hoe");
invalidShare.cards.push({ id: "test-seed", typeId: "carrot_seeds", x: 0, y: 0, meta: { amount: 1, inHand: true } });
invalidShare = equipFromHand(invalidShare, "test-seed").state;
assert.equal(dropAction(invalidShare, "farmer", bram.id), null, "Seeds cannot be shared");
assert.equal(findCard(invalidShare, "test-seed").meta.amount, 1);

function addProduce(state, id, typeId, amount = 1) {
  state.cards.push({ id, typeId, x: 0, y: 0, meta: { amount, inHand: true } });
  return equipFromHand(state, id).state;
}

function meetNell(state, day, typeId = null) {
  state.day = day;
  state.weather = "sunny";
  state.actionPoints = GAME.actionPointsPerDay;
  syncPeopleForDate(state);
  findCard(state, "farmer").meta.areaId = "town";
  if (typeId) state = addProduce(state, `gift-${state.week}-${day}-${typeId}`, typeId);
  const result = resolveDrop(state, "farmer", "person-nell");
  assert.equal(result.ok, true, `Nell interaction succeeds on W${state.week} Day ${day}`);
  return result.state;
}

let relationship = createGame();
relationship = meetNell(relationship, 2);
assert.equal(relationshipStateFor(relationship, "nell"), "New");
relationship = meetNell(relationship, 3, "carrots");
assert.equal(relationshipStateFor(relationship, "nell"), "Familiar", "two distinct memories become Familiar");
relationship = meetNell(relationship, 5, "green_beans");
assert.equal(relationshipStateFor(relationship, "nell"), "Familiar");
relationship.week = 2;
relationship = meetNell(relationship, 2, "choice_carrots");
assert.equal(relationshipStateFor(relationship, "nell"), "Close", "four memories across days with a Share become Close");
assert.equal(personDetails(relationship, "nell").moments.length, 4);

let favorite = createGame();
favorite.day = 4;
syncPeopleForDate(favorite);
findCard(favorite, "farmer").meta.areaId = "town";
favorite = addProduce(favorite, "choice-cauliflower-gift", "choice_cauliflowers", 2);
const favoriteResult = resolveDrop(favorite, "farmer", "person-mira");
assert.equal(favoriteResult.ok, true);
favorite = favoriteResult.state;
assert.equal(favorite.actionPoints, 7, "Share spends exactly 1 AP");
assert.equal(findCard(favorite, "choice-cauliflower-gift").meta.amount, 1, "Share consumes exactly one Produce");
assert.equal(favorite.memoryBook.people.mira.moments[0].favorite, true);
assert.ok(favorite.seasonStats.memories.some((memory) => memory.kind === "favorite_moment"));

const repeatSignature = JSON.parse(JSON.stringify(spendResult.state));
repeatSignature.week = 2;
repeatSignature.day = 1;
syncPeopleForDate(repeatSignature);
findCard(repeatSignature, "farmer").meta.areaId = "town";
assert.equal(availablePersonAction(repeatSignature, findCard(repeatSignature, "farmer"), findCard(repeatSignature, "person-mira")), null);
const repeatResult = resolveDrop(repeatSignature, "farmer", "person-mira");
assert.equal(repeatResult.ok, false, "a repeated signature is rejected across Weeks");
assert.equal(repeatResult.state.actionPoints, repeatSignature.actionPoints);

const reloaded = hydrateGame(JSON.parse(JSON.stringify(relationship)));
assert.equal(relationshipStateFor(reloaded, "nell"), "Close", "relationship is derived from persisted memories after reload");
assert.equal(reloaded.memoryBook.people.nell.moments.length, 4);

const relationshipRules = createGame();
relationshipRules.memoryBook.people.bram.moments = [
  { id: "a", signature: "spend:farm:sunny", kind: "spend", week: 1, day: 1 },
  { id: "b", signature: "spend:farm:rainy", kind: "spend", week: 1, day: 2 },
  { id: "c", signature: "spend:town:sunny", kind: "spend", week: 1, day: 3 },
  { id: "d", signature: "spend:town:rainy", kind: "spend", week: 1, day: 4 },
];
assert.equal(relationshipStateFor(relationshipRules, "bram"), "Familiar", "four memories without a Share cannot become Close");
relationshipRules.memoryBook.people.bram.moments[3] = { id: "d", signature: "share:potato:ordinary", kind: "share", week: 1, day: 1 };
relationshipRules.memoryBook.people.bram.moments.forEach((moment) => { moment.day = 1; });
assert.equal(relationshipStateFor(relationshipRules, "bram"), "Familiar", "four memories on one date cannot become Close");

const legacy = createGame();
legacy.version = 21;
legacy.coins = 17;
findCard(legacy, "soil").typeId = "planted_carrots";
legacy.cards = legacy.cards.filter((item) => !CARD_DEFS[item.typeId]?.personId);
legacy.memoryBook.people = {
  mira: { moments: [{ id: "legacy-mira", signature: "spend:town:sunny", kind: "spend", week: 1, day: 1, areaId: "town", weather: "sunny" }] },
};
const migrated = hydrateGame(legacy);
assert.equal(migrated.version, 22);
assert.equal(migrated.coins, 17);
assert.equal(findCard(migrated, "soil").typeId, "planted_carrots", "v21 migration preserves farm state");
assert.equal(Object.keys(migrated.memoryBook.people).length, 3);
assert.equal(migrated.memoryBook.people.mira.moments.length, 1, "migration preserves existing Person memory data");
assert.ok(findCard(migrated, "person-mira"), "v21 migration adds persistent resident cards");

const arranged = createGame();
findCard(arranged, "person-mira").x = 29;
findCard(arranged, "person-mira").y = 271;
const arrangedReload = hydrateGame(JSON.parse(JSON.stringify(arranged)));
assert.deepEqual(
  { x: findCard(arrangedReload, "person-mira").x, y: findCard(arrangedReload, "person-mira").y },
  { x: 29, y: 271 },
  "reload preserves an arranged present Person position",
);

let journal = JSON.parse(JSON.stringify(favorite));
journal.day = 7;
syncPeopleForDate(journal);
journal = endDay(journal);
assert.equal(journal.phase, "weekly_journal");
assert.ok(journal.seasonSummary.memories.some((memory) => memory.kind === "favorite_moment"), "Weekly Journal retains Person highlights");
journal = continueFarm(journal);
assert.equal(journal.day, 1);
assert.equal(journal.week, 2);
assert.equal(journal.memoryBook.people.mira.moments.length, 1, "Continue Farm resets schedule but preserves relationship memory");
assert.equal(cardArea(journal, findCard(journal, "person-mira")), "town");

const presentationState = createGame();
for (const item of presentationState.cards) {
  const view = cardPresentation(presentationState, item, { interactionState: "target" });
  assert.ok(["person", "crop", "land", "tool", "item", "landmark", "service"].includes(cardFamilyFor(item)));
  assert.equal(typeof view.title, "string");
  assert.ok(view.primaryStatus === null || typeof view.primaryStatus === "string", `${item.typeId} has at most one primary status`);
  assert.equal(view.primaryStatus, primaryStatusFor(presentationState, item, {}));
  assert.equal(view.interactionState, "target", "interaction overlay stays independent from family and status");
}

console.log("Person Presence & Memory v0.1 tests passed: schedule, tap/drag actions, mutation safety, relationship derivation, migration, Journal persistence and shared card grammar are covered.");
