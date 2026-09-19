# Mature Potatoes world card v0.1

- Purpose: ready-to-dig Potato state
- Status: runtime approved
- Generation date: 2026-09-19
- Tool/model: built-in `image_gen`; model metadata unavailable
- Edit target: approved Young Potatoes v0.1
- Source: `source/mature-potatoes-source-v0.1.png`
- Delivery: `processed/mature-potatoes-640x400-v0.1.png`
- Preview: `processed/mature-potatoes-preview-320x200-v0.1.png`
- Runtime: `prototype/little-valley-cards/assets/mature-potatoes.png`
- Transformation: center-cropped to 1584×990, then nearest-neighbor resized

## Final prompt

```text
Use case: precise-object-edit
Asset type: Little Valley Cards runtime crop/plot art, Mature Potatoes ready to dig, horizontal 8:5.
Primary request: edit Image 1 into the same potato field at harvest maturity: enlarge and thicken the same six leafy plants slightly, add restrained golden-yellow aging to some outer leaf clusters, and make the soil mounds beneath each plant visibly fuller and raised so the crop reads ready to dig.
Input images: Image 1 is the approved Potato identity and edit target; Image 2 controls approved native-pixel color, foliage, soil and shadow language only.
Constraints: preserve exactly six plants in the same two-row layout, complete plot geometry, stakes, camera, framing, background and pixel scale. Keep every potato fully underground; readiness must come from mature foliage and six fuller earthen mounds. Fully opaque; readable at 320x200.
Avoid: visible potatoes, exposed roots or bulbs, harvested produce, empty holes, hoe, tools, hands, people, basket, flowers, trellis, carrots, text, letters, UI, card border, logo, watermark, photorealism, painterly gradients, smooth vector edges, heavy dithering.
```

Review: yellowing foliage and fuller mounds communicate maturity without revealing harvested produce.
