import { AREAS, CARD_DEFS, CROPS, GAME, PROTOTYPE_2, cropForType } from "./data.js";
import { cardPresentation } from "./card-presentation.js";
import { seasonLabel } from "./crop-system.js";
import { personDetails } from "./person-system.js";
import {
  buySeeds,
  cardArea,
  cardLabel,
  carriedItem,
  createPrototype2Game,
  currentHint,
  endDay,
  farmerArea,
  findCard,
  freeHands,
  handStacks,
  hydratePrototype2Game,
  interactionSourceId,
  moveCard,
  newSpring,
  playFromHand,
  resolveDrop,
  returnToHand,
  shipmentTotals,
  continueFarm,
  tapDecision,
  validTargets,
  lifePathProgresses,
} from "./engine.js";

const root = document.querySelector("#game");
let state = load();
let dragging = null;
let handDragging = null;
let suppressHandClickId = null;
let selectedCardId = null;
let inspectedCardId = null;
let storeOpen = false;
let toastTimer = null;
let handInspectTimer = null;
let chronicleOpen = true;
let weatherOpen = false;
let personBubble = null;
let personBubbleTimer = null;

function load() {
  try {
    const saved = localStorage.getItem(PROTOTYPE_2.storageKey);
    return hydratePrototype2Game(JSON.parse(saved));
  } catch {
    return createPrototype2Game();
  }
}

function save() {
  localStorage.setItem(PROTOTYPE_2.storageKey, JSON.stringify(state));
}

function detailFor(item) {
  const definition = CARD_DEFS[item.typeId];
  if (definition.cropState === "seeds") {
    const crop = cropForType(item.typeId);
    if (!crop) return definition.description;
    return `Costs ${crop.seedBundleCost} coin${crop.seedBundleCost === 1 ? "" : "s"}. First harvest: ${firstHarvestLabel(crop)}. ${crop.yieldLabel}. ${crop.afterHarvestLabel}.`;
  }
  if (["thirsty", "watered"].includes(definition.cropState)) {
    const crop = cropForType(item.typeId);
    const days = item.meta.growthRemainingDays ?? crop?.growthDays ?? GAME.cropGrowthDays;
    return definition.cropState === "watered"
      ? `${days} watered ${days === 1 ? "night" : "nights"} until mature.`
      : `${days} ${days === 1 ? "night" : "nights"} remain · water today to grow.`;
  }
  if (definition.cropState === "early_ready") return "Harvest now to free the Land, or water deliberately to continue toward the full crop.";
  if (item.typeId === "shipping_bin") {
    const totals = shipmentTotals(state);
    return totals.amount > 0 ? `${totals.amount} produce will bring ${totals.value} coins when the day ends.` : CARD_DEFS[item.typeId].description;
  }
  if (item.typeId === "watering_can") {
    const charges = item.meta.charges ?? 0;
    return charges > 0
      ? `${charges} of ${GAME.wateringCanCapacity} water charges remain.`
      : "Empty · carry it to the Stone Well to refill.";
  }
  return CARD_DEFS[item.typeId].description;
}

function firstHarvestLabel(crop) {
  if (crop.earlyTypeId) return `Baby after 1 watered night · full after ${crop.growthDays}`;
  return `${crop.growthDays} watered night${crop.growthDays === 1 ? "" : "s"}`;
}

function artFor(item) {
  const definition = CARD_DEFS[item.typeId];
  if (item.typeId === "watering_can" && (item.meta.charges ?? 0) > 0) return definition.filledArt;
  return definition.art;
}

function implicitSourceId() {
  const farmer = state.cards.find((item) => item.typeId === "farmer");
  return farmer && carriedItem(state, farmer.id) ? farmer.id : null;
}

function presentationFor(item, interactionState = "idle") {
  const carrying = item.typeId === "farmer" ? carriedItem(state, item.id) : null;
  return cardPresentation(state, item, {
    active: CARD_DEFS[item.typeId].kind === "Landmark" && item.meta.areaId === farmerArea(state),
    carrying,
    shipment: item.typeId === "shipping_bin" ? shipmentTotals(state) : null,
    detail: carrying ? `${CARD_DEFS[carrying.typeId].name} attached · drag the stack` : detailFor(item),
    interactionState,
    art: artFor(item),
  });
}

function renderCardFace(view) {
  return `<div class="card-kicker"><span class="kind-label">${view.familyLabel}</span>${view.primaryStatus ? `<b>${view.primaryStatus}</b>` : ""}</div>
    <div class="card-art"><img src="${view.art}" alt="" draggable="false" /></div>
    <strong class="card-title">${view.title}</strong>
    ${view.quantity ? `<span class="card-quantity">×${view.quantity}</span>` : ""}
    ${view.progress ? `<div class="card-progress"><span>${view.progress.label}</span><div class="progress-shell crop"><i style="width:${100 * view.progress.value}%"></i></div></div>` : ""}`;
}

