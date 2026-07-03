const STORAGE_KEY = "easy-browser-apps-v1";
const SETTINGS_KEY = "easy-browser-settings-v1";

const defaultApps = [
  {
    id: crypto.randomUUID(),
    title: "Google",
    url: "https://www.google.com",
    iconUrl: "https://picsum.photos/seed/google/120/120",
  },
  {
    id: crypto.randomUUID(),
    title: "Facebook",
    url: "https://www.facebook.com",
    iconUrl: "https://picsum.photos/seed/facebook/120/120",
  },
  {
    id: crypto.randomUUID(),
    title: "YouTube",
    url: "https://www.youtube.com",
    iconUrl: "https://picsum.photos/seed/youtube/120/120",
  },
  {
    id: crypto.randomUUID(),
    title: "Gmail",
    url: "https://mail.google.com",
    iconUrl: "https://picsum.photos/seed/gmail/120/120",
  },
];

const defaultSettings = {
  fontSize: 20,
  highContrast: false,
  bigButtons: true,
};

let apps = [];
let settings = { ...defaultSettings };
let editingId = null;

function chromeStorageAvailable() {
  return typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
}

function loadState() {
  if (chromeStorageAvailable()) {
    chrome.storage.local.get([STORAGE_KEY, SETTINGS_KEY], (result) => {
      apps = Array.isArray(result[STORAGE_KEY]) && result[STORAGE_KEY].length ? result[STORAGE_KEY] : defaultApps;
      settings = { ...defaultSettings, ...(result[SETTINGS_KEY] || {}) };
      initializeApp();
    });
  } else {
    try {
      const savedApps = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      apps = Array.isArray(savedApps) && savedApps.length ? savedApps : defaultApps;
      settings = { ...defaultSettings, ...(savedSettings || {}) };
    } catch {
      apps = [...defaultApps];
      settings = { ...defaultSettings };
    }
    initializeApp();
  }
}

