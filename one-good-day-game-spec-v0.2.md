# One Good Day — Game Design Spec v0.2

**Status:** Prototype-ready draft  
**Revision:** Character-first multi-screen UI and AI-assisted card-art pipeline approved  
**Genre:** Cozy narrative farm simulation / choice-card game  
**Platform assumption:** Mobile first, portrait orientation  
**Session length:** 3–8 minutes  
**Prototype run length:** 14 in-game days, approximately 15–25 minutes  
**Working title:** *One Good Day*

---

## 1. Product thesis

*One Good Day* is a farming life simulation played through daily opportunity cards distributed across persistent character threads. Every morning, up to three people or responsibilities ask for the player's time, but the player can commit to only one. The farm, inventory, and relationships persist and react to both the chosen opportunity and the opportunities left behind.

The game borrows the immediate readability of a two-choice card interface, but its depth comes from a persistent simulation. The card deck is not a fixed script: the player's farm layout, crops, relationships, inventory, promises, and earlier decisions determine which cards can appear next.

### One-sentence pitch

> Build a farm—and a life—by deciding which moments deserve your limited time.

### Core design question

> Is choosing one meaningful opportunity while letting two others pass emotionally and strategically compelling across an entire run?

---

## 2. Player fantasy

The player inherits a neglected farm and a modest debt. They cannot do everything. Over a season, they decide what kind of life to build:

- a productive farm that secures financial independence;
- a place of belonging built through relationships;
- a strange, magical homestead connected to the forest;
- or an imperfect mixture with its own consequences.

The intended emotion is not constant optimization. It is **meaningful scarcity of time**: satisfaction from committing to a path, curiosity about missed opportunities, and attachment to consequences that feel personally authored.

---

## 3. Design pillars

### 3.1 One day, one commitment

The primary scarce resource is not energy points; it is the day itself. The player normally selects one opportunity per day. Extra actions must come from earned items, relationships, or upgrades and should feel exceptional.

### 3.2 A simulation beneath the cards

Crops grow, buildings decay, prices change, promises expire, and relationships remember. Cards expose and modify the simulation; they do not replace it with four abstract meters.

### 3.3 Missed opportunities create stories, not constant punishment

Not every unchosen card causes harm. Some expire quietly, some return later, and a minority create explicit consequences. The player should feel trade-offs without feeling attacked for every choice.

### 3.4 The player's state authors the deck

Planting grapes can unlock winemaking events. Befriending the herbalist can introduce remedies and forest events. Neglecting a damaged fence can add animal-loss events. The deck becomes a readable reflection of the life being built.

### 3.5 Short input, long consequence

An individual choice takes seconds to understand. Its impact may appear immediately, several days later, or at the end of the season.

### 3.6 People are the world

The world is navigated through relationships rather than a geographic map. Every discovered character gains a persistent screen containing their current situation, shared memories, promises, and available cards. Visiting a character screen is free; committing to one of their opportunities consumes the day.

---

## 4. Explicit non-goals for the first prototype

The prototype will not include:

- free character movement or a navigable overworld;
- a selectable world map or location-based navigation tabs;
- real-time farming actions;
- combat;
- a crafting tree;
- romance;
- procedural dialogue generation;
- multiplayer;
- multiple seasons;
- live-service systems, daily login rewards, or monetization;
- a collectible deck-building combat system.

These features do not help answer the core design question and therefore remain out of scope.

---

## 5. Core loop

### 5.1 Daily flow

1. **World update**  
   Advance crop growth, weather, deadlines, queued consequences, and market conditions.

2. **Morning overview**  
   Show date, weather, debt progress, notable farm changes, and urgent promises.

3. **Distribute up to three opportunity cards**  
   Draw from the dynamic event pool using eligibility, priority, cooldown, and weighting rules. Assign each card to its relevant character thread or the Home/Farm thread.

4. **Inspect character threads and choose one opportunity**  
   The player can move freely between active character screens to understand the context. Committing to one card consumes the day. The other cards resolve their defined unchosen behavior: expire, defer, return with changed context, or enqueue a consequence.