function renderCard(item) {
  const attached = Boolean(item.meta.parentId);
  const parent = attached ? findCard(state, item.meta.parentId) : null;
  const activeSourceId = selectedCardId ?? implicitSourceId();
  const selectionTargets = activeSourceId ? validTargets(state, activeSourceId) : [];
  const selected = selectedCardId === item.id;
  const tapTarget = selectionTargets.includes(item.id);
  const inspected = inspectedCardId === item.id;
  const interactionState = selected ? "selected" : tapTarget ? "target" : "idle";
  const view = presentationFor(item, interactionState);
  const z = parent ? Math.round(parent.y) + 44 : Math.round(item.y) + (item.typeId === "farmer" ? 30 : 0);
  return `
    <article class="world-card type-${item.typeId} family-${view.family} ${view.artShape === "square" ? "square-art" : ""} ${attached ? "attached" : ""} ${selected ? "selected-source" : ""} ${tapTarget ? "tap-target" : ""} ${inspected ? "inspected" : ""}"
      data-card-id="${item.id}" style="--x:${item.x}; --y:${item.y}px; --z:${z}" aria-label="${cardLabel(state, item)}" role="button" tabindex="0" aria-pressed="${selected}">
      ${renderCardFace(view)}
    </article>`;
}

function renderHandStack(stack) {
  const item = stack.at(-1);
  const definition = CARD_DEFS[item.typeId];
  const landmark = definition.kind === "Landmark";
  const active = landmark && item.meta.areaId === farmerArea(state);
  const view = presentationFor(item);
  const stackLabel = stack.length > 1 ? `${stack.length} stacked cards, ` : "";
  return `<div class="hand-stack ${landmark ? "landmark-stack" : ""} ${stack.length > 1 ? "stacked" : ""}">
    ${stack.length > 2 ? `<i class="hand-stack-layer layer-two" aria-hidden="true"></i>` : ""}
    ${stack.length > 1 ? `<i class="hand-stack-layer layer-one" aria-hidden="true"></i>` : ""}
    <button class="hand-card family-${view.family} ${landmark ? "hand-landmark" : "hand-item"} ${active ? "active-landmark" : ""}" data-hand-id="${item.id}" data-hand-kind="${landmark ? "landmark" : "item"}" ${active ? "disabled" : ""} aria-label="${active ? `${definition.name}, current Area` : `${stackLabel}Play ${cardLabel(state, item)}${landmark ? " by dragging it onto the table, costs 1 AP" : ""}`}">
      <img src="${view.art}" alt="" /><span><small>${view.familyLabel}</small><strong>${view.title}</strong></span>${active ? `<b>Here</b>` : landmark ? `<b>Play · 1 AP</b>` : view.primaryStatus ? `<b>${view.primaryStatus}</b>` : ""}${view.quantity ? `<em>×${view.quantity}</em>` : ""}
    </button>
  </div>`;
}

function renderHand() {
  const stacks = handStacks(state);
  const farmer = state.cards.find((item) => item.typeId === "farmer");
  const carried = farmer && carriedItem(state, farmer.id);
  const order = { hoe: 0, watering_can: 1, sickle: 2 };
  Object.values(CROPS).forEach((crop, index) => {
    const base = 3 + index * 3;
    order[crop.seedTypeId] = base;
    order[crop.produceTypeId] = base + 1;
    order[crop.choiceProduceTypeId] = base + 2;
  });
  const portable = stacks
    .filter((stack) => CARD_DEFS[stack[0].typeId].kind !== "Landmark")
    .sort((a, b) => (order[a[0].typeId] ?? 99) - (order[b[0].typeId] ?? 99));
  const landmarks = AREAS
    .map((area) => stacks.find((stack) => stack.some((item) => item.id === area.landmarkId)))
    .filter(Boolean);
  return `
    <section class="hand" id="hand" aria-label="Hand">
      <header><div><span>Hand</span><small>Tap to play · hold to inspect</small></div><nav><button id="reset">New Spring</button><button id="free-hands" ${carried && state.phase === "playing" ? "" : "disabled"}>Return item</button></nav></header>
      <div class="hand-scroll">
        <div class="hand-group"><small>Items</small><div>${portable.length ? portable.map(renderHandStack).join("") : `<p>No item cards</p>`}</div></div>
        <div class="hand-group landmarks"><small>Landmarks</small><div>${landmarks.map(renderHandStack).join("")}</div></div>
      </div>
    </section>`;
}

