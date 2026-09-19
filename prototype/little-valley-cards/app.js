import { AREAS, CARD_DEFS, GAME } from "./data.js";
import {
  buySeeds,
  cardArea,
  cardLabel,
  carriedItem,
  createGame,
  currentHint,
  detachItem,
  endDay,
  farmerArea,
  findCard,
  freeHands,
  handItems,
  hydrateGame,
  moveCard,
  playFromHand,
  resolveDrop,
  returnToHand,
  tapDecision,
  validTargets,
} from "./engine.js";

const root = document.querySelector("#game");
let state = load();
let dragging = null;
let selectedCardId = null;
let toastTimer = null;

function load() {
  try {
    return hydrateGame(JSON.parse(localStorage.getItem(GAME.storageKey)));
  } catch {
    return createGame();
  }
}

function save() {
  localStorage.setItem(GAME.storageKey, JSON.stringify(state));
}

function detailFor(item) {
  if (item.typeId === "watered_carrots") {
    const days = item.meta.growthRemainingDays ?? GAME.cropGrowthDays;
    return `${days} overnight growth ${days === 1 ? "step" : "steps"} until mature`;
  }
  if (item.typeId === "shipping_bin") {
    const amount = item.meta.amount ?? 0;
    return amount > 0 ? `${amount} carrots settle when the day ends.` : CARD_DEFS[item.typeId].description;
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
  if (attached) return "Carried";
  if (item.typeId === "shipping_bin" && (item.meta.amount ?? 0) > 0) return "Queued";
  return CARD_DEFS[item.typeId].badge;
}

function renderCard(item) {
  const definition = CARD_DEFS[item.typeId];
  const isPerson = definition.kind === "Person";
  const attached = Boolean(item.meta.parentId);
  const carrying = isPerson ? carriedItem(state, item.id) : null;
  const statusBadge = badgeFor(item, isPerson, carrying, attached);
  const parent = attached ? findCard(state, item.meta.parentId) : null;
  const selectionTargets = selectedCardId ? validTargets(state, selectedCardId) : [];
  const selected = selectedCardId === item.id;
  const tapTarget = selectionTargets.includes(item.id);
  const z = parent ? Math.round(parent.y) + 29 : Math.round(item.y) + (item.typeId === "farmer" ? 30 : 0);
  return `
    <article class="world-card ${definition.artShape === "square" ? "square-art" : ""} ${isPerson ? "person-card" : ""} ${item.typeId === "general_store" ? "service-card" : ""} ${attached ? "attached" : ""} ${selected ? "selected-source" : ""} ${tapTarget ? "tap-target" : ""}"
      data-card-id="${item.id}" style="--x:${item.x}; --y:${item.y}px; --z:${z}" aria-label="${cardLabel(state, item)}" role="button" tabindex="0" aria-pressed="${selected}">
      <div class="card-kicker"><span class="kind-label">${isPerson ? `<i class="actor-glyph" aria-hidden="true"></i>` : ""}${definition.kind}</span>${statusBadge ? `<b>${statusBadge}</b>` : ""}</div>
      <div class="card-art"><img src="${definition.art}" alt="" draggable="false" /></div>
      <strong>${cardLabel(state, item)}</strong>
      <p>${carrying ? `${CARD_DEFS[carrying.typeId].name} attached · drag the stack` : detailFor(item)}</p>
      ${item.typeId === "watered_carrots" ? `<div class="progress-shell crop"><i style="width:${100 * (1 - item.meta.growthRemainingDays / GAME.cropGrowthDays)}%"></i></div>` : ""}
      ${item.typeId === "general_store" ? `<button class="card-action" data-buy-seeds ${state.coins < GAME.seedBundleCost ? "disabled" : ""}>Buy Seeds · ${GAME.seedBundleCost}</button>` : ""}
    </article>`;
}

function handState(item) {
  if (item.typeId === "watering_can") return `${item.meta.charges ?? 0}/${GAME.wateringCanCapacity}`;
  if ((item.meta.amount ?? 1) > 1) return `×${item.meta.amount}`;
  return "";
}

function renderHandCard(item) {
  const definition = CARD_DEFS[item.typeId];
  const landmark = definition.kind === "Landmark";
  const active = landmark && item.meta.areaId === farmerArea(state);
  return `<button class="hand-card ${landmark ? "hand-landmark" : "hand-item"} ${active ? "active-landmark" : ""}" data-hand-id="${item.id}" ${active ? "disabled" : ""} aria-label="${active ? `${definition.name}, current Area` : `Play ${cardLabel(state, item)}`}">
    <img src="${definition.art}" alt="" /><span><small>${landmark ? "Landmark" : definition.kind}</small><strong>${definition.name}</strong></span>${active ? `<b>Here</b>` : handState(item) ? `<b>${handState(item)}</b>` : ""}
  </button>`;
}

function renderHand() {
  const items = handItems(state);
  const farmer = state.cards.find((item) => item.typeId === "farmer");
  const carried = farmer && carriedItem(state, farmer.id);
  const order = { hoe: 0, watering_can: 1, sickle: 2, carrot_seeds: 3, carrots: 4 };
  const portable = items
    .filter((item) => CARD_DEFS[item.typeId].kind !== "Landmark")
    .sort((a, b) => (order[a.typeId] ?? 99) - (order[b.typeId] ?? 99));
  const landmarks = AREAS
    .map((area) => items.find((item) => item.id === area.landmarkId))
    .filter(Boolean);
  return `
    <section class="hand" id="hand" aria-label="Hand">
      <header><div><span>Hand</span><small>Play cards onto the world</small></div><button id="free-hands" ${carried ? "" : "disabled"}>Free hands</button></header>
      <div class="hand-scroll">
        <div class="hand-group"><small>Items</small><div>${portable.length ? portable.map(renderHandCard).join("") : `<p>No item cards</p>`}</div></div>
        <div class="hand-group landmarks"><small>Landmarks</small><div>${landmarks.map(renderHandCard).join("")}</div></div>
      </div>
    </section>`;
}

function render() {
  const selected = selectedCardId ? findCard(state, selectedCardId) : null;
  if (selectedCardId && !selected) selectedCardId = null;
  const activeAreaId = farmerArea(state);
  const currentArea = AREAS.find((area) => area.id === activeAreaId) ?? AREAS[0];
  const guidance = selected
    ? `${cardLabel(state, selected)} selected · tap a glowing target or drag the card.`
    : currentHint(state);
  const boardCards = state.cards.filter((item) => !item.meta.inHand && cardArea(state, item) === activeAreaId);
  const atFarm = activeAreaId === "farm";
  root.innerHTML = `
    <section class="game-shell">
      <header class="hud">
        <div class="brand"><strong>Little Valley</strong><span>physical world prototype</span></div>
        <div class="money-unit" aria-label="${state.coins} coins"><i></i><span>${state.coins}</span><small>coins</small></div>
      </header>

      <section class="day-strip">
        <div><small>Day</small><strong>${state.day}</strong></div>
        <p>${atFarm ? "Watered crops grow and shipments pay overnight." : "Return to Home Farm to end the day."}</p>
        <button id="end-day" ${atFarm ? "" : "disabled"}>End Day</button>
      </section>

      <section class="hint" id="hint"><span>✦</span><p>${guidance}</p></section>

      <section class="area-ribbon"><small>Current Area</small><strong>${currentArea.name}</strong><span>Play another Landmark from your Hand to travel</span></section>

      <section class="board-wrap">
        <div class="world-board area-${activeAreaId}" id="world-board" aria-label="${currentArea.name} card table">
          ${activeAreaId === "farm"
            ? `<div class="zone meadow"><span>Home fields</span></div><div class="zone road"><span>Farm lane</span></div>`
            : `<div class="zone town-square"><span>Town square</span></div>`}
          <div class="board-note">Play item cards from the Hand · drag carried cards back to the Hand</div>
          ${boardCards.map(renderCard).join("")}
        </div>
      </section>

      <footer class="status-bar">
        <p id="message">${state.lastMessage}</p>
        <button id="reset">Reset farm</button>
      </footer>
      ${renderHand()}
      <div class="toast" id="toast" role="status"></div>
    </section>`;
  bindEvents();
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
  state = createGame();
  save();
  render();
}

function bindEvents() {
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
  document.querySelector("[data-buy-seeds]")?.addEventListener("pointerdown", (event) => event.stopPropagation());
  document.querySelector("[data-buy-seeds]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    selectedCardId = null;
    commitResult(buySeeds(state));
  });
  document.querySelectorAll("[data-hand-id]").forEach((element) => {
    element.addEventListener("click", () => {
      selectedCardId = null;
      commitResult(playFromHand(state, element.dataset.handId));
    });
  });
  document.querySelectorAll("[data-card-id]").forEach((element) => {
    element.addEventListener("pointerdown", startDrag);
    element.addEventListener("keydown", handleCardKey);
  });
  document.querySelector("#world-board")?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-card-id], button")) return;
    if (selectedCardId) {
      selectedCardId = null;
      render();
    }
  });
}

