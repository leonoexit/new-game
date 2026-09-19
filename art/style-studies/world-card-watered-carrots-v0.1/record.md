# Watered Carrots world card v0.1

- Purpose: make a hydrated growing crop visibly different from a thirsty planted crop
- Status: runtime approved for the requested prototype iteration
- Generation date: 2026-09-19
- Tool/model: built-in ImageGen; model and seed metadata unavailable
- References: approved high-key farm style reference controls rendering; Young Carrots controls crop layout
- Source: `source/watered-carrots-source-v0.1.png`
- Delivery: `processed/watered-carrots-640x400-v0.1.png`
- Review preview: `processed/watered-carrots-preview-320x200-v0.1.png`
- Runtime: `prototype/little-valley-cards/assets/watered-carrots.png`
- Transformation: center crop from 1586×992 to 1536×960, then nearest-neighbor resize; opaque RGB preserved

## Final prompt

```text
Use case: stylized-concept
Asset: Little Valley Cards runtime prototype crop-state artwork, horizontal 8:5.
Moment: six young carrot sprouts are visibly well watered and beginning healthy overnight growth.
Anchors: six separate bright leafy sprouts in two columns, dark damp furrows, unmistakable but restrained blue water glints around every row.
References: Image 1 controls approved native-pixel construction, high-key palette, colored outlines, foliage, soil and water language. Image 2 controls exact crop layout, close elevated framing and subject scale.
Composition: complete rectangular crop patch centered inside the central 80%, stronger hydrated leaf posture and damp-soil cues than the thirsty state, plain grass background, fully opaque rectangle.
Approved visual language: deliberate hard-edged pixel clusters, roughly three values per material, fresh yellow-green leaves, wet warm soil, compact cool-teal shadows and sparse powder-blue reflections.
Avoid: mature carrots, exposed large roots, rain, watering can, hands, people, text, UI, card border, logo, watermark, transparency, photorealism, painterly gradients, heavy dithering, dense scenery.
```

Review: hydrated leaves, wet furrows and water glints remain legible at 320×200; no revision required for the prototype slot.
