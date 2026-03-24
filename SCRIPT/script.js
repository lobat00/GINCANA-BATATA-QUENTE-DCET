// ── Elements ──────────────────────────────────────────────
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");
const resultOverlay = document.getElementById("result-overlay");

const startGameBtn = document.getElementById("start-game-btn");
const timerDisplay = document.getElementById("timer");
const turnLabel = document.getElementById("turn-label");
const temaBanner = document.getElementById("tema-banner");
const displayTema = document.getElementById("display-tema");
const centerBtn = document.getElementById("center-btn");
const startRoundBtn = document.getElementById("start-round-btn");

const resultTitle = document.getElementById("result-title");
const resultMsg = document.getElementById("result-msg");

const themeAddInput = document.getElementById("theme-add-input");
const addThemeBtn = document.getElementById("add-theme-btn");
const clearThemesBtn = document.getElementById("clear-themes-btn");
const themesPreview = document.getElementById("themes-preview");
const themesCount = document.getElementById("themes-count");

const teamInputs = Array.from({ length: 7 }, (_, i) => document.getElementById(`team${i + 1}-input`));
const teamCards = Array.from({ length: 7 }, (_, i) => document.getElementById(`team${i + 1}-card`));
const teamNameEls = Array.from({ length: 7 }, (_, i) => document.getElementById(`display-team${i + 1}`));
const teamLivesEls = Array.from({ length: 7 }, (_, i) => document.getElementById(`lives${i + 1}`));

// ── State ─────────────────────────────────────────────────
const TEAM_COUNT = 7;
const INITIAL_LIVES = 1;
const TURN_SECONDS = 10;

const DEFAULT_TEAM_NAMES = [
  "Arquitetura",
  "Civil",
  "Computação",
  "Elétrica",
  "Física",
  "Matemática",
  "Química"
];

const TEAM_COLORS = {
  "arquitetura": "team-red",
  "civil":       "team-green",
  "computação":  "team-purple",
  "elétrica":    "team-yellow",
  "física":      "team-orange",
  "matemática":  "team-black",
  "química":     "team-blue"
};

function getTeamColorClass(name) {
  return TEAM_COLORS[name.toLowerCase().trim()] || "";
}

let teams = [];
let currentTeamIndex = 0;
let seconds = TURN_SECONDS;
let interval = null;
let waitingToStart = true;

let themes = [
  "Partes do corpo humano",
  "Utensílios de cozinha",
  "Países do mundo",
  "Cidades do Brasil com a letra V",
  "Profissões com a letra A",
  "Instrumentos musicais",
  "Fenômenos da natureza",
  "Elementos da Tabela Periódica",
  "Peças de um carro",
  "Termos da informática/tecnologia",
  "Sentimentos ou estados emocionais",
  "Itens de sala de aula",
  "Itens do quarto",
  "Cursos Superiores"
];
let themeDrawPool = [];

// ── Helpers ───────────────────────────────────────────────
function flash(el) {
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
}

function aliveTeams() {
  return teams.filter(team => team.lives > 0);
}

function findNextAliveIndex(fromIndex) {
  for (let i = 1; i <= TEAM_COUNT; i++) {
    const idx = (fromIndex + i) % TEAM_COUNT;
    if (teams[idx].lives > 0) return idx;
  }
  return -1;
}

function renderTeams() {
  teams.forEach((team, i) => {
    teamNameEls[i].textContent = team.name;
    teamLivesEls[i].textContent = `Vidas: ${team.lives}`;
    teamCards[i].classList.toggle("eliminated", team.lives <= 0);
    teamCards[i].classList.remove("active");
    // apply team color
    Object.values(TEAM_COLORS).forEach(c => teamCards[i].classList.remove(c));
    const colorClass = getTeamColorClass(team.name);
    if (colorClass) teamCards[i].classList.add(colorClass);
  });
}

function setActiveTeam(index) {
  currentTeamIndex = index;
  const team = teams[index];
  turnLabel.textContent = `VEZ DE ${team.name.toUpperCase()}`;
  teamCards.forEach(card => card.classList.remove("active"));
  teamCards[index].classList.add("active");
  timerDisplay.classList.remove("danger");

  // Update body background to match active team color
  Object.values(TEAM_COLORS).forEach(c => document.body.classList.remove(`bg-${c}`));
  const colorClass = getTeamColorClass(team.name);
  if (colorClass) document.body.classList.add(`bg-${colorClass}`);
}

function normalizeTheme(value) {
  return value.trim().replace(/\s+/g, " ");
}

