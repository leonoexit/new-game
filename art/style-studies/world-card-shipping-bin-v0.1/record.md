# Shipping bin world card v0.1

Status: **runtime approved**
Created: 2026-09-19
Tool: Built-in ImageGen
Model and seed: unavailable

Purpose: test a readable farm-side destination for produce that remains available independently from General Store hours and settles its shipment at the end of the day.

References:

- `art/approved/style-references/farm-high-key-style-reference-v0.1.png` controls native-pixel construction, subject/environment scale, high-key color, material language and cool-teal shadows.
- `prototype/little-valley-cards/assets/roadside-market.png` controls card-sized world framing and restrained prop density, not its market subject.

Source: `source/shipping-bin-source-v0.1.png`
Delivery candidate: `processed/shipping-bin-640x400-v0.1.png`
Review preview: `processed/shipping-bin-preview-320x200-v0.1.png`

## Prompt

```text
Asset: horizontal 8:5 world-card illustration for the Little Valley Cards mobile game.
Moment: a sturdy wooden farm shipping bin waits beside the farmhouse path for harvested produce to be dropped off.
References: Image 1 controls the approved native-pixel construction, coherent subject/environment pixel scale, high-key fresh palette, colored outlines, chunky warm wood, yellow-green grass, powder-blue sky light, and compact cool-teal shadows. Image 2 controls the card-sized world framing, medium-close slightly elevated camera, simple continuous grassy setting, and restrained prop density; do not copy its market stall subject.
Anchors: one large waist-high wooden shipping crate with a hinged lid visibly propped open, chunky plank construction, small metal hinges, one simple carrot crate resting beside it to communicate farm shipment without showing loose UI icons.
Visual hypothesis: a single practical farm object can read immediately as a shipping destination at phone size while remaining part of the persistent physical world.
Composition: horizontal 8:5 landscape crop; complete shipping bin centered inside the central 80%; medium-close slightly elevated view; plain farm grass and a narrow path behind; strong uncluttered silhouette; fully opaque rectangular artwork.
Approved visual language: original native pixel art with deliberate hard-edged clusters, roughly three values per material, warm brown or blue-green colored outlines, bright high-key rural palette, minimal detail that remains readable at 320x200.
Avoid: people, buildings, market stalls, readable signs, letters, prices, coins, card borders, text, UI, icons, logo, watermark, transparent pixels, portrait framing, photorealism, painterly brushwork, smooth gradients, dithering, retro sepia grading, dense scenery, universal pure-black outlines.
```

Processing: center-cropped from the generated 1586×992 source to 1536×960, then nearest-neighbor resized to 640×400 and 320×200.

Review: runtime approved by the user on 2026-09-19 for the environment/time prototype. The object reads clearly and the art style was received positively. The surrounding landscape should be revised later so the Shipping Bin sits recognizably inside the protagonist's established farm rather than a generic open field; this caveat does not block prototype use.
