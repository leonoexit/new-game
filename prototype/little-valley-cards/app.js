import { CARD_DEFS, GAME } from "./data.js";
import {
  advance,
  cardLabel,
  carriedItem,
  createGame,
  currentHint,
  detachItem,
  findCard,
  hydrateGame,
  isBusy,
  moveCard,
  resolveDrop,
  togglePause,
  validTargets,
} from "./engine.js";

const root = document.querySelector("#game");
let state = load();
let dragging = null;
let lastFrame = performance.now();
let lastSavedSecond = -1;
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

function jobFor(cardId) {
  return state.jobs.find((job) => job.targetId === cardId || job.workerId === cardId) ?? null;
}

function detailFor(item) {
  if (item.typeId === "watered_carrots") {
    return `${Math.max(1, Math.ceil((item.meta.growthRemainingMs ?? 0) / 1000))}s until mature`;
  }
  return CARD_DEFS[item.typeId].description;
}

function renderCard(item) {
  const definition = CARD_DEFS[item.typeId];
  const job = jobFor(item.id);
  const busy = isBusy(state, item.id);
  const isPerson = definition.kind === "Person";
  const isWorking = Boolean(job && job.workerId === item.id);
  const attached = Boolean(item.meta.parentId);
  const carrying = isPerson ? carriedItem(state, item.id) : null;
  const statusBadge = isWorking ? "Working" : carrying ? "Carrying" : isPerson ? "Ready" : attached ? "Carried" : definition.badge;
  const parent = attached ? findCard(state, item.meta.parentId) : null;
  const z = parent ? Math.round(parent.y) + 29 : Math.round(item.y) + (item.typeId === "farmer" ? 30 : 0);
  return `
    <article class="world-card ${definition.artShape === "square" ? "square-art" : ""} ${isPerson ? "person-card" : ""} ${isWorking ? "worker-busy" : ""} ${busy ? "busy" : ""} ${attached ? "attached" : ""}"
      data-card-id="${item.id}" style="--x:${item.x}; --y:${item.y}px; --z:${z}" aria-label="${cardLabel(state, item)}${isWorking ? ", working" : ""}">
      <div class="card-kicker"><span class="kind-label">${isPerson ? `<i class="actor-glyph" aria-hidden="true"></i>` : ""}${definition.kind}</span>${statusBadge ? `<b>${statusBadge}</b>` : ""}</div>
      <div class="card-art">
        <img src="${definition.art}" alt="" draggable="false" />
        ${isWorking ? `<span class="work-overlay"><b>Working</b><em data-work-time="${job.id}">${Math.ceil(job.remainingMs / 1000)}s</em></span>` : ""}
      </div>
      <strong>${cardLabel(state, item)}</strong>
      <p>${carrying ? `${CARD_DEFS[carrying.typeId].name} attached · drag the stack` : detailFor(item)}</p>
      ${job ? `<div class="progress-shell"><i class="job-progress" data-job-id="${job.id}" style="width:${100 * (1 - job.remainingMs / job.durationMs)}%"></i></div>` : ""}
      ${item.typeId === "watered_carrots" ? `<div class="progress-shell crop"><i class="crop-progress" data-card-progress="${item.id}"></i></div>` : ""}
    </article>`;
}

function coins() {
  return state.cards.find((item) => item.typeId === "coin_purse")?.meta.amount ?? 0;
}

function render() {
  const seconds = Math.ceil(state.remainingMs / 1000);
  root.innerHTML = `
    <section class="game-shell">
      <header class="hud">
        <div class="brand"><strong>Little Valley</strong><span>physical board prototype</span></div>
        <div class="dusk"><span>Dusk in <b id="time-label">${seconds}s</b></span><div><i id="day-progress"></i></div></div>
        <button id="pause" class="icon-button" aria-label="${!state.started ? "Start time" : state.paused ? "Resume" : "Pause"}">${!state.started || state.paused ? "▶" : "Ⅱ"}</button>
      </header>

      <section class="goal-strip">
        <span>Today's goal</span>
        <strong>Sell your first harvest</strong>
        <b id="coin-goal">${coins()} / ${GAME.goalCoins} coins</b>
      </section>

      <section class="hint" id="hint"><span>✦</span><p>${currentHint(state)}</p></section>

      <section class="board-wrap">
        <div class="world-board" id="world-board" aria-label="Persistent card world">
          <div class="zone meadow"><span>Upper field</span></div>
          <div class="zone road"><span>Road to town</span></div>
          <div class="board-note">Time starts on your first move · Holding a card pauses time</div>
          ${state.cards.map(renderCard).join("")}
        </div>
      </section>

      <footer class="status-bar">
        <p id="message">${state.lastMessage}</p>
        <button id="reset">Reset day</button>
      </footer>
      <div class="toast" id="toast" role="status"></div>

      ${state.phase !== "playing" ? `
        <div class="result-layer">
          <section class="result-card ${state.phase}">
            <span class="result-mark">${state.phase === "won" ? "☀" : "☾"}</span>
            <small>${state.phase === "won" ? "First sale" : "Dusk"}</small>
            <h1>${state.phase === "won" ? "The farm made something real." : "The market closed."}</h1>
            <p>${state.phase === "won"
              ? "You cleared land, grew a crop, harvested it and sold the result — all on one persistent board."
              : "The cards remain understandable, but the work needs a quicker route."}</p>
            <button id="play-again">Try another day</button>
          </section>
        </div>` : ""}
    </section>`;
  bindEvents();
  updateLive();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
}

