# Mira character sheet v0.1

**Status:** approved reference  
**Purpose:** Test Mira's approved identity seeds across front, three-quarter, side, and three expressions before creating a canonical character reference.  
**Generated:** 2026-09-18  
**Tool:** Built-in ImageGen  
**Model/seed:** unavailable

## Reference inputs

- `art/approved/style-references/farm-high-key-style-reference-v0.1.png`
  - Role: approved reference for palette, outline, value grouping, and native-pixel treatment.
- `art/approved/style-references/mira-tea-interaction-style-reference-v0.1.png`
  - Role: approved identity and close-character reference for Mira.

The rejected chibi and earlier Mira tea studies were inspected only to identify prohibited drift; they were not supplied to the generator.

## Prompt

The complete generation prompt is stored in `prompt.md` beside this record.

## Outputs

- Source candidate: `mira-character-sheet-v0.1.png` (`1536x1024`).
- Phone review preview: `preview-390.png` (`390x260`).
- Approved character reference: `art/approved/characters/mira-character-reference-v0.1.png` (`1536x1024`).
- Source generation retained by the built-in tool under its generated-images directory.

## Transformations

- No artistic post-processing was applied to the source candidate.
- The phone preview is a nearest-neighbor resize used only for readability review.

## Review

### Keep

- Front, three-quarter, and strict side silhouettes are clean and easy to compare.
- Chestnut bob, honey apron, berry-red detail, cream blouse, brown skirt, and boots remain consistent across the full-body views.
- Concerned, amused, and quietly tired expressions are distinct through brows, eyelids, mouth, and posture.
- Approximate four-head proportions and broad cloth shapes remain readable at phone-review size.
- The empty cream ground keeps attention entirely on identity and expression.

### Accepted limitations and future validation

- The portraits use a rounder facial construction than the approved tea interaction; the user explicitly accepted this sheet as canonical.
- The berry accessory remains visible in the side view even though strict physical-side logic is ambiguous; the user explicitly accepted the sheet as drawn. Future images should preserve the recognizable berry placement unless a corrected turnaround is approved as a new version.
- The full sheet at `390x260` is suitable for overview, but individual portrait crops will be needed when validating dialogue-avatar size.
- Consistency in active poses and back view remains untested.

## Decision

Approved by the user on 2026-09-18 as Mira's canonical character reference v0.1. Use it as the identity invariant for continuity-sensitive Mira art. This is not a runtime-approved event asset.
