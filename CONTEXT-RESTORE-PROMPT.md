# Context restore — Little Valley Cards Spring Farming v1

Continue at `/Volumes/LeNguyen02SSD/Programming/new-game`.

Before planning or editing, read in full:

- `PROJECT-STATUS.md`
- `prototype/little-valley-cards/README.md`
- `prototype/little-valley-cards/SPRING-FARMING-V1-DESIGN.md`
- `prototype/little-valley-cards/BALANCE-REPORT.md`
- `STYLE.md`
- `little-valley-cards-art-bible-v0.1.md`
- `.agents/skills/little-valley-cards-art/SKILL.md` when doing raster art

Then inspect the current worktree and run the repository verification. Source, tests and current files are authoritative; do not follow older checkpoints or actions if they conflict.

## Safety and workflow

- Last pushed checkpoint before Spring Farming v1 work: `f8e4801 — Complete potato farming and physical store flow`.
- Spring Farming v1 changes are intentionally uncommitted unless the user later asks to commit/push.
- Preserve all existing changes. Do not reset, discard or replace the worktree.
- Do not restore One Good Day.
- Do not modify or delete `stardew rules.pdf`.
- Do not operate the browser. The user is the hands-on tester.

## Current milestone

Spring Farming v1 is implemented around exactly three persistent Land and five crop behaviors:

- Carrot: one coin, two watered nights, yield three, one-shot.
- Green Bean: two coins, three watered nights, yield three, regrows in two watered nights.
- Potato: one coin, two watered nights, Hoe harvest `2 + 2`; Potato Mounds persist.
- Cauliflower: three coins, four watered nights, yield nine, one slow Land commitment.
- Radish: one coin; Baby harvest after one watered night yields two, or deliberately water two more nights for five full Radishes.

All five use the same Store, Hand, both sow/water orders, rain, removal, shipping, quantity consolidation, Weekly persistence and save migration. Rain never silently continues Baby Radishes.

## Quality and memory

Quality is deterministic care, not perfect watering or RNG:

- with free hands, crop → Farmer resolves **Tend** through the same tap/drag engine;
- Tend costs 1 AP and persists a visible Tended card state;
- the next harvest becomes a separate visible Choice Produce card;
- Choice Produce ships at the ordinary rate; it is not a mandatory economy multiplier;
- each crop's first Choice harvest enters the persistent memory book;
- Green Bean care resets after harvest; Potato care survives both digs; removal erases pending care.

The Weekly Journal is memory-oriented. It recalls crop discoveries, first harvest, first Choice crops and farm milestones; shipment and living-crop information are prose rather than a score table.

## Architecture

- `data.js`: five-crop definitions, data-driven harvest stages, card definitions and config.
- `crop-system.js`: sow, water, rain, overnight growth, generic harvest stages and removal.
- `quality-system.js`: deterministic care, Choice transformation and persistent memories.
- `balance-model.js`: deterministic multi-Week, three-Land headless model.
- `balance-sim.mjs`: report generator for `BALANCE-REPORT.md`.
- `engine.js`: AP orchestration, Areas, Store, Shipping Bin, v16–v20 migration and messages.
- `app.js`: portrait rendering, Hand/Store/Journal, inspection, tap and drag.
- `smoke-test.mjs` and `spring-v1-test.mjs`: legacy core plus Spring v1 coverage.

The Shipping Bin now stores crop/Quality-aware shipment entries and migrates legacy numeric `amount`. Current save schema is v21; versions 16–20 remain supported.

## Balance evidence

`npm run balance` simulates eight Weeks for fast, regrow, slow-payoff, Potato, Baby/Full Radish, mixed and Quality-focused policies. The first pass led to three behavior-supported changes:

- Green Bean yield `4 → 3` to reduce long-horizon dominance.
- Potato Seed cost `2 → 1` because the crop already pays an extra Hoe AP.
- Choice per-unit payout multiplier removed so care remains a memory choice rather than an economy obligation.

The checked-in second pass reports no universal dominant required policy and no non-viable crop. Watering and refill actions are the main AP pressure.

## Art

Cauliflower and Radish each have a complete runtime-approved native-pixel family. Every asset has source, processed delivery, logical-size preview where applicable, full prompt and review record under `art/style-studies/`. Choice Produce deliberately reuses the normal Produce raster and transforms through card name, badge, border and background.

Do not integrate an unreviewed raster output. Follow the Little Valley Cards Art skill and review plot art at `320×200`, items at `256×256`.

## Verification

Run:

```sh
npm --prefix prototype/little-valley-cards test
npm --prefix prototype/little-valley-cards run balance
node --check prototype/little-valley-cards/data.js
node --check prototype/little-valley-cards/crop-system.js
node --check prototype/little-valley-cards/quality-system.js
node --check prototype/little-valley-cards/balance-model.js
node --check prototype/little-valley-cards/balance-sim.mjs
node --check prototype/little-valley-cards/engine.js
node --check prototype/little-valley-cards/app.js
node --check prototype/little-valley-cards/smoke-test.mjs
node --check prototype/little-valley-cards/spring-v1-test.mjs
git diff --check
```

Also verify every runtime art reference exists and `git status --short` contains no accidental files outside this milestone.

## Hands-on handoff

The one authoritative manual checklist is:

`prototype/little-valley-cards/SPRING-FARMING-V1-PLAYTEST.md`

Do not create a competing checklist. The user should complete it across at least two Spring Weeks and report tactile/layout/pacing feedback. Do not start the server or control the browser unless explicitly requested.
