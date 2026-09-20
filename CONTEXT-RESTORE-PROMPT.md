# Context restore — Prototype 2 One Spring, One Life

Continue at `/Volumes/LeNguyen02SSD/Programming/new-game`.

Before planning or editing, read in full:

- `PROJECT-STATUS.md`
- `prototype/little-valley-cards/README.md`
- `prototype/little-valley-cards/PROTOTYPE-2-BRIEF.md`
- `prototype/little-valley-cards/PROTOTYPE-2-PLAYTEST.md`
- `prototype/little-valley-cards/SPRING-FARMING-V1-DESIGN.md`
- `prototype/little-valley-cards/CARD-UI-GRAMMAR-V0.1.md`
- `prototype/little-valley-cards/PERSON-LIFE-V0.1-DESIGN.md`
- `prototype/little-valley-cards/BALANCE-REPORT.md`
- `STYLE.md`
- `little-valley-cards-art-bible-v0.1.md`
- `.agents/skills/little-valley-cards-art/SKILL.md` only when doing raster art

Then inspect the worktree and run repository verification. Source, tests and current files are authoritative.

## Safety and workflow

- Base committed checkpoint: `6ef18a2 — Complete Spring Farming v1 milestone`.
- Card Grammar, Person Presence and Prototype 2 work are intentionally uncommitted unless the user asks to commit/push.
- Preserve all existing changes. Do not reset, discard or replace the worktree.
- A recovery-only Prototype 1 patch and untracked archive were created under `/private/tmp` before Prototype 2 runtime edits; they are not project artifacts and may not survive a machine restart.
- Do not restore One Good Day.
- Do not modify or delete `stardew rules.pdf`.
- Do not operate the browser. The user is the hands-on tester.
- Do not rebalance 8 AP or expand content before the two-run hands-on evidence.
- Do not claim Prototype 1 or Prototype 2 design validation from automated tests.
- Do not add fishing, mining, combat, cooking, crafting, more seasons, Areas, crops or residents during this experiment.

## Why the project moved to Prototype 2

Prototype 1 established persistent cards, three Land, five crop behaviors, Tools, Hand, Areas, AP, weather, Person presence, contextual Memory and a shared card grammar. Its two-Week Person checklist was not completed, so the foundation remains implemented but manually unvalidated.

The user deliberately moved forward because Prototype 1 still lacked a macro arc. Local actions worked, but farming, travel and Person moments did not resolve into a clear answer to why the player chose one life over another or why a new run should feel different.

Prototype 2 tests:

> Can a short, finite Spring turn farming, time and relationships into meaningful choices about how the player chose to live?

## Active run contract

- One run lasts 14 Spring days.
- A seed deterministically selects Gentle Spring or Dry Spring and its authored forecast.
- Day 1 begins immediately, with no objective selection.
- Weather is an inspectable information card exposing the seeded 14-day forecast.
- `Care for the Land` and `Know Your Neighbors` are interpretive life paths derived from existing Choice crop memories or Memory-derived relationships.
- Farming, travel and Person moments share the same 8 AP budget.
- Day 7 opens a Week Journal and continues to day 8.
- Day 14 resolves overnight growth and shipping once, then opens the Spring Chronicle.
- The Chronicle derives every sentence from farm state, Person memory, both life-path readings or broad AP telemetry.
- It identifies what emerged without treating another path as an unfinished objective.
- New Spring starts clean under a new seed and never overwrites Prototype 1 storage.

## Architecture

- `data.js`: Prototype 1 v22 config plus Prototype 2 v23 run conditions, interpretive paths and forecast helpers.
- `crop-system.js`: crop actions, overnight growth and Prototype-aware HUD label.
- `quality-system.js`: deterministic care, Choice and farm memory.
- `person-system.js`: repeating seven-day presence, Person actions and relationship derivation.
- `run-system.js`: seed normalization, condition setup, derived life-path readings, AP telemetry and Chronicle prose.
- `card-presentation.js`: shared family/status/quantity/progress/detail/interaction presentation model.
- `engine.js`: preserved Prototype 1 state functions plus isolated Prototype 2 creation, hydration, lifecycle and New Spring.
- `app.js`: active Prototype 2 Weather card, Person speech feedback, Week Journal, Chronicle and New Spring UI.
- `prototype2-test.mjs`: active run acceptance coverage.

Prototype 1 remains on storage key `little-valley-physical-board-v22`. Prototype 2 uses `little-valley-one-spring-v23` and never scans legacy keys.

## Verification

Run:

```sh
npm --prefix prototype/little-valley-cards test
npm --prefix prototype/little-valley-cards run balance
node --check prototype/little-valley-cards/data.js
node --check prototype/little-valley-cards/crop-system.js
node --check prototype/little-valley-cards/quality-system.js
node --check prototype/little-valley-cards/person-system.js
node --check prototype/little-valley-cards/run-system.js
node --check prototype/little-valley-cards/card-presentation.js
node --check prototype/little-valley-cards/balance-model.js
node --check prototype/little-valley-cards/balance-sim.mjs
node --check prototype/little-valley-cards/engine.js
node --check prototype/little-valley-cards/app.js
node --check prototype/little-valley-cards/smoke-test.mjs
node --check prototype/little-valley-cards/spring-v1-test.mjs
node --check prototype/little-valley-cards/person-v1-test.mjs
node --check prototype/little-valley-cards/prototype2-test.mjs
git diff --check
```

Also verify every runtime art reference exists and `git status --short` contains no accidental files outside this milestone.

## Completion boundary

The implementation Goal ends when the build is reload-safe, all automated acceptance checks pass, documentation is current and `PROTOTYPE-2-PLAYTEST.md` is ready. Stop there for the user's two contrasting runs. Automated completion means ready for hands-on, not design validation.

Do not commit or push without an explicit user request.
