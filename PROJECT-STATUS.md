# Project status

## Active project

Little Valley Cards is the only active direction.

The game is a portrait farm-management game in which cards are persistent physical objects in the world. It no longer uses a hand, draw pile, play limit, action points or fixed row of targets.

Core interaction:

1. Drag a Person card onto a valid work stack.
2. Work occupies that person for visible time.
3. The stack transforms or spawns new cards onto the same board.
4. Move those outputs into the next farm process.

The farm is the board. Its spatial clutter and organization should become a readable history of what the player has built.

## Current validation slice

`prototype/little-valley-cards/` contains one complete physical-board loop:

```text
Farmer + Wild Soil -> Empty Plot
Carrot Seeds on Empty Plot, then Farmer -> Carrot Plot
Farmer + Stone Well -> Water
Water + Carrot Plot -> timed growth
Farmer + Mature Carrots -> Carrots x3
Carrots + Roadside Market -> Coin Purse x3 -> win
```

The build includes:

- a vertically arranged portrait board with freely draggable cards;
- magnetic highlighting for valid targets;
- multi-card sowing stacks;
- timed worker jobs and crop growth;
- spawned Water, Carrots and Coin Purse cards;
- a two-minute dusk clock that starts on the first valid move and pauses while a card is held;
- local save and a clean reset;
- generated pixel artwork on every runtime card.

This is an interaction prototype, not the production economy. On 2026-09-19 the user playtested it, described the gameplay as genuinely fun, and repeatedly looped the farming sequence voluntarily. The physical-card farm loop is therefore validated strongly enough to continue.

## Character direction

Characters are Person cards, not dialogue interfaces or crafting recipes. A structure and its inputs define the work; a person supplies labour and may modify speed, yield or available outcomes.

For example, an Oven makes bread. Any capable person may operate it; Mira might work faster or reveal a special recipe. Optional backstory should be discovered through mechanical reactions to places and objects, not through a mandatory relationship screen.

NPC characters remain outside the current playable slice until the actor-carrying interaction is resolved.

## Constraints learned from discarded approaches

- The five-card hand / play-three structure made days feel abstract and disposable.
- The universal tap-two-cards pair table felt like matching recipes while staring at a static row.

Their obsolete paper prototypes and GDD were removed from the active tree during the 2026-09-19 cleanup.

## Actor Stack v0.2

The prototype now makes the Actor the movable verb for Seeds and Water:

```text
Farmer + Water Bucket -> Farmer [carrying Water]
Farmer [carrying Water] + Carrot Plot -> Farmer + Empty Bucket + Watered Plot
```

An Actor carries one item as a two-card compound stack. Dragging the Person moves both cards; dragging the exposed item away detaches it safely. The Person title and badge communicate what is carried, target validation reads the actor plus item, and busy state applies to both cards.

The validated prototype sequence is now:

```text
Carrot Seeds + Farmer -> Farmer [carrying Seeds]
Farmer [carrying Seeds] + Empty Plot -> Carrot Plot + Farmer [carrying remaining Seeds]
Farmer + Stone Well -> Farmer [carrying Water]
Farmer [carrying Water] + Carrot Plot -> Watered Plot + Farmer
```

Water is consumed by watering. A seed unit is consumed by sowing, while remaining seed stays carried until detached or used. The browser loop, mobile portrait layout and automated smoke tests pass without console errors.

The next design checkpoint is a hands-on feel test of this grammar. Do not add NPCs or broader content until carrying, detaching and actor-led targeting feel natural. Only after that should the board add a second plot and then a second worker.

## Art status

`STYLE.md` and `little-valley-cards-art-bible-v0.1.md` control active art work.

The existing plot, crop, well, market, watering and harvest images plus the 2026-09-19 Farmer, wild soil, seed, carrot and coin-purse images are runtime-approved for this prototype only. They do not establish canonical protagonist, NPC, location or crop identity.

## Long-term goal under evaluation

The proposed full-run objective is to restore an abandoned farm and prepare it to survive its first winter. Short-term goals feed that arc through clearing land, building sustainable production and stocking supplies. This goal is not implemented yet; it should only be expanded after the physical work loop proves enjoyable.

## Source of truth

- `PROJECT-STATUS.md` describes the active direction.
- `prototype/little-valley-cards/README.md` describes the current playable contract.
- `STYLE.md` and `little-valley-cards-art-bible-v0.1.md` control art production.
- `CONTEXT-RESTORE-PROMPT.md` is the handoff prompt for the next session.

Earlier One Good Day prototypes and content were removed from the working tree after the project pivot. Their tracked history remains recoverable from Git commit `ebe2196`.
