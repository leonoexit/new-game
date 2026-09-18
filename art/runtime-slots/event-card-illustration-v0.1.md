# Event card illustration slot v0.1

**Status:** provisional production contract with test screen  
**Basis:** `one-good-day-game-spec-v0.2.md` specifies a portrait mobile interface, layered UI, and text-free generated illustrations, but no implemented screen or measured slot exists yet.

## Working viewport and slot

- Reference phone viewport: `390x844` logical pixels.
- Opportunity/resolution card width: `358` logical pixels with `16` px screen margins.
- Illustration inside the card: `320x200` logical pixels (`8:5` / `16:10`).
- Delivery asset: `640x400` pixels for a 2x display density.
- Generated source may be larger, but delivery conversion must use a centered `8:5` crop followed by nearest-neighbor resizing.
- UI title, premise, urgency, choices, and card frame render outside the illustration and must never be baked into the image.

## Composition safety

- Keep the complete focal action inside the central `80%`: logical `x=32..288`, `y=20..180`.
- Keep faces, hands, and the event-defining prop away from all crop edges.
- Edge regions may contain low-priority environment context only.
- The slot does not impose a global camera; each event still chooses the framing that best communicates its emotional beat.

## Review

- Inspect the delivery asset at `320x200` logical display size.
- Confirm the focal action reads without card copy.
- Confirm UI text can change or localize without regenerating the illustration.
- Replace this provisional contract when an implemented UI provides measured slot dimensions.

## Test screen

- `prototype/event-card/index.html`
- The test screen is now a five-day playable vertical slice with game-rendered HUD, thread tabs, morning and evening flow, persistent state, choice buttons, and commitment warnings.
- Uses the approved `mira_festival_repairs_01` illustration in its authored event and clearly labels reused art placeholders elsewhere.
- The user is the visual tester; browser automation is intentionally not used for this project review.
