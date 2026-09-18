const STORAGE_KEY = "one-good-day-demo-v0.6";

function freshState() {
  return {
    day: 1,
    phase: "decision",
    money: GAME.startingMoney,
    farm: GAME.startingFarm,
    vitality: GAME.startingVitality,
    relationships: { mira: 0, rowan: 0, iris: 0 },
    flags: [],
    inventory: [],
    memories: { field: [], mira: [], rowan: [], iris: [] },
    resolvedEvents: [],
    expiredEvents: [],
    scheduledBeats: [],
    morningBeats: [...DAYS[0].morning],
    history: [],
    evening: null,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.day >= 1 && saved.day <= GAME.finalDay) return saved;
  } catch {
    return freshState();
  }
  return freshState();
}

let state = loadState();
const screen = document.querySelector("#screen");
const resetButton = document.querySelector("#reset-button");
const choiceTemplate = document.querySelector("#choice-template");

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The in-memory run still works when local storage is unavailable.
  }
}

function dayData() {
  return DAYS[state.day - 1];
}

function clampMeter(value) {
  return Math.max(0, Math.min(GAME.meterMax, value));
}

function hasFlag(flag) {
  return state.flags.includes(flag);
}

function addFlag(flag) {
  if (!state.flags.includes(flag)) state.flags.push(flag);
}

function availableEvents() {
  return EVENTS.filter((event) => (
    state.day >= event.appears
    && state.day <= event.deadline
    && !state.resolvedEvents.includes(event.id)
    && !state.expiredEvents.includes(event.id)
  ));
}

function eventPremise(event) {
  return event.premises?.[state.day] ?? event.premise;
}

function deadlineLabel(event) {
  const remaining = event.deadline - state.day;
  if (remaining === 0) return "Hôm nay";
  return `Còn ${remaining} ngày`;
}

function meterClass(value) {
  if (value <= 1) return "danger";
  if (value >= GAME.meterMax) return "full";
  return "";
}

function meterMarkup(label, value, icon) {
  const cells = Array.from({ length: GAME.meterMax }, (_, index) => `<span class="meter-cell${index < value ? " filled" : ""}"></span>`).join("");
  return `<div class="meter ${meterClass(value)}"><div class="meter-label"><span>${icon} ${label}</span><strong>${value}/${GAME.meterMax}</strong></div><div class="meter-track">${cells}</div></div>`;
}

function renderHud() {
  document.querySelector("#status-hud").innerHTML = `
    <div class="day-status"><strong>Ngày ${state.day}</strong><span>${dayData().weather}</span></div>
    <div class="money-status"><span>TIỀN</span><strong>${state.money}G</strong></div>
    ${meterMarkup("FARM", state.farm, "⌂")}
    ${meterMarkup("SỨC", state.vitality, "♥")}`;
}

function effectDirections(effects, actorId) {
  const labels = [];
  const push = (label, value) => {
    if (value) labels.push(`<span class="effect-direction ${value > 0 ? "up" : "down"}">${label} ${value > 0 ? "↑" : "↓"}</span>`);
  };
  push("TIỀN", effects?.money);
  push("FARM", effects?.farm);
  push("SỨC", effects?.vitality);
  if (actorId !== "field") push(ACTORS[actorId].label.toUpperCase(), effects?.relationships?.[actorId]);
  return labels.length ? labels.join("") : '<span class="effect-direction neutral">HỆ QUẢ VỀ SAU</span>';
}

function applyEffects(effects, actorId) {
  if (!effects) return;
  state.money += effects.money ?? 0;
  state.farm = clampMeter(state.farm + (effects.farm ?? 0));
  state.vitality = clampMeter(state.vitality + (effects.vitality ?? 0));
  for (const [id, value] of Object.entries(effects.relationships ?? {})) {
    state.relationships[id] = clampMeter(state.relationships[id] + value);
  }
  for (const flag of effects.flags ?? []) addFlag(flag);
  if (effects.inventory) state.inventory.push(effects.inventory);
  if (effects.memory) state.memories[actorId].push(effects.memory);
}

function scheduleBeats(beats = []) {
  for (const beat of beats) state.scheduledBeats.push({ ...beat, applied: false });
}

function relationshipLabel(actorId) {
  if (actorId === "field") {
    if (state.farm <= 1) return "Chông chênh";
    if (state.farm >= 4) return "Vững vàng";
    return "Đang gây dựng";
  }
  const value = state.relationships[actorId];
  if (value >= 4) return "Tin cậy";
  if (value >= 2) return "Gần gũi";
  if (value === 1) return "Đã gặp";
  return "Chưa thân";
}

