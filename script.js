
// WATER ME - GAME JAVASCRIPT

// GAME VARIABLES

function createNewGame() {
  return {
    day: 1,
    time: 8,

    hydration: 70,
    health: 80,
    energy: 60,
    mood: 70,
    schoolProgress: 10,

    classesAttended: 0,
    waterHours: 0,
    waterTrips: 0,
    sickDays: 0,

    lastSchoolDay: 0,
    daysSick: [],
    mealsToday: 0,

    pumpUnlocked: false,
    cleanWaterUnlocked: false,
    achievedMilestones: []
  };
}

let game = createNewGame();
let pendingWaterTime = 0;
let gameEnded = false;


// DIFFICULTY SETTINGS

const difficultySettings = {
  easy: {
    riverRisk: 0.30,
    pumpRisk: 0.05,
    statLoss: 0.75
  },

  normal: {
    riverRisk: 0.60,
    pumpRisk: 0.10,
    statLoss: 1
  },

  hard: {
    riverRisk: 0.80,
    pumpRisk: 0.25,
    statLoss: 1.5
  }
};

let difficulty = "normal";


// SOUND EFFECTS

const sounds = {
  water: new Audio("sounds/water.mp3"),
  success: new Audio("sounds/success.mp3")
};

sounds.water.volume = 0.35;
sounds.success.volume = 0.45;

function playSound(name) {
  const sound = sounds[name];

  if (!sound) return;

  sound.pause();
  sound.currentTime = 0;

  const playback = sound.play();

  if (playback) {
    playback.catch(function() {
      // Gameplay continues even if audio cannot play.
    });
  }
}


// SCHOOL PROGRESS MILESTONES

const milestones = [
  {
    score: 25,
    title: "Great Start!",
    message: "Maya is making progress toward her education."
  },
  {
    score: 45,
    title: "Keep Going!",
    message: "Maya's hard work is paying off."
  },
  {
    score: 60,
    title: "Over Halfway There!",
    message: "Maya is getting closer to her goal."
  },
  {
    score: 80,
    title: "Almost There!",
    message: "Maya is so close to completing her education goal."
  },
  {
    score: 100,
    title: "Goal Achieved!",
    message: "Maya reached her education goal!"
  }
];


// CREATE MILESTONE PANEL

const milestonePanel = document.createElement("section");
milestonePanel.id = "milestone-panel";

const milestoneHeading = document.createElement("h3");
milestoneHeading.textContent = "🏆 Achievements";

const milestoneList = document.createElement("div");
milestoneList.id = "milestone-list";
milestoneList.setAttribute("aria-live", "polite");

milestonePanel.appendChild(milestoneHeading);
milestonePanel.appendChild(milestoneList);


// MOVE STATUS ABOVE BUTTONS

const statusBox = document.querySelector(".status-box");
const actionGrid = document.querySelector(
  "#game-screen .action-grid"
);

actionGrid.insertAdjacentElement("beforebegin", statusBox);


// PLACE ACHIEVEMENTS BELOW BUTTONS

actionGrid.insertAdjacentElement("afterend", milestonePanel);


// UPDATE MILESTONE DISPLAY

function updateMilestoneDisplay() {
  milestoneList.replaceChildren();

  if (game.achievedMilestones.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.id = "milestone-empty";
    emptyMessage.textContent =
      "Attend school to earn achievements!";

    milestoneList.appendChild(emptyMessage);
    return;
  }

  game.achievedMilestones.forEach(function(score, index) {
    const milestone = milestones.find(function(item) {
      return item.score === score;
    });

    if (!milestone) return;

    const item = document.createElement("div");
    item.classList.add("milestone-item");

    if (index === game.achievedMilestones.length - 1) {
      item.classList.add("latest");
    }

    const title = document.createElement("strong");
    title.textContent =
      milestone.score + "% — " + milestone.title;

    const message = document.createElement("span");
    message.textContent = milestone.message;

    item.appendChild(title);
    item.appendChild(message);

    milestoneList.appendChild(item);
  });
}


// CHECK FOR NEW MILESTONES

