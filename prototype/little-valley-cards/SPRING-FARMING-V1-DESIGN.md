# Spring Farming v1 — behavior and Quality contract

Status: implementation contract for the playtest milestone.

## Fixed world constraints

- Home Farm owns exactly three persistent Land cards. Crop actions transform those cards; they never create or destroy Land.
- Spring is a sequence of persistent seven-day weeks. Week boundaries never clear crops, supplies, memories or partially completed harvests.
- All five crops use the same Store, Hand, sow/water, rain, removal, shipping and save systems.

## Behavior matrix

| Crop | Seed | First harvest | Base yield | After harvest | New decision |
|---|---:|---:|---:|---|---|
| Carrot | 1 coin | 2 watered nights | 3 | Land clears | Fast, dependable one-shot crop |
| Green Bean | 2 coins | 3 watered nights | 3 | Vines regrow in 2 watered nights | Keep a Land committed for repeat harvests |
| Potato | 1 coin | 2 watered nights | 2 + 2 | First Hoe dig leaves mounds; second clears Land | Spend an extra harvest AP to reveal a deterministic split yield |
| Cauliflower | 3 coins | 4 watered nights | 9 | Land clears | Commit scarce Land for most of a week for one large payoff |
| Radish | 1 coin | Baby stage after 1 watered night; full crop after 3 | 2 baby or 5 full | Land clears | Harvest early to release Land or deliberately water twice more for a larger crop |

Radish is the fifth crop because flexible harvest timing adds a decision the other four do not contain. Its baby stage is a real ready state, not an unfinished crop: Farmer may harvest it immediately, while deliberately watering it resumes growth toward full Radishes. Rain does not silently advance a Baby Radish; the commitment to keep growing is explicit.

## Shared Quality: tended crops

Quality is deterministic care, not a streak, random roll or perfect-watering check.

1. Farmer must have free hands.
2. A thirsty, watered or Baby Radish crop that has not been tended in its current harvest cycle is a valid target.
3. **Tend** costs 1 AP and visibly marks the crop card as **Tended**.
4. The next harvest from that Land produces a dedicated **Choice** Produce card.
5. Choice Produce remains separate from ordinary Produce and consolidates by crop and Quality. It ships at the ordinary rate; its lasting reward is memory rather than a mandatory coin multiplier.
6. Green Bean vines reset their tended state after every harvest, so each regrow cycle asks for a new care decision.
7. Potato care survives the first dig and applies to both batches; the state clears only after the second dig.
8. Removal destroys the pending Quality state and yields nothing.

The first Choice harvest of each crop is stored as a permanent care memory, with the first one receiving a special milestone. This makes Quality meaningful even after the Produce is shipped. Because tending is an explicit, persisted action and harvest results contain no randomness, reloading cannot improve Quality.

## Farm memory and Weekly Journal

The save owns a persistent memory book with:

- the first crop ever harvested;
- crop discoveries, recorded when each crop is first sown;
- the first Choice harvest;
- milestone memories such as the first completed week and first six-coin farm.

Each Weekly Journal tells the story of new memories from that week and names crops still living on the farm. Shipment income may appear as a sentence, but the Journal must not present a score table or rank the player.

## Balance questions

The deterministic headless simulator must use three Land and the shared crop constants. It compares fast Carrots, Green Bean regrowth, slow Cauliflower payoff, a mixed roster, and Quality-focused tending across multiple weeks. Review focuses on:

- coins and harvests per week;
- Land occupancy;
- work AP, refill AP and travel pressure;
- seed affordability and reinvestment;
- whether one strategy dominates both income and flexibility;
- whether any crop is economically irrational after accounting for its behavior.

Numbers change only when simulator evidence and the intended behavior point in the same direction.
