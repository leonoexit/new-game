# General Store world card v0.1

- Purpose: visually establish a permanent Town shop distinct from the old roadside market
- Status: runtime approved for the requested Area UI experiment
- Generation date: 2026-09-19
- Tool/model: built-in ImageGen; model and seed metadata unavailable
- References: approved high-key farm style controls rendering; Roadside Market controls service-card density only
- Source: `source/general-store-source-v0.1.png`
- Delivery: `processed/general-store-640x400-v0.1.png`
- Review preview: `processed/general-store-preview-320x200-v0.1.png`
- Runtime: `prototype/little-valley-cards/assets/general-store.png`
- Transformation: center crop from 1586×992 to 1536×960, then nearest-neighbor resize; opaque RGB preserved

## Final prompt

```text
Use case: stylized-concept
Asset: Little Valley Cards runtime prototype General Store world-card artwork, horizontal 8:5.
Moment: a small permanent town shop stands open for everyday seed purchases.
Anchors: compact cream plaster storefront, teal double doors standing open, coral fabric awning with two seed sacks and a wooden crate outside.
References: Image 1 controls approved native-pixel construction, high-key palette, colored outlines, building materials and compact cool-teal shadows. Image 2 controls card-sized single-service framing and restrained object density only; do not copy the roadside stall.
Composition: medium-close slightly elevated view, entire storefront centered inside the central 80%, narrow cobbled town edge, strong welcoming silhouette, fully opaque rectangle.
Approved visual language: deliberate hard-edged pixel clusters, roughly three values per material, cream walls, warm wood, coral and teal accents.
Avoid: readable signs, text, letters, prices, people, market stall, card border, UI, logo, watermark, transparent pixels, photorealism, painterly gradients, heavy dithering, dense merchandise, sepia grading.
```

Review: permanent storefront, open doors and seed sacks read clearly at 320×200; no revision required for this experiment.
