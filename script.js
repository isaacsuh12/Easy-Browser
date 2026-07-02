const STORAGE_KEY = "easy-browser-apps-v1";
const SETTINGS_KEY = "easy-browser-settings-v1";

const defaultApps = [
  { id: crypto.randomUUID(), title: "Google", url: "https://www.google.com", icon: "🔍" },
  { id: crypto.randomUUID(), title: "YouTube", url: "https://www.youtube.com", icon: "▶️" },
  { id: crypto.randomUUID(), title: "Weather", url: "https://weather.com", icon: "☀️" },
  { id: crypto.randomUUID(), title: "News", url: "https://news.google.com", icon: "📰" },
];

const defaultSettings = {
  fontSize: 18,
  highContrast: false,
  bigButtons: false,
};

let apps = [];
let settings = { ...defaultSettings };
let editingId = null;
let currentUrl = "";

function loadState() {
  try {
    const savedApps = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY));

    apps = Array.isArray(savedApps) && savedApps.length ? savedApps : defaultApps;
    settings = { ...defaultSettings, ...(savedSettings || {}) };
  } catch (error) {
    apps = [...defaultApps];
    settings = { ...defaultSettings };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettings() {
  document.documentElement.style.setProperty("--font-size", `${settings.fontSize}px`);
  document.body.classList.toggle("high-contrast", settings.highContrast);
  document.getElementById("fontSize").value = settings.fontSize;
  document.getElementById("highContrast").checked = settings.highContrast;
  document.getElementById("bigButtons").checked = settings.bigButtons;
}

function renderApps() {
  const grid = document.getElementById("appGrid");
  grid.innerHTML = "";

  apps.forEach((app) => {
    const tile = document.createElement("button");
    tile.className = "app-tile";
    if (settings.bigButtons) {
      tile.classList.add("big");
    }
    tile.type = "button";
    tile.innerHTML = `
      <span class="app-icon">${escapeHtml(app.icon)}</span>
      <span class="app-label">${escapeHtml(app.title)}</span>
    `;
    tile.addEventListener("click", () => openApp(app.url));
    grid.appendChild(tile);
  });
}

function renderAppList() {
  const list = document.getElementById("appList");
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
  document.getElementById("appIcon").value = app.icon;
  document.getElementById("appTitle").focus();
}

function resetForm() {
  editingId = null;
  document.getElementById("appForm").reset();
}

function showHomeScreen() {
  document.getElementById("homeScreen").classList.remove("hidden");
  document.getElementById("browserScreen").classList.add("hidden");
}

function showBrowserScreen(url) {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("browserScreen").classList.remove("hidden");
  document.getElementById("currentAddress").textContent = url;
}

function openApp(url) {
  const cleaned = normalizeUrl(url);
  currentUrl = cleaned;
  showBrowserScreen(cleaned);
}

function refreshFrame() {
  if (currentUrl) {
    window.location.href = currentUrl;
  }
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

function toggleEditor() {
  const panel = document.getElementById("editorPanel");
  panel.classList.toggle("hidden");
}

function saveApp(event) {
  event.preventDefault();
  const title = document.getElementById("appTitle").value.trim();
  const url = document.getElementById("appUrl").value.trim();
  const icon = document.getElementById("appIcon").value.trim() || "🌐";

  if (!title || !url) {
    return;
  }

  if (editingId) {
    apps = apps.map((app) => (app.id === editingId ? { ...app, title, url, icon } : app));
  } else {
    apps = [{ id: crypto.randomUUID(), title, url, icon }, ...apps];
  }

  saveState();
  renderApps();
  renderAppList();
  resetForm();
}

function removeApp(id) {
  apps = apps.filter((app) => app.id !== id);
  saveState();
  renderApps();
  renderAppList();
}

function handleSearch() {
  const input = document.getElementById("searchInput");
  const value = input.value.trim();
  if (!value) {
    return;
  }
  openApp(value);
  input.value = "";
}

function bindEvents() {
  document.getElementById("editButton").addEventListener("click", toggleEditor);
  document.getElementById("backHomeButton").addEventListener("click", showHomeScreen);
  document.getElementById("refreshButton").addEventListener("click", refreshFrame);
  document.getElementById("openSiteButton").addEventListener("click", () => {
    if (currentUrl) {
      window.location.href = currentUrl;
    }
  });
  document.getElementById("cancelEdit").addEventListener("click", () => {
    resetForm();
  });
  document.getElementById("appForm").addEventListener("submit", saveApp);
  document.getElementById("searchButton").addEventListener("click", handleSearch);
  document.getElementById("searchInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  });

  document.getElementById("fontSize").addEventListener("input", (event) => {
    settings.fontSize = Number(event.target.value);
    applySettings();
    saveState();
  });

  document.getElementById("highContrast").addEventListener("change", (event) => {
    settings.highContrast = event.target.checked;
    applySettings();
    saveState();
  });

  document.getElementById("bigButtons").addEventListener("change", (event) => {
    settings.bigButtons = event.target.checked;
    applySettings();
    renderApps();
    saveState();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadState();
  bindEvents();
  applySettings();
  renderApps();
  renderAppList();
});
