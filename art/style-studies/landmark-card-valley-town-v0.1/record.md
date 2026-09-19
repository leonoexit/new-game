# Valley Town Landmark v0.1

- Purpose: represent the Town table as a persistent travel destination
- Status: runtime approved for the requested Area UI experiment
- Generation date: 2026-09-19
- Tool/model: built-in ImageGen; model and seed metadata unavailable
- Reference: `art/approved/style-references/farm-high-key-style-reference-v0.1.png` controls native-pixel rendering only
- Source: `source/valley-town-landmark-source-v0.1.png`
- Delivery: `processed/valley-town-landmark-640x400-v0.1.png`
- Review preview: `processed/valley-town-landmark-preview-320x200-v0.1.png`
- Runtime: `prototype/little-valley-cards/assets/valley-town-landmark.png`
- Transformation: center crop from 1586×992 to 1536×960, then nearest-neighbor resize; opaque RGB preserved

## Final prompt

```text
Use case: stylized-concept
Asset: Little Valley Cards runtime prototype Landmark card artwork for the Valley Town area, horizontal 8:5.
Moment: a welcoming small valley town square marks the center of local trade.
Anchors: one pale-stone clockless bell arch, a round blue fountain below it, two compact colorful shopfront silhouettes framing a cobbled lane.
Reference: Image 1 controls approved native-pixel construction, coherent subject scale, high-key palette, colored outlines, wood, stone, foliage and compact cool-teal shadows only; create an original town identity.
Composition: medium-wide slightly elevated view, bell arch and fountain make one readable central landmark inside the central 80%, restrained shopfront context, fully opaque rectangle.
Approved visual language: deliberate hard-edged pixel clusters, roughly three values per material, cream stone, coral and teal accents, powder-blue water, fresh greenery.
Avoid: readable signs, text, letters, clocks, UI, card border, logo, watermark, people, modern city elements, dense street clutter, transparent pixels, photorealism, painterly gradients, heavy dithering, sepia grading.
```

Review: the bell arch and fountain give Town a distinct central silhouette at 320×200; no revision required for this experiment.
