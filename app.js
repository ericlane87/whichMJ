const levels = [
  {
    title: "Warm-Up",
    prompt: "A character spins, plants one foot, then launches upward for a thunderous rim finish. Which MJ fits best?",
    answer: "jordan",
    success: "Court MJ is right. Big-air attack and rim pressure belong to the basketball side.",
    fail: "That move reads like court dominance, not stage choreography.",
    notes: [
      "Start with obvious move language so the player learns the joke immediately.",
      "Each correct answer should feel fast and satisfying.",
      "Use short text rounds before adding timed or animated rounds."
    ]
  },
  {
    title: "Spotlight Check",
    prompt: "The silhouette leans forward, snaps into a precise pose, and glides backward as the crowd loses it. Which MJ is this?",
    answer: "jackson",
    success: "Stage MJ is right. Precision pose plus glide energy points to the dance side.",
    fail: "Backward glide and performance drama are stage clues.",
    notes: [
      "Level 2 teaches players to read rhythm and theatricality.",
      "Dance rounds should feel stylish rather than violent.",
      "Visual staging can become a stronger clue later."
    ]
  },
  {
    title: "Fake-Out",
    prompt: "This MJ uses fast footwork, pivots hard, then leaves a defender frozen before striking a winning pose. Who is it?",
    answer: "jordan",
    success: "Court MJ again. The defender clue makes this a sports fake-out, even with the pose language.",
    fail: "The pose is bait. The defender and pivot language push it to basketball.",
    notes: [
      "This is the first mixed-clue round.",
      "Good levels create tension by borrowing words from the other MJ.",
      "Difficulty should come from overlap, not randomness."
    ]
  },
  {
    title: "Rhythm Trap",
    prompt: "A crowd gathers as this MJ slides sideways, taps the hat brim, then freezes long enough for the beat to punch through. Which one?",
    answer: "jackson",
    success: "Stage MJ is correct. The beat, freeze, and crowd-performance phrasing are the signal.",
    fail: "This level is about showmanship and timing, not sports pressure.",
    notes: [
      "Level 4 leans into iconic stage punctuation.",
      "Use simple costume silhouettes later, but keep them parody-safe.",
      "Player confidence should wobble a little here."
    ]
  },
  {
    title: "Arena Noise",
    prompt: "The move begins with a shoulder fake, turns into a clean drive lane, and ends at the hoop while the arena erupts. Which MJ?",
    answer: "jordan",
    success: "Court MJ is right. Drive lane and hoop are direct basketball tells.",
    fail: "Arena language can apply to concerts too, but hoop language settles it.",
    notes: [
      "Midgame rounds should reward reading the strongest noun, not every adjective.",
      "A timed bonus could start here in a later version.",
      "Scoring can add combo points after three correct picks."
    ]
  },
  {
    title: "Moonstep",
    prompt: "This MJ barely seems to touch the floor, drifting through the light while backup performers hit sharp accents around them. Which MJ?",
    answer: "jackson",
    success: "Stage MJ is right. Floating stage movement plus backup performers makes it clear.",
    fail: "The lighting and performer framing make this a dance round.",
    notes: [
      "This round can become the first animated level later.",
      "Add stage lights or beat pulses in version two.",
      "The player should now recognize both silhouettes instantly."
    ]
  },
  {
    title: "Championship Pressure",
    prompt: "The clock is almost out. This MJ rises over a defender, hangs in the air, and releases the winning shot. Which one?",
    answer: "jordan",
    success: "Court MJ is correct. Clutch shot creation is basketball MJ territory.",
    fail: "Hang time can sound dance-like, but the defender and winning shot decide it.",
    notes: [
      "Late-game levels should feel dramatic and specific.",
      "This is where audio stings would help a lot.",
      "Failure feedback should explain the clue logic."
    ]
  },
  {
    title: "Final Encore",
    prompt: "A spotlight snaps on. This MJ turns, locks into a razor-sharp pose, then explodes into a sequence built around rhythm and crowd reaction. Which MJ?",
    answer: "jackson",
    success: "Stage MJ closes it out. Crowd-controlled rhythm and signature posing belong to the dance side.",
    fail: "The final round is all performance command and musical timing.",
    notes: [
      "The finale should feel like a boss stage even without combat.",
      "After this, show a rank screen: Rookie, All-Star, or Legend.",
      "Future expansion can add versus mode and endless remix mode."
    ]
  }
];