function handleCardKey(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  handleCardTap(event.currentTarget.dataset.cardId);
}

function handleCardTap(cardId) {
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

function startDrag(event) {
  if (state.phase !== "playing" || event.target.closest("button")) return;
  const element = event.currentTarget;
  const cardId = element.dataset.cardId;
  event.preventDefault();
  const item = findCard(state, cardId);
  if (!item || item.meta.fixed || cardArea(state, item) !== farmerArea(state)) return;
  const wasAttached = Boolean(item.meta.parentId);
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
    offsetX: event.clientX - cardRect.left,
    offsetY: event.clientY - cardRect.top,
    targets: [],
    companionId,
    companionOffsetX: companionRect ? companionRect.left - cardRect.left : 0,
    companionOffsetY: companionRect ? companionRect.top - cardRect.top : 0,
  };
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
  if (!dragging.moved) {
    const distance = Math.hypot(event.clientX - dragging.startX, event.clientY - dragging.startY);
    if (distance < 7) return;
    dragging.moved = true;
    selectedCardId = null;
    if (dragging.wasAttached) state = detachItem(state, dragging.id);
    dragging.targets = validTargets(state, dragging.id);
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
  if (!active.moved) {
    active.element.releasePointerCapture?.(event.pointerId);
    active.element.removeEventListener("pointermove", dragMove);
    active.element.removeEventListener("pointerup", endDrag);
    active.element.removeEventListener("pointercancel", endDrag);
    dragging = null;
    handleCardTap(active.id);
    return;
  }
  const targetId = targetAtPoint(event.clientX, event.clientY);
  const overHand = pointInside(document.querySelector("#hand"), event.clientX, event.clientY);
  const boardRect = document.querySelector("#world-board").getBoundingClientRect();
  const x = 100 * (event.clientX - boardRect.left - active.offsetX) / boardRect.width;
  const y = event.clientY - boardRect.top - active.offsetY;
  state = moveCard(state, active.id, x, y);

  if (overHand) {
    const result = returnToHand(state, active.id);
    state = result.state;
    if (!result.ok) showToast(result.message);
  } else if (targetId) {
    const result = resolveDrop(state, active.id, targetId);
    state = result.state;
    if (!result.ok) showToast(result.message);
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
