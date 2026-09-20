import assert from "node:assert/strict";
import {
  GAME,
  PROTOTYPE_2,
  prototype2ConditionForSeed,
  prototype2WeatherForDay,
} from "./data.js";
import {
  continueFarm,
  createPrototype2Game,
  endDay,
  findCard,
  hydratePrototype2Game,
  lifePathProgress,
  lifePathProgresses,
  newSpring,
  playFromHand,
  resolveDrop,
} from "./engine.js";
import { relationshipStateFor, syncPeopleForDate } from "./person-system.js";

assert.notEqual(PROTOTYPE_2.storageKey, GAME.storageKey, "Prototype 2 persistence is isolated from Prototype 1");
assert.equal(PROTOTYPE_2.totalDays, 14);
assert.equal(prototype2ConditionForSeed(1).id, "dry_spring");
assert.equal(prototype2ConditionForSeed(2).id, "gentle_spring");
assert.equal(PROTOTYPE_2.conditions.dry_spring.weatherByDay.filter((weather) => weather === "rainy").length, 2);
assert.equal(PROTOTYPE_2.conditions.gentle_spring.weatherByDay.filter((weather) => weather === "rainy").length, 6);
for (const condition of Object.values(PROTOTYPE_2.conditions)) {
  assert.equal(condition.weatherByDay.length, PROTOTYPE_2.totalDays);
  condition.weatherByDay.forEach((weather, index) => {
    assert.equal(prototype2WeatherForDay(condition.id, index + 1), weather);
  });
}

const setup = createPrototype2Game({ seed: 2 });
assert.equal(setup.version, 23);
assert.equal(setup.prototype, 2);
assert.equal(setup.phase, "playing", "a new Spring begins without forcing an Objective choice");
assert.equal(setup.run.conditionId, "gentle_spring");
assert.equal(setup.run.goalId, undefined);
assert.equal(setup.day, 1);
assert.equal(setup.actionPoints, 8);
assert.deepEqual(lifePathProgresses(setup).map((path) => path.current), [0, 0]);
assert.equal(endDay(setup).day, 2, "the player is immediately free to live the Spring");

const setupReload = hydratePrototype2Game(JSON.parse(JSON.stringify(createPrototype2Game({ seed: 2 }))));
assert.equal(setupReload.phase, "playing");
assert.equal(setupReload.actionPoints, 8, "reloading preserves the day-one AP budget");
assert.equal(setupReload.run.conditionId, "gentle_spring");

let telemetry = createPrototype2Game({ seed: 1 });
telemetry = playFromHand(telemetry, "town-landmark").state;
assert.equal(telemetry.run.telemetry.apSpent.travel, 1);
const moment = resolveDrop(telemetry, "farmer", "person-mira");
assert.equal(moment.ok, true);
assert.equal(moment.targetId, "person-mira", "Person results identify the card that should speak");
telemetry = moment.state;
assert.equal(telemetry.run.telemetry.apSpent.people, 1);
telemetry = playFromHand(telemetry, "farm-landmark").state;
telemetry = playFromHand(telemetry, "sickle").state;
telemetry = resolveDrop(telemetry, "farmer", "soil2").state;
assert.deepEqual(telemetry.run.telemetry.apSpent, { farming: 1, travel: 2, people: 1 });

const telemetryReload = hydratePrototype2Game(JSON.parse(JSON.stringify(telemetry)));
assert.deepEqual(telemetryReload.run.telemetry, telemetry.run.telemetry, "reload preserves AP telemetry");
assert.equal(telemetryReload.memoryBook.people.mira.moments.length, 1);
assert.equal(telemetryReload.run.seed, 1);
assert.equal(telemetryReload.run.goalId, undefined);

const care = createPrototype2Game({ seed: 2 });
care.memoryBook.choiceCrops = ["carrot", "green_bean", "cauliflower", "carrot"];
const careProgress = lifePathProgress(care, "care_for_land");
assert.equal(careProgress.current, 3, "Choice crop memories are counted uniquely");
assert.equal(careProgress.complete, true);

