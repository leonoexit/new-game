const STORAGE_KEY = "one-good-day-farm-feel-v0.1";

const TOOL_COPY = {
  seed: { label: "Gieo", mark: "·", instruction: "Chạm hoặc kéo qua đất trống để gieo hạt." },
  water: { label: "Tưới", mark: "≈", instruction: "Tưới cây rồi kết thúc ngày để cây lớn." },
  harvest: { label: "Thu", mark: "◆", instruction: "Thu những cây đã lớn đủ hai lần." },
};

function freshPlots() {
  return Array.from({ length: FARM_FEEL.plotCount }, () => ({ crop: false, stage: 0, watered: false }));
}

function freshState() {
  return {
    day: 1,
    phase: "playing",
    selectedTool: "seed",
    plots: freshPlots(),
    harvested: 0,
    feedback: "Chọn một công cụ rồi chăm mảnh đất theo cách của bạn.",
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.plots?.length === FARM_FEEL.plotCount) return saved;
  } catch {
    return freshState();
  }
  return freshState();
}

let state = loadState();
let painting = false;
let lastPainted = null;

const screen = document.querySelector("#screen");
const resetButton = document.querySelector("#reset-button");

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The prototype remains playable when local storage is unavailable.
  }
}

function plotName(plot) {
  if (!plot.crop) return "Đất trống";
  if (plot.stage >= FARM_FEEL.matureStage) return "Củ cải đã chín";
  if (plot.stage === 1) return "Cây non";
  return "Hạt vừa gieo";
}

function plantMarkup(plot) {
  if (!plot.crop) return "";
  return `<span class="plant stage-${Math.min(plot.stage, FARM_FEEL.matureStage)}" aria-hidden="true"><i></i></span>`;
}

function updatePlotDom(index) {
  const plot = state.plots[index];
  const button = document.querySelector(`[data-plot="${index}"]`);
  if (!button) return;
  button.className = `plot${plot.watered ? " watered" : ""}${plot.stage >= FARM_FEEL.matureStage ? " mature" : ""}`;
  button.setAttribute("aria-label", `Ô ${index + 1}: ${plotName(plot)}${plot.watered ? ", đã tưới" : ""}`);
  button.innerHTML = `${plantMarkup(plot)}<span class="plot-label">${index + 1}</span>`;
  const harvestTotal = document.querySelector("#harvest-total");
  if (harvestTotal) harvestTotal.textContent = `${state.harvested} củ`;
}

function applyTool(index) {
  if (state.phase !== "playing" || index === lastPainted) return;
  const plot = state.plots[index];
  lastPainted = index;

  if (state.selectedTool === "seed") {
    if (plot.crop) {
      state.feedback = `Ô ${index + 1} đã có cây.`;
      renderStatusOnly();
      return;
    }
    plot.crop = true;
    plot.stage = 0;
    plot.watered = false;
    state.feedback = `Hạt đã nằm trong đất ở ô ${index + 1}.`;
  } else if (state.selectedTool === "water") {
    if (!plot.crop) {
      state.feedback = `Ô ${index + 1} chưa có gì để tưới.`;
      renderStatusOnly();
      return;
    }
    if (plot.stage >= FARM_FEEL.matureStage) {
      state.feedback = `Củ cải ở ô ${index + 1} đã sẵn sàng để thu.`;
      renderStatusOnly();
      return;
    }
    plot.watered = true;
    state.feedback = `Đất ở ô ${index + 1} đã thẫm nước.`;
  } else {
    if (!plot.crop || plot.stage < FARM_FEEL.matureStage) {
      state.feedback = `Ô ${index + 1} chưa thể thu hoạch.`;
      renderStatusOnly();
      return;
    }
    plot.crop = false;
    plot.stage = 0;
    plot.watered = false;
    state.harvested += 1;
    state.feedback = `Bạn nhổ được một củ cải từ ô ${index + 1}.`;
  }

  saveState();
  updatePlotDom(index);
  renderStatusOnly();
}

function renderStatusOnly() {
  const feedback = document.querySelector("#feedback");
  if (feedback) feedback.textContent = state.feedback;
}