function attachDeckNavigation(deck, count) {
  if (count <= 1) return;
  const previous = document.querySelector("#deck-prev");
  const next = document.querySelector("#deck-next");
  const position = document.querySelector("#deck-position");
  let currentIndex = 0;

  const updateControls = () => {
    position.textContent = `${currentIndex + 1}/${count}`;
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex === count - 1;
  };

  const showCard = (index) => {
    currentIndex = Math.max(0, Math.min(count - 1, index));
    const card = deck.children[currentIndex];
    const firstCard = deck.children[0];
    deck.scrollTo({ left: card.offsetLeft - firstCard.offsetLeft, behavior: "smooth" });
    updateControls();
  };

  let scrollFrame = null;
  deck.addEventListener("scroll", () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const cards = [...deck.children];
      const firstCardLeft = cards[0]?.offsetLeft ?? 0;
      currentIndex = cards.reduce((best, card, index) => {
        const distance = Math.abs(card.offsetLeft - firstCardLeft - deck.scrollLeft);
        return distance < best.distance ? { index, distance } : best;
      }, { index: 0, distance: Infinity }).index;
      updateControls();
    });
  }, { passive: true });

  previous.addEventListener("click", () => showCard(currentIndex - 1));
  next.addEventListener("click", () => showCard(currentIndex + 1));
  updateControls();
}

function renderDecision() {
  const events = availableEvents();
  const beats = state.morningBeats.length ? state.morningBeats : ["Một ngày mới bắt đầu ở nông trại."];
  screen.innerHTML = `
    <div class="screen-stack decision-screen">
      <aside class="world-strip">
        <span>SÁNG NAY</span>
        <ul>${beats.map((beat) => `<li>${beat}</li>`).join("")}</ul>
      </aside>
      <header class="deck-heading">
        <div>
          <span class="section-label">${events.length} LỜI GỌI · CHỌN MỘT</span>
          <h1>Hôm nay</h1>
          <p>${events.length > 1 ? "Xem các lời gọi, rồi chọn một." : "Chỉ còn một việc đáng chú ý."}</p>
        </div>
        ${events.length > 1 ? `<div class="deck-controls" aria-label="Điều hướng các cơ hội"><button class="deck-arrow" id="deck-prev" type="button" aria-label="Cơ hội trước">←</button><span id="deck-position" aria-live="polite">1/${events.length}</span><button class="deck-arrow" id="deck-next" type="button" aria-label="Cơ hội tiếp theo">→</button></div>` : ""}
      </header>
      <div class="event-deck" id="event-deck" aria-label="Các cơ hội hôm nay"></div>
    </div>`;

  const deck = document.querySelector("#event-deck");
  events.forEach((event, eventIndex) => {
    const actor = ACTORS[event.actor];
    const card = document.createElement("section");
    card.className = "event-card pixel-panel";
    card.setAttribute("aria-label", `Cơ hội ${eventIndex + 1} trên ${events.length}: ${event.title}`);
    card.innerHTML = `
      <div class="card-kicker"><span>${actor.label} · ${relationshipLabel(event.actor)}</span><span class="deadline">${event.urgency ?? deadlineLabel(event)}</span></div>
      <h2>${event.title}</h2>
      <div class="art-wrap">
        <img class="event-art" src="${event.art}" width="640" height="400" alt="${event.alt}" />
        ${event.artStatus ? `<span class="placeholder-chip">${event.artStatus}</span>` : ""}
      </div>
      <p class="premise">${eventPremise(event)}</p>
      <p class="choice-note">Chọn một phương án sẽ kết thúc ngày.</p>
      <div class="choices" aria-label="Chọn một cách giải quyết"></div>`;

    const choicesHost = card.querySelector(".choices");
    event.choices.forEach((choice, choiceIndex) => {
      const button = choiceTemplate.content.firstElementChild.cloneNode(true);
      button.querySelector("strong").textContent = choice.label;
      button.querySelector("span").textContent = choice.hint;
      const preview = document.createElement("div");
      preview.className = "effect-preview";
      preview.innerHTML = effectDirections(choice.effects, event.actor);
      button.append(preview);
      button.removeAttribute("aria-pressed");
      button.addEventListener("click", () => resolveEvent(event, choiceIndex));
      choicesHost.append(button);
    });
    deck.append(card);
  });

  attachDeckNavigation(deck, events.length);
}

function statChanges(before) {
  const changes = [];
  const add = (label, current, old, suffix = "") => {
    const delta = current - old;
    if (delta) changes.push(`${label} ${delta > 0 ? "+" : ""}${delta}${suffix}`);
  };
  add("Tiền", state.money, before.money, "G");
  add("Farm", state.farm, before.farm);
  add("Sức sống", state.vitality, before.vitality);
  for (const actorId of ["mira", "rowan", "iris"]) {
    add(ACTORS[actorId].label, state.relationships[actorId], before.relationships[actorId]);
  }
  return changes.length ? changes.join(" · ") : "Các trạng thái chung không đổi.";
}

