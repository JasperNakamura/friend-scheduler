// Data structure to hold people and their available times
let people = [];
let personIdCounter = 0;

// Initialize with two people
function init() {
  // Check if external data exists
  if (typeof scheduleData !== "undefined") {
    loadFromData(scheduleData);
  } else {
    // Default initialization
    addPerson("You");
  }
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
    };
    people.push(newPerson);
  });
  renderPeople();
}

function addPerson(name = "") {
  const person = {
    id: personIdCounter++,
    name: name,
    profileImage: "",
    selected: true,
    availableSlots: [],
  };
  people.push(person);
  renderPeople();
}

function removePerson(id) {
  people = people.filter((p) => p.id !== id);
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
    });
    renderPeople();
  }
}

function removeAvailableSlot(personId, slotId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.availableSlots = person.availableSlots.filter(
      (s) => s.id !== slotId,
    );
    renderPeople();
  }
}

function updatePersonName(personId, name) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.name = name;
  }
}

function updateSlot(personId, slotId, field, value) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    const slot = person.availableSlots.find((s) => s.id === slotId);
    if (slot) {
      slot[field] = value;
    }
  }
}

function togglePerson(personId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.selected = !person.selected;
    renderPeople();
  }
}

function renderPeople() {
    const container = document.getElementById('peopleContainer');
    container.innerHTML = people.map(person => `
        <div class="person-input ${person.selected ? '' : 'inactive'}" 
             onclick="togglePerson(${person.id})"
             style="cursor: pointer;">
            <h2>
              ${person.name}
              <img src="${person.profileImage}" alt="${person.name}" class="profile-img">
            </h2>
            
            <div class="time-slots">
                <label>Available times</label>
                ${person.availableSlots.map(slot => `
                    <div class="time-slot" onclick="event.stopPropagation()">
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
                `).join('')}
            </div>
            
            <button class="add-slot-btn" onclick="event.stopPropagation(); addAvailableSlot(${person.id})">
                Add available time
            </button>
        </div>
    `).join('');
}

function calculateAvailability() {
  const allDates = new Set();
  people.forEach((person) => {
    person.availableSlots.forEach((slot) => {
      if (slot.date) {
        allDates.add(slot.date);
      }
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
    const selectedPeople = people.filter(p => p.selected);
    
    // If no one is selected, return empty
    if (selectedPeople.length === 0) {
        return [];
    }
    
    const personAvailabilities = [];
    
    selectedPeople.forEach(person => {
        const availableOnDate = [];
        person.availableSlots.forEach(slot => {
            if (slot.date === date && slot.startTime && slot.endTime) {
                availableOnDate.push({
                    start: timeToMinutes(slot.startTime),
                    end: timeToMinutes(slot.endTime)
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

function renderResults(availableDays) {
  const resultsDiv = document.getElementById("results");
  const contentDiv = document.getElementById("resultsContent");

  if (availableDays.length === 0) {
    contentDiv.innerHTML =
      '<div class="no-results">No overlapping free time found. Make sure everyone has availability set for the same dates.</div>';
  } else {
    contentDiv.innerHTML = `
            <div class="calendar-grid">
                ${availableDays
                  .map(
                    (day) => `
                    <div class="day-card">
                        <h3>${formatDate(day.date)}</h3>
                        ${day.slots
                          .map(
                            (slot) => `
                            <div class="time-range">
                                ${minutesToTime(slot.start)} - ${minutesToTime(slot.end)}
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
