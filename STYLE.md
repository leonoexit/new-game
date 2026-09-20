# Little Valley Cards — visual direction v0.1

## Approved foundation

The active visual reference is:

- `art/approved/style-references/farm-high-key-style-reference-v0.1.png` for native-pixel construction, high-key color, colored outlines, broad value grouping, soil/foliage language, and the feeling of a bright rural world.

The reference originated during earlier project research but is intentionally retained as the visual foundation for Little Valley Cards. It controls rendering language, not the old game's characters or narrative.

## Card-first rule

The phone screen may be portrait, but generated artwork follows its slot rather than the device ratio.

- Action-card illustration: horizontal `8:5`, delivered at `640x400`, shown at `320x200` logical pixels.
- Persistent farm/plot illustration: horizontal `8:5` unless a measured runtime slot replaces it.
- NPC portrait: square `1:1`.
- Card frame, title, cost, state, progress, targeting feedback and buttons are rendered by the game UI, never baked into artwork.

## Visual language

- Original bright native pixel art.
- Deliberate hard-edged pixel clusters and colored outlines.
- Roughly three clear value steps per material.
- High-key fresh palette with compact cool-teal shadows.
- Light yellow-green foliage, warm soil, powder-blue sky and restrained cream/amber accents.
- One immediate action and one readable focal prop per action-card image.
- Clear at `320x200` on a phone.

Avoid photorealism, painterly brushwork, smooth airbrush gradients, pixel filters over detailed art, pure-black universal outlines, sepia/brown wash, retro grading, dithering, dense scenery, text, logos, card frames and UI inside generated assets.

## Current status

The rendering language is retained. The physical-board prototype now has runtime-approved complete crop families for Carrot, Green Bean, Potato, Cauliflower and Radish, plus Farmer, Tools, soil states, Well, Store, Shipping Bin, Landmarks and Area backgrounds. Cauliflower and Radish production records include source, processed delivery, logical-size preview, final prompt and delegated review decision under `art/style-studies/`. These assets validate prototype slots; they do not define canonical NPC or protagonist identity.
