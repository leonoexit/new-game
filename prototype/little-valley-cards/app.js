import { AREAS, CARD_DEFS, CROPS, GAME, cropForType } from "./data.js";
import { seasonLabel } from "./crop-system.js";
import {
  buySeeds,
  cardArea,
  cardLabel,
  carriedItem,
  createGame,
  currentHint,
  endDay,
  farmerArea,
  findCard,
  freeHands,
  handStacks,
  hydrateGame,
  interactionSourceId,
  moveCard,
  playFromHand,
  resolveDrop,
  returnToHand,
  continueFarm,
  tapDecision,
  validTargets,
} from "./engine.js";

const root = document.querySelector("#game");
let state = load();
let dragging = null;
let handDragging = null;
let suppressHandClickId = null;
let selectedCardId = null;
let inspectedCardId = null;
let toastTimer = null;
let handInspectTimer = null;

function load() {
  try {
    const saved = localStorage.getItem(GAME.storageKey)
      ?? GAME.legacyStorageKeys.map((key) => localStorage.getItem(key)).find(Boolean);
    return hydrateGame(JSON.parse(saved));
  } catch {
    return createGame();
  }
}

function save() {
  localStorage.setItem(GAME.storageKey, JSON.stringify(state));
}

function detailFor(item) {
  const definition = CARD_DEFS[item.typeId];
  if (definition.cropState === "seeds") {
    const crop = cropForType(item.typeId);
    if (!crop) return definition.description;
    const firstHarvest = `${crop.growthDays} watered night${crop.growthDays === 1 ? "" : "s"}`;
    const regrow = crop.regrowDays > 0
      ? ` Vines remain and regrow in ${crop.regrowDays} watered nights.`
      : " The crop is removed after harvest.";
    return `Costs ${crop.seedBundleCost} coin${crop.seedBundleCost === 1 ? "" : "s"}. First harvest after ${firstHarvest}. Produces ${crop.harvestAmount} ${crop.name}.${regrow}`;
  }
  if (["thirsty", "watered"].includes(definition.cropState)) {
    const crop = cropForType(item.typeId);
    const days = item.meta.growthRemainingDays ?? crop?.growthDays ?? GAME.cropGrowthDays;
    return definition.cropState === "watered"
      ? `${days} watered ${days === 1 ? "night" : "nights"} until mature.`
      : `${days} ${days === 1 ? "night" : "nights"} remain · water today to grow.`;
  }
  if (item.typeId === "shipping_bin") {
    const amount = item.meta.amount ?? 0;
    return amount > 0 ? `${amount} produce settle when the day ends.` : CARD_DEFS[item.typeId].description;
  }
  if (item.typeId === "watering_can") {
    const charges = item.meta.charges ?? 0;
    return charges > 0
      ? `${charges} of ${GAME.wateringCanCapacity} water charges remain.`
      : "Empty · carry it to the Stone Well to refill.";
  }
  return CARD_DEFS[item.typeId].description;
}

