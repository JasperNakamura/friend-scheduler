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

function toggleSlotEdit(personId, slotId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    const slot = person.availableSlots.find((s) => s.id === slotId);
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
    const editingSlot = e.target.closest(".time-slot.editing");
    if (!editingSlot) {
      saveSlotAndExit(personId, slotId);
      document.removeEventListener("click", handler);
    }
  };
  document.addEventListener("click", handler);
}

function saveSlotAndExit(personId, slotId) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    const slot = person.availableSlots.find((s) => s.id === slotId);
    // Only exit edit mode if all fields are filled
    if (slot && slot.date && slot.startTime && slot.endTime) {
      slot.editing = false;
      saveToLocalStorage();
      renderPeople();
    }
  }
}