function render() {
  cleanupHandDrag();
  const selected = selectedCardId ? findCard(state, selectedCardId) : null;
  if (selectedCardId && !selected) selectedCardId = null;
  if (inspectedCardId && !findCard(state, inspectedCardId)) inspectedCardId = null;
  const activeAreaId = farmerArea(state);
  if (storeOpen && (activeAreaId !== "town" || state.phase !== "playing")) storeOpen = false;
  const currentArea = AREAS.find((area) => area.id === activeAreaId) ?? AREAS[0];
  const implicitSource = implicitSourceId();
  const implicitItem = implicitSource ? carriedItem(state, implicitSource) : null;
  const guidance = selected
    ? `${cardLabel(state, selected)} selected · tap a glowing target or drag the card.`
    : implicitItem && validTargets(state, implicitSource).length
      ? `${CARD_DEFS[implicitItem.typeId].name} ready · tap a glowing target or drag Farmer.`
    : currentHint(state);
  const condition = PROTOTYPE_2.conditions[state.run?.conditionId];
  const boardCards = state.cards.filter((item) => !item.meta.inHand && cardArea(state, item) === activeAreaId);
  root.innerHTML = `
    <section class="game-shell">
      <header class="compact-hud">
        <div class="place-unit"><small>${seasonLabel(state)} · ${state.weather === "rainy" ? "Rain" : "Sun"} · ${condition?.name ?? "Spring"}</small><strong>${currentArea.name}</strong></div>
        <div class="ap-unit ${state.actionPoints === 0 ? "empty" : ""}" aria-label="${state.actionPoints} of ${GAME.actionPointsPerDay} action points remaining"><i>AP</i><span>${state.actionPoints}<small>/${GAME.actionPointsPerDay}</small></span></div>
        <div class="money-unit" aria-label="${state.coins} coins"><i></i><span>${state.coins}</span><small>coins</small></div>
        ${state.phase === "spring_chronicle"
          ? `<button id="view-chronicle">Chronicle</button>`
          : `<button id="end-day" ${state.phase !== "playing" ? "disabled" : ""}>End Day</button>`}
      </header>

      <section class="board-wrap">
        <div class="world-board area-${activeAreaId} weather-${state.weather}" id="world-board" aria-label="${currentArea.name} card table, ${state.weather} weather">
          <p class="board-message" id="message">${guidance}</p>
          ${renderWeatherCard(condition)}
          ${boardCards.map(renderCard).join("")}
          ${renderPersonBubble()}
        </div>
      </section>
      ${renderHand()}
      ${storeOpen ? renderStore() : ""}
      ${renderInspection()}
      ${weatherOpen ? renderWeatherInspection(condition) : ""}
      ${state.phase === "weekly_journal" ? renderWeeklyJournal() : ""}
      ${state.phase === "spring_chronicle" && chronicleOpen ? renderSpringChronicle() : ""}
      <div class="toast" id="toast" role="status"></div>
    </section>`;
  bindEvents();
}

function renderWeatherCard(condition) {
  const rainy = state.weather === "rainy";
  return `<button class="weather-card ${rainy ? "rainy" : "sunny"}" id="view-weather" aria-label="Inspect ${rainy ? "Rain" : "Sun"} weather and Spring forecast">
    <span class="weather-symbol" aria-hidden="true">${rainy ? "☂" : "☀"}</span>
    <small>Weather</small>
    <strong>${rainy ? "Rain" : "Sun"}</strong>
    <b>${condition.name}</b>
  </button>`;
}

function renderWeatherInspection(condition) {
  const forecast = condition.weatherByDay.map((weather, index) => `<li class="${weather}"><small>Day ${index + 1}</small><strong>${weather === "rainy" ? "Rain" : "Sun"}</strong></li>`).join("");
  return `<div class="inspection-backdrop weather-inspection" id="weather-inspection-backdrop">
    <aside class="card-inspection" role="dialog" aria-modal="true" aria-labelledby="weather-inspection-title">
      <button id="close-weather-inspection" aria-label="Close Weather card">Close</button>
      <article class="weather-card inspection-weather ${state.weather}">
        <span class="weather-symbol" aria-hidden="true">${state.weather === "rainy" ? "☂" : "☀"}</span>
        <small>Weather</small>
        <strong id="weather-inspection-title">${state.weather === "rainy" ? "Rain" : "Sun"}</strong>
        <b>${condition.name}</b>
      </article>
      <div class="inspection-content"><small>Fourteen-day forecast · Seed ${state.run.seed}</small><p>${condition.description}</p><ol class="weather-forecast">${forecast}</ol></div>
    </aside>
  </div>`;
}