function badgeFor(item, isPerson, carrying, attached) {
  if (carrying) return "Carrying";
  if (isPerson) return "Ready";
  if (CARD_DEFS[item.typeId].kind === "Landmark") return "Here";
  if (item.typeId === "watering_can") {
    const charges = item.meta.charges ?? 0;
    if (charges === GAME.wateringCanCapacity) return "Full";
    if (charges > 0) return `${charges} Water`;
    return "Empty";
  }
  if (attached) return "Carried";
  if (item.typeId === "shipping_bin" && (item.meta.amount ?? 0) > 0) return "Queued";
  return CARD_DEFS[item.typeId].badge;
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

function renderCard(item) {
  const definition = CARD_DEFS[item.typeId];
  const isPerson = definition.kind === "Person";
  const attached = Boolean(item.meta.parentId);
  const carrying = isPerson ? carriedItem(state, item.id) : null;
  const statusBadge = badgeFor(item, isPerson, carrying, attached);
  const parent = attached ? findCard(state, item.meta.parentId) : null;
  const activeSourceId = selectedCardId ?? implicitSourceId();
  const selectionTargets = activeSourceId ? validTargets(state, activeSourceId) : [];
  const selected = selectedCardId === item.id;
  const tapTarget = selectionTargets.includes(item.id);
  const inspected = inspectedCardId === item.id;
  const z = parent ? Math.round(parent.y) + 44 : Math.round(item.y) + (item.typeId === "farmer" ? 30 : 0);
  return `
    <article class="world-card type-${item.typeId} ${definition.artShape === "square" ? "square-art" : ""} ${isPerson ? "person-card" : ""} ${definition.kind === "Landmark" ? "landmark-card" : ""} ${item.typeId === "general_store" ? "service-card" : ""} ${attached ? "attached" : ""} ${selected ? "selected-source" : ""} ${tapTarget ? "tap-target" : ""} ${inspected ? "inspected" : ""}"
      data-card-id="${item.id}" style="--x:${item.x}; --y:${item.y}px; --z:${z}" aria-label="${cardLabel(state, item)}" role="button" tabindex="0" aria-pressed="${selected}">
      <div class="card-kicker"><span class="kind-label">${isPerson ? `<i class="actor-glyph" aria-hidden="true"></i>` : ""}${definition.kind}</span>${statusBadge ? `<b>${statusBadge}</b>` : ""}</div>
      <div class="card-art"><img src="${artFor(item)}" alt="" draggable="false" /></div>
      <strong>${cardLabel(state, item)}</strong>
      <p class="card-description">${carrying ? `${CARD_DEFS[carrying.typeId].name} attached · drag the stack` : detailFor(item)}</p>
      ${["thirsty", "watered"].includes(definition.cropState) ? `<div class="progress-shell crop"><i style="width:${100 * (1 - item.meta.growthRemainingDays / (item.meta.growthTotalDays ?? cropForType(item.typeId)?.growthDays ?? GAME.cropGrowthDays))}%"></i></div>` : ""}
      ${item.typeId === "general_store" ? `<div class="card-actions">${Object.values(CROPS).map((crop) => `<button class="card-action" data-buy-seeds="${crop.id}" ${state.coins < crop.seedBundleCost ? "disabled" : ""}>${crop.id === "carrot" ? "Carrot" : "Beans"} · ${crop.seedBundleCost}</button>`).join("")}</div>` : ""}
    </article>`;
}

function handState(stack) {
  const item = stack.at(-1);
  if (item.typeId === "watering_can") return `Water ${item.meta.charges ?? 0}/${GAME.wateringCanCapacity}`;
  const totalAmount = stack.reduce((total, card) => total + (card.meta.amount ?? 1), 0);
  if (totalAmount > 1) return `×${totalAmount}`;
  return "";
}

function renderHandStack(stack) {
  const item = stack.at(-1);
  const definition = CARD_DEFS[item.typeId];
  const landmark = definition.kind === "Landmark";
  const active = landmark && item.meta.areaId === farmerArea(state);
  const stackLabel = stack.length > 1 ? `${stack.length} stacked cards, ` : "";
  return `<div class="hand-stack ${landmark ? "landmark-stack" : ""} ${stack.length > 1 ? "stacked" : ""}">
    ${stack.length > 2 ? `<i class="hand-stack-layer layer-two" aria-hidden="true"></i>` : ""}
    ${stack.length > 1 ? `<i class="hand-stack-layer layer-one" aria-hidden="true"></i>` : ""}
    <button class="hand-card ${landmark ? "hand-landmark" : "hand-item"} ${active ? "active-landmark" : ""}" data-hand-id="${item.id}" data-hand-kind="${landmark ? "landmark" : "item"}" ${active ? "disabled" : ""} aria-label="${active ? `${definition.name}, current Area` : `${stackLabel}Play ${cardLabel(state, item)}${landmark ? " by dragging it onto the table, costs 1 AP" : ""}`}">
      <img src="${artFor(item)}" alt="" /><span><small>${landmark ? "Drag to travel" : definition.kind}</small><strong>${definition.name}</strong></span>${active ? `<b>Here</b>` : landmark ? `<b>Play · 1 AP</b>` : handState(stack) ? `<b>${handState(stack)}</b>` : ""}
    </button>
  </div>`;
}

function renderHand() {
  const stacks = handStacks(state);
  const farmer = state.cards.find((item) => item.typeId === "farmer");
  const carried = farmer && carriedItem(state, farmer.id);
  const order = { hoe: 0, watering_can: 1, sickle: 2, carrot_seeds: 3, green_bean_seeds: 4, carrots: 5, green_beans: 6 };
  const portable = stacks
    .filter((stack) => CARD_DEFS[stack[0].typeId].kind !== "Landmark")
    .sort((a, b) => (order[a[0].typeId] ?? 99) - (order[b[0].typeId] ?? 99));
  const landmarks = AREAS
    .map((area) => stacks.find((stack) => stack.some((item) => item.id === area.landmarkId)))
    .filter(Boolean);
  return `
    <section class="hand" id="hand" aria-label="Hand">
      <header><div><span>Hand</span><small>Tap to play · hold to inspect</small></div><nav><button id="reset">Reset farm</button><button id="free-hands" ${carried ? "" : "disabled"}>Return item</button></nav></header>
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
  const currentArea = AREAS.find((area) => area.id === activeAreaId) ?? AREAS[0];
  const implicitSource = implicitSourceId();
  const implicitItem = implicitSource ? carriedItem(state, implicitSource) : null;
  const guidance = selected
    ? `${cardLabel(state, selected)} selected · tap a glowing target or drag the card.`
    : implicitItem && validTargets(state, implicitSource).length
      ? `${CARD_DEFS[implicitItem.typeId].name} ready · tap a glowing target or drag Farmer.`
    : currentHint(state);
  const boardCards = state.cards.filter((item) => !item.meta.inHand && cardArea(state, item) === activeAreaId);
  root.innerHTML = `
    <section class="game-shell">
      <header class="compact-hud">
        <div class="place-unit"><small>${seasonLabel(state)} · ${state.weather === "rainy" ? "Rain" : "Sun"}</small><strong>${currentArea.name}</strong></div>
        <div class="ap-unit ${state.actionPoints === 0 ? "empty" : ""}" aria-label="${state.actionPoints} of ${GAME.actionPointsPerDay} action points remaining"><i>AP</i><span>${state.actionPoints}<small>/${GAME.actionPointsPerDay}</small></span></div>
        <div class="money-unit" aria-label="${state.coins} coins"><i></i><span>${state.coins}</span><small>coins</small></div>
        <button id="end-day" ${state.phase !== "playing" ? "disabled" : ""}>End Day</button>
      </header>

      <section class="board-wrap">
        <div class="world-board area-${activeAreaId} weather-${state.weather}" id="world-board" aria-label="${currentArea.name} card table, ${state.weather} weather">
          <p class="board-message" id="message">${guidance}</p>
          ${boardCards.map(renderCard).join("")}
        </div>
      </section>
      ${renderHand()}
      ${renderInspection()}
      ${state.phase === "weekly_journal" ? renderWeeklyJournal() : ""}
      <div class="toast" id="toast" role="status"></div>
    </section>`;
  bindEvents();
}

function renderInspection() {
  const item = inspectedCardId ? findCard(state, inspectedCardId) : null;
  if (!item) return "";
  const definition = CARD_DEFS[item.typeId];
  const crop = definition.cropState === "seeds" ? cropForType(item.typeId) : null;
  const body = crop
    ? `<dl class="inspection-fields">
        <div><dt>Cost</dt><dd>${crop.seedBundleCost} coin${crop.seedBundleCost === 1 ? "" : "s"}</dd></div>
        <div><dt>First harvest</dt><dd>${crop.growthDays} watered nights</dd></div>
        <div><dt>Yield</dt><dd>${crop.harvestAmount} ${crop.name}</dd></div>
        <div><dt>After harvest</dt><dd>${crop.regrowDays > 0 ? `Regrows · ${crop.regrowDays} nights` : "Plot clears"}</dd></div>
      </dl>`
    : `<p>${detailFor(item)}</p>`;
  return `<aside class="card-inspection" role="dialog" aria-label="${CARD_DEFS[item.typeId].name} details">
    <div class="inspection-content"><small>${definition.kind}</small><strong>${definition.name}</strong>${body}</div>
    <button id="close-inspection" aria-label="Close card details">Close</button>
  </aside>`;
}

function renderWeeklyJournal() {
  const summary = state.seasonSummary ?? state.seasonStats;
  return `<section class="season-summary" role="dialog" aria-modal="true" aria-labelledby="season-summary-title">
    <div>
      <small>Spring Week ${state.week} complete</small>
      <h2 id="season-summary-title">The farm carries on</h2>
      <dl>
        <div><dt>Coins earned</dt><dd>${summary.coinsEarned}</dd></div>
        <div><dt>Harvests</dt><dd>${summary.harvestCount}</dd></div>
        <div><dt>Crops growing</dt><dd>${summary.cropsGrowing}</dd></div>
      </dl>
      <p>Land, crops, Tools and supplies will remain exactly as you left them.</p>
      <button id="continue-week">Continue farm</button>
      <button id="restart-season">Reset farm</button>
    </div>
  </section>`;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
}

function commitResult(result) {
  state = result.state;
  if (!result.ok) showToast(result.message);
  save();
  render();
}

function reset() {
  selectedCardId = null;
  inspectedCardId = null;
  state = createGame();
  save();
  render();
}

function bindEvents() {
  document.querySelector("#close-inspection")?.addEventListener("click", () => {
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
    state = endDay(state);
    save();
    render();
  });
  document.querySelector("#reset")?.addEventListener("click", reset);
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
    if (!result.ok) showToast(result.message);
    save();
    render();
    return;
  }
  const decision = tapDecision(state, selectedCardId, cardId);
  if (decision.kind === "select") selectedCardId = decision.cardId;
  if (decision.kind === "clear") selectedCardId = null;
  if (decision.kind === "resolve") {
    const result = resolveDrop(state, decision.sourceId, decision.targetId);
    state = result.state;
    selectedCardId = null;
    if (!result.ok) showToast(result.message);
    save();
  }
  if (decision.kind === "none" && selectedCardId) showToast("No direct interaction there.");
  render();
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
  const overHand = pointInside(document.querySelector("#hand"), event.clientX, event.clientY);
  const boardRect = document.querySelector("#world-board").getBoundingClientRect();
  const x = 100 * (event.clientX - boardRect.left - active.offsetX) / boardRect.width;
  const y = event.clientY - boardRect.top - active.offsetY;
  if (overHand) {
    const result = returnToHand(state, active.id);
    state = result.state;
    if (!result.ok) showToast(result.message);
  } else if (targetId) {
    const result = resolveDrop(state, active.actionSourceId, targetId);
    state = result.state;
    if (!result.ok) showToast(result.message);
  } else {
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
}

render();
