# Little Valley Cards — physical board prototype

This replaces the rejected hand/pair prototype. Cards persist as physical objects in a portrait farm world; the player drags one worker between two plots, carries resources, watches crops grow, and moves spawned output onward.

## Run

```sh
cd /Volumes/LeNguyen02SSD/Programming/new-game/prototype/little-valley-cards
python3 -m http.server 8080
```

Open <http://127.0.0.1:8080/>. The state saves locally. **Reset day** starts clean.

## Prototype loop

```text
Farmer + Wild Soil ×2 -> Empty Plot ×2
Farmer + Carrot Seeds -> Farmer [carrying Seeds]
Farmer [carrying Seeds] + Empty Plot -> Carrot Plot
Farmer + Stone Well -> Farmer [carrying Water]
Farmer [carrying Water] + Carrot Plot -> timed growth
Farmer + Mature Carrots -> Carrots x3
Carrots + Roadside Market -> Coin Purse x6 -> win
```

Time starts on the first valid move and pauses while a card is held. Compatible targets glow. Active work resolves immediately on a valid drop; only crop growth and the day clock take time.

## Interaction v0.3

Tap and drag are parallel inputs for the same source-to-target rules:

- tap an actionable card to select it, then tap a glowing target;
- tap the selected card again or tap the board background to cancel;
- drag the same source directly onto the same target as a faster physical shortcut;
- selecting or holding a card pauses the day clock;
- keyboard Enter/Space follows the same selection path.

Selection is transient UI state and is never saved. It does not introduce a pair-recipe layer: the engine still resolves the same physical source, carried item and world target.

The Actor is always the active verb: drag Farmer onto loose Seeds or Water to pick them up. Farmer may carry an item before it has an immediate destination, and the Well remains usable whenever Farmer is free; the engine does not gate these actions to enforce a recipe order. Water drawn from the Well attaches automatically when that job completes. Drag Farmer to move the compound stack; drag the exposed carried card away only when you deliberately want to detach it. A completed job consumes Water, while a seed stack stays attached until its amount reaches zero.

Hints describe world state rather than prescribing the next card combination. Target glow communicates what is physically possible, not which move is optimal.

There are two plots but only one Farmer. The second plot intentionally introduces labour-order decisions without adding another crop, worker or economy system.

## Intentional scope

- One portrait board and one complete farm-production loop.
- No hand, draw pile, action points, dialogue, relationship UI, inventory panel or recipe menu.
- One worker and six starting world objects, including two workable plots.
- Every runtime card has generated pixel artwork; frames, crop progress, labels and targeting remain code-native UI.
- NPC characters remain out of scope until this physical worker loop feels good.

## Verification

```sh
npm test
```

The smoke test covers all active interactions, work timers, growth, card spawning, generated-art paths and the win condition.
