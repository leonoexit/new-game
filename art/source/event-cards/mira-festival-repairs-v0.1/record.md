# Mira festival repairs event illustration v0.1

**Status:** approved reference  
**Event ID:** `mira_festival_repairs_01`  
**Purpose:** First production candidate for the provisional event-card illustration slot.  
**Generated:** 2026-09-18  
**Tool:** Built-in ImageGen  
**Model/seed:** unavailable  
**Art bible:** v0.2

## Slot contract

- `art/runtime-slots/event-card-illustration-v0.1.md`
- Working display size: `320x200` logical pixels.
- Delivery size: `640x400` pixels.
- Status of slot: provisional until an implemented UI provides measured dimensions.

## Reference inputs

- `art/approved/style-references/farm-high-key-style-reference-v0.1.png`
  - Role: approved broad visual-language reference.
- `art/approved/style-references/mira-tea-interaction-style-reference-v0.1.png`
  - Role: approved close-interaction and modest café-context reference.
- `art/approved/characters/mira-character-reference-v0.1.png`
  - Role: canonical Mira identity reference.

## Prompt

The complete final prompt is stored in `prompt.md` beside this record.

## Outputs

- Generated source: `mira-festival-repairs-v0.1.png` (`1586x992`).
- Processed delivery candidate: `art/processed/event-cards/mira-festival-repairs-v0.1.png` (`640x400`).
- Approved event-card reference: `art/approved/event-cards/mira-festival-repairs-v0.1.png` (`640x400`).
- Phone-size review: `preview-320.png` (`320x200`).
- Source generation retained by the built-in tool under its generated-images directory.

## Transformations

- Center crop from `1586x992` to `1280x800` using crop origin `+153+96`.
- Nearest-neighbor resize from `1280x800` to the `640x400` delivery size.
- Nearest-neighbor review resize from `640x400` to `320x200`.
- No palette reduction or artistic retouching applied.

## Review

### Passes

- Mira remains recognizable from the canonical sheet: chestnut bob, berry-red accessory, cream blouse, honey apron, brown skirt, compact silhouette, and concerned face are preserved.
- Her face, both hands, loose shutter, and broken hinge remain inside the crop-safe center.
- The event-defining action reads without title or premise at `320x200`.
- Warm café light, high-key exterior color, colored outlines, and compact cool shadows remain consistent with the approved references.
- No text, UI, extra character, or protagonist design is baked into the image.

### Limitations and pending runtime validation

- The event slot is provisional because no UI implementation exists yet.
- The café façade shown here is supporting context, not a canonical location reference.
- A minimal card screen exists at `prototype/event-card/index.html`, but final visual validation of its card frame, title, premise, choices, accessibility text scaling, and device safe areas is delegated to the user as tester.

## Decision

Approved by the user on 2026-09-18 as the first event-card illustration reference and copied to `art/approved/event-cards/`. Do not mark `runtime approved` until the user has tested the card screen and confirms the crop, text hierarchy, controls, and device fit.
