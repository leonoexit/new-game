# Little Valley Cards — physical world prototype

Cards persist as physical objects in a portrait farm world. The board holds the active world; the lower screen is the Hand of persistent physical cards; money is a HUD value rather than a card.

The active build is **Prototype 2 — One Spring, One Life**. It keeps Prototype 1's shared card grammar, farming systems and three prototype-only residents, then places them inside a finite 14-day run with a visible Spring condition and a final evidence-derived Chronicle. The player starts freely on day 1; the Chronicle interprets the life that emerged instead of asking for an objective up front. Person cards remain everyday presence and memory, not workers or dialogue trees.

The HUD shows `Spring · Day n/14`. Day 7 pauses at a Week Journal; day 14 resolves overnight growth and shipping once, then ends at the Spring Chronicle. A new Spring begins from clean Prototype 2 state under a new deterministic seed.

Spring weather is a persistent information card on every Area table as well as a visual condition of the Farm. Tap it to inspect the seeded Gentle Spring or Dry Spring condition and its fixed 14-day forecast. Rain automatically waters prepared plots and thirsty crops without spending AP; reloading never redraws the forecast.

The world uses separate Area tables. The current Area's Landmark is face-up on its table, while the destination Landmark is in the Hand. Dragging the destination onto the table swaps the two and travels; there is no carousel browse state.

## Run

```sh
cd /Volumes/LeNguyen02SSD/Programming/new-game/prototype/little-valley-cards
python3 -m http.server 8080 --bind 127.0.0.1
```

Open <http://127.0.0.1:8080/>. Prototype 2 uses its own local save namespace. **New Spring** starts a clean seeded run without reading or overwriting Prototype 1 saves.

## Hand

Hoe, Watering Can and Sickle begin in the bottom Hand instead of occupying the board.

- Tap/play an item card to equip it. If Farmer is carrying another portable card, the two cards swap.
- Hold an item card in the Hand to inspect it without playing it. Inspection enlarges the physical card and places its full description directly below.
- Drag a loose portable card into the Hand to store it. A carried card returns to the Hand when dropped away from a valid target.
- Tools, all Seed families and ordinary/Choice Produce are portable.
- Farmer has one carrying slot.
- **Return item** returns Farmer's carried card before a hand-only action.
- Item cards are sorted together in the Hand; Landmark cards form a separate group.
- Identical Seeds and Produce consolidate into one physical card with an `×N` quantity. Tools and Landmarks remain unique persistent objects.
- Hand membership changes presentation and position, not card identity. Persistent Tools remain the same objects.

## Money and store

Money is `state.coins` and appears in the top HUD. There is no Coin Purse card.

The General Store sells one Seed unit per purchase. Carrot, Potato and Radish Seeds cost one coin; Green Bean Seeds cost two; Cauliflower Seeds cost three. Repeated purchases increase the matching Seed card's `×N` quantity. Farmer must be in Town to buy. Six coins remain a non-blocking milestone within the seven-day run.

The Store is opened through the same physical interaction grammar as farm work: select Farmer, then select the General Store (or drag Farmer onto it). A tray of the currently available Seed cards then appears. Buying from those cards is free and does not spend AP; travelling to Town still costs 1 AP.

## Areas and Landmark play

- Home Farm begins with its Landmark face-up on the Farm table; Valley Town begins in the Hand.
- Drag a destination Landmark from the Hand onto the table to move Farmer and the currently carried card to that Area. The previous Area Landmark returns to the Hand and the played Landmark becomes the new table card.
- Tapping a Landmark in the Hand only reminds the player to play it physically.
- Playing a Landmark costs 1 AP but does not advance the day by itself.
- The board always shows the Area where Farmer currently is.
- The General Store is in Valley Town; plots, Well and Shipping Bin are at Home Farm.
- **End Day** is available in every Area. Farmer always wakes at Home Farm the next morning, with Home Farm restored as the face-up table Landmark.

