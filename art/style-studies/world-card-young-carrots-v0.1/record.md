# Young carrots world card v0.1

Status: **runtime approved**  
Created: 2026-09-18  
Tool: Built-in ImageGen  
Model and seed: unavailable

Purpose: test whether the world-card treatment remains readable for a crop state.

References: `art/approved/style-references/farm-high-key-style-reference-v0.1.png` controls rendering language only.

Source: `source/young-carrots-source-v0.1.png`  
Delivery: `processed/young-carrots-640x400-v0.1.png`  
Review preview: `processed/young-carrots-preview-320x200-v0.1.png`

## Prompt

```text
Use case: stylized-concept
Asset: horizontal 8:5 crop-state illustration for a mobile world card
Moment: six young carrot sprouts grow in three broad damp furrows on one small rectangular soil patch
Anchors: exactly six separate leafy sprouts in two columns, dark damp soil, tiny restrained blue water highlights
Visual hypothesis: one simple card-sized place, instantly readable crop state, very low object density
Reference: Image 1 controls the approved bright native-pixel construction, coherent pixel scale, high-key fresh palette, colored outlines, warm soil clusters, yellow-green foliage and compact cool-teal shadows; do not copy its exact farm layout or character
Composition: horizontal 8:5 landscape crop, close slightly elevated view, complete rectangular soil patch centered inside the central 80%, plain continuous grass fills every part of the background
Constraints: fully opaque rectangular image with no transparency or cutout edges; artwork only; no hands, tools, people, mature carrots, card frame, text, UI, logo or watermark; native hard-edged pixel clusters rather than a pixel filter
Avoid: transparent pixels, black voids, neon artifacts, vignette, portrait orientation, painterly brushwork, smooth gradients, photorealism, dense scenery, universal pure-black outlines, retro sepia grading, dithering
```

Processing: center-cropped from 1586×992 to exact 8:5; nearest-neighbor delivery and preview. One earlier alpha-corrupted output was rejected and not retained.

Review: crop state reads immediately, though exposed orange roots may read slightly mature. Runtime approved by the user on 2026-09-18 and retained for the physical-board prototype; not a canonical crop reference.
