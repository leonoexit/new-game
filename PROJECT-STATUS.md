# Project status

## Active project

Little Valley Cards is the only active direction. Work has moved deliberately into **Prototype 2 — One Spring, One Life**.

It is a solo farm-management game represented through persistent physical cards. Cards, stacks and transformations are the world. There is no draw pile, play limit or fixed target row. The runtime now has a visible daily Action Point budget; the lower screen is a physical **Hand** of persistent cards, not a random-card system.

Prototype 1 established a shared Card UI Grammar and three prototype-only Person cards. People are everyday presence and remembered context, not workers or dialogue interfaces. Its two-Week manual validation was not completed; Prototype 2 preserves that implementation as an unvalidated foundation rather than retroactively declaring the milestone complete.

Prototype 2 adds a finite 14-day Spring around the existing farm and Person systems. Each run begins freely under a deterministic Spring condition, tracks broad AP emphasis without scoring efficiency, pauses for a Week Journal after day 7 and ends with an evidence-derived Spring Chronicle after day 14. The Chronicle identifies the life path that emerged instead of requiring an objective selection. The experiment tests whether the same small content set can support different ways of living, not whether more Stardew-like activities can be added.

## Validated foundation

The two-plot, one-Farmer loop was playtested positively on 2026-09-19. Protect its speed, tactile movement, direct board feedback, player-organized layout and bright handheld palette.

The three-Land/five-crop direction makes crop behavior compete for scarce persistent space: because not every crop can occupy Land at once, the player must compare commitments in their head. Do not add a fourth Land. The strongest emotional feedback is also not score excitement but a Tamagotchi-like feeling of caring for a small, cute living thing. Protect persistence, visible care and attachment over optimization pressure.

Interaction v0.3 keeps tap and drag as parallel paths through the same engine. Selection is transient and never saved. Farmer moves with one attached card; dropping that carried card away from a valid target returns it to the Hand. When Farmer carries an item, valid targets glow immediately and can be tapped without selecting Farmer first.

Long-press inspection now works for Hand items as well as board cards. It opens a focused overlay with the enlarged physical card above its description. Seed descriptions are generated from crop data and state cost, first-harvest watering time, yield and post-harvest behavior explicitly.

Farm Lane and semantic board zones were removed. Farm and Town now use separate generated native-pixel table backgrounds to communicate Area without reserving board space. Card descriptions are hidden during normal play and appear only after a long press. Carried item cards render above Farmer.

The mobile layout now uses one compact HUD for Day, Area, AP, coins and End Day. The former brand, day, hint, Area and status strips were removed; the table fills the remaining viewport above the fixed Hand.

Dragging a carried item onto a valid target resolves through Farmer, just like dragging the Farmer stack. Dropping a carried item away from a valid target returns it to the Hand; carried Tools no longer become loose board clutter. This keeps remaining units on a carried quantity card directly usable.

## Hand experiment

The Backpack UI was removed. The lower screen is now the Hand, where persistent physical cards are sorted into two groups: portable item cards together, and Landmark cards together.

- Hoe, Watering Can and Sickle begin in the Hand.
- Tap/play an item card from the Hand to equip it; the previously carried card returns to the Hand.
- Drag any loose portable card into the Hand to store it; dropping a carried item away from a valid target also returns it.
- Tools, every Seed family and ordinary/Choice Produce are portable.
- Farmer has one shared carrying slot.
- Home Farm and Valley Town Landmark cards stay in the Landmark group.
- The current Area Landmark is face-up on its table and inactive Landmarks live in the Hand. Dragging a destination Landmark onto the table swaps it with the current Landmark and changes Area; tapping only explains the gesture.

Hand membership is a positional state on the same card object. It does not clone, consume or replace the card and is not an abstract inventory database.

Seeds and Produce now consolidate into one physical card with an `×N` quantity. The earlier visual-only stack exposed redundant identities without adding a decision. Tools and Landmarks remain unique persistent objects.

## Persistent Tool system