function checkMilestones() {
  let newMilestone = null;

  milestones.forEach(function(milestone) {
    const reached =
      game.schoolProgress >= milestone.score;

    const alreadyEarned =
      game.achievedMilestones.includes(milestone.score);

    if (reached && !alreadyEarned) {
      game.achievedMilestones.push(milestone.score);
      newMilestone = milestone;
    }
  });

  if (newMilestone) {
    updateMilestoneDisplay();
    playSound("success");

    updateStatus(
      "🏆 " + newMilestone.title + " " +
      newMilestone.message
    );
  }
}


// UPDATE DIFFICULTY SELECTION

document.getElementById("difficulty-select").addEventListener(
  "change",
  function() {
    difficulty = this.value;

    const descriptions = {
      easy:
        "All water sources available immediately, with lower sickness risks.",

      normal:
        "River and Public Pump available. Clean Water unlocks at 80% school progress.",

      hard:
        "Start with River only. Public Pump unlocks at 45% and Clean Water at 80%."
    };

    document.getElementById("difficulty-description")
      .textContent = descriptions[difficulty];
  }
);


// CHANGE SCREENS

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(
    function(screen) {
      screen.classList.remove("active");
    }
  );

  document.getElementById(screenId).classList.add("active");
}


// WATER SOURCE UNLOCK SYSTEM

function updateWaterUnlocks() {

  // Easy and Normal begin with Public Pump
  if (difficulty === "easy" || difficulty === "normal") {
    game.pumpUnlocked = true;
  }

  // Hard unlocks Public Pump at 45%
  if (
    difficulty === "hard" &&
    game.schoolProgress >= 45
  ) {
    game.pumpUnlocked = true;
  }

  // Easy begins with Clean Water
  if (difficulty === "easy") {
    game.cleanWaterUnlocked = true;
  }

  // Normal and Hard unlock Clean Water at 80%
  if (
    difficulty !== "easy" &&
    game.schoolProgress >= 80
  ) {
    game.cleanWaterUnlocked = true;
  }

  // Public Pump display
  const pumpButton = document.getElementById("pump-btn");
  const pumpOption = document.getElementById("pump-option");
  const pumpStatus = document.getElementById("pump-status");

  pumpButton.disabled = !game.pumpUnlocked;

  if (game.pumpUnlocked) {
    pumpButton.textContent = "Select";
    pumpOption.classList.remove("locked-option");
    pumpStatus.textContent = "Available";
  } else {
    pumpButton.textContent = "Locked";
    pumpOption.classList.add("locked-option");
    pumpStatus.textContent =
      "Unlocks at 45% school progress.";
  }

  // Clean Water Point display
  const cleanButton =
    document.getElementById("clean-water-btn");

  const cleanOption =
    document.getElementById("clean-water-option");

  const cleanStatus =
    document.getElementById("clean-water-status");

  cleanButton.disabled = !game.cleanWaterUnlocked;

  if (game.cleanWaterUnlocked) {
    cleanButton.textContent = "Select";
    cleanOption.classList.remove("locked-option");
    cleanStatus.textContent = "Unlocked!";
  } else {
    cleanButton.textContent = "Locked";
    cleanOption.classList.add("locked-option");
    cleanStatus.textContent =
      "Unlocks at 80% school progress.";
  }
}


// UPDATE STATS AND MAYA'S EXPRESSION

