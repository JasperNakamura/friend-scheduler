// modal.js - modal controls

function openModal() {
  document.getElementById("rangeModal").style.display = "flex";
  // Clear previous values
  document.getElementById("modalStartDate").value = "";
  document.getElementById("modalEndDate").value = "";
  document.getElementById("modalStartTime").value = "";
  document.getElementById("modalEndTime").value = "";
}

function closeModal() {
  document.getElementById("rangeModal").style.display = "none";
  currentPersonIdForModal = null;
}
