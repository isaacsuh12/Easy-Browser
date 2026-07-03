const homeButton = document.getElementById("homeButton");
const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

function setActiveTab(tabId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle("active", isActive);
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === tabId;
    panel.classList.toggle("active", isActive);
    panel.classList.toggle("hidden", !isActive);
  });
}

function bindEvents() {
  if (homeButton) {
    homeButton.addEventListener("click", () => setActiveTab("homeTab"));
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  setActiveTab("homeTab");
});
