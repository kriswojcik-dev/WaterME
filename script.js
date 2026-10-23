
 // WATER ME - GAME JAVASCRIPT

// STEP 1: CREATE OUR GAME VARIABLES

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


// STEP 2: CREATE A FUNCTION TO CHANGE SCREENS

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


// STEP 3: CREATE A FUNCTION TO UPDATE STATS

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


// STEP 4: MAKE THE START BUTTON WORK

document.getElementById("start-btn").addEventListener(
  "click",
  function() {
    showScreen("game-screen");
    updateStats();
  }
);


// STEP 5: MAKE HOW TO PLAY WORK

document.getElementById("how-to-btn").addEventListener(
  "click",
  function() {
    document.getElementById("how-to-modal")
      .classList.remove("hidden");
  }
);


// STEP 6: MAKE GOT IT WORK

document.getElementById("got-it-btn").addEventListener(
  "click",
  function() {
    document.getElementById("how-to-modal")
      .classList.add("hidden");
  }
);
