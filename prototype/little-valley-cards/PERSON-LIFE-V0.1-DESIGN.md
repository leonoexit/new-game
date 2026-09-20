# Person Presence & Memory v0.1

## Intent

Person cards make the valley feel inhabited without turning people into workers or dialogue dispensers. They are persistent world cards whose presence changes by day. The player builds a relationship by spending scarce time or sharing something the farm actually produced.

Mira, Bram and Nell are runtime-approved Prototype 1 residents only. They test the system and are not the canonical cast.

## Weekly presence

The schedule repeats each Spring Week and never shows more than two residents per day.

| Person | Identity | Presence | Interests |
|---|---|---|---|
| Mira | young, observant | Town: days 1, 4, 7 | Choice Produce, Cauliflower |
| Bram | older, reserved | Farm: days 2, 6; Town: day 4 | rain, Potato, Radish |
| Nell | middle-aged, open | Town: days 2, 3, 5 | Carrot, Green Bean, sun |

Resident cards stay in the save when absent but are not rendered. When present, they can be rearranged on the board. They are not portable, never enter Hand and cannot receive jobs.

## Interaction grammar

Both actions use the existing Farmer source and Person target through either tap or drag:

- free-handed Farmer → Person: `spend_time`, 1 AP;
- Farmer carrying ordinary or Choice Produce → Person: `share_produce`, 1 AP and exactly one Produce.

Tools and Seeds cannot be shared. Each Person accepts one moment per day. AP and Produce are deducted only after a successful resolution.

Each moment has a signature:

- `spend:{area}:{weather}`
- `share:{crop}:{quality}`

A signature can be remembered only once, even in a later Week. Rejection never consumes AP or Produce. The first successful moment is marked `firstMeeting` but remains one moment.

## Relationship derived from memory

The save stores moments, never heart points.

- `New`: default and after one memory;
- `Familiar`: at least two distinct memories;
- `Close`: at least four distinct memories across at least two dates, including at least one Share.

Interest matches change the remembered wording and add a Weekly Journal highlight. They do not add AP, coins, relationship points or hidden acceleration.

## Feedback and inspection

There is no conversation modal or dialogue tree. The compact Person card shows only `New`, `Familiar` or `Close`. A successful action produces a short speech bubble anchored to that Person so the interaction is visibly acknowledged; it is feedback, not a dialogue choice. Hold/Inspection shows identity, weekly rhythm, interests and the complete memory list. The Weekly Journal retains first meetings, preference highlights and relationship transitions.

## Persistence

Save schema v22 adds:

```js
memoryBook.people[personId] = {
  moments: [{
    id, signature, kind, week, day, areaId, weather,
    cropId, quality, favorite, firstMeeting
  }]
}
```

`person-system.js` owns `syncPeopleForDate`, `availablePersonAction`, `applyPersonMoment`, `relationshipStateFor` and `personDetails`. v16–v21 migrate without replacing farm state. Continue Farm restarts the day-1 schedule and preserves all Person memories.