function reset() {
  state = createGame();
  save();
  render();
}

function bindEvents() {
  document.querySelector("#pause")?.addEventListener("click", () => {
    state = togglePause(state);
    save();
    render();
  });
  document.querySelector("#reset")?.addEventListener("click", reset);
  document.querySelector("#play-again")?.addEventListener("click", reset);
  document.querySelectorAll("[data-card-id]").forEach((element) => {
    element.addEventListener("pointerdown", startDrag);
  });
}

function startDrag(event) {
  if (state.phase !== "playing") return;
  const element = event.currentTarget;
  const cardId = element.dataset.cardId;
  if (isBusy(state, cardId)) {
    showToast("That card is busy.");
    return;
  }

  event.preventDefault();
  const item = findCard(state, cardId);
  const wasAttached = Boolean(item.meta.parentId);
  if (wasAttached) state = detachItem(state, cardId);
  const cardRect = element.getBoundingClientRect();
  const targets = validTargets(state, cardId);
  const companionId = wasAttached ? null : carriedItem(state, cardId)?.id ?? null;
  const companionRect = companionId
    ? document.querySelector(`[data-card-id="${companionId}"]`)?.getBoundingClientRect()
    : null;
  dragging = {
    id: cardId,
    pointerId: event.pointerId,
    element,
    offsetX: event.clientX - cardRect.left,
    offsetY: event.clientY - cardRect.top,
    targets,
    companionId,
    companionOffsetX: companionRect ? companionRect.left - cardRect.left : 0,
    companionOffsetY: companionRect ? companionRect.top - cardRect.top : 0,
  };
  element.setPointerCapture(event.pointerId);
  element.classList.add("dragging");
  targets.forEach((id) => document.querySelector(`[data-card-id="${id}"]`)?.classList.add("valid-target"));
  element.addEventListener("pointermove", dragMove);
  element.addEventListener("pointerup", endDrag);
  element.addEventListener("pointercancel", endDrag);
}

function dragMove(event) {
  if (!dragging || event.pointerId !== dragging.pointerId) return;
  event.preventDefault();
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
  const targetId = targetAtPoint(event.clientX, event.clientY);
  const boardRect = document.querySelector("#world-board").getBoundingClientRect();
  const x = 100 * (event.clientX - boardRect.left - active.offsetX) / boardRect.width;
  const y = event.clientY - boardRect.top - active.offsetY;
  state = moveCard(state, active.id, x, y);

  if (targetId) {
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

function updateLive() {
  const seconds = Math.ceil(state.remainingMs / 1000);
  const timeLabel = document.querySelector("#time-label");
  const dayProgress = document.querySelector("#day-progress");
  if (timeLabel) timeLabel.textContent = `${seconds}s`;
  if (dayProgress) dayProgress.style.width = `${100 * state.remainingMs / GAME.dayLengthMs}%`;

  state.jobs.forEach((job) => {
    document.querySelectorAll(`[data-job-id="${job.id}"]`).forEach((progress) => {
      progress.style.width = `${100 * (1 - job.remainingMs / job.durationMs)}%`;
    });
    document.querySelectorAll(`[data-work-time="${job.id}"]`).forEach((label) => {
      label.textContent = `${Math.max(1, Math.ceil(job.remainingMs / 1000))}s`;
    });
  });
  state.cards.filter((item) => item.typeId === "watered_carrots").forEach((item) => {
    const progress = document.querySelector(`[data-card-progress="${item.id}"]`);
    if (progress) progress.style.width = `${100 * (1 - item.meta.growthRemainingMs / 7_000)}%`;
  });
}

function frame(now) {
  const delta = Math.min(150, now - lastFrame);
  lastFrame = now;
  if (!dragging) {
    const previousPhase = state.phase;
    const previousJobs = state.jobs.length;
    const result = advance(state, delta);
    state = result.state;
    if (result.events.length || previousJobs !== state.jobs.length || previousPhase !== state.phase) {
      save();
      render();
      result.events.forEach(showToast);
    } else {
      updateLive();
    }
    const second = Math.ceil(state.remainingMs / 1000);
    if (second !== lastSavedSecond) {
      lastSavedSecond = second;
      save();
    }
  }
  requestAnimationFrame(frame);
}

render();
requestAnimationFrame(frame);
