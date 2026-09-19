# Rainy Home Farm table background v0.1

- Purpose: test whether weather-driven table art makes the Farm feel like a changing place while preserving card readability
- Status: runtime approved
- Generation date: 2026-09-19
- Tool/model: built-in `image_gen`; model metadata unavailable
- Edit target: `prototype/little-valley-cards/assets/home-farm-background.png`
- Style reference: `art/approved/style-references/farm-high-key-style-reference-v0.1.png`
- Source: `source/home-farm-rain-background-source-v0.1.png`
- Delivery candidate: `processed/home-farm-rain-background-1024-v0.1.png`
- Review preview: `processed/home-farm-rain-background-preview-320-v0.1.png`
- Runtime: `prototype/little-valley-cards/assets/home-farm-rain-background.png`
- Transformation: nearest-neighbor resize from 1254x1254 to 1024x1024 and 320x320

## Final prompt

```text
Use case: lighting-weather
Asset type: square full-bleed rainy Home Farm table background for Little Valley Cards
Primary request: edit Image 1 into the same farm grass pattern during a gentle spring rain; preserve its exact abstract top-down composition, spacing, object positions, low information density, native pixel scale, and quiet card-readable surface
Input images: Image 1 is the edit target and composition invariant; Image 2 is style reference only for native-pixel clusters, colored edges, compact cool-teal shadows, and fresh rural color behavior
Scene/backdrop: the same pale grass surface now rain-darkened, with restrained cool blue-green cast, tiny wet highlights on stones and leaves, a few shallow irregular puddle clusters in existing calm spaces, slightly muted flowers, and sparse short diagonal rain marks
Composition/framing: square, tile-like, full bleed, no focal object, no horizon, even visual weight, calm center and ample negative space for movable cards
Style/medium: original native pixel art with deliberate hard-edged clusters and roughly three values per material; retain the source's pixel construction
Lighting/mood: soft overcast daylight, fresh and comforting rather than gloomy or stormy
Constraints: change weather and wetness only; keep all existing motifs in place; fully opaque; background must stay lower contrast than card art; no text, UI, card borders, characters, buildings, crop plots, tools, lightning, heavy storm, fog, or watermark
Avoid: smooth gradients, painterly rendering, photorealism, dense rain, dominant puddles, dark muddy brown wash, universal black outlines, blur, resized pixel-filter look
```

## Review

- Weather reads immediately at 320x320 through rain marks, puddles and cool wet palette.
- The surface remains quiet enough for cream card frames and preserves native-pixel clusters.
- The edit changes some motif positions rather than preserving the sunny bitmap pixel-for-pixel; acceptable for a weather candidate, but not yet approved as runtime continuity.
- Keep: gentle rainfall, wet stone highlights, restrained puddles, fresh rather than stormy mood.
- Verify in the live portrait table before approval: crop cards must remain dominant and the overall screen must not become too dark.

Approval: explicitly approved by the user on 2026-09-19. Runtime integration uses this asset for rainy Home Farm days.