function renderPersonBubble() {
  if (!personBubble) return "";
  const person = findCard(state, personBubble.cardId);
  if (!person || person.meta.absent || cardArea(state, person) !== farmerArea(state)) return "";
  return `<div class="person-speech" role="status" style="--bubble-x:${person.x}; --bubble-y:${Math.max(24, person.y - 48)}px"><strong>${CARD_DEFS[person.typeId].name}</strong><span>${personBubble.text}</span></div>`;
}

function renderStore() {
  const seedCards = Object.values(CROPS).map((crop) => {
    const definition = CARD_DEFS[crop.seedTypeId];
    const item = { typeId: crop.seedTypeId, meta: { amount: 1 } };
    const view = cardPresentation(state, item, { primaryStatus: crop.behavior, art: definition.art });
    return `<article class="store-seed-card family-${view.family}">
      <div class="card-kicker"><span class="kind-label">${view.familyLabel}</span><b>${view.primaryStatus}</b></div>
      <div class="card-art"><img src="${view.art}" alt="" /></div>
      <strong class="card-title">${view.title}</strong>
      <dl>
        <div><dt>First harvest</dt><dd>${firstHarvestLabel(crop)}</dd></div>
        <div><dt>Yield</dt><dd>${crop.yieldLabel}</dd></div>
        <div><dt>After</dt><dd>${crop.afterHarvestLabel}</dd></div>
      </dl>
      <button data-buy-seeds="${crop.id}" ${state.coins < crop.seedBundleCost ? "disabled" : ""}>Buy · ${crop.seedBundleCost} coin${crop.seedBundleCost === 1 ? "" : "s"}</button>
    </article>`;
  }).join("");
  return `<div class="store-backdrop" id="store-backdrop">
    <section class="store-tray" role="dialog" aria-modal="true" aria-labelledby="store-title">
      <header><div><small>General Store</small><h2 id="store-title">Choose a Seed card</h2></div><button id="close-store" aria-label="Close Store">Close</button></header>
      <div class="store-seed-grid">${seedCards}</div>
    </section>
  </div>`;
}

function renderInspection() {
  const item = inspectedCardId ? findCard(state, inspectedCardId) : null;
  if (!item) return "";
  const definition = CARD_DEFS[item.typeId];
  const view = presentationFor(item);
  const person = personDetails(state, item);
  const crop = definition.cropState === "seeds" ? cropForType(item.typeId) : null;
  const body = person
    ? `<p>${person.summary}</p>
      <dl class="inspection-fields person-fields">
        <div><dt>Weekly rhythm</dt><dd>${person.scheduleLabel}</dd></div>
        <div><dt>Interests</dt><dd>${person.interestsLabel || "Everyday time in the valley"}</dd></div>
      </dl>
      <div class="person-memories"><small>Memory</small>${person.moments.length
        ? `<ul>${person.moments.map((moment) => `<li>${moment}</li>`).join("")}</ul>`
        : `<p>No shared moments yet.</p>`}</div>`
    : crop
    ? `<dl class="inspection-fields">
        <div><dt>Cost</dt><dd>${crop.seedBundleCost} coin${crop.seedBundleCost === 1 ? "" : "s"}</dd></div>
        <div><dt>First harvest</dt><dd>${firstHarvestLabel(crop)}</dd></div>
        <div><dt>Yield</dt><dd>${crop.yieldLabel}</dd></div>
        <div><dt>After harvest</dt><dd>${crop.afterHarvestLabel}</dd></div>
      </dl>`
    : `<p>${detailFor(item)}</p>`;
  return `<div class="inspection-backdrop" id="inspection-backdrop">
    <aside class="card-inspection" role="dialog" aria-modal="true" aria-label="${definition.name} details">
      <button id="close-inspection" aria-label="Close card details">Close</button>
      <article class="inspection-card family-${view.family} ${view.artShape === "square" ? "square-art" : ""}">
        ${renderCardFace(view)}
      </article>
      <div class="inspection-content"><small>${person ? "Presence & memory" : "Description"}</small><strong>${definition.name}</strong>${body}</div>
    </aside>
  </div>`;
}