function renderThemes() {
  themesCount.textContent = `Temas cadastrados: ${themes.length}`;
  themesPreview.innerHTML = "";

  themes.forEach(theme => {
    const item = document.createElement("span");
    item.className = "theme-chip";
    item.textContent = theme;
    themesPreview.appendChild(item);
  });
}

function addTheme() {
  const value = normalizeTheme(themeAddInput.value);
  if (!value) return;

  const exists = themes.some(theme => theme.toLowerCase() === value.toLowerCase());
  if (!exists) {
    themes.push(value);
    renderThemes();
  }

  themeAddInput.value = "";
  themeAddInput.focus();
}

function clearThemes() {
  themes = [];
  themeDrawPool = [];
  renderThemes();
}

function drawTheme() {
  if (themes.length === 0) return null;

  if (themeDrawPool.length === 0) {
    themeDrawPool = [...themes];
  }

  const index = Math.floor(Math.random() * themeDrawPool.length);
  const [selected] = themeDrawPool.splice(index, 1);
  return selected;
}

// ── Turn control ──────────────────────────────────────────
function startTurn(index, requireManualStart = false) {
  clearInterval(interval);
  seconds = TURN_SECONDS;
  timerDisplay.textContent = seconds;
  timerDisplay.classList.remove("danger");
  setActiveTeam(index);

  if (requireManualStart) {
    centerBtn.disabled = true;
    startRoundBtn.classList.remove("hidden");
    waitingToStart = true;
    return;
  }

  waitingToStart = true;
  beginCountdown();
}

function beginCountdown() {
  if (!waitingToStart) return;

  waitingToStart = false;
  startRoundBtn.classList.add("hidden");
  centerBtn.disabled = false;

  interval = setInterval(() => {
    seconds -= 1;
    timerDisplay.textContent = seconds;

    if (seconds <= 3) timerDisplay.classList.add("danger");

    if (seconds <= 0) {
      clearInterval(interval);
      centerBtn.disabled = true;
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  const team = teams[currentTeamIndex];
  team.lives -= 1;
  flash(teamCards[currentTeamIndex]);

  renderTeams();

  const alive = aliveTeams();
  if (alive.length === 1) {
    showResult(`🏆 ${alive[0].name} VENCEU!`, "Último time com vidas restantes.");
    return;
  }

  const next = findNextAliveIndex(currentTeamIndex);
  if (next >= 0) startTurn(next, false);
}

function showResult(title, sub) {
  clearInterval(interval);
  resultTitle.textContent = title;
  resultMsg.textContent = sub;
  gameScreen.classList.add("hidden");
  resultOverlay.classList.remove("hidden");

  setTimeout(() => {
    resultOverlay.classList.add("hidden");
    setupScreen.classList.remove("hidden");
    teamInputs.forEach(input => {
      input.value = "";
    });
  }, 4000);
}

// ── Start game ────────────────────────────────────────────
startGameBtn.addEventListener("click", () => {
  const selectedTheme = drawTheme();

  if (!selectedTheme) {
    alert("Cadastre pelo menos 1 tema para iniciar o jogo.");
    themeAddInput.focus();
    return;
  }

  teams = Array.from({ length: TEAM_COUNT }, (_, i) => ({
    id: i + 1,
    name: teamInputs[i].value.trim() || DEFAULT_TEAM_NAMES[i] || `Time ${i + 1}`,
    lives: INITIAL_LIVES
  }));

  renderTeams();

  displayTema.textContent = selectedTheme;
  temaBanner.classList.remove("hidden");

  setupScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  startTurn(0, true);
});

// ── Buttons ───────────────────────────────────────────────
startRoundBtn.addEventListener("click", () => {
  beginCountdown();
});

centerBtn.addEventListener("click", () => {
  flash(centerBtn);
  const next = findNextAliveIndex(currentTeamIndex);
  if (next >= 0) startTurn(next, false);
});

addThemeBtn.addEventListener("click", addTheme);
clearThemesBtn.addEventListener("click", clearThemes);

// ── Keyboard shortcuts ────────────────────────────────────
[...teamInputs].forEach(input => {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") startGameBtn.click();
  });
});

themeAddInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTheme();
  }
});

document.addEventListener("keydown", e => {
  if (e.code === "Space" && !gameScreen.classList.contains("hidden")) {
    e.preventDefault();
    if (waitingToStart) {
      startRoundBtn.click();
    } else if (!centerBtn.disabled) {
      centerBtn.click();
    }
  }
});

renderThemes();


