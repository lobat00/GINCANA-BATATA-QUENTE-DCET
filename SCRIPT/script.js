// ── Elements ──────────────────────────────────────────────
const setupScreen   = document.getElementById("setup-screen");
const gameScreen    = document.getElementById("game-screen");
const resultOverlay = document.getElementById("result-overlay");
const temaInput     = document.getElementById("tema-input");
const team1Input    = document.getElementById("team1-input");
const team2Input    = document.getElementById("team2-input");
const startGameBtn  = document.getElementById("start-game-btn");
const timerDisplay  = document.getElementById("timer");
const turnLabel     = document.getElementById("turn-label");
const temaBanner    = document.getElementById("tema-banner");
const displayTema   = document.getElementById("display-tema");
const displayTeam1  = document.getElementById("display-team1");
const displayTeam2  = document.getElementById("display-team2");
const team1Card     = document.getElementById("team1-card");
const team2Card     = document.getElementById("team2-card");
const centerBtn     = document.getElementById("center-btn");
const startRoundBtn = document.getElementById("start-round-btn");
const resultMsg     = document.getElementById("result-msg");

// ── State ─────────────────────────────────────────────────
let currentTeam    = 1;
let seconds        = 10;
let interval       = null;
let waitingToStart = true;

// ── Helpers ───────────────────────────────────────────────
function flash(el) {
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
}

function setActiveTeam(team) {
  currentTeam = team;
  const name = team === 1 ? displayTeam1.textContent : displayTeam2.textContent;
  turnLabel.textContent = `VEZ DO ${name.toUpperCase()}`;
  team1Card.classList.toggle("active", team === 1);
  team2Card.classList.toggle("active", team === 2);
  timerDisplay.classList.remove("danger");
}

// ── Prepare turn (show Start button, pause) ───────────────
function startTurn(team, requireManualStart = false) {
  clearInterval(interval);
  seconds = 10;
  timerDisplay.textContent = seconds;
  timerDisplay.classList.remove("danger");
  setActiveTeam(team);

  if (requireManualStart) {
    centerBtn.disabled = true;
    startRoundBtn.classList.remove("hidden");
    waitingToStart = true;
    return;
  }

  beginCountdown();
}

// ── Begin countdown after Start is pressed ────────────────
function beginCountdown() {
  waitingToStart = false;
  startRoundBtn.classList.add("hidden");
  centerBtn.disabled = false;

  interval = setInterval(() => {
    seconds--;
    timerDisplay.textContent = seconds;

    if (seconds <= 3) timerDisplay.classList.add("danger");

    if (seconds <= 0) {
      clearInterval(interval);
      centerBtn.disabled = true;
      teamLoses(currentTeam);
    }
  }, 1000);
}

// ── Win / Lose ────────────────────────────────────────────
function teamLoses(losingTeam) {
  const loserName  = losingTeam === 1 ? displayTeam1.textContent : displayTeam2.textContent;
  const winnerName = losingTeam === 1 ? displayTeam2.textContent : displayTeam1.textContent;
  showResult(`🏆 ${winnerName} VENCEU!`, `${loserName} não passou a batata a tempo!`);
}

function showResult(title, sub) {
  document.getElementById("result-title").textContent = title;
  resultMsg.textContent = sub;
  gameScreen.classList.add("hidden");
  resultOverlay.classList.remove("hidden");

  setTimeout(() => {
    resultOverlay.classList.add("hidden");
    setupScreen.classList.remove("hidden");
    temaInput.value = "";
    team1Input.value = "";
    team2Input.value = "";
  }, 3500);
}

// ── Setup: start game ─────────────────────────────────────
startGameBtn.addEventListener("click", () => {
  const name1 = team1Input.value.trim() || "Time 1";
  const name2 = team2Input.value.trim() || "Time 2";
  const tema  = temaInput.value.trim();

  displayTeam1.textContent = name1;
  displayTeam2.textContent = name2;

  if (tema) {
    displayTema.textContent = tema;
    temaBanner.classList.remove("hidden");
  } else {
    temaBanner.classList.add("hidden");
  }

  setupScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  startTurn(1, true);
});

// ── Start Round button ────────────────────────────────────
startRoundBtn.addEventListener("click", () => {
  beginCountdown();
});

// ── Center button ─────────────────────────────────────────
centerBtn.addEventListener("click", () => {
  flash(centerBtn);

  const next = currentTeam === 1 ? 2 : 1;
  startTurn(next, false);
});

// ── Keyboard shortcuts ────────────────────────────────────
[team1Input, team2Input, temaInput].forEach(input => {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") startGameBtn.click();
  });
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


