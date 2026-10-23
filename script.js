
 // WATER ME - GAME JAVASCRIPT

// CREATE GAME VARIABLES

let game = {
  day: 1,
  time: 8, // 8:00 AM

  hydration: 70,
  health: 80,
  energy: 60,
  mood: 70,
  schoolProgress: 10,

  classesAttended: 0,
  waterHours: 0,
  sickDays: 0
};


// FUNCTION TO CHANGE SCREENS

function showScreen(screenId) {
  // Find all sections with the class "screen"
  const screens = document.querySelectorAll(".screen");

  // Hide each screen
  screens.forEach(function(screen) {
    screen.classList.remove("active");
  });

  // Show the screen we want
  document.getElementById(screenId).classList.add("active");
}


// FUNCTION TO UPDATE STATS

function updateStats() {
  const stats = [
    "hydration",
    "health",
    "energy",
    "mood"
  ];

  stats.forEach(function(stat) {
    // Update the percentage text
    document.getElementById(stat + "-value").textContent =
      game[stat] + "%";

    // Update the progress bar
    document.getElementById(stat + "-bar").value =
      game[stat];
  });

  // Update school progress
  document.getElementById("school-value").textContent =
    game.schoolProgress + "%";

  document.getElementById("school-bar").value =
    game.schoolProgress;

  // Update the day
  document.getElementById("day-display").textContent =
    game.day;

  // Update the clock
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
  }

  document.getElementById("period-display").textContent =
    period;
}


// MAKE THE START BUTTON WORK

document.getElementById("start-btn").addEventListener(
  "click",
  function() {
    showScreen("game-screen");
    updateStats();
  }
);


// MAKE HOW TO PLAY WORK

document.getElementById("how-to-btn").addEventListener(
  "click",
  function() {
    document.getElementById("how-to-modal")
      .classList.remove("hidden");
  }
);


// MAKE GOT IT WORK

document.getElementById("got-it-btn").addEventListener(
  "click",
  function() {
    document.getElementById("how-to-modal")
      .classList.add("hidden");
  }
);


 // CHANGE STATS SAFELY

function changeStat(stat, amount) {
  game[stat] += amount;

  // Keep stats between 0 and 100
  game[stat] = Math.max(0, Math.min(100, game[stat]));

  updateStats();
}


// UPDATE MAYA'S STATUS MESSAGE

function updateStatus(message) {
  document.getElementById("status-message").textContent =
    message;
}


// ADVANCE GAME TIME

function advanceTime(hours) {
  game.time += hours;

  // Convert time to a 24-hour clock
  if (game.time >= 24) {
    game.time = game.time % 24;
    game.day += 1;
  }

  updateStats();
}


// EAT BUTTON

document.getElementById("eat-btn").addEventListener(
  "click",
  function() {
    changeStat("health", 5);
    changeStat("energy", 10);

    advanceTime(0.5);

    updateStatus("Maya ate a meal and feels better!");
  }
);


// SCHOOL BUTTON

document.getElementById("school-btn").addEventListener(
  "click",
  function() {
    changeStat("schoolProgress", 15);
    changeStat("mood", 5);
    changeStat("energy", -20);
    changeStat("hydration", -20);

    game.classesAttended += 1;

    advanceTime(8);

    updateStatus("Maya attended school today!");
  }
);


// REST BUTTON

document.getElementById("rest-btn").addEventListener(
  "click",
  function() {
    changeStat("energy", 40);
    changeStat("health", 10);

    // Rest takes 8 hours
    advanceTime(8);

    // Begin the next day at 8:00 AM
    game.day += 1;
    game.time = 8;

    updateStats();

    updateStatus("Maya rested and is ready for a new day!");
  }
);


// OPEN THE WATER MENU

document.getElementById("water-btn").addEventListener(
  "click",
  function() {
    document.getElementById("water-modal")
      .classList.remove("hidden");
  }
);


// CLOSE THE WATER MENU

document.getElementById("cancel-water-btn").addEventListener(
  "click",
  function() {
    document.getElementById("water-modal")
      .classList.add("hidden");
  }
);


// CREATE A WATER COLLECTION FUNCTION

function collectWater(source, travelTime, sicknessChance) {

  // Increase hydration
  changeStat("hydration", 30);

  // Track total hours spent collecting water
  game.waterHours += travelTime;

  // Advance the game clock
  advanceTime(travelTime);

  // Close the water menu
  document.getElementById("water-modal")
    .classList.add("hidden");

  // Determine if Maya gets sick
  let randomNumber = Math.random();

  if (randomNumber < sicknessChance) {
    changeStat("health", -15);
    changeStat("energy", -20);
    changeStat("mood", -10);

    game.sickDays += 1;

    showEvent(
      "Maya isn't feeling well. The water from the " +
      source + " may have made her sick.",
      "Health -15, Energy -20, Mood -10"
    );

  } else {
    updateStatus(
      "Maya collected water from the " + source + "."
    );
  }
}


// MAKE THE RIVER BUTTON WORK

document.getElementById("river-btn").addEventListener(
  "click",
  function() {
    collectWater("river", 2, 0.60);
  }
);


// MAKE THE PUBLIC PUMP BUTTON WORK

document.getElementById("pump-btn").addEventListener(
  "click",
  function() {
    collectWater("public pump", 0.75, 0.10);
  }
);


// DISPLAY AN EVENT POP-UP

function showEvent(message, effects) {

  document.getElementById("event-text").textContent =
    message;

  document.getElementById("event-effects").textContent =
    effects;

  document.getElementById("event-modal")
    .classList.remove("hidden");
}


// CLOSE THE EVENT POP-UP

document.getElementById("event-continue-btn").addEventListener(
  "click",
  function() {
    document.getElementById("event-modal")
      .classList.add("hidden");

    updateStats();
  }
);
