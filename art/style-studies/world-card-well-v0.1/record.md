# Farm well world card v0.1

Status: **runtime approved**  
Created: 2026-09-18  
Tool: Built-in ImageGen  
Model and seed: unavailable

Purpose: test a reusable location card that can combine with farming actions.

References: the approved farm reference controls rendering; the empty-plot generation controlled density and framing.

Source: `source/well-source-v0.1.png`  
Delivery: `processed/well-640x400-v0.1.png`  
Review preview: `processed/well-preview-320x200-v0.1.png`

## Prompt

```text
Use case: stylized-concept
Asset: horizontal 8:5 world-card illustration for a mobile card game
Moment: a small stone farm well offers clear water beside the field
Anchors: round pale-stone well, simple warm wooden roof and crank, one wooden bucket
Visual hypothesis: a single location should read as a usable world card without any UI or action icon
References: Image 1 controls approved native-pixel construction, coherent pixel scale, high-key fresh palette, colored outlines, chunky wood and stone, yellow-green grass and compact cool-teal shadows. Image 2 controls low density and close card-sized world framing, not its soil subject.
Composition: horizontal 8:5 landscape crop, medium-close slightly elevated view, complete well centered inside the central 80%, plain continuous grass and a faint field edge behind
Constraints: fully opaque rectangular image; artwork only; no people, hands, crops, card frame, text, UI, icons, logo or watermark; native hard-edged pixel clusters rather than a pixel filter
Avoid: transparent pixels, black voids, portrait orientation, painterly brushwork, smooth gradients, photorealism, dense scenery, universal pure-black outlines, retro sepia grading, dithering
```

Processing: center-cropped from 1586×992 to exact 8:5; nearest-neighbor delivery and preview.

Review: excellent location silhouette and readable material grouping. Runtime approved by the user on 2026-09-18 and retained for the physical-board prototype; not a canonical location reference.
