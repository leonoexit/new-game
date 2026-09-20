# Little Valley Cards — Art Bible v0.1

**Status:** Working source of truth  
**Scope:** Card artwork for the mobile gameplay prototype  
**Canonical style reference:** `art/approved/style-references/farm-high-key-style-reference-v0.1.png`

## North star

Little Valley Cards should feel like holding a small, bright rural world in your hand. Cards must communicate an action before decoration. The artwork is original native pixel art with readable silhouettes, hard-edged clusters, colored outlines, high-key color and compact cool-teal shadows.

## Asset contracts

| Asset | Ratio | Delivery | Requirement |
|---|---:|---:|---|
| Action illustration | 8:5 | 640×400 | one verb, one target, immediate readability |
| Plot/crop illustration | 8:5 | 640×400 | crop and state readable behind UI overlays |
| NPC portrait | 1:1 | 512×512 | stable identity and restrained expression |
| Small item art | 1:1 | 256×256 | strong silhouette and minimal internal detail |

The portrait screen and portrait-shaped card do not imply portrait artwork. UI owns the card shape; generated art only fills its measured illustration window.

## Material and color language

- Soil: blocky irregular clusters in two or three warm browns.
- Leaves: grouped masses with light yellow-green in open light and cool teal in shadow.
- Wood: chunky grain, softened corners and warm dark edges.
- Water: simple clear-blue shapes with one or two bright highlights.
- Cloth: broad color areas with one fold shadow.
- Outlines: dark brown, plum-brown or blue-green; avoid universal pure black.

## Action-card composition

- Keep the verb-defining hand, tool, seed or crop inside the central 80%.
- Use a close or medium-close crop.
- Background establishes the farm but remains low priority.
- Do not show card borders, costs, labels, arrows, buttons or status icons.
- Reuse artwork when state can be communicated by UI overlays.

## Workflow

1. Generate one study for one action.
2. Review at `320x200` logical size.
3. Change only one visual variable per iteration.
4. Save the prompt and references with the study.
5. Ask for explicit approval before marking a reference approved.
6. Only approved, processed assets enter runtime.

## Current approval state

The farm reference approves rendering language. The Spring Farming v1 runtime has complete approved prototype families for Carrot, Green Bean, Potato, Cauliflower and Radish. Cauliflower dry/watered/mature, Seed and Produce assets and Radish dry/watered/baby/full, Seed and Produce assets passed review at their logical sizes on 2026-09-19; records live beside their sources and processed deliveries under `art/style-studies/`. Farmer, Tools, soil states, Well, Store, Shipping Bin, Landmarks and Area backgrounds also remain runtime approved. None of these assets define canonical NPC or protagonist identity.