- **Sickle** cuts grass from Wild Soil, producing Cleared Ground.
- **Sickle** also removes thirsty, watered or mature crops for 1 AP. It yields no Produce and returns the same Land card to Empty Plot, so regrowing vines never lock Land permanently.
- **Hoe** tills Cleared Ground into an Empty Plot.
- **Watering Can** refills at the Stone Well and waters prepared soil or thirsty crops.
- **Mature Carrots** are harvested by Farmer's free hands, not by a Tool, and enter the Hand immediately.

Each Tool exists exactly once and is never consumed. Watering Can is one card with two charges. The Stone Well only changes its charge state and never creates Water or another container.

The Watering Can swaps between dedicated empty and visibly filled artwork. One or two charges use the filled image; the small numeric state preserves the exact count.

The Hand exposes a **Return item** action so the carried card can be returned before harvesting.

## Flexible preparation order

Home Farm has a finite three-field capacity. One field begins as an Empty Plot and two as Wild Soil, so expansion happens by working land that already exists on the Farm. All three cards carry persistent land identity through every soil and crop transformation; no runtime action creates more Land.

Cleared soil can be watered before Seeds are sown:

```text
Empty Plot + Watering Can -> Watered Plot
Watered Plot + Seeds -> Watered Carrot Plot
```

The former order remains valid:

```text
Empty Plot + Seeds -> thirsty Carrot Plot
thirsty Carrot Plot + Watering Can -> Watered Carrot Plot
```

Wild Soil requires the Sickle and then the Hoe before either sow/water path. Once prepared, a field never reverts to Wild Soil; harvest returns it to an Empty Plot.

## Carrot crop lifecycle v0.1

- Carrots need two watered nights to mature.
- Sowing into a Watered Plot counts as watered for the current day.
- Sowing into an Empty Plot creates a thirsty crop that must still be watered.
- End Day advances only watered crops, then returns unfinished crops to a thirsty state for the new day.
- Missing water pauses growth without killing or resetting the crop.
- An unplanted Watered Plot dries back into an Empty Plot overnight.
- Mature Carrots remain ready until harvested; harvesting preserves the same Land card and returns it to Empty Plot.

## Green Bean crop lifecycle v0.1

- The General Store sells one physical Seed per purchase: one Carrot Seed for one coin or one Green Bean Seed for two coins.
- Green Beans need three watered nights for the first harvest and produce three Beans.
- Harvest leaves the vines on the same Land card instead of returning it to Empty Plot.
- The vines need two watered nights to regrow; missed water pauses them like Carrots.
- Dry, watered, mature, seed and produce states have dedicated runtime artwork.

## Potato crop lifecycle v0.1

- Potato Seeds cost one coin and need two watered nights.
- Mature Potatoes require the Hoe instead of free-hand harvest.
- The first dig costs 1 AP, yields two Potatoes and leaves visible Potato Mounds on the same Land.
- The second dig costs 1 AP, yields two more Potatoes and returns the Land to an Empty Plot.
- The total yield is deterministic `2 + 2`; there is no harvest RNG or reload incentive.
- Potato Mounds persist across Spring Weeks and count as one completed harvest only after the second dig.
- Potato Seeds and Produce consolidate by quantity, rain waters growing Potatoes, and the Sickle can remove growing or mature Potato crops.
- Young, watered, mature, mound, Seed and Produce states have dedicated approved native-pixel artwork.

## Cauliflower and Radish crop lifecycles

- Cauliflower Seeds cost three coins, need four watered nights and produce nine Cauliflowers. The one-shot crop deliberately occupies Land for most of a Week before its large payoff.
- Radish Seeds cost one coin. After one watered night, Baby Radishes can be harvested for two Produce to release the Land, or deliberately watered for two more nights to produce five full Radishes.
- Rain waters thirsty Radishes normally but does not silently continue the Baby state; the grow-versus-harvest choice stays explicit.
- Both families have runtime-approved dry, watered, mature/decision-state, Seed and Produce art.

## Shared Quality and farm memory

