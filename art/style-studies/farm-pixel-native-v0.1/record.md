# Farm pixel-native study v0.1

**Status:** study  
**Purpose:** Test a pixel-native game-space construction instead of a high-resolution illustration rendered through a pixel filter.  
**Generated:** 2026-09-18  
**Tool:** Built-in ImageGen  
**Model/seed:** unavailable

## Prompt

```text
Use case: stylized-concept
Asset: native low-resolution pixel game environment study, not an illustration
Moment: one small farmer walks along a short dirt path toward their inherited cottage
Anchors: one crooked modest cottage, exactly three garden plots, one short path
Visual hypothesis: designed directly on a 384x256 logical pixel canvas with a fixed three-quarter top-down game camera, modular 16-pixel tile proportions, a 32-pixel-tall player sprite, deliberate hard-edged pixel clusters, and flat two-or-three-tone shading
Format: horizontal 3:2, simple playable-space composition
Avoid: anime illustration, high-resolution painting with a pixel filter, panoramic scenery, mountains, lake, town, animals, flower fields, atmospheric perspective, gradients, text, UI, logos, watermarks
```

## Outputs

- Source study: `farm-pixel-native-v0.1.png` (`1536×1024`).
- Phone review preview: `preview-390.png` (`390×260`, nearest-neighbor review resize only).
- No reference inputs.
- No artistic post-processing applied to the source.

## Review

### Keep

- Camera, player, cottage, plots, vegetation, and props now share one spatial and pixel-scale system.
- Pixel clusters determine the shapes instead of decorating a high-resolution illustration.
- The scene remains legible at `390×260`.
- Fresh greens and roof red avoid the earlier vintage brown cast.
- Cottage, path, and exactly three plots form an immediate hierarchy.

### Change

- The result resembles a familiar generic farming-simulation map too closely and does not yet own a One Good Day identity.
- The straw-hat farmer remains a default genre archetype.
- The generator added a well, multiple barrels/crates, many trees, rocks, stumps, and extensive fencing; density is improved but still not minimal.
- This reads as a playable map view rather than an emotional event vignette. We still need to decide whether that is a feature or a mismatch for the card-based game.

## Decision

The pixel-native hypothesis succeeds technically and eliminates the pixelated-anime failure. Do not promote the visual language yet. The next useful test should retain this pixel grammar while changing only the presentation from map overview to a closer character event moment, or establish a distinctly original shape language before further scene production.

