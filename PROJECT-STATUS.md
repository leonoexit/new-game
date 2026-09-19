# Project status

## Active project

Little Valley Cards is the only active direction.

It is a solo farm-management game represented through persistent physical cards. Cards, stacks and transformations are the world. There is no draw pile, play limit or fixed target row. The runtime now has a visible daily Action Point budget; the lower screen is a physical **Hand** of persistent cards, not a random-card system.

## Validated foundation

The two-plot, one-Farmer loop was playtested positively on 2026-09-19. Protect its speed, tactile movement, direct board feedback, player-organized layout and bright handheld palette.

The three-Land/four-crop direction has now produced a clear planning effect in hands-on play: because not every crop can occupy Land at once, the player naturally compares commitments in their head. Do not add a fourth Land yet. The strongest emotional feedback is also not score excitement but a Tamagotchi-like feeling of caring for a small, cute living thing. Protect persistence, visible care and attachment over optimization pressure.

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
- Tools, Seeds and Carrots are portable.
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
- Green Beans need three watered nights for the first harvest and produce four Beans.
- Harvest leaves the vines on the same Land card instead of returning it to Empty Plot.
- The vines need two watered nights to regrow; missed water pauses them like Carrots.
- Dry, watered, mature, seed and produce states have dedicated runtime artwork.

## Potato crop lifecycle v0.1

- Potato Seeds cost two coins and need two watered nights.
- Mature Potatoes require the Hoe instead of free-hand harvest.
- The first dig costs 1 AP, yields two Potatoes and leaves visible Potato Mounds on the same Land.
- The second dig costs 1 AP, yields two more Potatoes and returns the Land to an Empty Plot.
- The total yield is deterministic `2 + 2`; there is no harvest RNG or reload incentive.
- Potato Mounds persist across Spring Weeks and count as one completed harvest only after the second dig.
- Potato Seeds and Produce consolidate by quantity, rain waters growing Potatoes, and the Sickle can remove growing or mature Potato crops.
- Young, watered, mature, mound, Seed and Produce states have dedicated approved native-pixel artwork.

## Money and economy

Money is now a numeric HUD unit (`state.coins`), not a Coin Purse card. The General Store sells one Carrot Seed for one coin, or one Green Bean/Potato Seed for two coins. Repeated purchases increase the quantity on the matching Seed card.

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

This makes time's actual effects visible without restoring opaque day phases. Spring Week now supplies a finite deadline; weather, multiple seasons, story events and NPC schedules remain outside the current slice.

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

Future Person cards may temporarily add AP, reduce the cost of an action family or modify the daily AP rules. This is intentionally uncommitted.

## Art status

`STYLE.md`, `little-valley-cards-art-bible-v0.1.md` and `.agents/skills/little-valley-cards-art/` control raster work.

Hoe, Watering Can and Sickle use square transparent native-pixel item assets recorded under `art/style-studies/`.

Six previously missing or ambiguous horizontal card images now have dedicated runtime art: Cleared Ground, Watered Plot, Watered Carrots, General Store, Home Farm Landmark and Valley Town Landmark. Each source, prompt, processed delivery and 320×200 review preview is recorded under `art/style-studies/`.

Watering Can now also has a filled-state item variant with visible water inside its open top, recorded under `art/style-studies/item-card-watering-can-filled-v0.1/`.

Green Beans now have a complete runtime art family. Home Farm and Valley Town each have a generated low-contrast native-pixel table background recorded under `art/style-studies/area-background-*/`.

Home Farm also has an approved rainy variant. Weather is persisted in state, shown in the compact HUD, and changes the Farm table background. The deterministic Spring prototype forecast uses rain on day 6; that morning automatically waters Empty Plots and thirsty crops without spending AP. This is currently an immersion experiment, not a claim that watering pressure is balanced.

Shipping Bin art remains approved for the prototype with one caveat: a later revision should place it recognizably inside the protagonist's farm rather than a generic meadow.

## Next checkpoint

Spring now runs as persistent seven-day weeks. End Day on day 7 resolves overnight growth and shipment income, then pauses on a Weekly Journal showing coins earned, harvests and crops still growing. Continue Farm starts the next week while preserving the entire farm; Reset Farm remains the explicit full restart. Crop Remains and cleanup mode were removed after playtesting showed they added punishment and chores without an interesting decision.

Crop lifecycle rules now live in `prototype/little-valley-cards/crop-system.js`; `engine.js` still owns action/AP orchestration, Area travel, store, shipping and messages.

The next checkpoint is a hands-on transition across two Spring Weeks, especially whether continuity makes the farm feel persistent and whether four crop behaviors are needed for meaningful variety.

The user should hands-on playtest:

- whether 8 AP creates a useful constraint or merely interrupts the existing loop;
- whether spending feedback is clear for both tap and drag interactions;
- whether ending the day away from Home Farm and waking at Home creates a clear daily return loop;
- whether free equip, purchase and deposit actions remain understandable beside paid work;
- whether auto-armed carried Tools make tap play feel immediate without accidental actions;
- whether long-press descriptions are discoverable enough on touch;
- whether the generated Farm and Town table backgrounds communicate location without overpowering cards;
- whether one prepared Plot plus one Wild Soil is a better opening than clearing every field;
- whether two watered nights make Carrots feel like a crop rather than a one-click conversion;
- whether paused growth is legible when a crop dries each morning;

- whether the bottom Hand improves board readability;
- whether one-tap play/swap is faster than managing loose Tool cards;
- whether Sickle → Cleared Ground → Hoe reads naturally with the dedicated state art;
- whether hand-harvest directly into the Hand feels immediate enough;
- whether the money HUD is legible and purchasing feels direct;
- whether both water/sow orders read naturally;
- whether overnight growth and payout make the day boundary understandable;
- whether End Day still lacks a meaningful opportunity cost;
- whether dragging a Landmark from Hand onto the table feels like playing a card rather than clicking navigation;
- whether the compact one-screen layout leaves enough room for both table interactions and the fixed Hand;
- whether Carrots versus regrowing Green Beans creates a real short-term versus long-term choice;
- whether the two Hand groups make portable objects and navigation cards immediately understandable;
- whether each new image explains its card state at a glance.

Do not operate the browser for playtesting unless the user explicitly asks. Do not commit or push without the user's request.

## Source of truth

- `PROJECT-STATUS.md` describes the current direction and experiment.
- `prototype/little-valley-cards/README.md` describes the playable contract.
- `STYLE.md` and `little-valley-cards-art-bible-v0.1.md` control art production.
- `CONTEXT-RESTORE-PROMPT.md` is the handoff prompt for the next session.

Earlier One Good Day prototypes remain outside the active tree. Their history is recoverable from Git commit `ebe2196` and must not be restored accidentally.