- Dragging a thirsty, watered or Baby crop onto a free-handed Farmer—or using the same tap path—Tends it for 1 AP.
- Tended state is visible on the crop card, persisted in saves and deterministic.
- The next harvest becomes a separate visible Choice Produce card. Choice and ordinary Produce consolidate separately but ship at the same rate.
- Green Bean care resets each regrow cycle; Potato care survives both digs; removal yields nothing and clears pending care.
- The first Choice harvest of each crop enters the persistent memory book. Crop discoveries, first harvest, first Quality and farm milestones feed the Weekly Journal.
- Quality has no perfect-watering rule, random roll or reload incentive. Its reward is a visible card transformation and a care memory rather than mandatory coin optimization.

## Card UI Grammar v0.1

`card-presentation.js` is the shared semantic layer for World, Hand, Store and Inspection. Every card exposes family, title, one primary status, quantity, progress, detail and a separate interaction state. Faces read family/status → art → title → progress/quantity. Long prose appears only after hold.

All cards use neutral paper and one warm-neutral physical shadow. Family color is limited to border/header accents: teal Person, leaf-green Crop, ochre Land, blue-gray Tool, amber Item/Produce, warm-brown Landmark and plum Service. Choice and Tended no longer recolor the entire card. Cyan selection and gold targeting remain independent overlays. Board, Hand, card dimensions and tap/drag behavior are unchanged; the General Store no longer has a card-height exception.

## Person Presence & Memory v0.1

- Mira appears in Town on days 1, 4 and 7; she notices Choice Produce and Cauliflower.
- Bram appears at the Farm on days 2 and 6 and in Town on day 4; he notices rain, Potato and Radish.
- Nell appears in Town on days 2, 3 and 5; she notices Carrot, Green Bean and sunny days.
- The weekly schedule repeats and shows at most two residents per day. Absent cards remain in the save without rendering; present cards can be rearranged but never enter Hand or receive jobs.
- Free-handed Farmer → Person is Spend Time for 1 AP. Farmer carrying ordinary/Choice Produce → Person is Share for 1 AP plus exactly one Produce. Tool and Seed cards are never shareable.
- Each Person accepts one moment per day. Duplicate `spend:{area}:{weather}` or `share:{crop}:{quality}` signatures are rejected without spending AP or Produce.
- Relationship is derived from memories, not stored heart points: New by default, Familiar after two distinct moments, Close after four moments across two dates with at least one Share.
- Preference matches change memory prose and add a Journal highlight only. There is no hidden relationship multiplier.
- Person cards show only New/Familiar/Close. A successful Spend Time or Share moment produces a short speech bubble anchored to that Person. Hold reveals identity, schedule, interests and memories. There is no dialogue modal or dialogue tree.

Save schema is v22. v16–v21 migrate without replacing farm state. Continue Farm restarts the day-1 presence schedule while preserving Person memory.

## Money and economy

Money is now a numeric HUD unit (`state.coins`), not a Coin Purse card. The General Store sells Carrot, Potato and Radish Seeds for one coin, Green Bean Seeds for two, and Cauliflower Seeds for three. Repeated purchases increase the quantity on the matching Seed card.

The General Store no longer embeds always-visible purchase buttons. Farmer physically targets the Store through tap or drag, then a temporary tray presents the current Seed cards with cost, first harvest, yield and post-harvest behavior. Opening the tray and buying remain free actions; Town travel still costs AP.

Six coins remain a milestone and never lock the simulation. The seven-day boundary now limits how many purchase, growth and shipment cycles fit into one balance run.

## Time experiment after playtest

The user did not feel a meaningful effect from Morning/Afternoon/Evening/Night. Those phases and work-driven time marks have been removed from the playable experiment.

The current model has only an explicit day boundary:

- watered crops advance one growth step overnight when **End Day** is chosen;
- Shipping Bin contents pay overnight when **End Day** is chosen;
- the day counter increments;
- work and travel spend visible AP, while Tool changes remain free;
- the General Store is always open, but Farmer must travel to Town to use it.

This makes time's actual effects visible without restoring opaque day phases. Spring Week now supplies a finite deadline; multiple seasons and authored story events remain outside the current slice. Weather and a small Person schedule are now active experiments.

