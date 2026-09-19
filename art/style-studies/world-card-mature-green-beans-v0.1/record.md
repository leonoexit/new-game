# Mature Green Beans world card v0.1

- Purpose: explore a visually distinct regrowing crop for the next crop-system slice
- Status: runtime approved
- Generation date: 2026-09-19
- Tool/model: built-in `image_gen`; model metadata unavailable
- Style reference: `art/approved/style-references/farm-high-key-style-reference-v0.1.png`
- Framing reference: `art/style-studies/world-card-young-carrots-v0.1/processed/young-carrots-640x400-v0.1.png`
- Source: `source/mature-green-beans-source-v0.1.png`
- Delivery candidate: `processed/mature-green-beans-640x400-v0.1.png`
- Review preview: `processed/mature-green-beans-preview-320x200-v0.1.png`
- Transformation: center-cropped from 1586×992 to 1536×960, then nearest-neighbor resized to 640×400 and 320×200
- Runtime: `prototype/little-valley-cards/assets/mature-green-beans.png`

## Prompt

```text
Asset: horizontal 8:5 crop/plot identity study for Little Valley Cards.
Moment: one mature green bean crop is ready to harvest on a small rectangular farm plot.
Anchors: two short simple wooden trellises, a few climbing bean vines with broad bright leaves, several clearly visible long green bean pods hanging inside the central 80%.
References: Image 1 controls the approved native-pixel construction, coherent subject/environment pixel scale, high-key fresh palette, colored outlines, warm soil and wood language, yellow-green foliage, and compact cool-teal shadows. Image 2 controls only the close slightly elevated plot framing, low density, complete rectangular soil patch, and mobile-readable subject scale; do not copy its carrots.
Visual hypothesis: the trellis silhouette and hanging pods make a regrowing crop immediately distinct from one-shot root crops without adding UI.
Format: horizontal 8:5, fully opaque rectangular artwork, readable at 320x200.
Avoid: carrots, flowers, harvested basket, hands, people, tools, watering can, rain, text, letters, UI, card border, logo, watermark, transparent pixels, portrait framing, photorealism, painterly gradients, smooth vector edges, heavy dithering, dense scenery, universal black outlines.
```

## Review and approval

- At 320×200, the paired trellises and hanging pods remain immediately readable.
- The crop is visually distinct from Carrots and plausibly communicates a plant that remains after harvest.
- User approved the Green Bean identity on 2026-09-19.
- Runtime integration preserves the paired-trellis silhouette and uses distinct young dry, young watered, seed and produce companions.
