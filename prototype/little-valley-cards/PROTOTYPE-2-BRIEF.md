# Prototype 2 — One Spring, One Life

**Status:** implemented; awaiting two-run hands-on validation  
**Purpose:** test whether a finite Spring can reveal a life chosen through play, without assigning that life in advance

## Why Prototype 2 exists

Prototype 1 established a small farming world made from persistent physical cards: Land transformation, crops, Tools, Hand, Areas, AP, Weather, Person presence, contextual Memory and a shared card grammar.

It did not yet give those local actions a larger arc. Prototype 2 asks:

> Can a short, finite Spring turn farming, time and relationships into meaningful choices about how the player actually lived?

The answer must emerge from play. Asking the player to select an objective before day 1 would narrow that freedom and turn a way of living into an assigned checklist.

## Core hypothesis

A 14-day run will feel personal and replayable when:

1. the world condition is visible and legible as a Weather card;
2. the player begins freely, without declaring an objective;
3. farming, travel and Person moments compete for the same visible AP budget;
4. the ending Chronicle interprets the player's accumulated choices without scoring or judging them.

The prototype succeeds only if two runs can produce recognizably different stories from the same small content set. More crops, Areas, professions or residents are not evidence for this hypothesis.

## Run contract

- One run lasts **14 Spring days**, divided into two seven-day chapters.
- Day 1 begins immediately. There is no setup choice or chosen Goal.
- Day 7 ends with a Week Journal and continues into day 8.
- Day 14 resolves growth and shipping once, then opens the final Spring Chronicle.
- A new Spring starts from a clean world state under a new seed and never imports or overwrites Prototype 1 state.
- The seed deterministically selects Gentle Spring or Dry Spring and its authored 14-day forecast. Reloading cannot redraw it.

## Weather as a card

Weather is world state, so it uses the same visible card language as the rest of the world.

- A compact Weather card is present on every Area table.
- Its face shows today's Sun or Rain and the current Spring condition.
- Tapping it opens the full deterministic 14-day forecast and seed.
- It is an information card, not a portable object and not part of the Hand.
- Rain automatically waters prepared plots and thirsty crops without AP.

Prototype 2 begins with exactly two conditions:

- **Gentle Spring** — frequent rain releases some watering pressure.
- **Dry Spring** — scarce rain keeps watering and refill AP relevant.

Conditions change only the forecast. They add no hidden modifiers, random crop failure or bonus income.

## Emergent life paths

`Care for the Land` and `Know Your Neighbors` remain useful interpretations, but they are not objectives presented to the player.

- **Care for the Land** reads Choice harvest memories across crop families.
- **Know Your Neighbors** reads Memory-derived relationships.
- Both readings are derived continuously from existing state.
- Neither grants AP, income, acceleration, buffs or exclusive content.
- Neither appears as a progress chip during ordinary play.
- The Week Journal may reflect both readings without telling the player what to pursue.
- The Chronicle identifies the strongest direction that emerged, or says that no single path dominated.

These are lenses for remembrance, not contracts. The player is always free to mix, ignore or change priorities.

## Player-facing arc

```text
Seeded Weather card
        ↓
Begin day 1 freely
        ↓
14 days of shared AP pressure
        ↓
Farm commitments and Person presence compete for time
        ↓
Week Journal reflects what has happened so far
        ↓
Spring Chronicle interprets the life that emerged
        ↓
Begin another free Spring
```

The intended feeling is:

> I could not do everything, and what I repeatedly chose made this Spring mine.

## Systems retained from Prototype 1

- exactly three persistent Land;
- five distinct crop behaviors and deterministic Tended/Choice Quality;
- persistent Tools, Hand and carrying rules;
- one visible AP budget shared by farm work, travel and Person moments;
- Home Farm and Valley Town Area cards;
- Mira, Bram and Nell as prototype-only residents;
- fixed, learnable schedules;
- Spend Time and Share Produce;
- relationships derived from contextual Memory, not heart points;
- neutral physical card grammar with family accents;
- Journals as remembrance rather than score screens.

Prototype 1 remains an implemented but manually unvalidated foundation. Prototype 2 is the active experiment.

## New systems, and only these systems

1. deterministic 14-day run seed and two Spring conditions;
2. an inspectable Weather card with the full forecast;
3. two derived life-path readings that never constrain play;
4. a day-14 evidence-based Chronicle;
5. isolated Prototype 2 persistence and a clean New Spring flow;
6. lightweight AP telemetry for farming, travel and Person moments;
7. short Person speech bubbles as immediate interaction feedback.