## Landmark Area access experiment

The world is split into separate active Area tables:

- **Home Farm** contains Farmer while present, both plots, Stone Well and Shipping Bin;
- **Valley Town** contains the General Store;
- the current Area Landmark is face-up on its table; the other Landmark lives in the Hand;
- dragging the destination Landmark from the Hand onto the table swaps the two cards and moves Farmer with their carried card;
- there is no remote-table browsing state or carousel;
- **End Day** is available in every Area and always wakes Farmer and their carried card at Home Farm.

`areaId` belongs to world cards, while Hand cards remain location-independent until played. Landmark travel now participates in the visible AP budget.

## Action Point v0.1 — implemented

Each day begins with a visible baseline of 8 AP. AP is the current opportunity budget, not a hidden clock.

- equip/swap/return a Tool: 0 AP;
- play a Landmark to travel: 1 AP;
- buy Seeds: 0 AP;
- deposit Carrots into Shipping Bin: 0 AP;
- one Sickle, crop removal, Hoe, sow, water, refill or harvest interaction on a board target: 1 AP;
- dragging Farmer to a target is currently only card targeting, not a separate movement system and not an extra AP cost;
- water a 3×3 plot is 1 AP at baseline, not 2;
- AP is spent only after a successful Landmark/work interaction, never on selection, dragging, swapping, buying or depositing;
- End Day in any Area resets AP to 8 and returns Farmer to Home Farm;
- exhausting AP does not automatically end the day, so free actions remain available;
- 8 AP is a playtest baseline, not a final balance value.

Person preference matches do not add AP or reduce action costs. Whether 8 AP creates the right farming-versus-life pressure remains a hands-on question.

## Art status

`STYLE.md`, `little-valley-cards-art-bible-v0.1.md` and `.agents/skills/little-valley-cards-art/` control raster work.

Hoe, Watering Can and Sickle use square transparent native-pixel item assets recorded under `art/style-studies/`.

Six previously missing or ambiguous horizontal card images now have dedicated runtime art: Cleared Ground, Watered Plot, Watered Carrots, General Store, Home Farm Landmark and Valley Town Landmark. Each source, prompt, processed delivery and 320×200 review preview is recorded under `art/style-studies/`.

Watering Can now also has a filled-state item variant with visible water inside its open top, recorded under `art/style-studies/item-card-watering-can-filled-v0.1/`.

Green Beans now have a complete runtime art family. Home Farm and Valley Town each have a generated low-contrast native-pixel table background recorded under `art/style-studies/area-background-*/`.

Cauliflower and Radish now have complete runtime-approved art families. Each generated source, processed delivery, logical-size preview, prompt and review decision is recorded under its crop-specific `art/style-studies/` directory. Choice Produce intentionally reuses its crop's Produce raster and transforms visibly through the runtime card treatment, name and badge.

Home Farm also has an approved rainy variant. Weather is persisted in state, shown in the compact HUD, and changes the Farm table background. The deterministic Spring prototype forecast uses rain on day 6; that morning automatically waters Empty Plots and thirsty crops without spending AP. This is currently an immersion experiment, not a claim that watering pressure is balanced.

Shipping Bin art remains approved for the prototype with one caveat: a later revision should place it recognizably inside the protagonist's farm rather than a generic meadow.

Mira, Bram and Nell have square 512×512 native-pixel portraits reviewed at 72px board and 142px Inspection sizes. Their source, processed previews, full prompts and review decisions live under `art/style-studies/character-card-*-v0.1/`. They are approved only for Prototype 1 and do not establish a canonical cast. After Mira's explicit approval, the user delegated future image review to Codex; Bram and Nell were accepted under that delegation.

## Prototype 2 — One Spring, One Life

The active experiment is defined by `prototype/little-valley-cards/PROTOTYPE-2-BRIEF.md`.