function renderWeeklyJournal() {
  const summary = state.seasonSummary ?? state.seasonStats;
  const memories = summary.memories ?? [];
  const memoryCards = memories.length
    ? `<ul class="journal-memories">${memories.map((memory) => `<li><small>${memory.kind.replaceAll("_", " ")}</small><strong>${memory.text}</strong></li>`).join("")}</ul>`
    : `<p class="quiet-week">No first happened this week. The familiar rhythm still belongs to this farm.</p>`;
  const growing = summary.cropsGrowing === 1 ? "One crop is still living on the Land." : `${summary.cropsGrowing} crops are still living on the Land.`;
  const shipping = summary.coinsEarned > 0
    ? `The Shipping Bin brought ${summary.coinsEarned} coin${summary.coinsEarned === 1 ? "" : "s"} home.`
    : "Nothing needed to leave through the Shipping Bin this week.";
  const paths = lifePathProgresses(state);
  return `<section class="season-summary" role="dialog" aria-modal="true" aria-labelledby="season-summary-title">
    <div>
      <small>Spring Week ${state.week} complete</small>
      <h2 id="season-summary-title">The farm carries on</h2>
      <div class="summary-scroll">
        ${memoryCards}
        <p>${shipping} ${growing}</p>
        <p class="journal-goal"><strong>The Spring is still taking shape.</strong><br>${paths.map((path) => path.detail).join(" · ")}</p>
        <p>Land, crops, Tools, supplies and farm memories remain exactly as you left them.</p>
      </div>
      <div class="summary-actions">
        <button id="continue-week">Begin Week 2</button>
        <button id="restart-season">New Spring</button>
      </div>
    </div>
  </section>`;
}

function renderSpringChronicle() {
  const chronicle = state.run.chronicle;
  return `<section class="season-summary spring-chronicle" role="dialog" aria-modal="true" aria-labelledby="chronicle-title">
    <div>
      <small>${chronicle.condition} · Spring complete</small>
      <h2 id="chronicle-title">${chronicle.title}</h2>
      <div class="summary-scroll"><div class="chronicle-prose">${chronicle.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div></div>
      <div class="summary-actions">
        <button id="review-spring">Review farm</button>
        <button id="restart-season">Begin a new Spring</button>
      </div>
    </div>
  </section>`;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function resultFeedback(result) {
  if (!result.ok) return result.message;
  return null;
}

function capturePersonBubble(result) {
  if (!result.ok || !["spend_time", "share_produce"].includes(result.action) || !result.targetId) return;
  personBubble = {
    cardId: result.targetId,
    text: result.action === "share_produce" ? "Thank you. I’ll remember what you shared." : "I’m glad we had this moment.",
  };
  clearTimeout(personBubbleTimer);
  personBubbleTimer = setTimeout(() => {
    personBubble = null;
    render();
  }, 3200);
}

function blockedInteractionFeedback(sourceId, targetId) {
  const source = findCard(state, sourceId);
  const target = findCard(state, targetId);
  const carried = source?.typeId === "farmer" ? carriedItem(state, source.id) : null;
  if (!source || !target) return null;
  if (carried?.typeId === "hoe" && target.typeId === "wild_soil") {
    return "Wild Soil still has grass. Use the Sickle first; the Hoe works on Cleared Ground.";
  }
  if (carried?.typeId === "sickle" && target.typeId === "cleared_ground") {
    return "The grass is already cut. Use the Hoe to turn Cleared Ground into a Plot.";
  }
  if (CARD_DEFS[target.typeId].personId) {
    if (carried && CARD_DEFS[carried.typeId]?.cropState !== "produce") return "Only ordinary or Choice Produce can be shared.";
    return "That moment is already remembered, or you have already spent time together today.";
  }
  return null;
}

function commitResult(result) {
  state = result.state;
  if (result.ok && result.action === "browse_store") storeOpen = true;
  capturePersonBubble(result);
  save();
  render();
  const feedback = resultFeedback(result);
  if (feedback) showToast(feedback);
}

function reset() {
  selectedCardId = null;
  inspectedCardId = null;
  storeOpen = false;
  chronicleOpen = true;
  weatherOpen = false;
  personBubble = null;
  state = newSpring(state);
  save();
  render();
}

function bindEvents() {
  document.querySelector("#view-weather")?.addEventListener("click", () => {
    weatherOpen = true;
    render();
  });
  document.querySelector("#close-weather-inspection")?.addEventListener("click", () => {
    weatherOpen = false;
    render();
  });
  document.querySelector("#weather-inspection-backdrop")?.addEventListener("click", (event) => {
    if (event.target.id !== "weather-inspection-backdrop") return;
    weatherOpen = false;
    render();
  });
  document.querySelector("#view-chronicle")?.addEventListener("click", () => {
    chronicleOpen = true;
    render();
  });
  document.querySelector("#review-spring")?.addEventListener("click", () => {
    chronicleOpen = false;
    render();
  });
  document.querySelector("#close-store")?.addEventListener("click", () => {
    storeOpen = false;
    render();
  });
  document.querySelector("#store-backdrop")?.addEventListener("click", (event) => {
    if (event.target.id !== "store-backdrop") return;
    storeOpen = false;
    render();
  });
  document.querySelector("#close-inspection")?.addEventListener("click", () => {
    inspectedCardId = null;
    render();
  });
  document.querySelector("#inspection-backdrop")?.addEventListener("click", (event) => {
    if (event.target.id !== "inspection-backdrop") return;
    inspectedCardId = null;
    render();
  });
  document.querySelector("#continue-week")?.addEventListener("click", () => {
    state = continueFarm(state);
    save();
    render();
  });
  document.querySelector("#restart-season")?.addEventListener("click", reset);
  document.querySelector("#end-day")?.addEventListener("click", () => {
    selectedCardId = null;
    storeOpen = false;
    state = endDay(state);
    save();
    render();
  });
  document.querySelector("#reset")?.addEventListener("click", () => {
    if (window.confirm("Begin a new Spring? This Prototype 2 run will be replaced.")) reset();
  });
  document.querySelector("#free-hands")?.addEventListener("click", () => {
    selectedCardId = null;
    commitResult(freeHands(state));
  });
  document.querySelectorAll("[data-buy-seeds]").forEach((element) => {
    element.addEventListener("pointerdown", (event) => event.stopPropagation());
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedCardId = null;
      commitResult(buySeeds(state, element.dataset.buySeeds));
    });
  });
  document.querySelectorAll("[data-hand-id]").forEach((element) => {
    if (element.dataset.handKind === "landmark") element.addEventListener("pointerdown", startHandDrag);
    else element.addEventListener("pointerdown", startHandInspect);
    element.addEventListener("click", () => {
      if (suppressHandClickId === element.dataset.handId) {
        suppressHandClickId = null;
        return;
      }
      selectedCardId = null;
      inspectedCardId = null;
      if (element.dataset.handKind === "landmark") {
        showToast("Drag this Landmark onto the table to travel.");
        return;
      }
      commitResult(playFromHand(state, element.dataset.handId));
    });
  });
  document.querySelectorAll("[data-card-id]").forEach((element) => {
    element.addEventListener("pointerdown", startDrag);
    element.addEventListener("keydown", handleCardKey);
  });
  document.querySelector("#world-board")?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-card-id], button")) return;
    if (selectedCardId || inspectedCardId) {
      selectedCardId = null;
      inspectedCardId = null;
      render();
    }
  });
}