function updateStats() {
  const stats = ["hydration", "health", "energy", "mood"];

  stats.forEach(function(stat) {
    document.getElementById(stat + "-value").textContent =
      Math.round(game[stat]) + "%";

    document.getElementById(stat + "-bar").value =
      game[stat];
  });

  document.getElementById("school-value").textContent =
    game.schoolProgress + "%";

  document.getElementById("school-bar").value =
    game.schoolProgress;

  document.getElementById("day-display").textContent =
    Math.min(game.day, 7);

  // Update clock
  const hours = Math.floor(game.time);
  const minutes = Math.round((game.time - hours) * 60);
  const displayHour = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";

  document.getElementById("time-display").textContent =
    displayHour + ":" +
    String(minutes).padStart(2, "0") + " " + ampm;

  // Update time of day
  let period = "Morning";

  if (game.time >= 12 && game.time < 17) {
    period = "Afternoon";
  } else if (game.time >= 17) {
    period = "Evening";
  } else if (game.time < 6) {
    period = "Night";
  }

  document.getElementById("period-display").textContent =
    period;

  // Determine Maya's face and message
  const characterMessage =
    document.getElementById("character-message");

  const characterAvatar =
    document.getElementById("character-avatar");

  const eventAvatar =
    document.getElementById("event-avatar");

  let face = "(^‿^)";
  let message = "I'm feeling great!";

  // Physical condition takes priority over mood
  if (game.health < 30) {
    face = "(×_×)";
    message = "I'm feeling really sick!";

  } else if (game.hydration < 20) {
    face = "(>_<)";
    message = "I'm so thirsty...";

  } else if (game.energy < 20) {
    face = "(-_-)";
    message = "I'm exhausted...";

  // Mood determines the normal expression
  } else if (game.mood < 40) {
    face = "(._.)";
    message = "I'm feeling a little down...";

  } else if (game.mood < 70) {
    face = "(•‿•)";
    message = "I'm doing okay!";

  } else {
    face = "(^‿^)";
    message = "I'm feeling great!";
  }

  // Update Maya on the game screen
  characterAvatar.textContent = face + "\n/|\\";

  characterMessage.textContent = message;

  // Match the avatar in the event popup
  eventAvatar.textContent = face + "\n/|\\";

  updateWaterUnlocks();
}


// CHANGE STATS SAFELY

function changeStat(stat, amount) {
  game[stat] += amount;
  game[stat] = Math.max(0, Math.min(100, game[stat]));
  updateStats();
}


// UPDATE STATUS

function updateStatus(message) {
  document.getElementById("status-message").textContent =
    message;
}


// ADVANCE TIME

function advanceTime(hours) {
  const statLoss = difficultySettings[difficulty].statLoss;

  changeStat("hydration", -3 * hours * statLoss);
  changeStat("energy", -2 * hours * statLoss);

  if (game.hydration < 20) {
    changeStat("health", -5);
    updateStatus("Maya is dehydrated and losing health!");
  }

  game.time += hours;

  while (game.time >= 24) {
    game.time -= 24;
    game.day += 1;
    game.mealsToday = 0;
  }

  updateStats();

  if (game.day > 7) {
    endGame();
  }
}


// START GAME

document.getElementById("start-btn").addEventListener(
  "click",
  function() {
    difficulty =
      document.getElementById("difficulty-select").value;

    game = createNewGame();
    gameEnded = false;
    pendingWaterTime = 0;

    document.getElementById("difficulty-display")
      .textContent =
      "Difficulty: " +
      difficulty.charAt(0).toUpperCase() +
      difficulty.slice(1);

    updateMilestoneDisplay();
    updateStats();
    updateStatus("Maya is feeling okay.");

    showScreen("game-screen");
  }
);


// HOW TO PLAY

document.getElementById("how-to-btn").addEventListener(
  "click",
  function() {
    document.getElementById("how-to-modal")
      .classList.remove("hidden");
  }
);

document.getElementById("got-it-btn").addEventListener(
  "click",
  function() {
    document.getElementById("how-to-modal")
      .classList.add("hidden");
  }
);


// EAT BUTTON

document.getElementById("eat-btn").addEventListener(
  "click",
  function() {
    if (gameEnded) return;

    // Limit eating to 3 meals per day
    if (game.mealsToday >= 3) {
      updateStatus("Maya has already eaten 3 meals today!");
      return;
    }

    game.mealsToday += 1;

    changeStat("health", 5);
    changeStat("energy", 10);

    // Eating improves Maya's mood
    changeStat("mood", 3);

    updateStatus(
      "Maya ate a meal! Health +5, Energy +10, Mood +3. " +
      "Meals today: " + game.mealsToday + "/3"
    );

    advanceTime(0.5);
  }
);


// SCHOOL BUTTON

document.getElementById("school-btn").addEventListener(
  "click",
  function() {
    if (gameEnded) return;

    if (game.lastSchoolDay === game.day) {
      updateStatus("Maya already attended school today!");
      return;
    }

    if (game.time > 16) {
      updateStatus("It's too late to attend school today!");
      return;
    }

    if (
      game.energy < 20 ||
      game.hydration < 20 ||
      game.health < 30
    ) {
      updateStatus(
        "Maya is not healthy enough to attend school!"
      );
      return;
    }

    game.lastSchoolDay = game.day;
    game.classesAttended += 1;

    changeStat("schoolProgress", 15);
    changeStat("mood", 5);
    changeStat("energy", -20);
    changeStat("hydration", -20);

    updateStatus(
      "Maya attended school! School Progress +15, Mood +5."
    );

    advanceTime(8);

    // Check milestones after school is completed
    checkMilestones();
  }
);