- A run lasts 14 Spring days across two seven-day chapters.
- The seeded condition is either Gentle Spring or Dry Spring; each owns an authored deterministic forecast exposed through an inspectable Weather card.
- Day 1 begins immediately. There is no opening objective choice.
- `Care for the Land` and `Know Your Neighbors` are interpretive paths derived from existing Choice crop memories and Memory-derived relationships. They add no buffs, hidden multipliers or obligations.
- Day 7 opens a Week Journal and continues to day 8. Day 14 opens a final Spring Chronicle and never advances to day 15.
- Chronicle prose is derived from farm state, Person memory, both life-path readings and broad AP telemetry. It does not score, rank or judge the player for not following a path.
- New Spring begins a clean seeded run under storage schema v23. Prototype 1 storage remains separate and untouched.

The reload-safe build and automated acceptance suite are complete. The active stopping point is two contrasting hands-on runs; only those runs can validate the design hypothesis.

## Spring Farming v1 milestone

Spring now runs as persistent seven-day Weeks with exactly three Land and five crop behaviors. End Day on day 7 resolves growth and shipment income, then pauses on a memory-oriented Weekly Journal. Continue Farm preserves Land, crops, Tools, supplies, Choice cards and the memory book; Reset Farm remains the explicit full restart.

Crop lifecycle rules live in `prototype/little-valley-cards/crop-system.js`; deterministic care/memory rules live in `quality-system.js`; the reusable headless balance model lives in `balance-model.js`. `engine.js` still owns AP orchestration, Areas, Store, shipping and save migration. The initial balance pass led to three evidence-backed changes: Green Bean yield `4 → 3`, Potato Seed cost `2 → 1`, and removal of the proposed per-unit Choice payout multiplier.

`prototype/little-valley-cards/BALANCE-REPORT.md` records simulator assumptions and eight-Week results. `prototype/little-valley-cards/SPRING-FARMING-V1-PLAYTEST.md` remains the archived farming-specific checklist.

Card UI Grammar + Person Presence & Memory v0.1 remains implemented and its automated tests pass, but its two-Week manual completion gate was superseded when the user deliberately moved into Prototype 2. `PERSON-LIFE-V0.1-PLAYTEST.md` is retained as historical test material rather than the active checklist. Do not treat its unfinished questions as validated evidence.

The first hands-on pass exposed three presentation failures now corrected: invalid Hoe-on-Wild-Soil input looked inert instead of explaining the required Sickle step; successful Person moments had no short visible confirmation; and a legacy green global card shadow conflicted with ochre/plum family borders. Invalid Tool targets now explain the preparation sequence, Person actions show an anchored speech bubble, and all card families use one warm-neutral physical shadow.

Do not operate the browser for playtesting unless the user explicitly asks. Do not commit or push without the user's request.

## Source of truth

- `PROJECT-STATUS.md` describes the current direction and experiment.
- `prototype/little-valley-cards/README.md` describes the playable contract.
- `prototype/little-valley-cards/SPRING-FARMING-V1-DESIGN.md` defines crop, Quality and memory behavior.
- `prototype/little-valley-cards/CARD-UI-GRAMMAR-V0.1.md` defines shared card presentation.
- `prototype/little-valley-cards/PERSON-LIFE-V0.1-DESIGN.md` defines schedule, actions and relationship memory.
- `prototype/little-valley-cards/BALANCE-REPORT.md` records deterministic simulator assumptions and results.
- `prototype/little-valley-cards/PERSON-LIFE-V0.1-PLAYTEST.md` is archived manual test material for the unfinished Prototype 1 milestone.
- `prototype/little-valley-cards/PROTOTYPE-2-BRIEF.md` defines the active run-structure experiment and its non-goals.
- `prototype/little-valley-cards/PROTOTYPE-2-PLAYTEST.md` is the active two-run hands-on checklist.
- `STYLE.md` and `little-valley-cards-art-bible-v0.1.md` control art production.
- `CONTEXT-RESTORE-PROMPT.md` is the handoff prompt for the next session.

Earlier One Good Day prototypes remain outside the active tree. Their history is recoverable from Git commit `ebe2196` and must not be restored accidentally.
