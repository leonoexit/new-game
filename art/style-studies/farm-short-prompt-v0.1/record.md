# Farm short-prompt study v0.1

**Status:** study  
**Purpose:** Test whether a short prompt preserves the first keyframe's sense of place while avoiding vintage color grading and portrait-format pressure.  
**Generated:** 2026-09-18  
**Tool:** Built-in ImageGen  
**Model/seed:** unavailable

## Prompt

```text
Use case: stylized-concept
Asset: exploratory environment event vignette for One Good Day
Moment: a small farmer returns to their inherited farm on a clear spring morning
Anchors: a crooked modest cottage, exactly three garden plots, and a narrow path home
Visual hypothesis: an original contemporary pixel-art game scene with a strong sense of place, fresh clear colors, and simple readable shapes
Format: horizontal 3:2 composition, readable on a phone
Avoid: vintage or sepia color grading, dense clutter, text, UI, logos, and watermarks
```

## Output

- `farm-short-prompt-v0.1.png` (`1536×1024`).
- No references supplied.
- No post-processing applied.

## Review

### Keep

- Fresh blue/green color behavior without the earlier brown vintage cast.
- Strong spatial credibility and a clear feeling of returning home.
- Cottage, three plots, and path read immediately.
- Landscape framing fits an event vignette better than the earlier full portrait image.

### Change

- The generator invented a lake, snow mountain, town, dog, bird, flowering tree, and dense ground cover; these compete with the farm.
- Visual density remains much too high despite the short prompt.
- The scene feels expansive and idyllic rather than small, humble, and slightly worn.
- The farmer silhouette again defaults to a familiar hat-and-backpack farming archetype.

## Decision

Do not promote yet. The next targeted test should preserve the color freshness and spatial credibility while limiting the world to cottage, path, three plots, and one farmer. The next prompt should correct only scene scope and density.

