// main.js - initialization and coordination

// Initialize the app
function init() {
  // Try loading from localStorage first
  const hasLocalData = loadFromLocalStorage();

  if (hasLocalData) {
    // Use localStorage data
    renderPeople();
  } else if (typeof scheduleData !== "undefined") {
    // Load from data.js if no localStorage
    loadFromData(scheduleData);
  } else {
    // Default initialization
    addPerson("You");
  }

  renderSelectedIndicator();
  renderMinimumLengthIndicator();
}

// Initialize when DOM is ready
init();
