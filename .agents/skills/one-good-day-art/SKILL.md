---
name: one-good-day-art
description: Explore, generate, edit, and review raster art for One Good Day while preserving its evolving visual identity, character continuity, mobile readability, and asset records. Use for the game's keyframes, event illustrations, portraits, locations, crops, animals, items, and visual style studies; do not use for UI layout or non-art game implementation.
---

# One Good Day Art

Create a coherent world, not merely attractive individual images. The project is still discovering its visual language, so distinguish exploration from production and never promote a style to canonical status without user approval.

## Read project context

Before art work, read the current `art-bible-*.md`, `STYLE.md`, and the relevant records under `art/prompts/`. For identity-sensitive work, also inspect every available reference for the character or location.

Read [references/prompt-system.md](references/prompt-system.md) when generating or editing an image. Read [references/asset-records.md](references/asset-records.md) when saving, naming, approving, or superseding an asset.

## Choose the operating mode

### Explore

Use when style, composition, palette, camera, or rendering language is unresolved.

- Change one visual variable per comparison.
- Hold the scene, action, characters, and aspect ratio constant across a comparison.
- Start with a short prompt and only two or three identity anchors.
- Do not equate the device ratio with the illustration ratio. Select the crop for the scene and intended UI slot.
- Do not use palette reduction, dithering, or pixelation to rescue an image whose composition is already too detailed.
- Save studies separately from canonical references.
- Stop after the requested comparison. Do not expand the batch until the user identifies what is worth pursuing.

### Direction lock

Use when a promising result needs to become reproducible.

- Identify the few observable properties responsible for the result: shape language, density, camera, color behavior, edge treatment, lighting, and character proportions.
- Test the direction on one character moment and one environment moment before declaring it stable.
- Record both successful properties and prohibited drift.
- Ask for explicit approval before changing the art bible's canonical direction.

### Production

Use only after the relevant style and identity references are approved.

- Treat approved references as invariants.
- Generate named characters from their canonical reference inputs; a textual resemblance alone is insufficient for continuity-sensitive scenes.
- Preserve costume, silhouette, proportions, accent placement, location anchors, and visual density unless the event explicitly changes them.
- Review at the intended phone display size, not only at source resolution.
- Save the source, delivery asset, prompt, input references, tool/model, date, and review status.

## Project invariants

- Art must support emotional attachment and readable choices; decoration is secondary.
- Prefer one action, one focal relationship, and a few meaningful props over a complete scenic inventory.
- Camera and composition are chosen for each scene's emotional and interface needs; they are not global style invariants unless the user explicitly locks them later.
- Keep color fresh and warm without a sepia, brown-wash, or automatic vintage treatment.
- Pixel art is a candidate language, not a requirement. Do not add `retro`, `nostalgic`, `16-bit`, dithering, or a fixed palette unless the current approved direction calls for it.
- Do not imitate a named game, living artist, copyrighted character, or proprietary asset. Translate references into observable properties and preserve an original identity.
- The prototype cast is not the world limit. Use stable character and location IDs; never structure prompts or folders around an assumed total number of NPCs.
- Generated text, logos, speech bubbles, card frames, and interface controls do not belong in illustration assets.

## Review gate

Judge every candidate on:

1. **Feeling:** Does the moment create the intended emotion without relying on UI copy?
2. **Clarity:** Are the action and focal relationship immediate at mobile size?
3. **Density:** Is every visible object helping identity, action, or mood?
4. **Continuity:** Do recurring people and places remain recognizably the same?
5. **Color:** Is the palette intentional and free of unwanted vintage grading?
6. **Originality:** Does it feel native to One Good Day rather than like a named game's derivative?
7. **Production fit:** Can the result be repeated across many characters, locations, weather states, and events?

Label the result `study`, `candidate`, `approved reference`, or `runtime approved`. Beauty alone is not approval.
