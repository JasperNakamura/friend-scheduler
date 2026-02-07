// slots.js - single time slot management

function addAvailableSlot(personId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.availableSlots.push({
      id: Date.now(),
      date: "",
      startTime: "",
      endTime: "",
      editing: true,
    });
    saveToLocalStorage();
    renderPeople();
    
    // Focus on the date input after render
    setTimeout(() => {
      const newSlotId = person.availableSlots[person.availableSlots.length - 1].id;
      document.getElementById(`date-${personId}-${newSlotId}`)?.focus();
    }, 0);
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

function toggleSlotEdit(personId, slotId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    const slot = person.availableSlots.find((s) => s.id === slotId);
    if (slot) {
      slot.editing = true;
      renderPeople();
      
      // Focus on date input after render
      setTimeout(() => {
        document.getElementById(`date-${personId}-${slotId}`)?.focus();
      }, 0);
    }
  }
}

function saveSlot(personId, slotId) {
  const person = people.find(p => p.id === personId);
  const slot = person.availableSlots.find(s => s.id === slotId);
  
  // Get values from inputs
  const date = document.getElementById(`date-${personId}-${slotId}`).value;
  const startTime = document.getElementById(`start-${personId}-${slotId}`).value;
  const endTime = document.getElementById(`end-${personId}-${slotId}`).value;
  
  // Validate all fields are filled
  if (!date || !startTime || !endTime) {
    alert('Please fill in all fields (date, start time, and end time)');
    return;
  }
  
  // Check if it's an overnight slot (end time is earlier than start time)
  const isOvernight = startTime >= endTime;
  
  // Save the changes
  slot.date = date;
  slot.startTime = startTime;
  slot.endTime = endTime;
  slot.overnight = isOvernight; // Flag for overnight slots
  slot.editing = false;
  
  saveToLocalStorage();
  renderPeople();
}

function cancelSlotEdit(personId, slotId) {
  const person = people.find(p => p.id === personId);
  const slot = person.availableSlots.find(s => s.id === slotId);
  
  // If it's a new slot with no data, remove it entirely
  if (!slot.date && !slot.startTime && !slot.endTime) {
    person.availableSlots = person.availableSlots.filter(s => s.id !== slotId);
  } else {
    // Just exit edit mode without saving changes
    slot.editing = false;
  }
  
  saveToLocalStorage();
  renderPeople();
}