const neighbors = createPrototype2Game({ seed: 1 });
neighbors.memoryBook.people.mira.moments = [
  { id: "m1", signature: "spend:town:sunny", kind: "spend", week: 1, day: 1 },
  { id: "m2", signature: "share:cauliflower:ordinary", kind: "share", week: 1, day: 4 },
  { id: "m3", signature: "share:cauliflower:choice", kind: "share", week: 1, day: 7 },
  { id: "m4", signature: "share:carrot:ordinary", kind: "share", week: 2, day: 8 },
];
neighbors.memoryBook.people.bram.moments = [
  { id: "b1", signature: "spend:farm:sunny", kind: "spend", week: 1, day: 2 },
  { id: "b2", signature: "share:potato:ordinary", kind: "share", week: 2, day: 13 },
];
assert.equal(relationshipStateFor(neighbors, "mira"), "Close");
assert.equal(relationshipStateFor(neighbors, "bram"), "Familiar");
assert.equal(lifePathProgress(neighbors, "know_neighbors").complete, true);

let run = createPrototype2Game({ seed: 2 });
for (let ending = 1; ending <= 6; ending += 1) run = endDay(run);
assert.equal(run.day, 7);
assert.equal(run.phase, "playing");
run = endDay(run);
assert.equal(run.day, 7);
assert.equal(run.phase, "weekly_journal");
assert.equal(run.week, 1);
assert.equal(run.actionPoints, 0);
assert.ok(run.seasonSummary);
assert.equal(endDay(run).day, 7, "the Week Journal pauses further overnight resolution");

run = continueFarm(run);
assert.equal(run.phase, "playing");
assert.equal(run.day, 8);
assert.equal(run.week, 2);
assert.equal(run.actionPoints, 8);
assert.equal(findCard(run, "person-mira").meta.absent, undefined, "the weekly Person schedule repeats on day 8");
assert.equal(findCard(run, "person-mira").meta.areaId, "town");

for (let ending = 8; ending <= 13; ending += 1) run = endDay(run);
assert.equal(run.day, 14);
assert.equal(run.phase, "playing");
run = endDay(run);
assert.equal(run.day, 14);
assert.equal(run.phase, "spring_chronicle");
assert.equal(run.actionPoints, 0);
assert.ok(run.run.chronicle);
assert.equal(run.run.chronicle.paragraphs.length, 4);
assert.match(run.run.chronicle.paragraphs.at(-1), /No single path/);
assert.equal(endDay(run).day, 14, "the Chronicle cannot advance to day 15");
assert.deepEqual(endDay(run).run.chronicle, run.run.chronicle, "the final overnight resolves exactly once");
assert.equal(playFromHand(run, "hoe").ok, false, "reviewing the final board cannot mutate Hand state");

const endingReload = hydratePrototype2Game(JSON.parse(JSON.stringify(run)));
assert.equal(endingReload.phase, "spring_chronicle");
assert.equal(endingReload.day, 14);
assert.deepEqual(endingReload.run.chronicle, run.run.chronicle);

const nextSpring = newSpring(run);
assert.equal(nextSpring.phase, "playing");
assert.equal(nextSpring.day, 1);
assert.equal(nextSpring.run.seed, 3);
assert.notEqual(nextSpring.run.conditionId, run.run.conditionId);
assert.equal(nextSpring.run.goalId, undefined);
assert.equal(nextSpring.memoryBook.choiceCrops.length, 0);
assert.equal(nextSpring.memoryBook.people.mira.moments.length, 0);
assert.deepEqual(nextSpring.run.telemetry.apSpent, { farming: 0, travel: 0, people: 0 });

const dayEightSchedule = createPrototype2Game({ seed: 1 });
dayEightSchedule.day = 8;
dayEightSchedule.week = 2;
syncPeopleForDate(dayEightSchedule);
assert.equal(findCard(dayEightSchedule, "person-mira").meta.areaId, "town");

console.log("Prototype 2 tests passed: free-start runs, isolated persistence, deterministic Weather, emergent life paths, AP telemetry, reload, 14-day boundaries, Chronicle and New Spring are covered.");