function applyStormConsequences(event, choice) {
  if (state.day !== 5) return null;
  const missing = [
    !hasFlag("irrigation_restored"),
    !(hasFlag("rain_barrel_repaired") || hasFlag("rain_gutter_built")),
    !hasFlag("gate_repaired"),
  ].filter(Boolean).length;
  const protection = event.id === "field_storm_preparation" && choice.id === "reinforce" ? 2 : 0;
  const damage = Math.max(0, missing - protection);
  if (!damage) return "Những việc đã làm từ trước giúp farm trụ vững qua bão.";
  state.farm = clampMeter(state.farm - damage);
  return `Bão đánh vào ${damage} hạng mục chưa chuẩn bị; Farm −${damage}.`;
}

function resolveEvent(event, choiceIndex) {
  const choice = event.choices[choiceIndex];
  if (!choice) return;
  const eventSet = availableEvents();
  const eventIndex = eventSet.findIndex((candidate) => candidate.id === event.id);
  const before = { money: state.money, farm: state.farm, vitality: state.vitality, relationships: { ...state.relationships } };
  applyEffects(choice.effects, event.actor);
  scheduleBeats(choice.schedules);
  state.resolvedEvents.push(event.id);

  const unattended = [];
  for (const candidate of availableEvents()) {
    if (candidate.id === event.id) continue;
    if (candidate.deadline <= state.day) {
      state.expiredEvents.push(candidate.id);
      applyEffects(candidate.onExpire?.effects, candidate.actor);
      scheduleBeats(candidate.onExpire?.schedules);
      unattended.push({ title: candidate.title, text: candidate.onExpire?.text ?? "Cơ hội này đã khép lại." });
    } else {
      unattended.push({ title: candidate.title, text: candidate.carryText ?? `Việc này vẫn đang chờ đến ngày ${candidate.deadline}.` });
    }
  }

  const stormText = applyStormConsequences(event, choice);
  state.history.push({ day: state.day, eventId: event.id, actor: event.actor, choice: choice.label });
  state.evening = {
    eventId: event.id,
    eventIndex,
    eventCount: eventSet.length,
    eventTitle: event.title,
    choiceLabel: choice.label,
    result: choice.result,
    changes: statChanges(before),
    unattended,
    stormText,
  };
  state.phase = "evening";
  saveState();
  render();
}

function endingReason() {
  if (state.farm <= 0) return "Bạn còn một mái nhà, nhưng mùa tới sẽ bắt đầu bằng việc dựng lại những gì đã mất.";
  if (state.vitality <= 0) return "Bạn đã giữ quá nhiều lời hứa và không còn sức để nghe ngày mới gọi.";
  if (state.money < 0) return "Khoản nợ đã bắt đầu quyết định thay bạn.";
  const strongest = Object.entries(state.relationships).sort((a, b) => b[1] - a[1])[0];
  if (strongest[1] >= 4) return `${ACTORS[strongest[0]].label} đã bắt đầu xem bạn như một phần đáng tin cậy của cuộc sống nơi đây.`;
  if (state.farm >= 4 && state.money >= 20) return "Bạn đã đặt nền móng cho một nơi có thể sống lâu dài.";
  return "Năm ngày đầu chưa tạo ra câu trả lời, nhưng chúng đã cho thấy điều bạn sẵn sàng đánh đổi.";
}

function isCollapsed() {
  return state.farm <= 0 || state.vitality <= 0 || state.money < 0;
}