Telemetry supports testing and Chronicle prose. It must never become a visible efficiency score.

## Person feedback contract

After a successful Spend Time or Share interaction, a short speech bubble appears beside the Person who received it.

- The bubble confirms that the world acknowledged the action.
- It is anchored to the Person rather than detached as a global toast.
- It disappears automatically and contains no choices.
- Memory, one-moment-per-day rules, AP and Produce consumption remain authoritative.
- There is still no dialogue tree, conversation modal or authored event-card system.

## Spring Chronicle contract

The Chronicle answers:

1. What did the farm become?
2. Who became part of this Spring?
3. What did the player repeatedly spend time on?
4. Which direction emerged, if any?

Every sentence must be traceable to saved actions or world state. The Chronicle may mention crops discovered, living crops, Choice memories, relationships, meaningful Person memories and broad AP emphasis. It must not invent motives, rank the player, award stars or describe an unchosen path as failure.

## Explicit non-goals

Prototype 2 does not add:

- fishing, mining, combat, cooking or crafting;
- additional seasons, Areas, crops or residents;
- dialogue trees, conversation modals or event-card conversations;
- heart points, gift counters or hidden friendship multipliers;
- resident utility buffs or random Presence Decks;
- energy alongside AP;
- meta-progression, unlock trees or permanent power;
- festivals, quests, collections or Community Center equivalents;
- a fourth Land or numerical ending score.

## Interaction and presentation constraints

- Tap and drag remain parallel inputs to the same engine actions.
- Card dimensions, Hand behavior and free board arrangement remain unchanged unless hands-on evidence exposes a blocking problem.
- Weather is a non-portable information card.
- Life-path readings stay out of normal card faces and do not become quests.
- Person speech bubbles are brief local feedback only.
- Full explanations belong in Inspection, Journal or Chronicle.
- Long Journal and Chronicle content must scroll without hiding their action buttons.

## Persistence and safety

- Prototype 1 saves remain readable by Prototype 1.
- Prototype 2 uses its own storage key and never scans the Prototype 1 key.
- Legacy Prototype 2 setup saves hydrate directly into play and discard the obsolete chosen Goal.
- New Spring explicitly resets Prototype 2 state only.
- The current uncommitted worktree is preserved; commit and push require explicit user authorization.

## Automated acceptance criteria

The build is ready for hands-on when:

- a new run starts directly in play with no objective selection;
- both conditions produce their documented deterministic forecasts;
- Weather is visible and its full forecast is inspectable;
- reload preserves seed, condition, telemetry and world state without redrawing Weather;
- successful Person actions identify their target for an anchored speech bubble;
- day 7 opens a scroll-safe Week Journal and continues to day 8;
- day 14 resolves overnight systems exactly once and never advances to day 15;
- both life-path readings derive from existing memories without duplicate counters;
- the Chronicle can name a dominant path or no single path;
- New Spring clears only Prototype 2 state;
- existing crop, AP, migration, Person and card-presentation regressions pass;
- asset references, syntax and `git diff --check` pass.

## Hands-on acceptance criteria

The user completes two free-form 14-day Springs, leaning toward different priorities by choice rather than by setup instruction. Reload at least once in each run.

After each run, record:

- the priority the player felt emerge;
- one opportunity knowingly given up;
- whether Person time competed meaningfully with farming;
- whether Weather felt like part of the card world;
- whether Person speech feedback made interactions legible;
- whether the Chronicle felt specific without judging the run;
- whether 14 days felt too short, sufficient or repetitive.

Prototype 2 is design-validated only if the two runs create recognizably different priorities and the player can name a sacrifice that mattered. Automated completion means ready for hands-on, not validated.

## Implementation order

1. preserve the Prototype 1 baseline and isolate Prototype 2 persistence;
2. implement deterministic conditions, the finite run and day boundaries;
3. expose Weather as an inspectable card;
4. remove objective setup and start day 1 freely;
5. derive both life-path readings from existing memories;
6. generate evidence-based Journal and Chronicle prose;
7. anchor short feedback bubbles to successful Person interactions;
8. make long Journal and Chronicle screens scroll-safe;
9. run regression, balance, syntax and diff verification;
10. stop at the two-run hands-on gate without expanding content, committing or pushing unless requested.

## Goal-mode stopping condition

When this brief is used as a Codex Goal, implementation ends when the reload-safe build passes automated verification and the active hands-on checklist is ready. It must stop before claiming design validation.