function startHandInspect(event) {
  const element = event.currentTarget;
  const cardId = element.dataset.handId;
  clearTimeout(handInspectTimer);
  handInspectTimer = setTimeout(() => {
    inspectedCardId = cardId;
    suppressHandClickId = cardId;
    render();
    setTimeout(() => {
      if (suppressHandClickId === cardId) suppressHandClickId = null;
    }, 800);
  }, 450);
  const cancel = () => {
    clearTimeout(handInspectTimer);
    element.removeEventListener("pointerup", cancel);
    element.removeEventListener("pointercancel", cancel);
    element.removeEventListener("pointerleave", cancel);
  };
  element.addEventListener("pointerup", cancel);
  element.addEventListener("pointercancel", cancel);
  element.addEventListener("pointerleave", cancel);
}

function handleCardKey(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  handleCardTap(event.currentTarget.dataset.cardId);
}

function handleCardTap(cardId) {
  const implicitSource = !selectedCardId ? implicitSourceId() : null;
  if (implicitSource && validTargets(state, implicitSource).includes(cardId)) {
    const result = resolveDrop(state, implicitSource, cardId);
    state = result.state;
    inspectedCardId = null;
    if (result.ok && result.action === "browse_store") storeOpen = true;
    capturePersonBubble(result);
    save();
    render();
    const feedback = resultFeedback(result);
    if (feedback) showToast(feedback);
    return;
  }
  const decision = tapDecision(state, selectedCardId, cardId);
  let feedback = null;
  if (decision.kind === "select") selectedCardId = decision.cardId;
  if (decision.kind === "clear") selectedCardId = null;
  if (decision.kind === "resolve") {
    const result = resolveDrop(state, decision.sourceId, decision.targetId);
    state = result.state;
    selectedCardId = null;
    if (result.ok && result.action === "browse_store") storeOpen = true;
    capturePersonBubble(result);
    feedback = resultFeedback(result);
    save();
  }
  if (decision.kind === "none") feedback = blockedInteractionFeedback(selectedCardId ?? implicitSource, cardId)
    ?? (selectedCardId ? "No direct interaction there." : null);
  render();
  if (feedback) showToast(feedback);
}

function startHandDrag(event) {
  if (state.phase !== "playing" || event.currentTarget.disabled) return;
  cleanupHandDrag();
  const element = event.currentTarget;
  event.preventDefault();
  handDragging = {
    id: element.dataset.handId,
    pointerId: event.pointerId,
    element,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    ghost: null,
  };
  element.setPointerCapture(event.pointerId);
  window.addEventListener("pointermove", moveHandDrag, true);
  window.addEventListener("pointerup", endHandDrag, true);
  window.addEventListener("pointercancel", endHandDrag, true);
  element.addEventListener("lostpointercapture", endHandDrag);
}

