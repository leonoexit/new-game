# Roadside market world card v0.1

Status: **runtime approved**  
Created: 2026-09-18  
Tool: Built-in ImageGen  
Model and seed: unavailable

Purpose: make selling feel like combining cards with a physical place rather than opening a shop screen.

References: the approved farm reference controls rendering; the well generation controlled single-location focus.

Source: `source/market-source-v0.1.png`  
Delivery: `processed/market-640x400-v0.1.png`  
Review preview: `processed/market-preview-320x200-v0.1.png`

## Prompt

```text
Use case: stylized-concept
Asset: horizontal 8:5 world-card illustration for a mobile card game
Moment: a tiny unattended roadside produce stall waits for the farmer to trade
Anchors: warm wooden counter, simple cream-and-coral cloth awning, one empty basket and a small brass weighing scale
Visual hypothesis: the market is a physical place-card, not a shop screen, and should invite the player to combine it with a produce card
References: Image 1 controls approved native-pixel construction, coherent pixel scale, high-key fresh palette, colored outlines, chunky wood, yellow-green grass and compact cool-teal shadows. Image 2 controls the clear single-location focus and card-sized world framing, not its well subject.
Composition: horizontal 8:5 landscape crop, medium-close slightly elevated view, complete stall centered inside the central 80%, a narrow country path and plain continuous grass behind
Constraints: fully opaque rectangular image; artwork only; no people, readable signs, letters, prices, card frame, text, UI, icons, logo or watermark; native hard-edged pixel clusters rather than a pixel filter
Avoid: transparent pixels, black voids, portrait orientation, painterly brushwork, smooth gradients, photorealism, dense scenery, universal pure-black outlines, retro sepia grading, dithering
```

Processing: center-cropped from 1586×992 to exact 8:5; nearest-neighbor delivery and preview.

Review: immediately reads as trade and leaves UI responsibility to the card frame. Runtime approved by the user on 2026-09-18 and retained for the physical-board prototype; not a canonical location reference.