function saveState() {
  if (chromeStorageAvailable()) {
    chrome.storage.local.set({ [STORAGE_KEY]: apps, [SETTINGS_KEY]: settings });
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

function initializeApp() {
  bindEvents();
  applySettings();
  renderApps();
  renderAppList();
}

function applySettings() {
  document.documentElement.style.setProperty("--font-size", `${settings.fontSize}px`);
  document.body.classList.toggle("high-contrast", settings.highContrast);
  const fontSizeInput = document.getElementById("fontSize");
  const highContrastInput = document.getElementById("highContrast");
  const bigButtonsInput = document.getElementById("bigButtons");
  if (fontSizeInput) fontSizeInput.value = settings.fontSize;
  if (highContrastInput) highContrastInput.checked = settings.highContrast;
  if (bigButtonsInput) bigButtonsInput.checked = settings.bigButtons;
}

function renderApps() {
  const grid = document.getElementById("appGrid");
  if (!grid) return;
  grid.innerHTML = "";

  apps.forEach((app) => {
    const tile = document.createElement("button");
    tile.className = "app-tile";
    if (settings.bigButtons) {
      tile.classList.add("big");
    }
    tile.type = "button";
    tile.innerHTML = `
      <img class="app-icon" src="${escapeHtml(app.iconUrl)}" alt="${escapeHtml(app.title)} icon" />
      <span class="app-label">${escapeHtml(app.title)}</span>
    `;
    const isGoogleApp = app.title.toLowerCase() === "google" || app.url.includes("google.com");
    tile.addEventListener("click", () => {
      if (isGoogleApp) {
        showResultsScreen("Google", true);
      } else {
        openApp(app.url);
      }
    });
    grid.appendChild(tile);
  });
}

function renderAppList() {
  const list = document.getElementById("appList");
  if (!list) return;
  list.innerHTML = "";

  apps.forEach((app) => {
    const row = document.createElement("div");
    row.className = "app-row";
    row.innerHTML = `
      <span class="app-row-label">${escapeHtml(app.title)}</span>
      <div class="app-row-actions">
        <button class="ghost-btn" type="button" data-action="edit">Edit</button>
        <button class="ghost-btn" type="button" data-action="delete">Remove</button>
      </div>
    `;

    row.querySelector('[data-action="edit"]').addEventListener("click", () => fillForm(app));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => removeApp(app.id));
    list.appendChild(row);
  });
}

function fillForm(app) {
  editingId = app.id;
  document.getElementById("appTitle").value = app.title;
  document.getElementById("appUrl").value = app.url;
  document.getElementById("appIcon").value = app.iconUrl;
  document.getElementById("appTitle").focus();
}

function resetForm() {
  editingId = null;
  const form = document.getElementById("appForm");
  if (form) form.reset();
}

function openApp(url) {
  const cleaned = normalizeUrl(url);
  window.location.href = cleaned;
}

function normalizeUrl(value) {
  const input = value.trim();
  if (!input) {
    return "https://www.google.com";
  }

  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(input)) {
    return `https://${input}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function showHomeScreen() {
  const homeScreen = document.getElementById("homeScreen");
  const resultsScreen = document.getElementById("resultsScreen");
  if (!homeScreen || !resultsScreen) return;
  homeScreen.classList.remove("hidden");
  homeScreen.classList.add("active");
  resultsScreen.classList.remove("active");
  resultsScreen.classList.add("hidden");
}

function showResultsScreen(query, isGoogle = false) {
  const homeScreen = document.getElementById("homeScreen");
  const resultsScreen = document.getElementById("resultsScreen");
  const searchQueryText = document.getElementById("searchQueryText");
  const resultsEyebrow = document.getElementById("resultsEyebrow");
  const resultsTitle = document.getElementById("resultsTitle");
  const queryDisplay = document.getElementById("queryDisplay");
  if (!homeScreen || !resultsScreen || !searchQueryText || !resultsEyebrow || !resultsTitle || !queryDisplay) return;
  if (!query) return;

  searchQueryText.textContent = query;
  if (isGoogle || query.toLowerCase() === "google") {
    resultsEyebrow.textContent = "Google";
    resultsTitle.textContent = "AI Overview";
    queryDisplay.textContent = "Showing Google AI overview and image cards.";
  } else {
    resultsEyebrow.textContent = "Search";
    resultsTitle.textContent = "Search results";
    queryDisplay.textContent = `Results for ${query}`;
  }

  homeScreen.classList.remove("active");
  homeScreen.classList.add("hidden");
  resultsScreen.classList.remove("hidden");
  resultsScreen.classList.add("active");
  setResultsTab("imagesTab");
}

function setResultsTab(tabId) {
  const resultsTabButtons = Array.from(document.querySelectorAll(".results-nav .tab-btn"));
  const resultsPanels = Array.from(document.querySelectorAll("#resultsScreen .tab-panel"));

  resultsTabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle("active", isActive);
  });

  resultsPanels.forEach((panel) => {
    const isActive = panel.id === tabId;
    panel.classList.toggle("active", isActive);
    panel.classList.toggle("hidden", !isActive);
  });
}

function handleSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  showResultsScreen(value);
  input.blur();
}

function bindEvents() {
  const editButton = document.getElementById("editButton");
  const cancelEdit = document.getElementById("cancelEdit");
  const appForm = document.getElementById("appForm");
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  const homeButton = document.getElementById("homeButton");
  const resultsTabButtons = Array.from(document.querySelectorAll(".results-nav .tab-btn"));

  if (editButton) {
    editButton.addEventListener("click", () => {
      const editorPanel = document.getElementById("editorPanel");
      if (editorPanel) editorPanel.classList.toggle("hidden");
    });
  }

  if (cancelEdit) {
    cancelEdit.addEventListener("click", resetForm);
  }

  if (appForm) {
    appForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = document.getElementById("appTitle").value.trim();
      const url = document.getElementById("appUrl").value.trim();
      const iconUrl = document.getElementById("appIcon").value.trim() || "https://picsum.photos/seed/default/120/120";

      if (!title || !url) return;

      if (editingId) {
        apps = apps.map((app) => (app.id === editingId ? { ...app, title, url, iconUrl } : app));
      } else {
        apps = [{ id: crypto.randomUUID(), title, url, iconUrl }, ...apps];
      }

      saveState();
      renderApps();
      renderAppList();
      resetForm();
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", handleSearch);
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
    });
  }

  if (homeButton) {
    homeButton.addEventListener("click", showHomeScreen);
  }

  resultsTabButtons.forEach((button) => {
    button.addEventListener("click", () => setResultsTab(button.dataset.tab));
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadState();
});
