# One Good Day — Art Bible v0.2

**Status:** Working source of truth  
**Scope:** GenImg assets for the mobile prototype  
**Last updated:** 2026-09-18

## 1. Visual north star

One Good Day is a small, warm, slightly worn rural world. It should feel cozy and personal before it feels spectacular.

The approved direction is an original, bright native-pixel look:

- cute, readable silhouettes;
- deliberate hard-edged pixel clusters and colored outlines;
- high-key palettes with compact cool-teal shadows;
- simple shapes with a few memorable details;
- gentle imperfection and handmade charm;
- quiet rural atmosphere, never high fantasy spectacle;
- fresh color without retro, vintage, sepia, or brown-wash grading.

This is an original style direction. Do not imitate a named game, artist, or copyrighted character.

## 2. Format and composition

The game is designed for mobile screens, but illustration ratio and camera are chosen per scene and UI slot.

| Asset type | Working ratio | Use |
|---|---:|---|
| Event scene/card | Variable | Match the emotional moment and actual UI slot |
| Full-screen background | 9:16 | Future map, title, or transition screens |
| Character portrait | 1:1 | Dialogue avatar and relationship UI |
| Item/icon/sprite | 1:1 | Inventory, farm actions, shop UI |

Do not impose a universal portrait crop, top-down view, or fixed camera. Compose around one clear action or relationship and reserve calm space only where the actual UI needs it.

## 3. Technical art rules

- Build scenes as native pixel art at a coherent pixel scale; do not use pixelation to rescue a detailed illustration.
- Upscale with nearest-neighbor only when a delivery size requires enlargement.
- Use roughly three clear value steps per material and reserve extra values for focal elements.
- Use hard-edged clusters rather than airbrushed gradients.
- Use outlines selectively. Important silhouettes may use a dark colored outline; avoid a universal pure-black contour.
- Lighting should be soft and readable: warm sunlight, amber windows, cool shade.
- No text, logos, UI panels, watermarks, speech bubbles, photorealism, or painterly brushwork in generated assets.
- Verify the focal action at the intended phone display size.

## 4. Palette direction

The palette is bright, high-key, fresh, and warm without vintage grading.

- **Ink:** deep brown, plum-brown, or blue-green instead of pure black.
- **Earth:** light ochre, clay, warm brown.
- **Foliage:** light yellow-green in open light, leaf green, compact cool teal in shadow.
- **Sky:** powder blue, lavender-blue, pale peach.
- **Warm light:** cream, honey, soft orange.
- **Accent colors:** one clear accent per character or location, used sparingly.

Avoid muddy midtones, sepia or brown wash, pure-black outlines, metallic gradients, uncontrolled neon saturation, and high-contrast cinematic lighting.

## 5. Character bible

Character identity must survive different poses, scenes, seasons, and expressions. Every canonical character needs a reference sheet before producing event art.

The three characters below are the prototype cast, not the population limit of the world. The art system must support an expanding roster without changing its core visual language.

### Mira

- Role: café owner and first social anchor.
- Feeling: warm, practical, observant.
- Canonical reference: `art/approved/characters/mira-character-reference-v0.1.png`.
- Silhouette: compact adult figure at approximately four heads tall, short rounded dark-chestnut bob with side-swept fringe.
- Outfit: cream rolled-sleeve blouse, honey-amber apron with one front pocket and back bow, dark warm-brown calf-length skirt, plain brown ankle boots.
- Accent: honey/amber with a small three-berry red hair accessory preserved as shown in the canonical sheet.
- Face: restrained dark-brown eyes and the round facial construction approved in the canonical sheet.
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

When adding a character, test their silhouette beside at least three existing characters at mobile display size. A new character should feel native to the same world without requiring a unique rendering style or an increasingly saturated accent color.

## 6. Location bible

Locations need one or more anchor objects that remain stable across images.

### Farm / Home

Crooked inherited cottage, old wooden fence, barrel, three small plots, distant rounded hills. The farm should visibly improve through props and cleanliness, not through a sudden style change.

### Mira’s café

Small wooden counter, amber window light, tea and bread, flower box, hand-made shelves. Cozy but modest; it is not a polished restaurant.

### Rowan’s workshop / gate

Squeaky village gate, stacked planks, simple workbench, hanging lantern, vines. Wood and iron should feel tactile and slightly worn.

### Iris’s forest edge

Canonical reference: `art/approved/locations/iris-forest-edge-location-reference-v0.1.png`.

Rounded grouped trees, a readable narrow footpath, a small blue-green stream crossed by mossy stepping stones, cool desaturated bank stones, sparse red mushrooms, and restrained firefly-yellow lights. Magical details stay quiet and local. Camera, crop, season, weather, and time of day remain scene-specific.

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
original bright native pixel art, deliberate hard-edged pixel clusters,
colored outlines, high-key fresh palette, compact cool-teal shadows,
roughly three clear values per material, readable silhouettes, original design

[REFERENCE]
canonical character or location reference: <reference id>

[SCENE]
<event-specific action, composition, time of day, focal object>

[FORMAT]
aspect ratio and camera chosen for the emotional moment and actual UI slot,
one focal action or relationship, no text, no UI

[NEGATIVE]
photorealistic, painterly, smooth airbrush, pixel filter over detailed illustration,
retro grading, sepia, brown wash, text, logo, watermark, speech bubble, glossy 3D
```

The style core, format, and negative blocks should remain stable for a whole art batch. Only the reference and scene blocks should normally change.

## 9. Generation and approval workflow

1. Create or update the relevant canonical reference sheet.
2. Generate a batch of 8–16 candidates with the same style and format blocks.
3. Select for identity and silhouette consistency before selecting for beauty.
4. Check the candidate at its intended mobile display size and card crop.
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

The approved environment visual reference is `art/approved/style-references/farm-high-key-style-reference-v0.1.png`. It controls high-key color behavior, compact cool-teal shadows, colored outlines, broad value grouping, and native-pixel treatment.

The approved close-interaction reference is `art/approved/style-references/mira-tea-interaction-style-reference-v0.1.png`. It validates the same language at character distance and establishes restrained facial rendering, approximately four-head character proportions, a clear hand-to-prop focal action, and reduced background priority as the current working baseline.

Mira's canonical identity reference is `art/approved/characters/mira-character-reference-v0.1.png`. Use it directly for identity-sensitive generations and preserve the approved silhouette, outfit, facial construction, accent placement, and expression language.

The canonical `iris-forest-edge` location reference is `art/approved/locations/iris-forest-edge-location-reference-v0.1.png`. It proves that the high-key direction remains coherent in a shaded wet environment and controls the location's path, stream crossing, rounded tree grouping, material balance, and restrained magical accents.

Neither reference locks camera, aspect ratio, protagonist design, or scene inventory. The protagonist appearance in the tea image is incidental and must not be treated as canonical.

The earlier v0.1 keyframe remains process history. The approved high-key reference supersedes its muted nostalgic palette and fixed portrait assumptions.

The direction-lock milestone is complete: the approved set now covers an environment overview, a close emotional interaction, one canonical recurring-character sheet, and a second environment state.

The first approved event-card illustration reference is `art/approved/event-cards/mira-festival-repairs-v0.1.png`, produced for the provisional `320x200` logical slot documented in `art/runtime-slots/event-card-illustration-v0.1.md`. A minimal test screen exists at `prototype/event-card/index.html`. The asset and slot remain below `runtime approved` until the user completes visual testing in the target presentation.