5. **Resolve the chosen opportunity**  
   Present two clear approaches. The player swipes or taps left/right. If eligible, one inventory item may enable a special third solution.

6. **Apply outcome**  
   Update money, inventory, farm state, NPC state, flags, and future event pool.

7. **Evening summary**  
   Show visible changes and one concise narrative beat. Save automatically and advance to the next day.

### 5.2 Run flow

- **Start:** inherit the farm, receive 50G, three empty plots, and a 300G payment due on Day 14.
- **Middle:** specialize through repeated choices; unlock event chains and manage deadlines.
- **End:** calculate debt payment, farm value, relationship outcomes, and discovered story flags.
- **Replay:** show missed branches and an invitation to try a different life path, without revealing every exact requirement.

---

## 6. Interaction model

### Character-first navigation

The prototype has four horizontally switchable primary screens:

- Home/Farm;
- Mira;
- Rowan;
- Iris.

Character screens unlock when the player meets that character. A character screen represents the relationship thread, not a fixed physical location; its background may change as the character moves through the story.

Each character screen contains:

- a portrait and current mood/state;
- the most recent shared memory;
- active promises and deadlines;
- a short history of major decisions;
- zero or one opportunity card available today.

The player may inspect every unlocked screen without spending the day. Resolving any opportunity card commits the day and advances the entire world.

### Opportunity distribution

At most three opportunity cards are active globally on a normal day. They are distributed across different character threads whenever possible. A subtle marker appears on a thread with new or time-sensitive content; avoid notification styling designed to create anxiety or daily-login pressure.

Each opportunity card shows:

- title;
- character or location;
- urgency marker, if any;
- one-sentence premise;
- optional deadline icon.

The player can inspect all available cards across character screens before committing. Selecting a resolution is final unless an accessibility setting enables confirmation.

### Choice resolution

After selecting an opportunity:

- left and right approaches are previewed with qualitative hints;
- exact numerical effects are hidden by default but can be enabled in settings;
- eligible item solutions appear below the card;
- holding a choice reveals which known commitments or assets it references.

### Why this is not a Reigns clone

The player first chooses **whose thread deserves the day**, then chooses **how to handle the situation**. Outcomes update concrete world objects and future event eligibility, rather than primarily balancing four global bars. The world is experienced as a network of people and responsibilities, not as a menu of locations.

---

## 7. Simulation state

### 7.1 Required prototype state

| State | Prototype representation | Purpose |
|---|---|---|
| Calendar | Day 1–14 | Primary time pressure |
| Weather | Sunny, Rain, Storm | Modifies crops and event eligibility |
| Money | Integer, starts at 50G | Debt and purchases |
| Debt | 300G due Day 14 | Clear run objective |
| Farm | 3×3 plot board | Persistent visible progress |
| Crops | Turnip, tomato, pumpkin | Different growth/value/risk profiles |
| Inventory | Seed, produce, and key item stacks | Enables future choices and third solutions |
| Relationships | Affinity plus memory flags for three NPCs | Narrative continuity |
| World flags | Boolean or enumerated facts | Event chaining and state memory |
| Event queue | Timed future consequences | Delayed outcomes |

### 7.2 Farm board

The farm is a 3×3 board presented as a visual state screen, not a movement space.

Each plot can be:

- empty;
- prepared;
- planted with crop and growth stage;
- ready to harvest;
- damaged;
- occupied by a small structure in later versions.

Planting, tending, harvesting, and repairing happen through opportunity cards. The board makes accumulated choices visible and supplies conditions to the event system.

### 7.3 NPC prototype roster

1. **Mira — café owner**  
   Theme: community versus productivity. Can create reliable produce contracts.

2. **Rowan — carpenter**  
   Theme: maintenance versus expansion. Can repair damage or unlock farm upgrades.

3. **Iris — herbalist**  
   Theme: safety versus curiosity. Introduces remedies and the forest mystery chain.

Each NPC stores:

- affinity score;
- last meaningful interaction;
- promises made and deadlines;
- two to four memory flags;
- current event-chain stage.
- whether their character screen is unlocked;
- their current portrait state and background context.

