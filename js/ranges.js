// ranges.js - date range management

function addDateRange(personId) {
  currentPersonIdForModal = personId;
  openModal();
}

function submitDateRange() {
  const person = people.find((p) => p.id === currentPersonIdForModal);
  if (!person) return;

  const startDate = document.getElementById("modalStartDate").value;
  const endDate = document.getElementById("modalEndDate").value;
  const startTime = document.getElementById("modalStartTime").value;
  const endTime = document.getElementById("modalEndTime").value;

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

  // Add to ranges array
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