function renderEvening() {
  const evening = state.evening;
  const event = EVENTS.find((candidate) => candidate.id === evening.eventId || candidate.title === evening.eventTitle);
  const actor = ACTORS[event.actor];
  const isLast = state.day === GAME.finalDay || isCollapsed();
  const beats = state.morningBeats.length ? state.morningBeats : ["Một ngày mới bắt đầu ở nông trại."];
  const eventCount = evening.eventCount ?? 1;
  const eventIndex = evening.eventIndex ?? 0;
  screen.innerHTML = `
    <div class="screen-stack decision-screen evening-screen">
      <aside class="world-strip">
        <span>SÁNG NAY</span>
        <ul>${beats.map((beat) => `<li>${beat}</li>`).join("")}</ul>
      </aside>
      <header class="deck-heading evening-heading">
        <div>
          <span class="section-label">BUỔI TỐI · NGÀY ${state.day}</span>
          <h1>Hôm nay</h1>
          <p>Trang này đã khép lại.</p>
        </div>
        ${eventCount > 1 ? `<div class="deck-controls" aria-label="Vị trí thẻ đã chọn"><button class="deck-arrow" type="button" disabled aria-label="Cơ hội trước">←</button><span>${eventIndex + 1}/${eventCount}</span><button class="deck-arrow" type="button" disabled aria-label="Cơ hội tiếp theo">→</button></div>` : ""}
      </header>
      <div class="event-deck result-deck">
        <section class="event-card result-event-card pixel-panel">
          <div class="card-kicker"><span>${actor.label} · ${relationshipLabel(event.actor)}</span><span class="deadline">Đã chọn</span></div>
          <h2>${evening.eventTitle}</h2>
          <div class="art-wrap">
            <img class="event-art" src="${event.art}" width="640" height="400" alt="${event.alt}" />
            ${event.artStatus ? `<span class="placeholder-chip">${event.artStatus}</span>` : ""}
          </div>
          <p class="result-choice">${evening.choiceLabel}</p>
          <p class="premise result-copy">${evening.result}</p>
          <ul class="summary-list outcome-list">
            <li class="stat-change"><strong>Cân bằng:</strong> ${evening.changes}</li>
            ${evening.stormText ? `<li class="storm-result"><strong>Sau cơn bão:</strong> ${evening.stormText}</li>` : ""}
            ${evening.unattended.map((item) => `<li class="missed"><strong>${item.title}:</strong> ${item.text}</li>`).join("")}
          </ul>
          <button class="primary-action pixel-button" id="next-day" type="button">${isLast ? "Xem kết quả lượt chơi" : "Sang ngày tiếp theo"}</button>
        </section>
      </div>
    </div>`;

  document.querySelector("#next-day").addEventListener("click", () => {
    if (isLast) {
      state.phase = "run-end";
    } else {
      state.day += 1;
      processMorning();
      state.phase = "decision";
      state.evening = null;
    }
    saveState();
    render();
  });
}

function processMorning() {
  const beats = [...dayData().morning];
  for (const beat of state.scheduledBeats) {
    if (beat.day !== state.day || beat.applied) continue;
    beat.applied = true;
    beats.push(beat.text);
    applyEffects({ vitality: beat.vitality, money: beat.money, farm: beat.farm, flags: beat.flags, inventory: beat.inventory }, "field");
  }
  for (const event of availableEvents()) {
    if (event.appears < state.day && event.carryText) beats.push(event.carryText);
  }
  state.morningBeats = beats;
}

function renderRunEnd() {
  const beats = state.morningBeats.length ? state.morningBeats : ["Một ngày mới bắt đầu ở nông trại."];
  screen.innerHTML = `
    <div class="screen-stack decision-screen run-end-screen">
      <aside class="world-strip">
        <span>SÁNG NAY</span>
        <ul>${beats.map((beat) => `<li>${beat}</li>`).join("")}</ul>
      </aside>
      <header class="deck-heading">
        <div><span class="section-label">KẾT THÚC VERTICAL SLICE</span><h1>Hôm nay</h1><p>Lượt chơi đã khép lại.</p></div>
      </header>
      <div class="event-deck result-deck">
        <section class="event-card result-event-card pixel-panel">
          <div class="card-kicker"><span>Nông trại · KẾT QUẢ</span><span class="deadline">5 ngày</span></div>
          <h2>Năm ngày đầu tiên</h2>
          <div class="art-wrap"><img class="event-art" src="${ART.farm}" width="640" height="400" alt="Nông trại sau năm ngày đầu tiên." /></div>
          <p class="premise result-copy">${endingReason()}</p>
          <ul class="run-stats outcome-list">
            <li><strong>Tiền:</strong> ${state.money}G · <strong>Farm:</strong> ${state.farm}/${GAME.meterMax} · <strong>Sức sống:</strong> ${state.vitality}/${GAME.meterMax}</li>
            <li><strong>Quan hệ:</strong> Mira ${state.relationships.mira} · Rowan ${state.relationships.rowan} · Iris ${state.relationships.iris}</li>
            <li><strong>Đồ vật:</strong> ${state.inventory.length ? state.inventory.join(", ") : "Chưa có"}</li>
            <li><strong>Cam kết:</strong> ${state.history.map((item) => `Ngày ${item.day}: ${item.choice}`).join(" · ")}</li>
          </ul>
          <button class="secondary-action pixel-button" id="restart-run" type="button">Chơi lại năm ngày</button>
        </section>
      </div>
    </div>`;
  document.querySelector("#restart-run").addEventListener("click", resetGame);
}

function resetGame() {
  state = freshState();
  saveState();
  render();
}

function render() {
  renderHud();
  if (state.phase === "decision") renderDecision();
  else if (state.phase === "evening") renderEvening();
  else renderRunEnd();
}

resetButton.addEventListener("click", resetGame);
render();
