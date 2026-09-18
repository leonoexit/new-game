# Farm morning keyframe v0.1

**Purpose:** First visual proof for the world, farm anchors, mobile composition, and pixel-processing pipeline.  
**Status:** Visual-development reference; not a final runtime asset.  
**Generated:** 2026-09-18  
**Tool:** Built-in ImageGen  
**Art bible:** v0.1

## Prompt

```text
Use case: stylized-concept
Asset type: canonical visual-development keyframe for a portrait mobile narrative farming game event card
Primary request: establish the visual north star for One Good Day, a small warm slightly worn rural world that feels personal, inhabited, and worth returning to
Scene/backdrop: early morning at an inherited farm; a crooked modest wooden cottage, old uneven fence, weathered barrel, exactly three small cultivated plots, a narrow footpath leading toward distant rounded hills; tiny signs of daily life and gentle imperfection
Subject: one small gender-neutral player figure seen mostly from behind, standing at the edge of the three plots and looking toward the cottage; simple readable silhouette, no locked facial identity; the environment is the true subject
Style/medium: original cozy kawaii late-1990s/early-2000s handheld-inspired 16-bit pixel art; crisp hard-edged pixel clusters; chunky readable silhouettes; selective dithering; limited warm palette; visibly low-resolution pixel construction, not a smooth illustration with a pixel filter
Composition/framing: vertical 4:5 mobile composition; quiet eye-level three-quarter view; focal farm elements inside the central 60%; calm negative space near top and bottom for interface overlays; clear visual hierarchy and readable at small phone size; no frame or interface shown
Lighting/mood: soft honey morning light, cool sage shadows, hopeful but lightly melancholic, humble rather than spectacular
Color palette: deep plum-brown and blue-green ink colors, ochre and clay earth, moss/sage foliage, powder blue sky, pale peach and cream light; roughly 12–24 dominant colors; one restrained berry-red accent
Materials/textures: chunky horizontal wood grain, blocky irregular soil clusters, grouped leaf masses, minimal highlights, 2–4 value steps per material
Constraints: exactly three plots; preserve strong silhouettes; original design; reusable visual language suitable for a world that can later contain many recurring characters and locations; no named-game imitation; no character close-up; no text; no lettering; no logo; no UI; no card border; no speech bubble; no watermark
Avoid: photorealism, painterly rendering, smooth airbrush gradients, glossy 3D, cinematic concept art, neon colors, extreme dramatic lighting, wide landscape framing, dense clutter, excessive botanical detail, modern machinery, accidental signs or glyphs
```

## Outputs

- Source generation: `art/source/keyframes/farm-morning-keyframe-v0.1.png` (`1122×1402`, RGBA).
- Processed reference: `art/processed/keyframes/farm-morning-keyframe-pixel-v0.1.png` (`960×1200`, 24 colors).
- Processing: crop to exact 4:5, flatten generated alpha against sky blue, nearest-neighbor reduction to `240×300`, 24-color palette reduction, nearest-neighbor upscale to `960×1200`.

## Review

### Keep

- The cottage, fence, barrel, path, and three plots create a readable farm identity.
- The scale feels intimate and inhabited rather than grand.
- The warm/cool balance and worn materials support the intended emotional tone.
- The distant path implies a larger world without requiring a map.

### Change before canonical approval

- Reduce environmental detail at generation time rather than depending on palette reduction.
- Make the top and bottom margins calmer for real card UI.
- Avoid locking the player avatar to the straw-hat silhouette until the protagonist policy is decided.
- Test a scene with a recurring character to validate face and costume continuity.

