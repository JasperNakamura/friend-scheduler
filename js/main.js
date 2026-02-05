// Data structure to hold people and their available times
let people = [];
let personIdCounter = 0;
let minimumMeetingLength = 60; // in minutes

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

// Initialize with two people
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

// Load data from external JSON structure
function loadFromData(data) {
  data.people.forEach((person) => {
    const newPerson = {
      id: personIdCounter++,
      name: person.name,
      profileImage: person.profileImage,
      selected: true,
      availableSlots: person.availableSlots.map((slot) => ({
        id: Date.now() + Math.random(),
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
      ranges: person.ranges || [], // Add ranges support
    };
    people.push(newPerson);
  });
  renderPeople();
  renderSelectedIndicator();
}

function addPerson(name = "") {
  const person = {
    id: personIdCounter++,
    name: name,
    profileImage: "",
    selected: true,
    availableSlots: [],
    ranges: [], // Add ranges array
  };
  people.push(person);
  saveToLocalStorage();
  renderPeople();
}

function removePerson(id) {
  people = people.filter((p) => p.id !== id);
  saveToLocalStorage();
  renderPeople();
}

function addAvailableSlot(personId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.availableSlots.push({
      id: Date.now(),
      date: "",
      startTime: "",
      endTime: "",
      editing: true, // Start in edit mode
    });
    saveToLocalStorage();
    renderPeople();
  }
}

function removeAvailableSlot(personId, slotId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.availableSlots = person.availableSlots.filter(
      (s) => s.id !== slotId,
    );
    saveToLocalStorage();
    renderPeople();
  }
}

function updatePersonName(personId, name) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.name = name;
  }
}

function toggleSlotEdit(personId, slotId) {
    const person = people.find(p => p.id === personId);
    if (person) {
        const slot = person.availableSlots.find(s => s.id === slotId);
        if (slot) {
            slot.editing = !slot.editing;
            renderPeople();
            
            // Set up click-outside detection if entering edit mode
            if (slot.editing) {
                setTimeout(() => setupClickOutside(personId, slotId), 100);
            }
        }
    }
}

function setupClickOutside(personId, slotId) {
    const handler = (e) => {
        // Check if click is outside the editing slot
        const editingSlot = e.target.closest('.time-slot.editing');
        if (!editingSlot) {
            saveSlotAndExit(personId, slotId);
            document.removeEventListener('click', handler);
        }
    };
    document.addEventListener('click', handler);
}

function saveSlotAndExit(personId, slotId) {
    const person = people.find(p => p.id === personId);
    if (person) {
        const slot = person.availableSlots.find(s => s.id === slotId);
        // Only exit edit mode if all fields are filled
        if (slot && slot.date && slot.startTime && slot.endTime) {
            slot.editing = false;
            saveToLocalStorage();
            renderPeople();
        }
    }
}

function updateSlot(personId, slotId, field, value) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    const slot = person.availableSlots.find((s) => s.id === slotId);
    if (slot) {
      slot[field] = value;
      saveToLocalStorage();
    }
  }
}

function togglePerson(personId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.selected = !person.selected;
    saveToLocalStorage();
    renderPeople();
    renderSelectedIndicator();
  }
}

function selectAll() {
  people.forEach((p) => (p.selected = true));
  saveToLocalStorage();
  renderPeople();
  renderSelectedIndicator();
}

function deselectAll() {
  people.forEach((p) => (p.selected = false));
  saveToLocalStorage();
  renderPeople();
  renderSelectedIndicator();
}

let currentPersonIdForModal = null;

function addDateRange(personId) {
  currentPersonIdForModal = personId;
  openModal();
}

function openModal() {
  document.getElementById('rangeModal').style.display = 'flex';
  // Clear previous values
  document.getElementById('modalStartDate').value = '';
  document.getElementById('modalEndDate').value = '';
  document.getElementById('modalStartTime').value = '';
  document.getElementById('modalEndTime').value = '';
}

function closeModal() {
  document.getElementById('rangeModal').style.display = 'none';
  currentPersonIdForModal = null;
}

function submitDateRange() {
  const person = people.find((p) => p.id === currentPersonIdForModal);
  if (!person) return;

  const startDate = document.getElementById('modalStartDate').value;
  const endDate = document.getElementById('modalEndDate').value;
  const startTime = document.getElementById('modalStartTime').value;
  const endTime = document.getElementById('modalEndTime').value;

  if (!startDate || !endDate || !startTime || !endTime) {
    alert("All fields are required!");
    return;
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    alert("Start date must be before end date!");
    return;
  }

  // Add to ranges array instead of individual slots
  person.ranges.push({
    id: Date.now() + Math.random(),
    startDate: startDate,
    endDate: endDate,
    startTime: startTime,
    endTime: endTime,
    expanded: false,
  });

  saveToLocalStorage();
  renderPeople();
  closeModal();
}