const state = {
  index: 0,
  score: 0,
  lives: 3,
  locked: false,
  finished: false
};

const levelTitle = document.getElementById("levelTitle");
const scoreValue = document.getElementById("scoreValue");
const livesValue = document.getElementById("livesValue");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const promptTitle = document.getElementById("promptTitle");
const promptText = document.getElementById("promptText");
const feedbackText = document.getElementById("feedbackText");
const nextButton = document.getElementById("nextButton");
const designNotes = document.getElementById("designNotes");
const choiceButtons = [...document.querySelectorAll(".choice-btn")];

function renderLevel() {
  const level = levels[state.index];
  const currentNumber = Math.min(state.index + 1, levels.length);

  levelTitle.textContent = `${currentNumber}`;
  scoreValue.textContent = `${state.score}`;
  livesValue.textContent = `${state.lives}`;
  progressText.textContent = `${currentNumber} / ${levels.length}`;
  progressFill.style.width = `${(state.index / levels.length) * 100}%`;

  promptTitle.textContent = state.finished ? "Run Complete" : `${level.title}: Which MJ?`;
  promptText.textContent = state.finished
    ? getEndingText()
    : level.prompt;

  feedbackText.textContent = state.finished
    ? "Restart the page to run the challenge again."
    : "Choose the better match.";
  feedbackText.className = "feedback";

  nextButton.disabled = true;
  nextButton.textContent = state.finished ? "Complete" : "Next Level";

  choiceButtons.forEach((button) => {
    button.disabled = state.finished;
    button.textContent = button.dataset.choice === "jordan" ? "Pick Court MJ" : "Pick Stage MJ";
  });

  designNotes.innerHTML = "";
  (state.finished ? getEndNotes() : level.notes).forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    designNotes.appendChild(item);
  });
}

function getEndingText() {
  if (state.lives <= 0) {
    return "The run ends here. The concept works best when losses still teach the clue language, so the retry should feel inviting rather than punishing.";
  }

  if (state.score === levels.length) {
    return "Perfect read. You cleared every round and proved the Which MJ hook can sustain a fast browser game with escalating clue design.";
  }

  return "You cleared the first campaign. The next step is adding animation, sound, and harder mixed-clue rounds.";
}

function getEndNotes() {
  return [
    "Phase 2 should add a countdown timer and combo multiplier.",
    "Phase 3 can introduce moving silhouettes and short sound cues.",
    "Phase 4 can add endless remix mode with randomized clue packs."
  ];
}

function handleChoice(choice) {
  if (state.locked || state.finished) {
    return;
  }

  const level = levels[state.index];
  const correct = choice === level.answer;
  state.locked = true;

  if (correct) {
    state.score += 1;
    feedbackText.textContent = level.success;
    feedbackText.className = "feedback good";
  } else {
    state.lives -= 1;
    feedbackText.textContent = level.fail;
    feedbackText.className = "feedback bad";
  }

  choiceButtons.forEach((button) => {
    const isCorrect = button.dataset.choice === level.answer;
    if (isCorrect) {
      button.textContent = `${button.textContent} ✓`;
    } else if (button.dataset.choice === choice) {
      button.textContent = `${button.textContent} ✕`;
    }
    button.disabled = true;
  });

  progressFill.style.width = `${((state.index + 1) / levels.length) * 100}%`;

  if (state.lives <= 0 || state.index === levels.length - 1) {
    state.finished = true;
  }

  nextButton.disabled = false;
}

function nextLevel() {
  if (!state.locked) {
    return;
  }

  if (state.finished) {
    renderLevel();
    return;
  }

  state.index += 1;
  state.locked = false;
  choiceButtons.forEach((button) => {
    button.disabled = false;
  });
  renderLevel();
}

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => handleChoice(button.dataset.choice));
});

nextButton.addEventListener("click", nextLevel);

renderLevel();
