# Little Valley Cards — physical board prototype

This replaces the rejected hand/pair prototype. Cards persist as physical objects in a portrait farm world; the player drags a worker onto work sites, stacks resources, waits for visible progress, and moves spawned output onward.

## Run

```sh
cd /Volumes/LeNguyen02SSD/Programming/new-game/prototype/little-valley-cards
python3 -m http.server 8080
```

Open <http://127.0.0.1:8080/>. The state saves locally. **Reset day** starts clean.

## Prototype loop

```text
Farmer + Wild Soil -> Empty Plot
Carrot Seeds + Farmer -> Farmer [carrying Seeds]
Farmer [carrying Seeds] + Empty Plot -> Carrot Plot
Farmer + Stone Well -> Farmer [carrying Water]
Farmer [carrying Water] + Carrot Plot -> timed growth
Farmer + Mature Carrots -> Carrots x3
Carrots + Roadside Market -> Coin Purse x3 -> win
```

Time starts on the first valid move and pauses while a card is held. Compatible targets glow. Work takes time and cards visibly spawn back onto the same persistent board.

Seeds and Water attach to Farmer as a two-card actor stack. Drag Farmer to move the compound stack; drag the exposed carried card away to detach it safely. A completed job consumes Water, while a seed stack stays attached until its amount reaches zero.

## Intentional scope

- One portrait board and one complete farm-production loop.
- No hand, draw pile, action points, dialogue, relationship UI, inventory panel or recipe menu.
- One worker and five starting world objects.
- Every runtime card has generated pixel artwork; frames, progress, labels and targeting remain code-native UI.
- NPC characters remain out of scope until this physical worker loop feels good.

## Verification

```sh
npm test
```

The smoke test covers all active interactions, work timers, growth, card spawning, generated-art paths and the win condition.
