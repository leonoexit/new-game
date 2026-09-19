---
name: little-valley-cards-art
description: Explore, generate, edit, and review raster artwork for Little Valley Cards while preserving its approved native-pixel language, horizontal card-art contracts, mobile readability, and asset records. Use for action illustrations, crop/plot art, NPC portraits, items, and style studies; do not use for card frames, UI layout, icons better authored in code/vector, or non-art implementation.
---

# Little Valley Cards Art

Create a coherent library of readable card artwork, not decorative images that happen to sit inside cards. The action must read at phone size before detail or beauty.

## Read project context

Before art work, read:

- `STYLE.md`;
- `little-valley-cards-art-bible-v0.1.md`;
- the relevant records under `art/`;
- `references/prompt-system.md` when generating or editing;
- `references/asset-records.md` when saving, naming, approving or superseding an asset.

The active rendering reference is `art/approved/style-references/farm-high-key-style-reference-v0.1.png`. It controls pixel construction, color behavior, edge treatment and material language. It does not import characters or narrative from the previous project.

## Operating modes

### Explore

Use while action composition, crop presentation or NPC identity is unresolved.

- Generate one study at a time unless the user requests a comparison.
- Change one visual variable per comparison.
- Start from one verb, one target and two or three visual anchors.
- Save outside `approved/`.
- Stop for user review before expanding a batch.

### Direction lock

Use when one study is promising enough to reproduce.

- Identify observable properties: crop, camera, focal hierarchy, pixel scale, color behavior and density.
- Test the direction on one second action before declaring it stable.
- Record both successful properties and prohibited drift.
- Require explicit user approval before changing canonical direction.

### Production

Use only after the relevant direction or identity is approved.

- Treat approved references as invariants.
- Review at the actual logical display size.
- Save source, delivery asset, prompt, references, tool/model, date and review status.
- Only `runtime approved` art may be referenced by the playable build.

## Slot contracts

- Action-card artwork: horizontal `8:5`, delivery `640x400`, logical display `320x200`.
- Plot/crop artwork: horizontal `8:5` unless an implemented measured slot supersedes it.
- NPC portraits: square `1:1`.
- Small item artwork: square `1:1`.

Never infer artwork orientation from the phone or card orientation. The card may be portrait while its illustration window remains landscape.

## Project invariants

- Native pixel construction with deliberate hard-edged clusters; never pixel-filtered painterly art.
- High-key fresh palette, colored outlines and compact cool-teal shadows.
- Roughly three clear values per material.
- One immediate action and one readable focal target per action illustration.
- Card frames, titles, costs, buttons, progress and targeting feedback are rendered by UI.
- No generated text, logos, card borders, speech bubbles or interface controls.
- No imitation of named games, artists, copyrighted characters or proprietary assets.
- Reuse artwork across states when UI overlays can communicate the difference.

## Review gate

Judge every candidate on:

1. **Verb:** Is the action immediate without reading the card title?
2. **Target:** Is it clear what the action affects?
3. **Phone readability:** Does it work at `320x200` or the intended portrait slot?
4. **Density:** Is every visible object helping the verb, target or world identity?
5. **Continuity:** Does it match approved pixel scale, materials and color behavior?
6. **Originality:** Does it feel native to Little Valley Cards?
7. **Production fit:** Can this treatment repeat across the whole action library?

Label every output `study`, `candidate`, `approved reference`, `runtime approved` or `superseded`. Beauty alone is not approval.