function toggleRangeExpansion(personId, rangeId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    const range = person.ranges.find((r) => r.id === rangeId);
    if (range) {
      range.expanded = !range.expanded;
      saveToLocalStorage();
      renderPeople();
    }
  }
}

function removeRange(personId, rangeId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.ranges = person.ranges.filter((r) => r.id !== rangeId);
    saveToLocalStorage();
    renderPeople();
  }
}

function getDaysInRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];

  const currentDate = new Date(start);
  while (currentDate <= end) {
    days.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

function expandRangeToSlots(range) {
  const days = getDaysInRange(range.startDate, range.endDate);
  return days.map((date) => ({
    date: date,
    startTime: range.startTime,
    endTime: range.endTime,
  }));
}

function renderSelectedIndicator() {
  const selectedPeople = people.filter((p) => p.selected);
  const indicator = document.getElementById("selectedIndicator");

  if (selectedPeople.length === 0) {
    indicator.innerHTML =
      '<div class="selected-indicator warning">⚠️ No one selected - select at least one person</div>';
  } else {
    const names = selectedPeople.map((p) => p.name).join(", ");
    indicator.innerHTML = `
            <div class="selected-indicator">
                <strong>Calculating for ${selectedPeople.length}/${people.length} people:</strong> ${names}
            </div>
        `;
  }
}

function renderMinimumLengthIndicator() {
  const indicator = document.getElementById("minimumLengthIndicator");
  const hours = Math.floor(minimumMeetingLength / 60);
  const mins = minimumMeetingLength % 60;

  let timeText = "";
  if (hours > 0 && mins > 0) {
    timeText = `${hours}h ${mins}m`;
  } else if (hours > 0) {
    timeText = `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    timeText = `${mins} minutes`;
  }

  indicator.innerHTML = `
        <div class="minimum-length-indicator">
            ⏱️ Minimum meeting length: <strong>${timeText}</strong>
        </div>
    `;
}

function renderPeople() {
  const container = document.getElementById("peopleContainer");
  container.innerHTML = people
    .map(
      (person) => `
        <div class="person-input ${person.selected ? "" : "inactive"}" 
             onclick="togglePerson(${person.id})"
             style="cursor: pointer;">
            <h2>
              ${person.name}
              ${person.profileImage ? `<img src="${person.profileImage}" alt="${person.name}" class="profile-img">` : ""}
            </h2>
            
            ${
              person.ranges.length > 0
                ? `
            <div class="ranges-section" onclick="event.stopPropagation()">
                <label>Date Ranges</label>
                ${person.ranges
                  .map((range) => {
                    const days = getDaysInRange(
                      range.startDate,
                      range.endDate,
                    );
                    const dayCount = days.length;
                    return `
                    <div class="range-card">
                        <div class="range-header" onclick="toggleRangeExpansion(${person.id}, ${range.id})">
                            <div class="range-summary">
                                <div class="range-dates">${formatDateShort(range.startDate)} - ${formatDateShort(range.endDate)}</div>
                                <div class="range-time">${range.startTime} - ${range.endTime}</div>
                                <div class="range-count">${dayCount} day${dayCount > 1 ? "s" : ""}</div>
                            </div>
                            <div class="range-actions">
                                <button class="expand-btn">${range.expanded ? "▲" : "▼"}</button>
                                <button class="remove-btn" onclick="event.stopPropagation(); removeRange(${person.id}, ${range.id})">🗑</button>
                            </div>
                        </div>
                        ${
                          range.expanded
                            ? `
                        <div class="range-expanded">
                            ${days
                              .map(
                                (date) => `
                                <div class="range-day">
                                    <span>${formatDateShort(date)}</span>
                                    <span>${range.startTime} - ${range.endTime}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                        `
                            : ""
                        }
                    </div>
                `;
                  })
                  .join("")}
            </div>
            `
                : ""
            }
            
            <div class="time-slots" onclick="event.stopPropagation()">
                <label>Single Times</label>
                ${person.availableSlots
                  .map(
                    (slot) => {
                        // Check if slot has data to display
                        const hasData = slot.date && slot.startTime && slot.endTime;
                        const isEditing = slot.editing || !hasData;
                        
                        if (isEditing) {
                            // Show input fields
                            return `
                                <div class="time-slot editing">
                                    <div class="time-slot-info">
                                        <input type="date" 
                                               value="${slot.date}"
                                               onchange="updateSlot(${person.id}, ${slot.id}, 'date', this.value)">
                                        <input type="time" 
                                               value="${slot.startTime}"
                                               onchange="updateSlot(${person.id}, ${slot.id}, 'startTime', this.value)">
                                        <input type="time" 
                                               value="${slot.endTime}"
                                               onchange="updateSlot(${person.id}, ${slot.id}, 'endTime', this.value)">
                                    </div>
                                    <button class="remove-btn" onclick="removeAvailableSlot(${person.id}, ${slot.id})">🗑</button>
                                </div>
                            `;
                        } else {
                            // Show as styled card
                            return `
                                <div class="time-slot display-mode" onclick="toggleSlotEdit(${person.id}, ${slot.id})">
                                    <div class="slot-display">
                                        <span class="slot-date">${formatDateShort(slot.date)}</span>
                                        <span class="slot-separator">•</span>
                                        <span class="slot-time">${slot.startTime} - ${slot.endTime}</span>
                                    </div>
                                    <button class="remove-btn" onclick="event.stopPropagation(); removeAvailableSlot(${person.id}, ${slot.id})">🗑</button>
                                </div>
                            `;
                        }
                    }
                  )
                  .join("")}
            </div>
            
            <div class="slot-actions" onclick="event.stopPropagation()">
                <button class="add-slot-btn" onclick="addAvailableSlot(${person.id})">
                    Add single time
                </button>
                <button class="add-slot-btn range-btn" onclick="addDateRange(${person.id})">
                    Add date range
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function calculateAvailability() {
  const allDates = new Set();

  // Collect dates from both individual slots and ranges
  people.forEach((person) => {
    // Individual slots
    person.availableSlots.forEach((slot) => {
      if (slot.date) {
        allDates.add(slot.date);
      }
    });

    // Expanded ranges
    person.ranges.forEach((range) => {
      const days = getDaysInRange(range.startDate, range.endDate);
      days.forEach((date) => allDates.add(date));
    });
  });

  const availableDays = [];

  Array.from(allDates)
    .sort()
    .forEach((date) => {
      const dayAvailability = calculateDayAvailability(date);
      if (dayAvailability.length > 0) {
        availableDays.push({
          date: date,
          slots: dayAvailability,
        });
      }
    });

  renderResults(availableDays);
}

function calculateDayAvailability(date) {
  const selectedPeople = people.filter((p) => p.selected);

  // If no one is selected, return empty
  if (selectedPeople.length === 0) {
    return [];
  }

  const personAvailabilities = [];

  selectedPeople.forEach((person) => {
    const availableOnDate = [];

    // Check individual slots
    person.availableSlots.forEach((slot) => {
      if (slot.date === date && slot.startTime && slot.endTime) {
        availableOnDate.push({
          start: timeToMinutes(slot.startTime),
          end: timeToMinutes(slot.endTime),
        });
      }
    });

    // Check ranges
    person.ranges.forEach((range) => {
      const days = getDaysInRange(range.startDate, range.endDate);
      if (days.includes(date) && range.startTime && range.endTime) {
        availableOnDate.push({
          start: timeToMinutes(range.startTime),
          end: timeToMinutes(range.endTime),
        });
      }
    });

    if (availableOnDate.length > 0) {
      personAvailabilities.push(mergeIntervals(availableOnDate));
    }
  });

  if (personAvailabilities.length !== selectedPeople.length) {
    return [];
  }

  let overlapping = personAvailabilities[0];

  for (let i = 1; i < personAvailabilities.length; i++) {
    overlapping = findOverlap(overlapping, personAvailabilities[i]);
    if (overlapping.length === 0) break;
  }

  return overlapping;
}

function findOverlap(periods1, periods2) {
  const overlaps = [];

  for (const p1 of periods1) {
    for (const p2 of periods2) {
      const overlapStart = Math.max(p1.start, p2.start);
      const overlapEnd = Math.min(p1.end, p2.end);

      if (overlapStart < overlapEnd) {
        overlaps.push({
          start: overlapStart,
          end: overlapEnd,
        });
      }
    }
  }

  return mergeIntervals(overlaps);
}

function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];

  intervals.sort((a, b) => a.start - b.start);
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function renderResults(availableDays) {
  const resultsDiv = document.getElementById("results");
  const contentDiv = document.getElementById("resultsContent");

  // Filter out slots shorter than minimum length
  const filteredDays = availableDays
    .map((day) => ({
      date: day.date,
      slots: day.slots.filter(
        (slot) => slot.end - slot.start >= minimumMeetingLength,
      ),
    }))
    .filter((day) => day.slots.length > 0);

  if (filteredDays.length === 0) {
    contentDiv.innerHTML = `<div class="no-results">No overlapping free time found with minimum ${minimumMeetingLength} minute duration. Make sure everyone has availability set for the same dates.</div>`;
  } else {
    contentDiv.innerHTML = `
            <div class="calendar-grid">
                ${filteredDays
                  .map(
                    (day) => `
                    <div class="day-card">
                        <h3>${formatDate(day.date)}</h3>
                        ${day.slots
                          .map(
                            (slot) => `
                            <div class="time-range">
                                ${minutesToTime(slot.start)} - ${minutesToTime(slot.end)}
                                <span class="duration">(${Math.floor((slot.end - slot.start) / 60)}h ${(slot.end - slot.start) % 60}m)</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  }

  resultsDiv.classList.add("show");
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Initialize the app
init();