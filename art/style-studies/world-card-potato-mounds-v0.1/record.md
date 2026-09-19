# Potato Mounds world card v0.1

- Purpose: persistent Land state between the first and second Potato dig
- Status: runtime approved
- Generation date: 2026-09-19
- Tool/model: built-in `image_gen`; model metadata unavailable
- Edit target: Mature Potatoes v0.1
- Source: `source/potato-mounds-source-v0.1.png`
- Delivery: `processed/potato-mounds-640x400-v0.1.png`
- Preview: `processed/potato-mounds-preview-320x200-v0.1.png`
- Runtime: `prototype/little-valley-cards/assets/potato-mounds.png`
- Transformation: center-cropped to 1584×990, then nearest-neighbor resized

## Final prompt

```text
Use case: precise-object-edit
Asset type: Little Valley Cards runtime crop/plot art, partially dug Potato Mound after the first Hoe action, horizontal 8:5.
Primary request: transform Image 1 into the same plot immediately after the first potato dig: remove all leafy tops cleanly, replace the six plant positions with four intact rounded earthen mounds and two shallow freshly opened holes. No potatoes are visible; the remaining crop is still hidden in the four mounds.
Input images: Image 1 is the approved Mature Potato plot and exact composition target; Image 2 controls approved native-pixel soil and grass material language only.
Constraints: preserve the complete rectangular plot, two-row six-position rhythm, stakes, camera, framing, background, pixel scale, palette and native-pixel construction. Use exactly four closed mounds and two empty shallow holes. Fully opaque; readable at 320x200. This must clearly invite one more Hoe action.
Avoid: visible potatoes, produce pile, leafy plants, exposed roots, deep pits, hoe, tools, hands, people, basket, text, letters, UI, card border, logo, watermark, photorealism, painterly gradients, smooth vector edges, heavy dithering.
```

Review: four closed mounds plus two holes read as a partial dig and preserve the six-position rhythm.
