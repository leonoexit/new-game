# One Good Day — Art Bible v0.1

**Status:** Working source of truth  
**Scope:** GenImg assets for the vertical mobile prototype  
**Last updated:** 2026-09-18

## 1. Visual north star

One Good Day is a small, warm, slightly worn rural world. It should feel cozy and personal before it feels spectacular.

The target is an original late-1990s/early-2000s handheld-inspired pixel look:

- cute, readable silhouettes;
- chunky pixel clusters and selective dithering;
- limited, warm palettes;
- simple shapes with a few memorable details;
- gentle imperfection and handmade charm;
- quiet rural atmosphere, never high fantasy spectacle.

This is an original style direction. Do not imitate a named game, artist, or copyrighted character.

## 2. Format and composition

The game is designed for portrait mobile screens.

| Asset type | Working ratio | Use |
|---|---:|---|
| Event scene/card | 4:5 | Main illustrated scene above narrative text |
| Full-screen background | 9:16 | Future map, title, or transition screens |
| Character portrait | 1:1 | Dialogue avatar and relationship UI |
| Item/icon/sprite | 1:1 | Inventory, farm actions, shop UI |

Scene art must be generated vertically from the start. Do not use a wide image as the canonical source and crop it later except for temporary prototypes.

Leave calm negative space near the top and bottom edges for mobile UI overlays. Keep the primary focal object inside the central 60% of the frame.

## 3. Technical art rules

- Generate or reduce scene art to a low-resolution base, currently `240×300` for 4:5 scenes.
- Upscale with nearest-neighbor only; never use a soft resampling filter for the final pixel pass.
- Keep a restrained palette: generally 12–24 dominant colors per scene, with 2–4 value steps per material.
- Use hard-edged clusters rather than airbrushed gradients.
- Use outlines selectively. Important silhouettes may use a dark colored outline; avoid a universal pure-black contour.
- Lighting should be soft and readable: warm sunlight, amber windows, cool shade.
- No text, logos, UI panels, watermarks, speech bubbles, photorealism, or painterly brushwork in generated assets.
- Preserve a clean focal silhouette at `390×844` CSS pixels.

## 4. Palette direction

The palette is warm, muted, and slightly nostalgic.

- **Ink:** deep brown, plum-brown, or blue-green instead of pure black.
- **Earth:** ochre, clay, muted umber.
- **Foliage:** moss, leaf green, sage, deep teal.
- **Sky:** powder blue, lavender-blue, pale peach.
- **Warm light:** cream, honey, soft orange.
- **Accent colors:** one clear accent per character or location, used sparingly.

Avoid neon saturation, metallic gradients, excessive blue shadows, and high-contrast cinematic lighting.

## 5. Character bible

Character identity must survive different poses, scenes, seasons, and expressions. Every canonical character needs a reference sheet before producing event art.

The three characters below are the prototype cast, not the population limit of the world. The art system must support an expanding roster without changing its core visual language.

### Mira

- Role: café owner and first social anchor.
- Feeling: warm, practical, observant.
- Silhouette: compact figure, apron or short work jacket, hair shape clearly visible.
- Accent: honey/amber with a small berry-red detail.
- Props: tea cup, bread basket, café key, handwritten order slip.
- Expression range: welcoming, concerned, amused, quietly tired.

### Rowan

- Role: carpenter and repair/gate anchor.
- Feeling: steady, capable, a little guarded.
- Silhouette: broader shoulders, work clothes, tool or plank silhouette.
- Accent: muted moss green with warm wood brown.
- Props: hammer, measuring string, gate latch, plank bundle.
- Expression range: focused, skeptical, relieved, quietly proud.

### Iris

- Role: forest guide and mystery anchor.
- Feeling: gentle, elusive, attentive to small things.
- Silhouette: lighter, layered clothing, distinctive hood/scarf/hair shape.
- Accent: teal or lilac with a small firefly-yellow detail.
- Props: satchel, pressed leaf, lantern, mushroom or river stone.
- Expression range: curious, playful, distant, sincere.

Canonical references should include front, three-quarter, side, and three expressions. Do not redesign clothing between event cards without a documented costume change.

### Roster scalability

Use three production tiers so a larger cast remains manageable:

1. **Recurring characters** receive a stable character ID, written specification, palette/accent assignment, silhouette test, canonical reference sheet, and expression set before event-scene production.
2. **Supporting characters** receive a compact turnaround, one locked outfit, one signature prop, and two expressions. Promote them to recurring status before giving them a long event chain.
3. **Incidental figures** may appear without a full reference sheet, but must use the shared proportion, outline, palette, and material rules. They cannot carry identity-sensitive continuity between cards until promoted.

