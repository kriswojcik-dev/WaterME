
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
    mealsToday: 0
  };
}

let game = createNewGame();


// CHANGE SCREENS

function showScreen(screenId) {
  const screens = document.querySelectorAll(".screen");

  screens.forEach(function(screen) {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");
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
}


// CHANGE STATS SAFELY

function changeStat(stat, amount) {
  game[stat] += amount;

  // Keep values between 0 and 100
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

  // Maya becomes thirstier and more tired over time
  changeStat("hydration", -3 * hours);
  changeStat("energy", -2 * hours);

  // Low hydration reduces health
  if (game.hydration < 20) {
    changeStat("health", -5);
    updateStatus("Maya is dehydrated and losing health!");
  }

  // Advance the clock
  game.time += hours;

  // Begin a new day after midnight
  while (game.time >= 24) {
    game.time -= 24;
    game.day += 1;
    game.mealsToday = 0;
  }

  updateStats();

  // End the game after Day 7
  if (game.day > 7) {
    endGame();
  }
}


// START GAME

document.getElementById("start-btn").addEventListener(
  "click",
  function() {
    showScreen("game-screen");
    updateStats();
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

    // School lasts 8 hours
    advanceTime(8);
  }
);


// REST BUTTON

document.getElementById("rest-btn").addEventListener(
  "click",
  function() {

    // Restore energy and health
    changeStat("energy", 40);
    changeStat("health", 10);

    // Hydration decreases during overnight sleep
    changeStat("hydration", -24);

    // Rest begins the following morning
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

  // Remember which day the water was collected
  const collectionDay = game.day;

  changeStat("hydration", 30);

  // Track total hours spent collecting water
  game.waterHours += travelTime;

  // Close the water menu
  document.getElementById("water-modal")
    .classList.add("hidden");

  updateStatus(
    "Maya collected water from the " + source + "."
  );

  // Random chance of sickness
  const randomNumber = Math.random();

  if (randomNumber < sicknessChance) {
    changeStat("health", -15);
    changeStat("energy", -20);
    changeStat("mood", -10);

    // Sickness also reduces school progress
    changeStat("schoolProgress", -5);

    // Count each sick day only once
    if (!game.daysSick.includes(collectionDay)) {
      game.daysSick.push(collectionDay);
      game.sickDays += 1;
    }

    showEvent(
      "Maya isn't feeling well. The water from the " +
      source + " may have made her sick.",
      "Health -15, Energy -20, Mood -10, School Progress -5"
    );
  }

  advanceTime(travelTime);
}


// WATER SOURCE BUTTONS

document.getElementById("river-btn").addEventListener(
  "click",
  function() {
    // 60% chance of sickness
    collectWater("river", 2, 0.60);
  }
);

document.getElementById("pump-btn").addEventListener(
  "click",
  function() {
    // 10% chance of sickness
    collectWater("public pump", 0.75, 0.10);
  }
);


// EVENT POP-UP

function showEvent(message, effects) {
  document.getElementById("event-text").textContent =
    message;

  document.getElementById("event-effects").textContent =
    effects;

  document.getElementById("event-modal")
    .classList.remove("hidden");
}

document.getElementById("event-continue-btn").addEventListener(
  "click",
  function() {
    document.getElementById("event-modal")
      .classList.add("hidden");
  }
);


// END THE GAME

function endGame() {

  // Close any open pop-ups
  document.getElementById("event-modal")
    .classList.add("hidden");

  document.getElementById("water-modal")
    .classList.add("hidden");

  // Show classes attended
  document.getElementById("result-classes").textContent =
    game.classesAttended + " / 7";

  // Show water collection time
  document.getElementById("result-water-hours").textContent =
    Math.round(game.waterHours * 100) / 100;

  // Show number of sick days
  document.getElementById("result-sick-days").textContent =
    game.sickDays;

  // Show final school progress
  document.getElementById("result-school").textContent =
    game.schoolProgress + "%";

  // Display win or loss message
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

  // Celebrate only when school progress reaches 100%
  if (game.schoolProgress === 100) {
    celebrateWin();
  }
}


// RESULTS AND COMPARISON SCREEN

document.getElementById("results-continue-btn").addEventListener(
  "click",
  function() {

    document.getElementById("compare-water-time").textContent =
      (Math.round(game.waterHours * 100) / 100) + " hrs";

    document.getElementById("compare-sick-days").textContent =
      game.sickDays;

    document.getElementById("compare-classes").textContent =
      game.classesAttended + "/7";

    showScreen("comparison-screen");
  }
);


// RESET THE GAME

function resetGame() {

  // Remove any remaining confetti
  document.querySelectorAll(".confetti").forEach(
    function(piece) {
      piece.remove();
    }
  );

  // Reset all game variables
  game = createNewGame();

  // Close any open pop-ups
  document.querySelectorAll(".modal").forEach(
    function(modal) {
      modal.classList.add("hidden");
    }
  );

  updateStats();
  updateStatus("Maya is feeling okay.");

  showScreen("game-screen");
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

    // Random horizontal position
    confetti.style.left =
      Math.random() * 100 + "vw";

    // Random confetti color
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    // Random falling speed
    confetti.style.animationDuration =
      (2 + Math.random() * 3) + "s";

    document.body.appendChild(confetti);

    // Remove confetti when animation finishes
    confetti.addEventListener("animationend", function() {
      confetti.remove();
    });
  }
}
