# Cleared Ground world card v0.1

- Purpose: visually separate sickle-cleared ground from both Wild Soil and tilled Empty Plot
- Status: runtime approved for the requested prototype iteration
- Generation date: 2026-09-19
- Tool/model: built-in ImageGen; model and seed metadata unavailable
- References: `art/approved/style-references/farm-high-key-style-reference-v0.1.png` controls rendering; the existing Wild Soil card controls framing and scale
- Source: `source/cleared-ground-source-v0.1.png`
- Delivery: `processed/cleared-ground-640x400-v0.1.png`
- Review preview: `processed/cleared-ground-preview-320x200-v0.1.png`
- Runtime: `prototype/little-valley-cards/assets/cleared-ground.png`
- Transformation: center crop from 1586×992 to 1536×960, then nearest-neighbor resize; opaque RGB preserved

## Final prompt

```text
Use case: stylized-concept
Asset: Little Valley Cards runtime prototype plot-state artwork, horizontal 8:5.
Moment: the same rough farm patch after a sickle has cut away all tall grass, leaving flat untilled ground that still needs a hoe.
Anchors: short cut grass stubble, compact firm warm earth with no furrows, the same two small stones moved to the edge.
References: Image 1 controls approved native-pixel construction, high-key palette, colored outlines, soil and foliage language. Image 2 controls close slightly elevated plot framing and scale only.
Composition: complete ground patch centered inside the central 80%, clear contrast with both tall Wild Soil and furrowed Empty Plot, quiet meadow background, fully opaque rectangle.
Approved visual language: deliberate hard-edged pixel clusters, roughly three values per material, yellow-green stubble, warm compact earth, cool-teal shadows.
Avoid: tall grass, weeds, tilled rows, crops, water, hands, tools, people, text, UI, card border, logo, watermark, transparency, photorealism, painterly gradients, heavy dithering, dense scenery.
```

Review: the cut stubble and un-furrowed soil remain readable at 320×200; no revision required for the prototype slot.
