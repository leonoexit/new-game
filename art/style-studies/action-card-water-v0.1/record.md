# Water action card v0.1

Status: **runtime approved**  
Created: 2026-09-18  
Tool: Built-in ImageGen  
Model and seed: unavailable

Purpose: test the existing action composition on a second verb.

References: the approved farm reference controls rendering. A discarded sow-action study informed the close framing during generation but is no longer part of the active tree.

Source: `source/water-action-source-v0.1.png`  
Delivery: `processed/water-action-640x400-v0.1.png`  
Review preview: `processed/water-action-preview-320x200-v0.1.png`

## Prompt

```text
Use case: stylized-concept
Asset: horizontal 8:5 action-card illustration for a mobile card game
Moment: a compact farmer's hand tips a small blue metal watering can so one clear stream lands on two young carrot sprouts
Anchors: hand and sleeve, blue watering-can spout, sparkling water stream hitting dark soil
Visual hypothesis: match the close action clarity and low-priority farm background of Image 2 while giving Water its own unmistakable verb silhouette
References: Image 1 controls approved bright native-pixel construction, coherent pixel scale, high-key palette, colored outlines, water and foliage language, and compact cool-teal shadows. Image 2 controls close horizontal action framing and density only; do not copy its exact hand pose or seed.
Composition: horizontal 8:5 landscape crop, close view, can spout, water stream and two sprouts fully inside central 80%, background only suggests grass and fence
Constraints: fully opaque rectangular image; artwork only; no card frame, text, UI, logo or watermark; native hard-edged pixel clusters rather than a pixel filter
Avoid: portrait orientation, full character, painterly brushwork, smooth gradients, photorealism, dense scenery, universal pure-black outlines, retro sepia grading, dithering
```

Processing: center-cropped from 1586×992 to exact 8:5; nearest-neighbor delivery and preview.

Review: verb and target are immediate at phone size. Runtime approved by the user on 2026-09-18 and retained for the physical-board prototype; not a canonical action reference.
