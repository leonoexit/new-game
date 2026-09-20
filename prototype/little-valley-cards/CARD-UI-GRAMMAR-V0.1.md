# Card UI Grammar v0.1

This document defines the shared visual reading order for every runtime card surface. It changes presentation only; Board, Hand, card dimensions and tap/drag behavior remain unchanged.

## Shared presentation model

`card-presentation.js` produces the same semantic fields for World, Hand, Store and Inspection:

```js
{
  family,
  title,
  primaryStatus,
  quantity,
  progress,
  detail,
  interactionState,
  art,
  artShape
}
```

Every face reads in this order: family and one primary status, art, title, then progress or quantity when present. Long descriptions belong only in hold/Inspection.

## Families

All cards use neutral paper and one warm-neutral physical shadow. Family color is limited to the outer border and header/status; artwork wells remain neutral.

| Family | Content | Accent |
|---|---|---|
| Person | Farmer and residents | teal |
| Crop | planted, watered and mature crops | leaf green |
| Land | soil states | soil ochre |
| Tool | Hoe, Watering Can, Sickle | blue-gray |
| Item | Seeds and Produce | amber |
| Landmark | Area Landmarks | warm brown |
| Service | Store, Well, Shipping Bin | plum |

Choice and Tended are primary-status changes, not alternate full-card backgrounds. Quantity and crop progress occupy fixed bottom positions.

## Status and interaction separation

A card exposes at most one `primaryStatus`. Relationship, Quality, Tended, Watering Can charge, shipment state and current Landmark all compete for that one slot using deterministic priority.

`interactionState` is separate from content. Selected source remains cyan; valid tap/drag/drop targets remain gold. These overlays never redefine family or status.

## Surface contract

- World uses the complete compact face.
- Hand uses the same family, art, title and primary status in a horizontal compression.
- Store builds Seed cards through the same presentation model; crop behavior occupies the one status slot.
- Inspection reuses the complete face and puts details beneath it.
- No Store card receives a special card height.