function moveHandDrag(event) {
  if (!handDragging || event.pointerId !== handDragging.pointerId) return;
  const distance = Math.hypot(event.clientX - handDragging.startX, event.clientY - handDragging.startY);
  if (!handDragging.moved && distance < 7) return;
  event.preventDefault();
  if (!handDragging.moved) {
    handDragging.moved = true;
    handDragging.ghost = handDragging.element.cloneNode(true);
    handDragging.ghost.classList.add("hand-card-ghost");
    handDragging.ghost.removeAttribute("disabled");
    document.body.append(handDragging.ghost);
    document.querySelector("#world-board")?.classList.add("landmark-drop-ready");
  }
  handDragging.ghost.style.left = `${event.clientX}px`;
  handDragging.ghost.style.top = `${event.clientY}px`;
  const board = document.querySelector("#world-board");
  board?.classList.toggle("landmark-drop-hot", pointInside(board, event.clientX, event.clientY));
}

function endHandDrag(event) {
  if (!handDragging || event.pointerId !== handDragging.pointerId) return;
  const active = handDragging;
  const board = document.querySelector("#world-board");
  const cancelled = event.type === "pointercancel" || event.type === "lostpointercapture";
  const played = !cancelled && active.moved && pointInside(board, event.clientX, event.clientY);
  cleanupHandDrag(active);
  if (!active.moved) return;
  suppressHandClickId = active.id;
  setTimeout(() => {
    if (suppressHandClickId === active.id) suppressHandClickId = null;
  }, 0);
  if (played) {
    selectedCardId = null;
    commitResult(playFromHand(state, active.id));
  } else {
    showToast("Drop the Landmark onto the table to travel.");
  }
}

function cleanupHandDrag(active = handDragging) {
  if (active) {
    window.removeEventListener("pointermove", moveHandDrag, true);
    window.removeEventListener("pointerup", endHandDrag, true);
    window.removeEventListener("pointercancel", endHandDrag, true);
    active.element?.removeEventListener("lostpointercapture", endHandDrag);
    if (active.element?.hasPointerCapture?.(active.pointerId)) {
      active.element.releasePointerCapture(active.pointerId);
    }
    active.ghost?.remove();
  }
  document.querySelectorAll(".hand-card-ghost").forEach((ghost) => ghost.remove());
  document.querySelector("#world-board")?.classList.remove("landmark-drop-ready", "landmark-drop-hot");
  if (!active || handDragging === active) handDragging = null;
}

function startDrag(event) {
  if (state.phase !== "playing" || event.target.closest("button")) return;
  const element = event.currentTarget;
  const cardId = element.dataset.cardId;
  event.preventDefault();
  const item = findCard(state, cardId);
  if (!item || item.meta.fixed || cardArea(state, item) !== farmerArea(state)) return;
  const wasAttached = Boolean(item.meta.parentId);
  const actionSourceId = interactionSourceId(state, cardId);
  const cardRect = element.getBoundingClientRect();
  const companionId = wasAttached ? null : carriedItem(state, cardId)?.id ?? null;
  const companionRect = companionId
    ? document.querySelector(`[data-card-id="${companionId}"]`)?.getBoundingClientRect()
    : null;
  dragging = {
    id: cardId,
    pointerId: event.pointerId,
    element,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    wasAttached,
    actionSourceId,
    offsetX: event.clientX - cardRect.left,
    offsetY: event.clientY - cardRect.top,
    targets: [],
    companionId,
    companionOffsetX: companionRect ? companionRect.left - cardRect.left : 0,
    companionOffsetY: companionRect ? companionRect.top - cardRect.top : 0,
    inspected: false,
  };
  dragging.longPressTimer = setTimeout(() => {
    if (dragging?.id === cardId && !dragging.moved) dragging.inspected = true;
  }, 450);
  element.setPointerCapture(event.pointerId);
  element.addEventListener("pointermove", dragMove);
  element.addEventListener("pointerup", endDrag);
  element.addEventListener("pointercancel", endDrag);
}

