// ui.js - rendering functions

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
                    const days = getDaysInRange(range.startDate, range.endDate);
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
                <label>Available Times</label>
            ${person.availableSlots
              .map((slot) => {
                // Check if slot has data to display
                const hasData = slot.date && slot.startTime && slot.endTime;
                const isEditing = slot.editing || !hasData;

                if (isEditing) {
                  // Show input fields with save/cancel buttons
                  return `
                        <div class="time-slot editing">
                            <div class="time-slot-inputs">
                                <input type="date" 
                                      id="date-${person.id}-${slot.id}"
                                      value="${slot.date}"
                                      placeholder="mm/dd/yyyy">
                                <input type="time" 
                                      id="start-${person.id}-${slot.id}"
                                      value="${slot.startTime}"
                                      placeholder="--:--">
                                <input type="time" 
                                      id="end-${person.id}-${slot.id}"
                                      value="${slot.endTime}"
                                      placeholder="--:--">
                            </div>
                            <div class="slot-actions-inline">
                                <button class="save-btn" onclick="saveSlot(${person.id}, ${slot.id})">✓ Save</button>
                                <button class="cancel-btn" onclick="cancelSlotEdit(${person.id}, ${slot.id})">✗ Cancel</button>
                            </div>
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
              })
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
