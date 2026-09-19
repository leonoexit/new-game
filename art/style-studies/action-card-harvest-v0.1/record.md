# Harvest action card v0.1

Status: **runtime approved**  
Created: 2026-09-18  
Tool: Built-in ImageGen  
Model and seed: unavailable

Purpose: test a third farming verb in the close-action language.

References: the approved farm reference controls rendering. A discarded sow-action study informed the close framing during generation but is no longer part of the active tree.

Source: `source/harvest-action-source-v0.1.png`  
Delivery: `processed/harvest-action-640x400-v0.1.png`  
Review preview: `processed/harvest-action-preview-320x200-v0.1.png`

## Prompt

```text
Use case: stylized-concept
Asset: horizontal 8:5 action-card illustration for a mobile card game
Moment: a compact farmer's hand pulls one ripe carrot from loose dark soil beside a small woven harvest basket
Anchors: hand gripping leafy carrot tops, orange carrot emerging with a few soil crumbs, simple basket holding two carrots
Visual hypothesis: match the close action clarity and low-priority farm background of Image 2 while making Harvest readable before the title
References: Image 1 controls approved bright native-pixel construction, coherent pixel scale, high-key palette, colored outlines, soil and foliage language, and compact cool-teal shadows. Image 2 controls close horizontal action framing and density only; do not copy its exact hand pose or seed.
Composition: horizontal 8:5 landscape crop, close view, hand, emerging carrot and basket fully inside central 80%, background only suggests grass and field
Constraints: fully opaque rectangular image; artwork only; no full character, card frame, text, UI, logo or watermark; native hard-edged pixel clusters rather than a pixel filter
Avoid: portrait orientation, painterly brushwork, smooth gradients, photorealism, dense scenery, universal pure-black outlines, retro sepia grading, dithering
```

Processing: center-cropped from 1586×992 to exact 8:5; nearest-neighbor delivery and preview.

Review: strongest action read in the batch; basket supports the verb without adding UI semantics. Runtime approved by the user on 2026-09-18 and retained for the physical-board prototype; not a canonical action reference.