Affinity alone must never determine all dialogue. Memory flags are required so characters can reference specific player behavior.

---

## 8. Dynamic event deck

### 8.1 Event sources

At the start of each day, eligible events are assembled from:

- **base events:** always available under broad conditions;
- **farm events:** generated by crops, empty plots, damage, or harvests;
- **relationship events:** unlocked by affinity and memory flags;
- **promise events:** tied to explicit commitments and deadlines;
- **economy events:** affected by money, inventory, and market state;
- **mystery events:** unlocked through the forest chain;
- **queued consequences:** scheduled by earlier choices;
- **finale events:** enabled near Day 14.

### 8.2 Draw rules

For each morning:

1. Resolve mandatory queued events.
2. Build the eligible pool.
3. Exclude events on cooldown or already completed when non-repeatable.
4. Reserve at most one slot for an urgent or promise event.
5. Prefer three cards from different categories.
6. Apply weights and draw without replacement.
7. If fewer than three events are eligible, fill from safe repeatable base events.

### 8.3 Unchosen behavior

Every event defines one of four behaviors:

- **Expire:** disappears without punishment.
- **Defer:** can reappear after a cooldown.
- **Escalate:** returns later in a changed form.
- **Consequence:** immediately enqueues a future event or state change.

Prototype target distribution:

- 40% expire;
- 30% defer;
- 20% escalate;
- 10% consequence.

This distribution prevents the system from treating every missed opportunity as failure.

---

## 9. Event specification

Every event card requires the following fields:

```yaml
id: mira_festival_repairs_01
title: Before the Festival
category: relationship
character: mira
premise: Mira asks for help repairing the café before tonight's festival.
eligibility:
  day_range: [5, 10]
  required_flags: [met_mira]
  forbidden_flags: [cafe_repaired]
priority: normal
weight: 1.0
cooldown_days: 0
unchosen:
  behavior: consequence
  effects:
    - set_flag: mira_felt_ignored
choices:
  left:
    label: Help Mira
    hint: The harvest must wait.
    effects:
      - affinity: { mira: 2 }
      - set_flag: cafe_repaired
      - damage_ready_crops: 1
      - enqueue: mira_festival_evening
  right:
    label: Stay and harvest
    hint: Secure today's income.
    effects:
      - harvest_ready_crops: all
      - money_from_harvest: true
      - set_flag: refused_mira_repairs
item_solutions:
  - requires_item: growth_tonic
    label: Finish both jobs
    effects:
      - consume_item: growth_tonic
      - harvest_ready_crops: all
      - affinity: { mira: 2 }
      - set_flag: cafe_repaired
      - enqueue: mira_festival_evening
```

### Writing rules

- The premise must fit in two short sentences.
- Both default choices must be defensible in context.
- Do not disguise a clearly superior choice as a dilemma.
- A delayed consequence must reference the initiating decision when it returns.
- Numerical rewards cannot be the only distinction between choices.
- At least one third of events should transform future eligibility, not merely add or subtract resources.

---

## 10. Prototype content scope

### 10.1 Required content

- 14 playable days;
- 30 authored event templates;
- 3 NPCs;
- 3 crop types;
- 6 inventory/key items;
- 3 weather states;
- 3 event chains of at least three stages;
- 5 delayed-consequence events;
- 3 end states;
- 1 tutorial sequence integrated into Days 1–2.

### 10.2 Event allocation

- 10 farm events;
- 7 relationship events;
- 5 economy/debt events;
- 4 forest mystery events;
- 2 weather events;
- 2 finale events.

Repeatable filler events are allowed but cannot account for more than 20% of events seen in a normal run.

### 10.3 End states

1. **A Farm That Pays** — debt paid primarily through production.
2. **A Place at the Table** — strong community support changes the debt outcome.
3. **The Forest's Bargain** — the mystery path resolves the debt at a meaningful cost.

Failing to pay the debt produces a narrative conclusion and score summary, not an abrupt game-over screen.

---

## 11. Economy and preliminary balance