// REST BUTTON

document.getElementById("rest-btn").addEventListener(
  "click",
  function() {
    if (gameEnded) return;

    changeStat("energy", 40);
    changeStat("health", 10);

    // Rest improves Maya's mood
    changeStat("mood", 5);

    // Hydration decreases overnight
    changeStat(
      "hydration",
      -24 * difficultySettings[difficulty].statLoss
    );

    game.day += 1;
    game.time = 8;
    game.mealsToday = 0;

    updateStats();

    if (game.day > 7) {
      endGame();
      return;
    }

    updateStatus(
      "Maya rested overnight! Energy +40, Health +10, Mood +5."
    );
  }
);


// WATER MENU

document.getElementById("water-btn").addEventListener(
  "click",
  function() {
    if (gameEnded) return;

    updateWaterUnlocks();

    document.getElementById("water-modal")
      .classList.remove("hidden");
  }
);

document.getElementById("cancel-water-btn").addEventListener(
  "click",
  function() {
    document.getElementById("water-modal")
      .classList.add("hidden");
  }
);


// COLLECT WATER

function collectWater(source, travelTime, sicknessChance) {
  if (gameEnded || pendingWaterTime > 0) return;

  const collectionDay = game.day;
  const isCleanWater = source === "clean water point";

  // Save travel time until Continue is clicked
  pendingWaterTime = travelTime;

  changeStat("hydration", 30);

  // Clean water improves Maya's mood
  if (isCleanWater) {
    changeStat("mood", 5);
  }

  game.waterHours += travelTime;
  game.waterTrips += 1;

  document.getElementById("water-modal")
    .classList.add("hidden");

  playSound("water");

  // Determine whether Maya becomes sick
  if (Math.random() < sicknessChance) {

    changeStat("health", -15);
    changeStat("energy", -20);
    changeStat("mood", -10);
    changeStat("schoolProgress", -5);

    if (!game.daysSick.includes(collectionDay)) {
      game.daysSick.push(collectionDay);
      game.sickDays += 1;
    }

    updateStatus(
      "Maya became sick after drinking water from the " +
      source + "."
    );

    showEvent(
      "Maya Isn't Feeling Well!",
      "Maya collected water from the " + source +
      ", but the water may have made her sick.",
      "Hydration +30, Health -15, Energy -20, " +
      "Mood -10, School Progress -5"
    );

  } else {

    const effects = isCleanWater
      ? "Hydration +30, Mood +5"
      : "Hydration +30";

    updateStatus(
      "Maya successfully collected water from the " +
      source + "!"
    );

    showEvent(
      "Water Collected Successfully!",
      "Maya collected water from the " + source +
      " without getting sick!",
      effects
    );
  }
}


// WATER SOURCE BUTTONS

document.getElementById("river-btn").addEventListener(
  "click",
  function() {
    collectWater(
      "river",
      2,
      difficultySettings[difficulty].riverRisk
    );
  }
);

document.getElementById("pump-btn").addEventListener(
  "click",
  function() {
    if (!game.pumpUnlocked) return;

    collectWater(
      "public pump",
      0.75,
      difficultySettings[difficulty].pumpRisk
    );
  }
);

document.getElementById("clean-water-btn").addEventListener(
  "click",
  function() {
    if (!game.cleanWaterUnlocked) return;

    collectWater("clean water point", 0.25, 0);
  }
);


// DYNAMIC EVENT POPUP

function showEvent(title, message, effects) {
  document.getElementById("event-heading").textContent =
    title;

  document.getElementById("event-text").textContent =
    message;

  const effectsContainer =
    document.getElementById("event-effects");

  effectsContainer.replaceChildren();

  effects.split(",").forEach(function(effect) {
    const effectElement = document.createElement("p");

    effectElement.classList.add("event-effect");
    effectElement.textContent = effect.trim();

    effectsContainer.appendChild(effectElement);
  });

  document.getElementById("event-modal")
    .classList.remove("hidden");
}


