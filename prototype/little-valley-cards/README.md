# Little Valley Cards — physical world prototype

Cards persist as physical objects in a portrait farm world. The board holds the active world; the lower screen is the Hand of persistent physical cards; money is a HUD value rather than a card.

The current balance experiment is a seven-day **Spring Week**. The HUD shows `Spring · Day n/7`; ending day 7 closes the season and opens a compact summary.

Spring weather is visible in both the HUD and Farm table. The reproducible prototype forecast places a gentle rainy day on day 6; rain automatically waters prepared plots and thirsty crops without spending AP.

The world uses separate Area tables. The current Area's Landmark is face-up on its table, while the destination Landmark is in the Hand. Dragging the destination onto the table swaps the two and travels; there is no carousel browse state.

## Run

```sh
cd /Volumes/LeNguyen02SSD/Programming/new-game/prototype/little-valley-cards
python3 -m http.server 8080 --bind 127.0.0.1
```

Open <http://127.0.0.1:8080/>. State saves locally. **Reset farm** starts clean.

## Hand

Hoe, Watering Can and Sickle begin in the bottom Hand instead of occupying the board.

- Tap/play an item card to equip it. If Farmer is carrying another portable card, the two cards swap.
- Hold an item card in the Hand to inspect its full description without playing it.
- Drag a loose portable card into the Hand to store it. A carried card returns to the Hand when dropped away from a valid target.
- Tools, Seeds and harvested Carrots are portable.
- Farmer has one carrying slot.
- **Return item** returns Farmer's carried card before a hand-only action.
- Item cards are sorted together in the Hand; Landmark cards form a separate group.
- Identical Seeds and Produce consolidate into one physical card with an `×N` quantity. Tools and Landmarks remain unique persistent objects.
- Hand membership changes presentation and position, not card identity. Persistent Tools remain the same objects.

## Money and store

Money is `state.coins` and appears in the top HUD. There is no Coin Purse card.

The General Store sells one Seed unit per purchase: one coin buys one Carrot Seed, while two coins buy one slower regrowing Green Bean Seed. Repeated purchases increase the matching Seed card's `×N` quantity. Farmer must be in Town to buy. Six coins remain a non-blocking milestone within the seven-day run.

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

Home Farm currently has exactly two persistent Land cards: one starts as an Empty Plot and one as Wild Soil. Preparing and harvesting transform those same cards; Land is never spawned or consumed. Once prepared, a field does not become Wild Soil again.

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

Green Beans create the first strategic crop contrast. One Seed costs two coins, needs three watered nights for its first harvest and produces four Beans. A Carrot Seed costs one coin, needs two watered nights and is consumed after one harvest. Harvesting Green Beans keeps the vines on the same Land card; two more watered nights produce the next harvest. Missed water still pauses rather than killing the crop.

## Day-only time experiment

Morning, Afternoon, Evening and Night have been removed from the playable UI. They did not create a meaningful decision.

Time now has two explicit overnight effects:

- watered crops grow into Mature Carrots when **End Day** is chosen;
- produce in the Shipping Bin pays coins when **End Day** is chosen.

There is no hidden clock. Work and Area travel spend visible AP; Tool changes and purchases are free. The General Store is always open but only usable in Town.

## Spring Week v0.1

- Spring lasts seven playable days; this is a test horizon, not the canonical season length.
- The final End Day still advances watered crops and pays the Shipping Bin, then stops day progression.
- A Weekly Journal reports shipment coins, harvest actions and crops still growing.
- **Continue farm** begins the next Spring Week while preserving Land, crops, Tools, supplies and coins.
- **Reset farm** remains a separate full restart. Week boundaries never wither or remove crops.

## Action Point v0.1

Each day begins with 8 AP. Successful Sickle, crop removal, Hoe, sow, water, refill and harvest work costs 1 AP; Landmark travel costs 1 AP. Equip/swap, returning cards to the Hand, buying Seeds and depositing Carrots are free. Dragging Farmer to a target is card targeting, not a separate movement cost. Watering a 3×3 plot is 1 AP.

AP is deducted only after an interaction succeeds. End Day in any Area restores all 8 AP and returns Farmer and their carried card to Home Farm. AP exhaustion does not automatically end the day, so free actions remain available.

## Current loop

```text
drag Valley Town Landmark onto the table -> Town board
choose Carrot or Green Bean Seeds -> Seeds enter Hand
drag Home Farm Landmark onto the table -> Farm board
play Sickle -> cut the remaining Wild Soil
play Hoe -> till Cleared Ground into the second Plot
play Watering Can -> refill at Well
water then sow, or sow then water
End Day -> watered crops advance and become thirsty
water growing crops again
End Day -> crops mature
Return item -> pull Mature Carrots -> Carrots enter Hand
play Carrots -> ship
End Day -> shipment pays
repeat with persistent Tools and growing coin total
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
- Card descriptions stay hidden during play. Hold a card to inspect its description.
- Seed descriptions include purchase cost, watered nights to first harvest, yield and regrow behavior.
- Dragging a carried item onto a glowing target uses it through Farmer. Dropping it anywhere else returns it to the Hand.
- Resolving work never moves Farmer automatically; the board layout remains where the player arranged it.

Farm and Town use distinct generated native-pixel table backgrounds rather than fixed semantic zones. Carried cards render above Farmer in the physical stack. A single compact HUD replaces the former brand, day, hint, Area and status strips so the table and Hand fit within one portrait viewport.

## Intentional scope

- One Farmer, one of each Tool, two finite persistent fields, Carrots, regrowing Green Beans, one Well, one General Store, one Shipping Bin and two Areas with one Landmark each.
- No draw pile, dialogue, relationship UI, Weather, multiple seasons, NPC or location graph. Spring Week is a deliberately narrow crop-balance slice.
- Hand is the presentation layer for persistent physical cards, not a second abstract item database.
- Tool is a concrete behavior family; the rest of the ontology remains open.
- The user is the hands-on tester. Automated tests cover the engine; Codex does not operate the browser unless explicitly requested.

## Verification

```sh
npm test
```

The smoke test covers Hand membership, Landmark play, Store access by Area, End Day in multiple Areas, Sickle clearing, Hoe tilling, free-hand harvest directly into the Hand, Watering Can charges, both sow/water orders, overnight crop growth, shipment payout, the six-coin milestone and a repeated economy reaching ten coins.
