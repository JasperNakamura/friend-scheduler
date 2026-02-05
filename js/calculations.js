// calculations.js - availability calculations

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