// EVENT CONTINUE BUTTON

document.getElementById("event-continue-btn").addEventListener(
  "click",
  function() {
    document.getElementById("event-modal")
      .classList.add("hidden");

    document.getElementById("event-effects")
      .replaceChildren();

    if (pendingWaterTime > 0) {
      const hours = pendingWaterTime;
      pendingWaterTime = 0;
      advanceTime(hours);
    }
  }
);


// END THE GAME

function endGame() {
  if (gameEnded) return;

  gameEnded = true;
  pendingWaterTime = 0;

  document.getElementById("event-modal")
    .classList.add("hidden");

  document.getElementById("water-modal")
    .classList.add("hidden");

  document.getElementById("result-classes").textContent =
    game.classesAttended + " / 7";

  document.getElementById("result-water-hours").textContent =
    Math.round(game.waterHours * 100) / 100;

  document.getElementById("result-sick-days").textContent =
    game.sickDays;

  document.getElementById("result-school").textContent =
    game.schoolProgress + "%";

  const resultMessage =
    document.getElementById("result-message");

  if (game.schoolProgress === 100) {
    resultMessage.textContent =
      "You Win! Maya reached 100% school progress!";

    playSound("success");
  } else {
    resultMessage.textContent =
      "Keep Trying! Can you reach 100% next time?";
  }

  showScreen("results-screen");

  if (game.schoolProgress === 100) {
    celebrateWin();
  }
}


// RESULTS AND COMPARISON SCREEN

document.getElementById("results-continue-btn").addEventListener(
  "click",
  function() {

    const cleanWaterHours = game.waterTrips * 0.25;

    document.getElementById("compare-water-time").textContent =
      game.waterHours.toFixed(2) + " hrs";

    document.getElementById("compare-sick-days").textContent =
      game.sickDays;

    document.getElementById("compare-classes").textContent =
      game.classesAttended + "/7";

    const cleanWaterElement =
      document.getElementById("compare-clean-water-time");

    if (cleanWaterElement) {
      cleanWaterElement.textContent =
        cleanWaterHours.toFixed(2) + " hrs";
    }

    showScreen("comparison-screen");
  }
);


// RESET THE GAME

function resetGame() {

  document.querySelectorAll(".confetti").forEach(
    function(piece) {
      piece.remove();
    }
  );

  game = createNewGame();
  pendingWaterTime = 0;
  gameEnded = false;

  document.querySelectorAll(".modal").forEach(
    function(modal) {
      modal.classList.add("hidden");
    }
  );

  document.getElementById("event-effects")
    .replaceChildren();

  // Return difficulty to Normal
  difficulty = "normal";

  document.getElementById("difficulty-select").value =
    "normal";

  document.getElementById("difficulty-description")
    .textContent =
    "Balanced gameplay. Clean water unlocks at 80% school progress.";

  document.getElementById("difficulty-display")
    .textContent = "Difficulty: Normal";

  updateMilestoneDisplay();
  updateStats();
  updateStatus("Maya is feeling okay.");

  // Return to the difficulty selection screen
  showScreen("start-screen");
}


// PLAY AGAIN BUTTON

document.getElementById("play-again-btn").addEventListener(
  "click",
  function() {
    resetGame();
  }
);


// RESET BUTTON

document.getElementById("reset-btn").addEventListener(
  "click",
  function() {

    const confirmReset = confirm(
      "Are you sure you want to restart the game?"
    );

    if (confirmReset) {
      resetGame();
    }
  }
);


// CONFETTI CELEBRATION

function celebrateWin() {
  const colors = [
    "#FFC907",
    "#003366",
    "#77A8BB",
    "#FF7F50",
    "#5AAD85"
  ];

  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");

    confetti.classList.add("confetti");

    confetti.style.left =
      Math.random() * 100 + "vw";

    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    confetti.style.animationDuration =
      (2 + Math.random() * 3) + "s";

    document.body.appendChild(confetti);

    confetti.addEventListener("animationend", function() {
      confetti.remove();
    });
  }
}


// INITIAL DISPLAY

updateMilestoneDisplay();
updateStats();