## Flexible sowing and watering

Preparing a new plot now uses both ground-working Tools:

```text
Sickle + Wild Soil -> Cleared Ground
Hoe + Cleared Ground -> Empty Plot
```

The Sickle can also remove any thirsty, watered or mature crop. Removal costs 1 AP, produces nothing and returns that same Land card to an Empty Plot. This keeps persistent regrowing crops from locking a field forever.

Home Farm currently has exactly three persistent Land cards: one starts as an Empty Plot and two as Wild Soil. Preparing and harvesting transform those same cards; Land is never spawned or consumed. Once prepared, a field does not become Wild Soil again.

Mature Carrots are pulled by hand, not with a Tool. Farmer must have free hands, and the harvested Carrots go directly into the Hand.

Both physically sensible sow/water orders are valid after the Empty Plot exists:

```text
Sickle + Wild Soil -> Cleared Ground -> Hoe -> Empty Plot

Watering Can + Empty Plot -> Watered Plot
Seeds + Watered Plot -> Watered Carrot Plot
```

or:

```text
Seeds + Empty Plot -> thirsty Carrot Plot
Watering Can + thirsty Carrot Plot -> Watered Carrot Plot
```

The Watering Can is one persistent card with two charges. The Stone Well refills that card and never spawns Water or another container.

The Watering Can uses separate empty and filled artwork. Any remaining charge shows visible water in the can; the label preserves the exact charge count.

## Carrot crop lifecycle

Carrots require two watered nights. At End Day, each watered crop advances one step and, if not yet mature, becomes thirsty again for the next morning. An unwatered crop pauses without dying or losing progress. Watered soil with no crop dries overnight. Mature crops wait safely for harvest, and harvesting returns the same persistent Land card to an Empty Plot.

## Green Bean crop lifecycle

Green Beans create the first strategic crop contrast. One Seed costs two coins, needs three watered nights for its first harvest and produces three Beans. A Carrot Seed costs one coin, needs two watered nights and is consumed after one harvest. Harvesting Green Beans keeps the vines on the same Land card; two more watered nights produce the next harvest. Missed water still pauses rather than killing the crop.

## Potato crop lifecycle

One Potato Seed costs one coin and needs two watered nights. Mature Potatoes cannot be harvested by hand: Farmer must carry the Hoe. The first 1 AP dig yields two Potatoes and transforms the same Land into visible Potato Mounds. A second 1 AP dig yields two more, consolidates the Produce card to `×4`, and returns that Land to an Empty Plot. The deterministic `2 + 2` reveal gives Potatoes a digging rhythm without RNG or reload incentives.

Rain waters thirsty Potatoes normally. The Sickle can remove growing or mature Potatoes without Produce. A partially dug Potato Mound persists across Spring Weeks and is completed with the Hoe; the Weekly Journal counts the crop once after the second dig.

## Cauliflower crop lifecycle

Cauliflower is the slow Land commitment. One Seed costs three coins, needs four watered nights and produces nine Cauliflowers in one hand harvest. It clears the Plot afterward. The large payoff is paired with low flexibility: on a three-Land farm, that field is unavailable for most of a Spring Week.

## Radish crop lifecycle

Radish adds a harvest-timing decision. After one watered night, the Land becomes a visible Baby Radish harvest. Farmer may pull two immediately and free the Plot, or deliberately water the Baby Radishes for two more nights to reach a full harvest of five. Rain does not silently advance the Baby state, so continuing the crop is always an explicit commitment.

## Shared Quality and care memories

Quality is deterministic and never depends on perfect watering or a random roll. With free hands, drag a thirsty, watered or Baby crop onto Farmer—or use the equivalent tap path—to **Tend** it for 1 AP. The crop card shows a Tended primary status. Its next harvest transforms into a separate **Choice** Produce card with the same shared Item-family frame and a Choice status.

