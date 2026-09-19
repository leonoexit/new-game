# Little Valley Cards — physical world prototype

Cards persist as physical objects in a portrait farm world. The board holds the active world; the lower screen is the Hand of persistent physical cards; money is a HUD value rather than a card.

The world uses separate Area tables. Home Farm and Valley Town are accessed by playing their Landmark cards from the Hand; there is no carousel browse state.

## Run

```sh
cd /Volumes/LeNguyen02SSD/Programming/new-game/prototype/little-valley-cards
python3 -m http.server 8080 --bind 127.0.0.1
```

Open <http://127.0.0.1:8080/>. State saves locally. **Reset farm** starts clean.

## Hand

Hoe, Watering Can and Sickle begin in the bottom Hand instead of occupying the board.

- Tap/play an item card to equip it. If Farmer is carrying another portable card, the two cards swap.
- Drag a loose or attached portable card into the Hand to store it.
- Tools, Seeds and harvested Carrots are portable.
- Farmer has one carrying slot.
- **Free hands** returns Farmer's carried card before a hand-only action.
- Item cards are sorted together in the Hand; Landmark cards form a separate group.
- Hand membership changes presentation and position, not card identity. Persistent Tools remain the same objects.

## Money and store

Money is `state.coins` and appears in the top HUD. There is no Coin Purse card.

The General Store lives in Valley Town and contains a **Buy Seeds · 2** action. Farmer must be in Town to use it. A purchase subtracts two coins and puts a two-Seed stack directly into the Hand. Six coins remain a non-blocking milestone; the simulation continues indefinitely.

## Areas and Landmark play

- Home Farm and Valley Town Landmark cards live in the Hand.
- Play a Landmark card to move Farmer and the currently carried card to that Area.
- Playing a Landmark does not advance the day.
- The board always shows the Area where Farmer currently is.
- The General Store is in Valley Town; plots, Well and Shipping Bin are at Home Farm.
- **End Day** is only available while Farmer is at Home Farm.

## Flexible sowing and watering

Preparing a new plot now uses both ground-working Tools:

```text
Sickle + Wild Soil -> Cleared Ground
Hoe + Cleared Ground -> Empty Plot
```

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

## Day-only time experiment

Morning, Afternoon, Evening and Night have been removed from the playable UI. They did not create a meaningful decision.

Time now has two explicit overnight effects:

- watered crops grow into Mature Carrots when **End Day** is chosen;
- produce in the Shipping Bin pays coins when **End Day** is chosen.

Work, Tool changes, Area travel and purchases do not advance a hidden clock. The General Store is always open but only usable in Town. This is an honest day-boundary settlement model, not yet a strategic time-management system.

## Future Action Point experiment

The next time experiment is expected to introduce a finite AP budget per day, but AP is **not implemented in the current runtime**. The first candidate is 8 AP, not a final value. Equip/swap remains free; successful work and Landmark travel spend visible AP. Buying Seeds and depositing Carrots are free. Dragging Farmer to a target is currently card targeting, not a separate movement system. Watering a 3×3 plot remains 1 AP at baseline. Day boundary will still handle crop growth, Shipping Bin payout and AP reset.

## Current loop

```text
play Valley Town Landmark -> Town board
Buy Seeds -> Seeds enter Hand
play Home Farm Landmark -> Farm board
play Sickle -> cut grass
play Hoe -> till Cleared Ground into Plots
play Watering Can -> refill at Well
water then sow, or sow then water
End Day -> crops mature
Free hands -> pull Mature Carrots -> Carrots enter Hand
play Carrots -> ship
End Day -> shipment pays
repeat with persistent Tools and growing coin total
```

## Interaction

- Tap an actionable board card to select it, then tap a glowing target.
- Tap the selected card again or tap the board background to cancel.
- Drag the same source directly onto the target as a physical shortcut.
- Tap/play a Hand card to equip or travel.
- Drag portable cards into the Hand to store them.
- Keyboard Enter/Space follows the board selection path.

## Intentional scope

- One Farmer, one of each Tool, two plots, one Well, one General Store, one Shipping Bin and two Areas with one Landmark each.
- No draw pile, AP system yet, dialogue, relationship UI, Weather, Season, NPC or location graph. AP is the next planned experiment.
- Hand is the presentation layer for persistent physical cards, not a second abstract item database.
- Tool is a concrete behavior family; the rest of the ontology remains open.
- The user is the hands-on tester. Automated tests cover the engine; Codex does not operate the browser unless explicitly requested.

## Verification

```sh
npm test
```

The smoke test covers Hand membership, Landmark play, Store access by Area, Farm-only End Day, Sickle clearing, Hoe tilling, free-hand harvest directly into the Hand, Watering Can charges, both sow/water orders, overnight crop growth, shipment payout, the six-coin milestone and a repeated economy reaching ten coins.
