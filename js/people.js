// people.js - person management

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
      ranges: person.ranges || [],
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
    ranges: [],
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

function updatePersonName(personId, name) {
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.name = name;
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