Choice Produce consolidates separately from ordinary Produce and ships at the same coin rate. Its lasting value is the farm's memory book: the first Choice harvest and the first Choice harvest of every crop become persistent care memories. Green Bean care resets each regrow cycle; Potato care survives the first dig and covers both batches. Removing a crop erases its pending care and produces nothing. The outcome is persisted and deterministic, so reloading cannot improve it.

## Card UI grammar v0.1

World, Hand, Store and Inspection now derive from `card-presentation.js`. Every face reads family and one primary status first, then art, title, and a fixed progress or quantity position. Paper, artwork wells and physical shadows stay neutral; teal, green, ochre, blue-gray, amber, brown and plum border/header accents identify Person, Crop, Land, Tool, Item, Landmark and Service families.

Choice and Tended no longer recolor an entire card. Relationship, Quality, tool charge, shipment and Landmark state each occupy the same single status slot. Cyan source selection and gold targeting remain separate interaction overlays. Full prose stays in hold/Inspection. The authoritative rules are in `CARD-UI-GRAMMAR-V0.1.md`.

## Person Presence & Memory v0.1

Mira, Bram and Nell are persistent world cards on a repeating seven-day schedule, with no more than two present on any day. Absent residents remain in the save but do not render. Present cards can be rearranged, but never enter Hand and cannot perform work.

- Free-handed Farmer → Person spends 1 AP to spend time.
- Farmer carrying ordinary or Choice Produce → Person spends 1 AP and exactly one Produce to share it.
- Tools and Seeds cannot be shared; each Person accepts one moment per day.
- Repeating the same area/weather or crop/quality memory is rejected without cost.
- Relationship is derived from distinct memories: `Familiar` at two; `Close` at four across at least two dates with at least one Share.
- A preference match changes memory and Journal emphasis only; it grants no resource or relationship-speed bonus.

Person cards show only `New`, `Familiar` or `Close`. After a successful Spend Time or Share action, a short speech bubble anchored to that Person confirms the interaction. Hold reveals identity, weekly rhythm, interests and remembered moments. The bubble is immediate feedback, not a conversation modal or dialogue tree. Full behavior is defined in `PERSON-LIFE-V0.1-DESIGN.md`.

## Day-only time experiment

Morning, Afternoon, Evening and Night have been removed from the playable UI. They did not create a meaningful decision.

Time now has two explicit overnight effects:

- watered crops grow into Mature Carrots when **End Day** is chosen;
- produce in the Shipping Bin pays coins when **End Day** is chosen.

There is no hidden clock. Work and Area travel spend visible AP; Tool changes and purchases are free. The General Store is always open but only usable in Town.

## One Spring run

- Spring lasts 14 playable days across two seven-day chapters; this is a prototype run length, not a canonical season claim.
- Day 1 begins immediately under one deterministic condition—Gentle Spring or Dry Spring—with no objective selection.
- `Care for the Land` and `Know Your Neighbors` are interpretive life paths derived from existing Choice crop memories and relationship Memory. They never constrain play or grant buffs, AP or hidden acceleration.
- Day 7 opens a Weekly Journal. **Begin Week 2** continues the same Land, crops, Tools, supplies, coins and Memory on day 8.
- The final End Day advances watered crops and pays the Shipping Bin exactly once, then opens the Spring Chronicle.
- The Chronicle recalls farm state, people, broad AP emphasis and the life path that emerged. It never assigns a score or treats another path as unfinished work.
- **New Spring** creates a clean seed and condition, then begins day 1 directly. It never advances into day 15.

## Action Point v0.1

Each day begins with 8 AP. Successful Sickle, crop removal, Hoe, sow, water, refill and harvest work costs 1 AP; Landmark travel costs 1 AP. Equip/swap, returning cards to the Hand, buying Seeds and depositing Carrots are free. Dragging Farmer to a target is card targeting, not a separate movement cost. Watering a 3×3 plot is 1 AP.

