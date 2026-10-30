
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
    sickDays: 0,

    lastSchoolDay: 0,
    daysSick: [],
    mealsToday: 0,

    pumpUnlocked: false,
    cleanWaterUnlocked: false,
    waterTrips: 0,
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
  const screens = document.querySelectorAll(".screen");

  screens.forEach(function(screen) {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");
}


// WATER SOURCE UNLOCK SYSTEM

function updateWaterUnlocks() {

  // Easy and Normal start with Public Pump available
  if (difficulty === "easy" || difficulty === "normal") {
    game.pumpUnlocked = true;
  }

  // Hard unlocks Public Pump at 45% school progress
  if (
    difficulty === "hard" &&
    game.schoolProgress >= 45
  ) {
    game.pumpUnlocked = true;
  }

  // Easy starts with Clean Water available
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

  // Update Public Pump
  const pumpButton =
    document.getElementById("pump-btn");

  const pumpOption =
    document.getElementById("pump-option");

  const pumpStatus =
    document.getElementById("pump-status");

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

  // Update Clean Water Point
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


// UPDATE STATS

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
    String(minutes).padStart(2, "0") +
    " " + ampm;

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

  // Update Maya's message
  const characterMessage =
    document.getElementById("character-message");

  if (game.health < 30) {
    characterMessage.textContent = "I'm feeling really sick...";
  } else if (game.hydration < 20) {
    characterMessage.textContent = "I'm so thirsty...";
  } else if (game.energy < 20) {
    characterMessage.textContent = "I'm exhausted...";
  } else {
    characterMessage.textContent = "Feeling okay!";
  }

  // Check for newly unlocked water sources
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

  // Adjust stat loss based on difficulty
  const statLoss = difficultySettings[difficulty].statLoss;

  changeStat("hydration", -3 * hours * statLoss);
  changeStat("energy", -2 * hours * statLoss);

  // Low hydration reduces health
  if (game.hydration < 20) {
    changeStat("health", -5);
    updateStatus("Maya is dehydrated and losing health!");
  }

  game.time += hours;

  // Begin a new day after midnight
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

    // Create a fresh game for the chosen difficulty
    game = createNewGame();
    gameEnded = false;
    pendingWaterTime = 0;

    document.getElementById("difficulty-display")
      .textContent =
      "Difficulty: " +
      difficulty.charAt(0).toUpperCase() +
      difficulty.slice(1);

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

    // Maya can eat only 3 times each day
    if (game.mealsToday >= 3) {
      updateStatus("Maya has already eaten 3 meals today!");
      return;
    }

    game.mealsToday += 1;

    changeStat("health", 5);
    changeStat("energy", 10);

    updateStatus(
      "Maya ate a meal! Meals today: " +
      game.mealsToday + "/3"
    );

    advanceTime(0.5);
  }
);


// SCHOOL BUTTON

document.getElementById("school-btn").addEventListener(
  "click",
  function() {

    if (gameEnded) return;

    // School can only happen once per day
    if (game.lastSchoolDay === game.day) {
      updateStatus("Maya already attended school today!");
      return;
    }

    // School must begin by 4:00 PM
    if (game.time > 16) {
      updateStatus("It's too late to attend school today!");
      return;
    }

    // Maya must be healthy enough to attend
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

    updateStatus("Maya made it to class today!");

    advanceTime(8);
  }
);


// REST BUTTON

document.getElementById("rest-btn").addEventListener(
  "click",
  function() {

    if (gameEnded) return;

    changeStat("energy", 40);
    changeStat("health", 10);

    // Hydration decreases during overnight rest
    changeStat(
      "hydration",
      -24 * difficultySettings[difficulty].statLoss
    );

    // Rest begins the next morning
    game.day += 1;
    game.time = 8;
    game.mealsToday = 0;

    updateStats();

    if (game.day > 7) {
      endGame();
      return;
    }

    updateStatus(
      "Maya rested overnight and is ready for a new day!"
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

  // Save travel time until Continue is clicked
  pendingWaterTime = travelTime;

  // Increase hydration immediately
  changeStat("hydration", 30);

  // Track total time collecting water
  game.waterHours += travelTime;
  game.waterTrips += 1;

  // Close water selection
  document.getElementById("water-modal")
    .classList.add("hidden");

  // Random chance of sickness
  const randomNumber = Math.random();

  if (randomNumber < sicknessChance) {

    changeStat("health", -15);
    changeStat("energy", -20);
    changeStat("mood", -10);
    changeStat("schoolProgress", -5);

    // Count each sick day only once
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

    // Success popup
    updateStatus(
      "Maya successfully collected water from the " +
      source + "!"
    );

    showEvent(
      "Water Collected Successfully!",
      "Maya collected water from the " + source +
      " without getting sick!",
      "Hydration +30"
    );
  }

  // Time advances after the popup is acknowledged
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

    // Public Pump must be unlocked
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

    // Clean Water Point must be unlocked
    if (!game.cleanWaterUnlocked) return;

    collectWater(
      "clean water point",
      0.25,
      0
    );
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

  // Remove feedback from previous events
  effectsContainer.replaceChildren();

  // Create separate elements for each stat change
  const effectList = effects.split(",");

  effectList.forEach(function(effect) {

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

    // Close the popup
    document.getElementById("event-modal")
      .classList.add("hidden");

    // Remove created feedback elements
    document.getElementById("event-effects")
      .replaceChildren();

    // Advance time after acknowledgment
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

  // Close popups
  document.getElementById("event-modal")
    .classList.add("hidden");

  document.getElementById("water-modal")
    .classList.add("hidden");

  // Show results
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
  } else {
    resultMessage.textContent =
      "Keep Trying! Can you reach 100% next time?";
  }

  showScreen("results-screen");

  // Celebrate only at exactly 100%
  if (game.schoolProgress === 100) {
    celebrateWin();
  }
}


// RESULTS AND COMPARISON SCREEN


// RESULTS AND COMPARISON SCREEN

document.getElementById("results-continue-btn").addEventListener(
  "click",
  function() {

    // Calculate hypothetical clean water collection time
    const cleanWaterHours = game.waterTrips * 0.25;

    // Display actual water collection time
    document.getElementById("compare-water-time").textContent =
      game.waterHours.toFixed(2) + " hrs";

    // Display hypothetical clean water collection time
    document.getElementById("compare-clean-water-time").textContent =
      cleanWaterHours.toFixed(2) + " hrs";

    document.getElementById("compare-sick-days").textContent =
      game.sickDays;

    document.getElementById("compare-classes").textContent =
      game.classesAttended + "/7";

    showScreen("comparison-screen");
  }
);



// RESET THE GAME

function resetGame() {

  // Remove remaining confetti
  document.querySelectorAll(".confetti").forEach(
    function(piece) {
      piece.remove();
    }
  );

  // Reset game variables
  game = createNewGame();
  pendingWaterTime = 0;
  gameEnded = false;

  // Close open modals
  document.querySelectorAll(".modal").forEach(
    function(modal) {
      modal.classList.add("hidden");
    }
  );

  // Clear event feedback
  document.getElementById("event-effects")
    .replaceChildren();

  // Reset difficulty selection
  difficulty = "normal";

  document.getElementById("difficulty-select").value =
    "normal";

  document.getElementById("difficulty-description")
    .textContent =
    "Balanced gameplay. Clean water unlocks at 80% school progress.";

  document.getElementById("difficulty-display")
    .textContent = "Difficulty: Normal";

  // Reset stats and status
  updateStats();
  updateStatus("Maya is feeling okay.");

  // Return to difficulty selection
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

  // Create 60 pieces of confetti
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

updateStats();