Character files and prompts must use stable IDs rather than roster positions. Never encode assumptions such as “the three NPCs” into asset templates, directory structure, palette rules, or UI-facing art. Accent colors may repeat across the wider cast when silhouette, value grouping, and signature props remain distinct.

When adding a character, test their silhouette beside at least three existing characters at mobile portrait size. A new character should feel native to the same world without requiring a unique rendering style or an increasingly saturated accent color.

## 6. Location bible

Locations need one or more anchor objects that remain stable across images.

### Farm / Home

Crooked inherited cottage, old wooden fence, barrel, three small plots, distant rounded hills. The farm should visibly improve through props and cleanliness, not through a sudden style change.

### Mira’s café

Small wooden counter, amber window light, tea and bread, flower box, hand-made shelves. Cozy but modest; it is not a polished restaurant.

### Rowan’s workshop / gate

Squeaky village gate, stacked planks, simple workbench, hanging lantern, vines. Wood and iron should feel tactile and slightly worn.

### Iris’s forest edge

Rounded trees, mossy stones, a small stream, mushrooms, fireflies, and one readable footpath. Magical details stay quiet and local.

## 7. Material language

Use the same visual vocabulary everywhere:

- **Wood:** chunky horizontal grain, softened corners, warm dark edges.
- **Soil:** blocky irregular clusters, 2–3 browns, small green sprouts.
- **Stone:** cool desaturated shapes with one light plane and moss accent.
- **Metal:** minimal highlight, mostly dark gray-brown, never glossy chrome.
- **Cloth:** broad color areas with one fold shadow; avoid detailed fabric texture.
- **Glass/water:** simple blue-green shapes and one or two bright highlights.
- **Leaves:** grouped clusters, not individual botanical detail.

## 8. Prompt system

Every generation uses the following blocks, stored with the asset:

```text
[STYLE CORE]
original cozy kawaii 16-bit handheld pixel art, crisp hard-edged pixel clusters,
limited warm palette, chunky readable silhouettes, selective dithering,
handmade rural charm, original design

[REFERENCE]
canonical character or location reference: <reference id>

[SCENE]
<event-specific action, composition, time of day, focal object>

[FORMAT]
vertical 4:5 mobile composition, focal subject in the central 60%, calm top and
bottom margins, no text, no UI

[NEGATIVE]
photorealistic, painterly, smooth airbrush, cinematic concept art, neon colors,
wide landscape, text, logo, watermark, speech bubble, modern glossy 3D
```

The style core, format, and negative blocks should remain stable for a whole art batch. Only the reference and scene blocks should normally change.

## 9. Generation and approval workflow

1. Create or update the relevant canonical reference sheet.
2. Generate a batch of 8–16 candidates with the same style and format blocks.
3. Select for identity and silhouette consistency before selecting for beauty.
4. Check the candidate at mobile size (`390×844`) and at the intended card crop.
5. Apply the standard low-resolution/palette pass if required.
6. Save the source, processed asset, prompt, model, seed/reference, and art-bible version.
7. Approve the asset only when it passes the checklist below.

### Approval checklist

- Does it read immediately at small mobile size?
- Does the character/location match its canonical reference?
- Is the palette consistent with the bible?
- Are the anchor objects present and recognizable?
- Is the focal point clear behind the UI?
- Does the image avoid text, logos, accidental UI, and unwanted artifacts?
- Does it look like the same world as the previous approved asset?

## 10. Naming and versioning

Use:

```text
<location-or-character>-<asset-purpose>-v<major>.<minor>.<ext>
```

Examples:

```text
farm-event-day01-v0.1.png
mira-portrait-neutral-v0.1.png
iris-forest-edge-v0.1.png
```

Keep source references and generated candidates outside the runtime asset folder. Only approved, processed files go into the game build.

Breaking changes to palette, pixel scale, camera, or character design require a new art-bible version.

## 11. Current prototype status

The first visual-development keyframe now lives in `art/source/keyframes/`, with its processed 4:5 pixel reference in `art/processed/keyframes/` and generation record in `art/prompts/`. It establishes an initial farm mood and processing test, but is not yet a canonical runtime asset.

The v0.1 keyframe validates the cottage, fence, barrel, three-plot composition, warm/cool palette relationship, and intimate rural scale. It also reveals that future generations should begin with less environmental detail and calmer UI-safe margins rather than relying on post-processing to simplify the image.

The next art milestone is a Farm reference sheet plus one recurring-character reference sheet and one shared event scene. That small set must prove location continuity, character identity, and card readability before expanding to the remaining prototype cast or the full Days 1–5 illustration set.