AP is deducted only after an interaction succeeds. End Day in any Area restores all 8 AP and returns Farmer and their carried card to Home Farm. AP exhaustion does not automatically end the day, so free actions remain available.

## Current loop

```text
drag Valley Town Landmark onto the table -> Town board
compare five Seed behavior cards -> Seeds enter Hand
drag Home Farm Landmark onto the table -> Farm board
play Sickle -> cut the remaining Wild Soil
play Hoe -> till Cleared Ground into the second Plot
play Watering Can -> refill at Well
water then sow, or sow then water
optionally drag a growing crop onto Farmer -> Tend for a Choice harvest
meet a present Person -> Spend Time, or carry Produce to Share
End Day -> watered crops advance and become thirsty
water growing crops again
End Day -> crops mature
Return item -> pull Mature Carrots -> Carrots enter Hand
play Carrots -> ship
End Day -> shipment pays
repeat with persistent Tools and growing coin total
Day 7 -> review the Week Journal -> Begin Week 2
Day 14 -> resolve the final night -> read the Spring Chronicle
New Spring -> begin freely and let another life emerge
```

## Interaction

- Tap an actionable board card to select it, then tap a glowing target.
- When Farmer carries an item, its valid targets glow immediately; tap one without selecting Farmer first.
- Tap the selected card again or tap the board background to cancel.
- Drag the same source directly onto the target as a physical shortcut.
- Tap an item card in the Hand to equip it.
- Drag a Landmark card from the Hand onto the table to travel; a simple tap does not change Area.
- Drag portable cards into the Hand to store them.
- Keyboard Enter/Space follows the board selection path.
- Card descriptions stay hidden during play. Hold a card to open an enlarged-card inspection overlay with the description directly below it.
- Seed descriptions include purchase cost, watered nights to first harvest, yield and regrow behavior.
- Dragging a carried item onto a glowing target uses it through Farmer. Dropping it anywhere else returns it to the Hand.
- Resolving work never moves Farmer automatically; the board layout remains where the player arranged it.

Farm and Town use distinct generated native-pixel table backgrounds rather than fixed semantic zones. Carried cards render above Farmer in the physical stack. A single compact HUD replaces the former brand, day, hint, Area and status strips so the table and Hand fit within one portrait viewport.

## Intentional scope

- One Farmer, three prototype-only residents, one of each Tool, exactly three finite persistent fields, five Spring crops, one Well, one General Store, one Shipping Bin and two Areas with one Landmark each.
- No draw pile, dialogue UI, worker assignment, heart-point economy, multiple seasons or location graph. The 14-day Spring remains a deliberately narrow crop-and-life slice.
- Hand is the presentation layer for persistent physical cards, not a second abstract item database.
- Tool is a concrete behavior family; the rest of the ontology remains open.
- The user is the hands-on tester. Automated tests cover the engine; Codex does not operate the browser unless explicitly requested.

## Verification

```sh
npm test
```

The automated suite covers Hand membership, Landmark play, five-crop Store access, both sow/water orders for every crop, rain, removal, each harvest behavior, shared Quality, shipping, memory Journal, Week persistence, exactly three Land, v16–v21 migrations, the Person schedule and actions, relationship derivation, shared card presentation semantics, isolated Prototype 2 persistence, deterministic conditions, emergent life-path derivation, AP telemetry, the day-7/day-14 boundaries, Chronicle and New Spring.

Run the reviewable balance model with:

```sh
npm run balance
```

Its assumptions and latest deterministic results are stored in `BALANCE-REPORT.md`. Foundation contracts are `SPRING-FARMING-V1-DESIGN.md`, `CARD-UI-GRAMMAR-V0.1.md` and `PERSON-LIFE-V0.1-DESIGN.md`. The active experiment is defined by `PROTOTYPE-2-BRIEF.md`; its hands-on checklist is `PROTOTYPE-2-PLAYTEST.md`.
