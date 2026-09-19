# Young Potatoes world card v0.1

- Purpose: explore the dry/growing identity for Potato before runtime implementation
- Status: runtime approved
- Generation date: 2026-09-19
- Tool/model: built-in `image_gen`; model metadata unavailable
- Style reference: `art/approved/style-references/farm-high-key-style-reference-v0.1.png`
- Framing reference: `art/style-studies/world-card-empty-plot-v0.1/processed/empty-plot-640x400-v0.1.png`
- Source: `source/young-potatoes-source-v0.1.png`
- Delivery candidate: `processed/young-potatoes-640x400-v0.1.png`
- Review preview: `processed/young-potatoes-preview-320x200-v0.1.png`
- Transformation: center-cropped from 1585×992 to 1584×990, then nearest-neighbor resized to 640×400 and 320×200
- Runtime: approved by the user on 2026-09-19; integration pending the complete Potato asset family

## Exploration prompt

```text
Use case: stylized-concept
Asset: horizontal 8:5 crop/plot identity study for Little Valley Cards.
Moment: one young potato crop grows on a small rectangular farm plot, visibly thirsty and not ready to harvest.
Anchors: six compact potato plants in two tidy rows, broad clustered yellow-green leaves, pale dry furrows with a few subtle rounded soil mounds.
References: Image 1 controls approved native-pixel construction, coherent subject/environment pixel scale, high-key fresh palette, colored outlines, warm soil and grass language, and compact cool-teal shadows. Image 2 controls the close slightly elevated plot framing, low density, complete rectangular soil patch, and mobile-readable subject scale.
Visual hypothesis: low clustered potato foliage and small rounded mounds establish a root crop identity clearly distinct from carrot sprigs and trellised beans.
Format: horizontal 8:5, fully opaque rectangular artwork, readable at 320x200.
Avoid: visible potatoes above ground, exposed roots, carrots, bean trellises, flowers, harvested basket, hands, people, tools, watering can, rain, text, letters, UI, card border, logo, watermark, transparent pixels, portrait framing, photorealism, painterly gradients, smooth vector edges, heavy dithering, dense scenery, universal black outlines.
```

The first output exposed orange potato bulbs above the soil and was rejected rather than saved as the candidate.

## Corrective edit prompt

```text
Use case: precise-object-edit
Asset type: Little Valley Cards young thirsty Potato crop/plot study, horizontal 8:5.
Primary request: edit Image 1 to remove and fully cover every visible orange potato bulb beneath the plants; replace those six exposed bulbs with ordinary pale dry soil and subtle rounded earthen mounds.
Input images: Image 1 is the edit target; Image 2 controls approved native-pixel color and material language only.
Constraints: change only the exposed orange bulbs and soil immediately around them; preserve the exact six potato plants, two-row layout, plot geometry, wooden stakes, camera, framing, background, native pixel construction, palette, and fully opaque canvas. No potato should be visible above ground or through the soil. The plants must still look young and thirsty, not ready to harvest.
Avoid: visible potatoes, exposed roots, orange bulbs, carrots, flowers, harvested produce, tools, people, text, UI, card border, logo, watermark, painterly gradients, smooth vector edges.
```

## Review

- Keep: six low clustered plants, two-row silhouette, dry soil, clear separation from Carrot sprouts and Green Bean trellises.
- At 320×200 the plant masses and plot remain readable, and no harvested tubers are visible.
- Approval decision: the user explicitly approved this Potato identity on 2026-09-19.
