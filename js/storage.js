// storage.js - localStorage operations

const STORAGE_KEY = 'whenCanWeHang_data';

// Save to localStorage
function saveToLocalStorage() {
  const data = {
    people: people,
    personIdCounter: personIdCounter
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load from localStorage
function loadFromLocalStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    people = data.people || [];
    personIdCounter = data.personIdCounter || 0;
    return true;
  }
  return false;
}

// Clear localStorage (useful for reset)
function clearLocalStorage() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}