These numbers are test values, not production commitments.

- Starting money: 50G
- Final debt: 300G
- Turnip: cost 10G, grows in 2 days, sells for 22G
- Tomato: cost 20G, grows in 4 days, sells for 50G
- Pumpkin: cost 35G, grows in 6 days, sells for 95G
- Basic repair: 25–50G
- Typical social opportunity cost: one farm action or 20–60G in delayed income

The economy should allow a focused production player to pay the debt with a small buffer. Social and mystery routes should remain viable through alternative rewards, not require the player to secretly farm just as efficiently.

---

## 12. User interface flow

### Required screens

1. Title / continue
2. Morning overview
3. Home/Farm thread
4. Mira character thread
5. Rowan character thread
6. Iris character thread
7. Single-card choice resolution overlay
8. Inventory
9. Character memories / promises detail
10. Evening summary
11. End-of-run summary
12. Settings / accessibility

### Primary navigation

- Home/Farm and unlocked characters form the primary tab strip.
- Switching threads is free and never advances time.
- A thread can contain at most one unresolved opportunity card per day.
- Resolving one card locks the remaining cards and advances to the evening summary.
- Inactive characters remain inspectable but do not offer free repeatable conversation actions.
- The prototype must never show more than four primary tabs.

Future versions with more characters should use four to five active/favorite threads plus a low-priority archive or contacts screen. Do not convert the system into a location map.

### HUD priorities

Always visible during daily decisions:

- current day;
- money and debt target;
- weather;
- number of urgent promises.

Inventory, farm detail, and relationship memories are one tap away. Avoid displaying multiple abstract status bars across the top of the screen.

### Accessibility requirements

- Tap alternatives for all swipe actions.
- Optional choice confirmation.
- Optional exact effect previews.
- No meaning conveyed by color alone.
- Adjustable text size.
- Reduced-motion mode.

---

## 13. Tutorial

The tutorial is embedded in play:

- **Day 1:** use Home/Farm to plant the first crop and explain that resolving a card spends the day.
- **Day 2:** introduce Mira, unlock her character thread, and teach free thread switching before commitment.
- **Day 3:** introduce the first deadline and delayed consequence without additional tutorial text.

The player should make a meaningful, non-scripted decision by the end of Day 2.

---

## 14. Visual direction and AI-assisted art production

### 14.1 Visual thesis

The card-driven, mostly static presentation is intentionally compatible with AI-assisted illustration. Production effort should concentrate on art direction and consistency rather than character animation, environment traversal, or cinematic staging.

AI-generated images are appropriate for:

- event-card illustrations;
- character portraits and expression variants;
- character-thread backgrounds;
- seasonal farm-state illustrations;
- title and ending illustrations during later production.

UI text, buttons, icons, meters, and card frames must be rendered by the game interface rather than baked into generated images.

### 14.2 Prototype art budget

The 14-day prototype targets:

- 3 approved character reference sheets;
- 4–6 expression variants per character;
- 4 key backgrounds: Home/Farm plus one signature context per NPC;
- up to 30 portrait card illustrations, one per event template;
- 3 ending illustrations;
- a single reusable card frame and UI system.

Placeholder art is acceptable until the event writing passes the paper test. Do not generate all 30 final illustrations before validating Days 1–5.

### 14.3 Consistency pipeline

For each named character:

1. Lock a written visual specification: age range, silhouette, face, hair, clothing, palette, signature prop, and prohibited deviations.
2. Approve one canonical front portrait and one full-body reference.
3. Use those references for every later generation or edit.
4. Generate expression and pose variants before producing event scenes.
5. Review every asset for face, costume, body, palette, lighting, and world-style continuity.
6. Store prompt, model/tool version, reference inputs, generation date, and edit notes beside the asset.

The visual style guide must describe observable traits rather than requesting imitation of a living artist. Generated outputs require human review for anatomy, accidental text, duplicated objects, continuity errors, and usage rights under the selected generation provider.

### 14.4 Asset architecture

Use layered presentation where practical:

- generated illustration without text;
- game-rendered card frame;
- game-rendered title, premise, urgency, and choices;
- optional reusable character portrait over a generated or painted background.

This allows copy changes, localization, accessibility settings, and balance updates without regenerating art.

### 14.5 Production constraint

AI reduces illustration cost but does not remove the art bottleneck; it moves the bottleneck to art direction, reference management, selection, correction, and consistency. The prototype should measure whether one reviewed event illustration can be produced in under 20 minutes after character references are locked.

---

## 15. Narrative tone

- Warm, observant, and lightly melancholic.
- Characters have needs independent of the player.
- Missed events should feel like life continuing, not content being withheld as punishment.
- Humor comes from specific rural situations and character behavior, not memes.
- Magic begins ambiguous and becomes explicit only through sustained player interest.

The game should never tell the player that one lifestyle is morally correct.

---

## 16. Prototype success criteria

Test with at least five target players who did not design the game.

The prototype passes its first validation gate if:

- at least 4/5 players finish the 14-day run;
- at least 3/5 voluntarily begin a second run or explicitly ask to replay;
- at least 4/5 can recall one delayed consequence and its originating choice;
- at least 3/5 describe an unchosen opportunity as a meaningful sacrifice;
- at least 4/5 understand that switching character threads is free but resolving a card spends the day;
- at least 3/5 describe a character screen as a persistent relationship rather than a location menu;
- no major binary choice has the same answer selected by more than 80% of testers;
- median session time is 15–25 minutes;
- fewer than 20% of daily selections are reported as confusing rather than difficult.

### Failure interpretations

- **Players choose by reward preview only:** strengthen narrative and future-state consequences.
- **Players feel punished for missed cards:** reduce escalation/consequence rate.
- **Players do not care about the farm:** improve visual state change and farm-generated events.
- **Players do not replay:** increase early path divergence before adding more total content.
- **Players cannot predict anything:** improve card hints and state visibility.

---

## 17. Instrumentation

Record locally for prototype tests:

- cards offered each day;
- character threads inspected before commitment;
- selected and unselected cards;
- left/right/item solution selected;
- decision time;
- resources and flags before/after;
- event-chain completion;
- debt result;
- run completion and replay start.

No account system or remote analytics pipeline is required for the first five tests. A structured local log is sufficient.

---

## 18. Production gates

### Gate 0 — Paper/content test

Run five sample days using cards in a spreadsheet or simple clickable mockup with four simulated character threads. Confirm that inspecting threads and selecting one of three distributed opportunities is understandable.

### Gate 1 — Functional prototype

Implement the full 14-day scope in this document. Validate the core design question using the success criteria above.

### Gate 2 — Vertical slice

Only after Gate 1 passes:

- expand to one 28-day season;
- increase to approximately 80 events;
- add five NPCs;
- support four to five active character threads plus archived contacts;
- add richer art, sound, and save presentation;
- test 30–45 minute retention and replay intent.

### Gate 3 — Product planning

Only after the vertical slice demonstrates replay demand: decide whether to add further seasons, romance, structures, broader farming systems, or commercial release features.

---

## 19. Open decisions

These are intentionally unresolved until the first paper test:

1. Should unchosen cards resolve visibly inside their character threads, or be revealed during the evening summary?
2. Should exact resource changes be visible by default?
3. Can one rare item create an extra action, or only modify the chosen event?
4. Does the Home/Farm thread need direct planting interaction, or should all changes remain card-driven?
5. Is the debt premise emotionally appropriate, or should the seasonal goal be framed as restoring the farm before an inspection/festival?
6. Should a complete run be deterministic from a seed for easier testing?
7. Should thread navigation use fixed tabs, horizontal swipes, or a hybrid of both?

---

## 20. Immediate next deliverable

Create a content spreadsheet containing:

- the 30 prototype event rows;
- eligibility and unchosen behavior;
- both default outcomes;
- any item solution;
- follow-up event IDs;
- affected simulation state.

Then test Days 1–5 on paper before implementing the complete event engine.

After the Days 1–5 writing passes, create the visual style sheet and three canonical character reference sheets before generating event-card art.