function pointInside(element, clientX, clientY) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function dragMove(event) {
  if (!dragging || event.pointerId !== dragging.pointerId) return;
  event.preventDefault();
  if (dragging.inspected) return;
  if (!dragging.moved) {
    const distance = Math.hypot(event.clientX - dragging.startX, event.clientY - dragging.startY);
    if (distance < 7) return;
    clearTimeout(dragging.longPressTimer);
    dragging.moved = true;
    selectedCardId = null;
    dragging.targets = validTargets(state, dragging.actionSourceId);
    dragging.element.classList.remove("selected-source");
    document.querySelectorAll(".tap-target").forEach((target) => target.classList.remove("tap-target"));
    dragging.element.classList.add("dragging");
    dragging.targets.forEach((id) => document.querySelector(`[data-card-id="${id}"]`)?.classList.add("valid-target"));
  }
  const board = document.querySelector("#world-board");
  const boardRect = board.getBoundingClientRect();
  const xPx = event.clientX - boardRect.left - dragging.offsetX;
  const yPx = event.clientY - boardRect.top - dragging.offsetY;
  dragging.element.style.left = `${xPx}px`;
  dragging.element.style.top = `${yPx}px`;
  dragging.element.style.transform = "rotate(1.5deg) scale(1.035)";
  if (dragging.companionId) {
    const companion = document.querySelector(`[data-card-id="${dragging.companionId}"]`);
    if (companion) {
      companion.style.left = `${xPx + dragging.companionOffsetX}px`;
      companion.style.top = `${yPx + dragging.companionOffsetY}px`;
      companion.classList.add("stack-dragging");
    }
  }

  document.querySelectorAll(".drop-hot").forEach((target) => target.classList.remove("drop-hot"));
  const hand = document.querySelector("#hand");
  if (pointInside(hand, event.clientX, event.clientY)) hand.classList.add("drop-hot");
  const hot = targetAtPoint(event.clientX, event.clientY);
  if (hot) document.querySelector(`[data-card-id="${hot}"]`)?.classList.add("drop-hot");
}

function targetAtPoint(clientX, clientY) {
  if (!dragging) return null;
  let closest = null;
  let closestDistance = Infinity;
  dragging.targets.forEach((id) => {
    const element = document.querySelector(`[data-card-id="${id}"]`);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const inside = clientX >= rect.left - 24 && clientX <= rect.right + 24
      && clientY >= rect.top - 24 && clientY <= rect.bottom + 24;
    const distance = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
    if (inside && distance < closestDistance) {
      closest = id;
      closestDistance = distance;
    }
  });
  return closest;
}

function cardAtPoint(clientX, clientY, ...excludedIds) {
  const excluded = new Set(excludedIds.filter(Boolean));
  let closest = null;
  let distance = Infinity;
  document.querySelectorAll("[data-card-id]").forEach((element) => {
    if (excluded.has(element.dataset.cardId) || !pointInside(element, clientX, clientY)) return;
    const rect = element.getBoundingClientRect();
    const nextDistance = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
    if (nextDistance < distance) {
      closest = element.dataset.cardId;
      distance = nextDistance;
    }
  });
  return closest;
}

function endDrag(event) {
  if (!dragging || event.pointerId !== dragging.pointerId) return;
  const active = dragging;
  clearTimeout(active.longPressTimer);
  if (!active.moved) {
    active.element.releasePointerCapture?.(event.pointerId);
    active.element.removeEventListener("pointermove", dragMove);
    active.element.removeEventListener("pointerup", endDrag);
    active.element.removeEventListener("pointercancel", endDrag);
    dragging = null;
    if (active.inspected) {
      inspectedCardId = inspectedCardId === active.id ? null : active.id;
      render();
      return;
    }
    handleCardTap(active.id);
    return;
  }
  const targetId = targetAtPoint(event.clientX, event.clientY);
  const blockedTargetId = targetId ? null : cardAtPoint(event.clientX, event.clientY, active.id, active.companionId);
  const overHand = pointInside(document.querySelector("#hand"), event.clientX, event.clientY);
  const boardRect = document.querySelector("#world-board").getBoundingClientRect();
  const x = 100 * (event.clientX - boardRect.left - active.offsetX) / boardRect.width;
  const y = event.clientY - boardRect.top - active.offsetY;
  let feedback = null;
  if (overHand) {
    const result = returnToHand(state, active.id);
    state = result.state;
    feedback = resultFeedback(result);
  } else if (targetId) {
    const result = resolveDrop(state, active.actionSourceId, targetId);
    state = result.state;
    if (result.ok && result.action === "browse_store") storeOpen = true;
    capturePersonBubble(result);
    feedback = resultFeedback(result);
  } else {
    if (blockedTargetId) feedback = blockedInteractionFeedback(active.actionSourceId, blockedTargetId);
    if (active.wasAttached) {
      state = returnToHand(state, active.id).state;
    } else {
      state = moveCard(state, active.id, x, y);
    }
  }

  active.element.releasePointerCapture?.(event.pointerId);
  active.element.removeEventListener("pointermove", dragMove);
  active.element.removeEventListener("pointerup", endDrag);
  active.element.removeEventListener("pointercancel", endDrag);
  dragging = null;
  save();
  render();
  if (feedback) showToast(feedback);
}

save();
render();
