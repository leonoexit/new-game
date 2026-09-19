# Project status

## Active project

Little Valley Cards is the only active direction.

It is a solo farm-management game represented through persistent physical cards. Cards, stacks and transformations are the world. There is no draw pile, play limit or fixed target row. The current runtime has no Action Point system yet; the lower screen is a physical **Hand** of persistent cards, not a random-card system.

## Validated foundation

The two-plot, one-Farmer loop was playtested positively on 2026-09-19. Protect its speed, tactile movement, direct board feedback, player-organized layout and bright handheld palette.

Interaction v0.3 keeps tap and drag as parallel paths through the same engine. Selection is transient and never saved. Farmer moves with one attached card and can detach it by dragging the exposed card.

## Hand experiment

The Backpack UI was removed. The lower screen is now the Hand, where persistent physical cards are sorted into two groups: portable item cards together, and Landmark cards together.

- Hoe, Watering Can and Sickle begin in the Hand.
- Tap/play an item card from the Hand to equip it; the previously carried card returns to the Hand.
- Drag any loose or attached portable card into the Hand to store it.
- Tools, Seeds and Carrots are portable.
- Farmer has one shared carrying slot.
- Home Farm and Valley Town Landmark cards stay in the Landmark group.
- Playing a Landmark card changes the active Area immediately; the Landmark remains in the Hand.

Hand membership is a positional state on the same card object. It does not clone, consume or replace the card and is not an abstract inventory database.

## Persistent Tool system

- **Sickle** cuts grass from Wild Soil, producing Cleared Ground.
- **Hoe** tills Cleared Ground into an Empty Plot.
- **Watering Can** refills at the Stone Well and waters prepared soil or thirsty crops.
- **Mature Carrots** are harvested by Farmer's free hands, not by a Tool, and enter the Hand immediately.

Each Tool exists exactly once and is never consumed. Watering Can is one card with two charges. The Stone Well only changes its charge state and never creates Water or another container.

The Hand exposes a **Free hands** action so the carried card can be returned before harvesting.

## Flexible preparation order

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

Wild Soil still requires the Hoe before either path.

## Money and economy

Money is now a numeric HUD unit (`state.coins`), not a Coin Purse card. The General Store is a Town card with a direct Buy Seeds action; purchased Seeds enter the Hand.

Six coins remain a milestone and never lock the simulation. The repeat economy still reaches ten coins after a second purchase and shipment cycle.

## Time experiment after playtest

The user did not feel a meaningful effect from Morning/Afternoon/Evening/Night. Those phases and work-driven time marks have been removed from the playable experiment.

The current model has only an explicit day boundary:

- watered crops grow overnight when **End Day** is chosen;
- Shipping Bin contents pay overnight when **End Day** is chosen;
- the day counter increments;
- all ordinary work and Tool changes are free of hidden time costs;
- the General Store is always open, but Farmer must travel to Town to use it.

This makes time's actual effects visible without pretending that the game already has strategic time management. No Weather, Season, story event, travel cost, NPC schedule or other time feature should be added until a real competing opportunity is defined. Area travel deliberately costs no time in this experiment.

## Landmark Area access experiment

The world is split into separate active Area tables:

- **Home Farm** contains Farmer while present, both plots, Stone Well and Shipping Bin;
- **Valley Town** contains the General Store;
- the two Landmark cards live in the Hand, not on the board;
- playing a Landmark card moves Farmer and their carried card to that Area;
- there is no remote-table browsing state or carousel;
- **End Day** is only available while Farmer is at Home Farm.

This is spatial separation, not a time-cost system. `areaId` belongs to world cards, while Hand cards remain location-independent until played.

## Action Point direction — not implemented yet

The next time experiment should use a finite AP budget per day. This is a design direction only; the current runtime still has no AP counter or action costs.

- equip/swap/return a Tool: 0 AP;
- play a Landmark to travel: provisional 1 AP;
- buy Seeds: 0 AP;
- deposit Carrots into Shipping Bin: 0 AP;
- one Sickle, Hoe, sow, water, refill or harvest interaction on a board target: provisional 1 AP;
- dragging Farmer to a target is currently only card targeting, not a separate movement system and not an extra AP cost;
- water a 3×3 plot is 1 AP at baseline, not 2;
- AP is spent only after a successful Landmark/work interaction, never on selection, dragging, swapping, buying or depositing;
- 10 AP was only a placeholder; 8 AP is the first candidate to playtest.

Future Person cards may temporarily add AP, reduce the cost of an action family or modify the daily AP rules. This is intentionally uncommitted.

## Art status

`STYLE.md`, `little-valley-cards-art-bible-v0.1.md` and `.agents/skills/little-valley-cards-art/` control raster work.

Hoe, Watering Can and Sickle use square transparent native-pixel item assets recorded under `art/style-studies/`.

Six previously missing or ambiguous horizontal card images now have dedicated runtime art: Cleared Ground, Watered Plot, Watered Carrots, General Store, Home Farm Landmark and Valley Town Landmark. Each source, prompt, processed delivery and 320×200 review preview is recorded under `art/style-studies/`.

Shipping Bin art remains approved for the prototype with one caveat: a later revision should place it recognizably inside the protagonist's farm rather than a generic meadow.

## Next checkpoint

The user should hands-on playtest:

- whether the bottom Hand improves board readability;
- whether one-tap play/swap is faster than managing loose Tool cards;
- whether Sickle → Cleared Ground → Hoe reads naturally with the dedicated state art;
- whether hand-harvest directly into the Hand feels immediate enough;
- whether the money HUD is legible and purchasing feels direct;
- whether both water/sow orders read naturally;
- whether overnight growth and payout make the day boundary understandable;
- whether End Day still lacks a meaningful opportunity cost;
- whether playing a Landmark feels more direct than carousel browsing;
- whether the two Hand groups make portable objects and navigation cards immediately understandable;
- whether each new image explains its card state at a glance.

Do not operate the browser for playtesting unless the user explicitly asks. Do not commit or push without the user's request.

## Source of truth

- `PROJECT-STATUS.md` describes the current direction and experiment.
- `prototype/little-valley-cards/README.md` describes the playable contract.
- `STYLE.md` and `little-valley-cards-art-bible-v0.1.md` control art production.
- `CONTEXT-RESTORE-PROMPT.md` is the handoff prompt for the next session.

Earlier One Good Day prototypes remain outside the active tree. Their history is recoverable from Git commit `ebe2196` and must not be restored accidentally.
