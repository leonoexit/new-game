# Watered Green Beans world card v0.1

- Purpose: watered growth state for the approved Green Beans crop
- Status: runtime approved
- Generation date: 2026-09-19
- Tool/model: built-in `image_gen`; model metadata unavailable
- Edit target: Young Green Beans source v0.1
- Style reference: `art/approved/style-references/farm-high-key-style-reference-v0.1.png`
- Source: `source/watered-green-beans-source-v0.1.png`
- Delivery: `processed/watered-green-beans-640x400-v0.1.png`
- Review preview: `processed/watered-green-beans-preview-320x200-v0.1.png`
- Runtime: `prototype/little-valley-cards/assets/watered-green-beans.png`
- Transformation: center-cropped from 1586×992 to 1536×960, then nearest-neighbor resized

## Final prompt

```text
Use case: precise-object-edit
Asset type: Little Valley Cards runtime crop/plot art, watered young Green Beans, horizontal 8:5
Primary request: edit Image 1 so only the soil moisture and subtle plant freshness change: make the complete rectangular plot visibly dark, freshly watered soil with a few tiny clear-blue pixel highlights between rows; make leaves very slightly more upright and fresh
Input images: Image 1 is the edit target and its exact composition, paired trellises, vines, framing, pixel scale and all objects must be preserved; Image 2 is the approved color/material reference only
Constraints: change only the moisture state and subtle freshness; keep every trellis, vine position, plot geometry, grass, rocks, camera, framing and native-pixel construction unchanged; no new objects; fully opaque; readable at 320x200
Avoid: rain, watering can, people, hands, tools, giant puddles, flooded soil, mature bean pods, text, letters, UI, card border, logo, watermark, photorealism, painterly gradients, smooth vector edges, heavy dithering
```

Review: dark soil and blue highlights make the watered state visibly distinct without changing crop identity.
