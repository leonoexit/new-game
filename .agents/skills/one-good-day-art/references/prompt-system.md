# Prompt system

Use a restrained prompt builder. More instructions often produce more visual clutter and a more generic compromise.

## Exploration prompt

Include only:

```text
Asset: <event vignette, portrait, location, item, or other use>
Moment: <one concrete action>
Anchors: <two or three identity-critical details>
Visual hypothesis: <the single style or composition idea under test>
Format: <aspect ratio and framing chosen for the UI slot>
Avoid: text, UI, logos, watermarks, and one or two known failure modes
```

Let the generator solve secondary scenery, minor colors, and surface detail. If a result fails because of an invented element, add only that correction on the next iteration.

## Production prompt

Add references and invariants only after the direction is locked:

```text
Asset: <runtime use>
Moment: <one action and emotional beat>
References: <character/location reference IDs and their roles>
Must preserve: <identity and continuity invariants>
Composition: <crop, camera, focal hierarchy, UI-safe needs>
Approved visual language: <short observable description>
Avoid: <project-specific drift plus text/UI/logo/watermark>
```

## Comparison discipline

- Use the same moment and anchors for every style candidate.
- State the exact variable that changes.
- Use one generation call per distinct candidate.
- Do not introduce post-processing during style comparison unless post-processing itself is the tested variable.
- Compare at equal dimensions and in the same UI crop.

## Known project findings

- Lower color count does not automatically reduce information density.
- `16-bit`, heavy dithering, muted earth colors, and ochre/sage emphasis can create an unwanted vintage cast.
- Forcing a full-screen portrait composition can make the generator fill empty space with irrelevant scenery.
- Excessively detailed prompts tend to produce polished but generic cozy-game imagery.
- The first farm keyframe had stronger sense of place than later simplified studies; simplification must preserve world-building and spatial credibility.
- A high-resolution anime/concept-art composition does not become native pixel art through pixel texture, palette reduction, or nearest-neighbor scaling. For pixel-native tests, define the logical canvas, shared subject/environment pixel scale, cluster construction, and discrete shading before adding mood language. Choose camera per scene; do not encode one fixed camera into the style.