function advanceDay() {
  if (state.phase !== "playing") return;
  const app = document.querySelector(".farm-app");
  app.classList.add("is-turning");

  setTimeout(() => {
    let grew = 0;
    for (const plot of state.plots) {
      if (plot.crop && plot.watered && plot.stage < FARM_FEEL.matureStage) {
        plot.stage += 1;
        grew += 1;
      }
      plot.watered = false;
    }

    if (state.day >= FARM_FEEL.finalDay) {
      state.phase = "complete";
    } else {
      state.day += 1;
      state.feedback = grew
        ? `${grew} ô cây đã lớn thêm trong đêm.`
        : "Sáng đến, khu vườn vẫn như hôm qua.";
    }
    saveState();
    app.classList.remove("is-turning");
    render();
  }, 520);
}

function renderTools() {
  return `<div class="tools" role="toolbar" aria-label="Công cụ làm vườn">${FARM_FEEL.tools.map((tool) => {
    const copy = TOOL_COPY[tool];
    return `<button class="tool-button" data-tool="${tool}" type="button" aria-pressed="${state.selectedTool === tool}"><span aria-hidden="true">${copy.mark}</span><strong>${copy.label}</strong></button>`;
  }).join("")}</div>`;
}

function renderPlaying() {
  screen.innerHTML = `
    <section class="day-line" aria-label="Tiến độ lượt thử">
      <div><span class="eyebrow">NGÀY</span><strong>${state.day} / ${FARM_FEEL.finalDay}</strong></div>
      <div class="harvest-count"><span class="eyebrow">ĐÃ THU</span><strong id="harvest-total">${state.harvested} củ</strong></div>
    </section>

    ${renderTools()}
    <p class="tool-instruction">${TOOL_COPY[state.selectedTool].instruction}</p>

    <section class="garden" id="garden" aria-label="Mảnh vườn sáu ô">
      ${state.plots.map((plot, index) => `<button class="plot${plot.watered ? " watered" : ""}${plot.stage >= FARM_FEEL.matureStage ? " mature" : ""}" data-plot="${index}" type="button" aria-label="Ô ${index + 1}: ${plotName(plot)}${plot.watered ? ", đã tưới" : ""}">${plantMarkup(plot)}<span class="plot-label">${index + 1}</span></button>`).join("")}
    </section>

    <p class="feedback" id="feedback">${state.feedback}</p>
    <button class="end-day" id="end-day" type="button">${state.day === FARM_FEEL.finalDay ? "Kết thúc lượt thử" : "Kết thúc ngày"}</button>`;

  for (const button of document.querySelectorAll("[data-tool]")) {
    button.addEventListener("click", () => {
      state.selectedTool = button.dataset.tool;
      state.feedback = TOOL_COPY[state.selectedTool].instruction;
      saveState();
      render();
    });
  }

  const garden = document.querySelector("#garden");
  garden.addEventListener("pointerdown", (event) => {
    const plot = event.target.closest("[data-plot]");
    if (!plot) return;
    event.preventDefault();
    painting = true;
    lastPainted = null;
    applyTool(Number(plot.dataset.plot));
  });
  garden.addEventListener("pointermove", (event) => {
    if (!painting) return;
    const plot = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-plot]");
    if (plot && garden.contains(plot)) applyTool(Number(plot.dataset.plot));
  });
  document.querySelector("#end-day").addEventListener("click", advanceDay);
}

function renderComplete() {
  screen.innerHTML = `
    <section class="result-card">
      <span class="eyebrow">KẾT THÚC LƯỢT THỬ</span>
      <div class="result-crop" aria-hidden="true"><span class="plant stage-2"><i></i></span></div>
      <h2>Bốn ngày trong vườn</h2>
      <p>Bạn đã thu được <strong>${state.harvested} củ cải</strong>.</p>
      <p class="result-question">Bạn có muốn chăm thêm một vụ nữa không?</p>
      <button class="end-day secondary" id="play-again" type="button">Làm lại từ đầu</button>
    </section>`;
  document.querySelector("#play-again").addEventListener("click", resetGame);
}

function render() {
  if (state.phase === "complete") renderComplete();
  else renderPlaying();
}

function resetGame() {
  state = freshState();
  painting = false;
  lastPainted = null;
  saveState();
  render();
}

resetButton.addEventListener("click", resetGame);
document.addEventListener("pointerup", () => {
  painting = false;
  lastPainted = null;
});
document.addEventListener("pointercancel", () => {
  painting = false;
  lastPainted = null;
});
render();
