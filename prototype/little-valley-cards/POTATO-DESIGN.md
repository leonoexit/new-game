# Potato behavior v0.1

Status: **implemented in Spring Farming v1**

Potato should make harvesting feel like digging up a root crop without adding random yield or a reload incentive.

## Seed fields

- Cost: 1 coin after deterministic balance review; the second Hoe dig already supplies the crop's extra action cost
- First harvest: 2 watered nights
- Yield: 4 Potatoes total, delivered as two visible digs of 2
- After harvest: the first dig leaves a Potato Mound on the same Land; the second dig returns that Land to an Empty Plot
- Unique behavior: mature Potatoes require the Hoe. Each dig costs 1 AP. Farmer cannot harvest them with free hands.

## State sequence

```text
Potato Seeds + Empty/Watered Plot
  -> thirsty/watered Potato Plot
  -> Mature Potatoes
  -> Hoe: 2 Potatoes + Potato Mound
  -> Hoe: 2 Potatoes + Empty Plot
```

The two-step deterministic reveal is the controlled variation: the player receives produce twice, but the total is known in advance. It adds one extra harvest action and one visible card transformation without RNG.

## Shared-system expectations

- Potato Seeds and harvested Potatoes consolidate by quantity in the Hand.
- Both produce batches can be shipped normally.
- Rain waters thirsty Potato crops exactly like the existing crops.
- Spring Week boundaries preserve every Potato state, including Mature Potatoes and Potato Mounds.
- Sickle removes thirsty, watered or mature Potato crops with no Produce. A Potato Mound is already being harvested and is finished with the Hoe, not cleared with the Sickle.
- The Weekly Journal counts each completed Potato crop once, on the second dig, rather than counting both partial digs as separate harvests.

## Art status

The complete Potato family is runtime approved and recorded under `art/style-studies/`. Young, watered, mature, mound, Seed and Produce assets are integrated.
