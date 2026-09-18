import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const prototypeDir = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(prototypeDir, "data.js"), "utf8");
const appSource = fs.readFileSync(path.join(prototypeDir, "app.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(prototypeDir, "index.html"), "utf8");
const styleSource = fs.readFileSync(path.join(prototypeDir, "styles.css"), "utf8");
const sandbox = {};
vm.runInNewContext(`${source}\nthis.demoData = { ART, ACTORS, GAME, DAYS, EVENTS };`, sandbox);

const { ART, ACTORS, GAME, DAYS, EVENTS } = sandbox.demoData;
const errors = [];
const eventIds = new Set();

if (DAYS.length !== GAME.finalDay) errors.push(`Expected ${GAME.finalDay} days, found ${DAYS.length}.`);
if (Object.keys(ACTORS).length !== 4) errors.push("Expected the field actor and three character actors.");
if (ACTORS.field?.kind !== "activity") errors.push("The field must be modeled as an activity actor.");
if (GAME.startingFarm <= 0 || GAME.startingVitality <= 0) errors.push("Shared meters need playable starting values.");
if (htmlSource.includes('id="threads"')) errors.push("Actors must not render as persistent tabs.");
if (!htmlSource.includes('id="status-hud"')) errors.push("Unified status HUD is missing.");
if (appSource.includes('class="commit pixel-button"')) errors.push("Choice flow still contains a redundant confirmation step.");
if (!appSource.includes('class="event-deck"')) errors.push("Horizontal event deck is missing.");
if (!appSource.includes("result-event-card")) errors.push("Evening result must preserve the event-card presentation.");
if (!styleSource.includes("height: clamp(520px")) errors.push("Event and result cards must keep one stable height.");
if (!appSource.includes('id="deck-prev"') || !appSource.includes('id="deck-next"')) errors.push("Desktop event navigation arrows are missing.");
if (!appSource.includes("card.offsetLeft - firstCard.offsetLeft")) errors.push("Carousel navigation is missing stable card-relative positioning.");
if (!appSource.includes("scheduledBeats")) errors.push("Timeline beats are missing.");
if (!styleSource.includes("scroll-snap-type: x mandatory")) errors.push("Event deck is missing horizontal snap behavior.");

for (const event of EVENTS) {
  if (eventIds.has(event.id)) errors.push(`Duplicate event id: ${event.id}.`);
  eventIds.add(event.id);
  if (!ACTORS[event.actor]) errors.push(`Unknown actor ${event.actor} in ${event.id}.`);
  if (event.appears < 1 || event.deadline < event.appears || event.deadline > GAME.finalDay) errors.push(`${event.id} has an invalid timeline.`);
  if (event.choices.length !== 2) errors.push(`${event.id} must have exactly two choices.`);
  if (!event.art || !event.alt || (!event.premise && !event.premises)) errors.push(`${event.id} is missing presentation data.`);
  if (!event.onExpire?.text) errors.push(`${event.id} is missing an expiry consequence.`);
  for (const choice of event.choices) {
    if (!choice.id || !choice.label || !choice.hint || !choice.result || !choice.effects) errors.push(`${event.id} has an incomplete choice.`);
  }
}

for (let day = 1; day <= GAME.finalDay; day += 1) {
  const possible = EVENTS.filter((event) => day >= event.appears && day <= event.deadline);
  if (possible.length > 3) errors.push(`Day ${day} can expose more than three unresolved events.`);
}

for (const [name, assetPath] of Object.entries(ART)) {
  const absolute = path.resolve(prototypeDir, assetPath);
  if (!fs.existsSync(absolute)) errors.push(`Missing ${name} asset: ${absolute}.`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`OK: ${DAYS.length} days, ${EVENTS.length} timed events, 3 shared pressures, actor memory, deadlines and morning beats.`);
