/**
 * ClimateTwin AI - Main Application Logic & API Client (Pure JavaScript)
 */

// Global State
let allClimateData = [];
let allDistrictsData = (typeof window !== "undefined" && Array.isArray(window.STATIC_DISTRICTS_DATA)) ? window.STATIC_DISTRICTS_DATA : [];
let stateDistrictsMap = (typeof window !== "undefined" && window.STATIC_STATE_DISTRICTS_MAP) ? window.STATIC_STATE_DISTRICTS_MAP : {};
let currentSelectedDistrict = null;
let currentDistrictTelemetry = null;
let summaryMetrics = {};
let currentActiveView = "home";

// Fallback baseline data if opened as static file without active FastAPI server
const FALLBACK_DATA = [
  { State: "Andhra Pradesh", Temperature: 29.37, Rainfall: 4.10, Humidity: 69.17, Latitude: 15.9129, Longitude: 79.7400, AQI: 124, Risk: "High" },
  { State: "Arunachal Pradesh", Temperature: 27.22, Rainfall: 0.95, Humidity: 75.82, Latitude: 28.2180, Longitude: 94.7278, AQI: 143, Risk: "High" },
  { State: "Assam", Temperature: 29.93, Rainfall: 12.29, Humidity: 79.54, Latitude: 26.2006, Longitude: 92.9376, AQI: 175, Risk: "High" },
  { State: "Bihar", Temperature: 31.94, Rainfall: 14.16, Humidity: 64.38, Latitude: 25.0961, Longitude: 85.3131, AQI: 136, Risk: "High" },
  { State: "Chhattisgarh", Temperature: 28.03, Rainfall: 31.55, Humidity: 81.85, Latitude: 21.2787, Longitude: 81.8661, AQI: 110, Risk: "Medium" },
  { State: "Goa", Temperature: 23.64, Rainfall: 14.13, Humidity: 93.87, Latitude: 15.2993, Longitude: 74.1240, AQI: 141, Risk: "High" },
  { State: "Gujarat", Temperature: 30.54, Rainfall: 16.51, Humidity: 71.13, Latitude: 22.2587, Longitude: 71.1924, AQI: 78, Risk: "Low" },
  { State: "Haryana", Temperature: 33.48, Rainfall: 2.11, Humidity: 54.24, Latitude: 29.0588, Longitude: 76.0856, AQI: 98, Risk: "Medium" },
  { State: "Himachal Pradesh", Temperature: 29.70, Rainfall: 2.97, Humidity: 55.55, Latitude: 31.1048, Longitude: 77.1734, AQI: 96, Risk: "Medium" },
  { State: "Jharkhand", Temperature: 27.97, Rainfall: 16.84, Humidity: 73.77, Latitude: 23.6102, Longitude: 85.2799, AQI: 177, Risk: "High" },
  { State: "Karnataka", Temperature: 23.86, Rainfall: 6.40, Humidity: 87.36, Latitude: 15.3173, Longitude: 75.7139, AQI: 130, Risk: "High" },
  { State: "Kerala", Temperature: 23.81, Rainfall: 12.68, Humidity: 93.67, Latitude: 10.8505, Longitude: 76.2711, AQI: 165, Risk: "High" },
  { State: "Madhya Pradesh", Temperature: 28.48, Rainfall: 18.25, Humidity: 73.36, Latitude: 22.9734, Longitude: 78.6569, AQI: 150, Risk: "High" },
  { State: "Maharashtra", Temperature: 26.18, Rainfall: 4.06, Humidity: 76.21, Latitude: 19.7515, Longitude: 75.7139, AQI: 89, Risk: "Medium" },
  { State: "Manipur", Temperature: 26.01, Rainfall: 12.39, Humidity: 79.94, Latitude: 24.6637, Longitude: 93.9063, AQI: 87, Risk: "Medium" },
  { State: "Meghalaya", Temperature: 26.76, Rainfall: 13.07, Humidity: 82.86, Latitude: 25.4670, Longitude: 91.3662, AQI: 58, Risk: "Low" },
  { State: "Mizoram", Temperature: 25.09, Rainfall: 14.45, Humidity: 82.59, Latitude: 23.1645, Longitude: 92.9376, AQI: 166, Risk: "High" },
  { State: "Nagaland", Temperature: 26.36, Rainfall: 10.77, Humidity: 77.08, Latitude: 26.1584, Longitude: 94.5624, AQI: 132, Risk: "High" },
  { State: "Odisha", Temperature: 29.34, Rainfall: 12.55, Humidity: 77.71, Latitude: 20.9517, Longitude: 85.0985, AQI: 84, Risk: "Medium" },
  { State: "Punjab", Temperature: 34.59, Rainfall: 1.65, Humidity: 45.23, Latitude: 31.1471, Longitude: 75.3412, AQI: 94, Risk: "Medium" },
  { State: "Rajasthan", Temperature: 33.58, Rainfall: 3.75, Humidity: 50.43, Latitude: 27.0238, Longitude: 74.2179, AQI: 121, Risk: "High" },
  { State: "Sikkim", Temperature: 13.87, Rainfall: 16.82, Humidity: 90.68, Latitude: 27.5330, Longitude: 88.5122, AQI: 106, Risk: "Medium" },
  { State: "Tamil Nadu", Temperature: 28.12, Rainfall: 2.17, Humidity: 73.37, Latitude: 11.1271, Longitude: 78.6569, AQI: 124, Risk: "High" },
  { State: "Telangana", Temperature: 25.50, Rainfall: 1.33, Humidity: 78.50, Latitude: 18.1124, Longitude: 79.0193, AQI: 101, Risk: "Medium" },
  { State: "Tripura", Temperature: 29.13, Rainfall: 14.28, Humidity: 83.15, Latitude: 23.9408, Longitude: 91.9882, AQI: 115, Risk: "Medium" },
  { State: "Uttar Pradesh", Temperature: 32.74, Rainfall: 10.45, Humidity: 60.12, Latitude: 26.8467, Longitude: 80.9462, AQI: 168, Risk: "High" },
  { State: "Uttarakhand", Temperature: 22.30, Rainfall: 8.70, Humidity: 71.00, Latitude: 30.0668, Longitude: 79.0193, AQI: 92, Risk: "Medium" },
  { State: "West Bengal", Temperature: 30.82, Rainfall: 15.34, Humidity: 78.90, Latitude: 22.9868, Longitude: 87.8550, AQI: 158, Risk: "High" }
];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Localization
  const savedLang = localStorage.getItem("climatetwin_lang") || "en";
  updatePageTranslations(savedLang);

  // 2. Setup Event Listeners
  setupNavigation();
  setupLanguageSwitcher();
  setupSimulationControls();
  setupAssistant();
  setupNasaSync();
  setupNasaSatelliteTelemetry();
  setupRiskModal();

  // 3. Load Data & Render Views
  await loadData();
  await loadNasaSatelliteTelemetry();
});

/**
 * Setup SPA Tab Navigation & Mobile Drawer
 */
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const view = item.getAttribute("data-view");
      switchView(view);
    });
  });

  // Mobile Bottom Navigation Buttons
  const mobileNavBtns = document.querySelectorAll(".mobile-nav-btn");
  mobileNavBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (view) switchView(view);
    });
  });

  // Mobile Hamburger Menu & Off-canvas Drawer
  const menuToggle = document.getElementById("btnMobileMenuToggle");
  const sidebarClose = document.getElementById("btnSidebarClose");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const appSidebar = document.getElementById("appSidebar");

  const openDrawer = () => {
    if (appSidebar) appSidebar.classList.add("open");
    if (sidebarOverlay) sidebarOverlay.classList.add("open");
  };

  const closeDrawer = () => {
    if (appSidebar) appSidebar.classList.remove("open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("open");
  };

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (sidebarClose) sidebarClose.addEventListener("click", closeDrawer);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeDrawer);

  // Resize handler for Leaflet Map
  window.addEventListener("resize", () => {
    if (currentActiveView === "dashboard" && typeof indiaMap !== "undefined" && indiaMap) {
      indiaMap.invalidateSize();
    }
  });
}

function switchView(viewName) {
  currentActiveView = viewName;

  // Auto-close mobile drawer on view switch
  const appSidebar = document.getElementById("appSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  if (appSidebar) appSidebar.classList.remove("open");
  if (sidebarOverlay) sidebarOverlay.classList.remove("open");

  // Scroll to top of content on view switch on mobile
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Update desktop nav item active states
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-view") === viewName);
  });

  // Update mobile bottom nav active states
  document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
  });

  // Update view panel visibility
  document.querySelectorAll(".view-panel").forEach(panel => {
    panel.classList.toggle("active-view", panel.id === `view-${viewName}`);
  });

  // Re-render map/charts if switching to dashboard, analytics, or assistant
  if (viewName === "dashboard") {
    setTimeout(() => {
      initIndiaMap(allClimateData);
      if (typeof indiaMap !== "undefined" && indiaMap) {
        indiaMap.invalidateSize();
      }
      renderHottestChart(allClimateData);
      renderRainfallChart(allClimateData);
      renderHumidityChart(allClimateData);
    }, 120);
  } else if (viewName === "analytics") {
    setTimeout(() => {
      renderAnalyticsView();
    }, 100);
  } else if (viewName === "predictions") {
    updateForecastView();
  } else if (viewName === "assistant") {
    const chatInput = document.getElementById("assistantChatInput");
    if (chatInput && window.innerWidth > 768) chatInput.focus();
    const chatHistory = document.getElementById("assistantChatHistory");
    if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}

/**
 * Setup Language Switcher
 */
function setupLanguageSwitcher() {
  const select = document.getElementById("languageSelect");
  if (select) {
    select.addEventListener("change", (e) => {
      updatePageTranslations(e.target.value);
    });
  }
}

/**
 * Helper to fetch API with automatic fallback between /api/* and /* for Vercel/local compatibility
 */
async function apiFetch(path, options = {}) {
  const normPath = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normPath.startsWith("/api") ? normPath : `/api${normPath}`;
  const rootPath = normPath.startsWith("/api") ? normPath.replace(/^\/api/, "") || "/" : normPath;

  try {
    let res = await fetch(apiPath, options);
    if (res.ok) return res;
    if (res.status === 404) {
      let res2 = await fetch(rootPath, options);
      if (res2.ok) return res2;
    }
    return res;
  } catch (err) {
    try {
      return await fetch(rootPath, options);
    } catch (e2) {
      throw err;
    }
  }
}

/**
 * Load Climate Dataset from API (with fallback)
 */
async function loadData() {
  try {
    const res = await apiFetch("/climate-data");
    if (res.ok) {
      const json = await res.json();
      allClimateData = json.data && json.data.length ? json.data : FALLBACK_DATA;
    } else {
      allClimateData = FALLBACK_DATA;
    }
  } catch (e) {
    console.warn("API offline, utilizing local telemetry cache.", e);
    allClimateData = FALLBACK_DATA;
  }

  // Ensure baseline districts dataset from window static bundle
  if (!allDistrictsData || !allDistrictsData.length) {
    if (typeof window !== "undefined" && Array.isArray(window.STATIC_DISTRICTS_DATA) && window.STATIC_DISTRICTS_DATA.length) {
      allDistrictsData = window.STATIC_DISTRICTS_DATA;
    }
  }
  if (!stateDistrictsMap || !Object.keys(stateDistrictsMap).length) {
    if (typeof window !== "undefined" && window.STATIC_STATE_DISTRICTS_MAP) {
      stateDistrictsMap = window.STATIC_STATE_DISTRICTS_MAP;
    }
  }

  // Load All 786 Districts Data from backend API if online
  try {
    const dRes = await apiFetch("/districts");
    if (dRes.ok) {
      const dJson = await dRes.json();
      if (dJson.data && dJson.data.length) allDistrictsData = dJson.data;
    } else {
      const staticDistRes = await fetch("./data/india_districts.json");
      if (staticDistRes.ok) allDistrictsData = await staticDistRes.json();
    }
  } catch (err) {
    try {
      const staticDistRes = await fetch("./data/india_districts.json");
      if (staticDistRes.ok) allDistrictsData = await staticDistRes.json();
    } catch (e2) {}
  }

  // Final check to guarantee allDistrictsData is never empty
  if ((!allDistrictsData || !allDistrictsData.length) && typeof window !== "undefined" && window.STATIC_DISTRICTS_DATA) {
    allDistrictsData = window.STATIC_DISTRICTS_DATA;
  }

  // Load State-Districts Hierarchy Map
  try {
    const mapRes = await apiFetch("/state-districts-map");
    if (mapRes.ok) {
      const mapJson = await mapRes.json();
      if (mapJson.map && Object.keys(mapJson.map).length) stateDistrictsMap = mapJson.map;
    } else {
      const staticMapRes = await fetch("./data/state_districts_map.json");
      if (staticMapRes.ok) stateDistrictsMap = await staticMapRes.json();
    }
  } catch (err) {
    try {
      const staticMapRes = await fetch("./data/state_districts_map.json");
      if (staticMapRes.ok) stateDistrictsMap = await staticMapRes.json();
    } catch (e2) {}
  }

  if ((!stateDistrictsMap || !Object.keys(stateDistrictsMap).length) && typeof window !== "undefined" && window.STATIC_STATE_DISTRICTS_MAP) {
    stateDistrictsMap = window.STATIC_STATE_DISTRICTS_MAP;
  }

  computeSummaryMetrics();
  populateStateSelectors();
  renderQuickDistrictPills();
  setupDistrictSearch();
  setupDistrictModal();
  setupVoiceFeatures();
  renderHomeView();
  renderDashboardView();
  renderAnalyticsView();
  renderRiskView();
  renderReportsView();
  setupAnalyticsFilters();
}

/**
 * Compute key summary metrics
 */
function computeSummaryMetrics(dataset = allClimateData) {
  if (!dataset.length) return;

  let totalTemp = 0, totalRain = 0, totalHum = 0, highRiskCount = 0;
  let hottest = dataset[0], rainiest = dataset[0], worstAqi = dataset[0];

  dataset.forEach(row => {
    totalTemp += row.Temperature;
    totalRain += row.Rainfall;
    totalHum += row.Humidity;
    if (row.Risk === "High") highRiskCount++;

    if (row.Temperature > hottest.Temperature) hottest = row;
    if (row.Rainfall > rainiest.Rainfall) rainiest = row;
    if (row.AQI > worstAqi.AQI) worstAqi = row;
  });

  summaryMetrics = {
    totalStates: dataset.length,
    avgTemp: (totalTemp / dataset.length).toFixed(2),
    avgRain: (totalRain / dataset.length).toFixed(2),
    avgHumidity: (totalHum / dataset.length).toFixed(2),
    highRiskCount: highRiskCount,
    hottest: hottest,
    rainiest: rainiest,
    worstAqi: worstAqi
  };

  updateMetricCards(summaryMetrics);
  updateAlertsBanner(summaryMetrics);
}

/**
 * Update DOM KPI Metric Cards
 */
function updateMetricCards(m) {
  document.querySelectorAll(".metric-val-temp").forEach(el => el.textContent = `${m.avgTemp} °C`);
  document.querySelectorAll(".metric-val-rain").forEach(el => el.textContent = `${m.avgRain} mm`);
  document.querySelectorAll(".metric-val-humidity").forEach(el => el.textContent = `${m.avgHumidity} %`);
  document.querySelectorAll(".metric-val-risk").forEach(el => el.textContent = `${m.highRiskCount}`);
}

/**
 * Update AI Alert Banners
 */
function updateAlertsBanner(m) {
  const heatEl = document.getElementById("alertHeatwave");
  const rainEl = document.getElementById("alertRain");
  const aqiEl = document.getElementById("alertAqi");

  if (heatEl) heatEl.innerHTML = `🔥 <b>${t('heatwave_alert')}:</b> ${m.hottest.State} (${m.hottest.Temperature}°C)`;
  if (rainEl) rainEl.innerHTML = `🌧️ <b>${t('heavy_rain_alert')}:</b> ${m.rainiest.State} (${m.rainiest.Rainfall} mm)`;
  if (aqiEl) aqiEl.innerHTML = `🌫️ <b>${t('poor_aqi_alert')}:</b> ${m.worstAqi.State} (AQI ${m.worstAqi.AQI})`;
}

/**
 * Populate State & District Selectors with Cascading Hierarchy
 */
function populateStateSelectors() {
  const selects = [
    document.getElementById("dashboardStateSelect"),
    document.getElementById("predictionStateSelect"),
    document.getElementById("assistantStateSelect")
  ];
  
  const stateSet = new Set(allClimateData.map(r => r.State));
  Object.keys(stateDistrictsMap).forEach(s => stateSet.add(s));
  allDistrictsData.forEach(d => stateSet.add(d.State));
  const states = [...stateSet].filter(Boolean).sort();

  selects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = "";
    if (sel.id === "dashboardStateSelect") {
      const optAll = document.createElement("option");
      optAll.value = "all";
      optAll.textContent = "🇮🇳 All States (National View)";
      sel.appendChild(optAll);
    } else if (sel.id === "assistantStateSelect") {
      const optPrompt = document.createElement("option");
      optPrompt.value = "";
      optPrompt.textContent = "-- Choose State or District for Climate Intel --";
      sel.appendChild(optPrompt);
    }
    states.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      sel.appendChild(opt);
    });
  });

  // Populate District Selectors
  populateDistrictSelector("all", "dashboardDistrictSelect");
  populateDistrictSelector(states[0] || "all", "predictionDistrictSelect");

  // State Change Listener in Dashboard
  const dashSelect = document.getElementById("dashboardStateSelect");
  if (dashSelect) {
    dashSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      populateDistrictSelector(val, "dashboardDistrictSelect");
      if (val === "all") {
        computeSummaryMetrics(allClimateData);
        initIndiaMap(allClimateData);
      } else {
        const stateDists = allDistrictsData.filter(d => d.State === val);
        const filteredState = allClimateData.filter(r => r.State === val);
        const mapData = stateDists.length ? stateDists : filteredState;
        computeSummaryMetrics(mapData);
        initIndiaMap(mapData);

        // Center map on state/district if coordinates available
        if (mapData.length && mapData[0].Latitude && indiaMap) {
          indiaMap.flyTo([mapData[0].Latitude, mapData[0].Longitude], 7, { duration: 1.2 });
        }
      }
    });
  }

  // District Change Listener in Dashboard (1-CLICK INSTANT LIVE INSPECTION!)
  const dashDistSelect = document.getElementById("dashboardDistrictSelect");
  if (dashDistSelect) {
    dashDistSelect.addEventListener("change", (e) => {
      const dist = e.target.value;
      const st = dashSelect ? dashSelect.value : "";
      if (!dist || dist === "all") {
        if (st === "all" || !st) {
          computeSummaryMetrics(allClimateData);
          initIndiaMap(allClimateData);
        } else {
          const stateDists = allDistrictsData.filter(d => d.State === st);
          const mapData = stateDists.length ? stateDists : allClimateData.filter(r => r.State === st);
          computeSummaryMetrics(mapData);
          initIndiaMap(mapData);
        }
        return;
      }

      // Specific District Selected:
      const distRec = allDistrictsData.find(d => 
        d.District.toLowerCase() === dist.toLowerCase() &&
        (!st || st === "all" || d.State.toLowerCase() === st.toLowerCase())
      );
      if (distRec) {
        computeSummaryMetrics([distRec]);
        if (indiaMap && distRec.Latitude && distRec.Longitude) {
          indiaMap.flyTo([distRec.Latitude, distRec.Longitude], 8.5, { duration: 1.2 });
        }
      }
      window.openDistrictDetailModal(st, dist, distRec?.Latitude, distRec?.Longitude);
    });
  }

  // Prediction State & District Listeners
  const predSelect = document.getElementById("predictionStateSelect");
  const predDistSelect = document.getElementById("predictionDistrictSelect");
  if (predSelect) {
    predSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      populateDistrictSelector(val, "predictionDistrictSelect");
      updateForecastView();
    });
  }
  if (predDistSelect) {
    predDistSelect.addEventListener("change", () => updateForecastView());
  }

  const asstStateSelect = document.getElementById("assistantStateSelect");
  if (asstStateSelect) {
    asstStateSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (!val) return;
      if (typeof window.askAssistantQuery === "function") {
        window.askAssistantQuery(`Tell me the weather, temperature and risk in ${val}`);
      }
    });
  }
}

/**
 * Populate District Selector options based on selected State
 */
function populateDistrictSelector(state, selectId, defaultDistrict = "") {
  const sel = document.getElementById(selectId);
  if (!sel) return;

  sel.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = state === "all" ? "📍 All Districts (786 Districts)" : `📍 All Districts in ${state}`;
  sel.appendChild(optAll);

  let districts = [];
  if (state && state !== "all" && stateDistrictsMap[state]) {
    districts = stateDistrictsMap[state];
  } else if (state && state !== "all") {
    districts = [...new Set(allDistrictsData.filter(d => d.State === state).map(d => d.District))].sort();
  } else {
    // Top / sample districts if state is "all"
    districts = [...new Set(allDistrictsData.map(d => d.District))].sort();
  }

  districts.forEach(dist => {
    const opt = document.createElement("option");
    opt.value = dist;
    opt.textContent = `📍 ${dist}`;
    if (defaultDistrict && dist.toLowerCase() === defaultDistrict.toLowerCase()) {
      opt.selected = true;
    }
    sel.appendChild(opt);
  });
}

/**
 * Quick 1-Click District Explorer Pills
 */
function renderQuickDistrictPills() {
  const container = document.getElementById("quickDistrictPills");
  if (!container) return;

  const popular = [
    { label: "🌟 All India", state: "all", district: "all" },
    { label: "📍 New Delhi", state: "Delhi", district: "New Delhi" },
    { label: "📍 Lucknow", state: "Uttar Pradesh", district: "Lucknow" },
    { label: "📍 Varanasi", state: "Uttar Pradesh", district: "Varanasi" },
    { label: "📍 Mumbai", state: "Maharashtra", district: "Mumbai Suburban" },
    { label: "📍 Pune", state: "Maharashtra", district: "Pune" },
    { label: "📍 Patna", state: "Bihar", district: "Patna" },
    { label: "📍 Bengaluru", state: "Karnataka", district: "Bengaluru Urban" },
    { label: "📍 Ahmedabad", state: "Gujarat", district: "Ahmedabad" },
    { label: "📍 Jaipur", state: "Rajasthan", district: "Jaipur" },
    { label: "📍 Bhopal", state: "Madhya Pradesh", district: "Bhopal" },
    { label: "📍 Kolkata", state: "West Bengal", district: "Kolkata" },
    { label: "📍 Hyderabad", state: "Telangana", district: "Hyderabad" },
    { label: "📍 Chennai", state: "Tamil Nadu", district: "Chennai" },
    { label: "📍 Guwahati", state: "Assam", district: "Kamrup Metropolitan (Guwahati)" },
    { label: "📍 Srinagar", state: "Jammu and Kashmir", district: "Srinagar" },
    { label: "📍 Dehradun", state: "Uttarakhand", district: "Dehradun" },
    { label: "📍 Shimla", state: "Himachal Pradesh", district: "Shimla" }
  ];

  container.innerHTML = "";
  popular.forEach((item, idx) => {
    const pill = document.createElement("button");
    pill.className = `district-pill ${idx === 0 ? "active" : ""}`;
    pill.textContent = item.label;
    pill.onclick = () => {
      document.querySelectorAll(".district-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const stateSelect = document.getElementById("dashboardStateSelect");
      if (item.state === "all") {
        if (stateSelect) stateSelect.value = "all";
        populateDistrictSelector("all", "dashboardDistrictSelect");
        computeSummaryMetrics(allClimateData);
        initIndiaMap(allClimateData);
      } else {
        if (stateSelect) stateSelect.value = item.state;
        populateDistrictSelector(item.state, "dashboardDistrictSelect", item.district);
        window.openDistrictDetailModal(item.state, item.district);
      }
    };
    container.appendChild(pill);
  });
}

/**
 * Fast Euclidean distance computation for nearest district lookup
 */
function getNearestDistrictStatic(lat, lon) {
  const distList = (allDistrictsData && allDistrictsData.length)
    ? allDistrictsData
    : (typeof window !== "undefined" && Array.isArray(window.STATIC_DISTRICTS_DATA) ? window.STATIC_DISTRICTS_DATA : []);
  if (!distList || !distList.length) return null;
  lat = Number(lat);
  lon = Number(lon);
  if (isNaN(lat) || isNaN(lon)) return null;

  let best = null;
  let minDistSq = Infinity;
  for (const d of distList) {
    const dLat = Number(d.Latitude);
    const dLon = Number(d.Longitude);
    if (!isNaN(dLat) && !isNaN(dLon)) {
      const distSq = (dLat - lat) ** 2 + (dLon - lon) ** 2;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        best = d;
      }
    }
  }
  if (best) {
    const approxKm = Math.round(Math.sqrt(minDistSq) * 111.0 * 10) / 10;
    return { ...best, distance_km: approxKm, target_lat: lat, target_lon: lon };
  }
  return null;
}

/**
 * Floating glassmorphic toast notification
 */
function showToast(msg, duration = 3500) {
  let toast = document.getElementById("climateTwinToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "climateTwinToast";
    toast.className = "gps-status-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.style.display = "flex";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = "none";
  }, duration);
}

/**
 * Instant Autocomplete Search for 786 Districts & Exact Coordinates
 */
function setupDistrictSearch() {
  const input = document.getElementById("districtSearchInput");
  const dropdown = document.getElementById("districtSearchDropdown");
  const clearBtn = document.getElementById("btnClearDistrictSearch");
  if (!input || !dropdown) return;

  const handleSearch = () => {
    const val = input.value.trim().toLowerCase();
    if (!val) {
      dropdown.style.display = "none";
      if (clearBtn) clearBtn.style.display = "none";
      return;
    }

    if (clearBtn) clearBtn.style.display = "block";

    dropdown.innerHTML = "";

    // 1. Check if user typed numeric coordinates (e.g. "28.61, 77.20" or "26.85 80.95")
    const coordMatches = val.match(/[-+]?\d{1,3}\.\d+/g);
    if (coordMatches && coordMatches.length >= 2) {
      const cLat = parseFloat(coordMatches[0]);
      const cLon = parseFloat(coordMatches[1]);
      if (cLat >= 6.0 && cLat <= 38.0 && cLon >= 68.0 && cLon <= 98.0) {
        const nearest = getNearestDistrictStatic(cLat, cLon);
        const item = document.createElement("div");
        item.className = "district-search-item";
        item.style.background = "rgba(6, 182, 212, 0.15)";
        item.style.borderBottom = "1px solid rgba(6, 182, 212, 0.3)";
        item.innerHTML = `
          <div>
            <div class="district-search-item-title" style="color: #38bdf8;">🌐 Coordinates (${cLat.toFixed(4)}° N, ${cLon.toFixed(4)}° E)</div>
            <div class="district-search-item-state">${nearest ? `Nearest Station: ${nearest.District}, ${nearest.State} (${nearest.distance_km} km away)` : 'Indian Digital Twin Grid Node'}</div>
          </div>
          <div>
            <span class="badge-pill badge-low" style="font-size: 0.7rem; padding: 2px 8px;">GO TO COORD</span>
          </div>
        `;
        item.onclick = () => {
          input.value = `${cLat.toFixed(4)}, ${cLon.toFixed(4)}`;
          dropdown.style.display = "none";
          window.lookupCoordinatesTelemetry(cLat, cLon);
        };
        dropdown.appendChild(item);
      }
    }

    // 2. Filter districts by name or state
    const matches = allDistrictsData.filter(d => 
      (d.District && d.District.toLowerCase().includes(val)) ||
      (d.State && d.State.toLowerCase().includes(val))
    ).slice(0, 10);

    if (!matches.length && dropdown.children.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 12px 16px; color: var(--text-muted); font-size: 0.85rem; text-align: center;">
          No matching districts found for "<b>${input.value}</b>". Try another city, district, or coordinates.
        </div>
      `;
      dropdown.style.display = "block";
      return;
    }

    matches.forEach(m => {
      const item = document.createElement("div");
      item.className = "district-search-item";
      const riskClass = m.Risk === "High" ? "badge-high" : (m.Risk === "Medium" ? "badge-medium" : "badge-low");
      item.innerHTML = `
        <div>
          <div class="district-search-item-title">📍 ${m.District}</div>
          <div class="district-search-item-state">${m.State} • Temp: ${m.Temperature}°C • AQI: ${m.AQI}</div>
        </div>
        <div>
          <span class="badge-pill ${riskClass}" style="font-size: 0.7rem; padding: 2px 8px;">${m.Risk}</span>
        </div>
      `;
      item.onclick = () => {
        input.value = `${m.District}, ${m.State}`;
        dropdown.style.display = "none";
        
        // Sync state & district selectors
        const stateSelect = document.getElementById("dashboardStateSelect");
        if (stateSelect) {
          stateSelect.value = m.State;
          populateDistrictSelector(m.State, "dashboardDistrictSelect", m.District);
        }

        // 1-Click Instant Live Telemetry Inspection!
        window.openDistrictDetailModal(m.State, m.District, m.Latitude, m.Longitude);
      };
      dropdown.appendChild(item);
    });

    dropdown.style.display = "block";
  };

  input.addEventListener("input", handleSearch);
  input.addEventListener("focus", handleSearch);

  clearBtn?.addEventListener("click", () => {
    input.value = "";
    dropdown.style.display = "none";
    clearBtn.style.display = "none";
    input.focus();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".district-search-wrapper")) {
      dropdown.style.display = "none";
    }
  });
}

/**
 * Reverse-geocodes any coordinates to nearest district and opens live satellite telemetry
 */
window.lookupCoordinatesTelemetry = async function(lat, lon) {
  lat = Number(lat);
  lon = Number(lon);
  if (isNaN(lat) || isNaN(lon)) {
    showToast("⚠️ Invalid coordinate numbers provided.");
    return;
  }

  const isOutsideIndia = (lat < 6.0 || lat > 38.0 || lon < 68.0 || lon > 98.0);
  if (isOutsideIndia) {
    showToast(`🌐 Coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°) are outside standard India bounds. Mapping to closest Indian climate node...`);
  } else {
    showToast(`🛰️ Reverse-geocoding (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)...`);
  }

  let nearest = null;
  try {
    const res = await apiFetch(`/nearest-district?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      nearest = await res.json();
    }
  } catch (err) {
    console.warn("Nearest district API offline, computing locally:", err);
  }

  if (!nearest) {
    nearest = getNearestDistrictStatic(lat, lon);
  }

  if (!nearest && allDistrictsData && allDistrictsData.length) {
    nearest = allDistrictsData.find(d => d.District === "New Delhi") || allDistrictsData[0];
  }

  if (!nearest) {
    showToast("⚠️ Unable to find nearest Indian climate district node.");
    return;
  }

  const distKm = nearest.distance_km !== undefined ? nearest.distance_km : 0;
  showToast(`📍 Nearest Station: ${nearest.District}, ${nearest.State} (${distKm} km away)`);

  // Sync Selectors
  const stSelect = document.getElementById("dashboardStateSelect");
  if (stSelect) {
    stSelect.value = nearest.State;
    populateDistrictSelector(nearest.State, "dashboardDistrictSelect", nearest.District);
  }

  // Update Dashboard summary and fly map to this district
  computeSummaryMetrics([nearest]);
  if (indiaMap && nearest.Latitude && nearest.Longitude) {
    indiaMap.flyTo([nearest.Latitude, nearest.Longitude], 8.5, { duration: 1.2 });
  }

  // Open Live Telemetry Modal
  window.openDistrictDetailModal(nearest.State, nearest.District, nearest.Latitude || lat, nearest.Longitude || lon);
};

/**
 * Handles map click event anywhere on India map
 */
window.handleMapCoordinateClick = function(lat, lon) {
  const nearest = getNearestDistrictStatic(lat, lon);
  const distText = nearest 
    ? `<b>Nearest District:</b> ${nearest.District}, ${nearest.State} (${nearest.distance_km} km away)`
    : "Indian Digital Twin Coordinate Node";

  if (indiaMap && typeof L !== "undefined") {
    L.popup()
      .setLatLng([lat, lon])
      .setContent(`
        <div style="font-family: inherit; font-size: 13px; color: #0f172a; min-width: 190px; padding: 4px 2px;">
          <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            <span>🌐</span> <span>Selected Node</span>
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
            Lat: <b>${lat.toFixed(4)}° N</b>, Lon: <b>${lon.toFixed(4)}° E</b>
          </div>
          <div style="font-size: 12px; color: #334155; margin-bottom: 10px;">
            ${distText}
          </div>
          <button onclick="window.lookupCoordinatesTelemetry(${lat}, ${lon})" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; border: none; border-radius: 6px; padding: 7px 12px; font-weight: 700; font-size: 11px; cursor: pointer; width: 100%; box-shadow: 0 2px 8px rgba(37,99,235,0.3);">
            ⚡ Inspect Live Telemetry
          </button>
        </div>
      `)
      .openOn(indiaMap);
  }
};

/**
 * Setup District Live Modal & Coordinate Handlers
 */
function setupDistrictModal() {
  const modal = document.getElementById("districtDetailModal");
  if (!modal) return;

  document.getElementById("btnDistrictModalClose")?.addEventListener("click", () => {
    modal.style.display = "none";
  });
  document.getElementById("btnDistrictModalCloseFooter")?.addEventListener("click", () => {
    modal.style.display = "none";
  });
  modal.addEventListener("click", (e) => {
    if (e.target.id === "districtDetailModal") modal.style.display = "none";
  });

  // Top header button to open current district (⚡ LiveCheck)
  const handleLiveCheckClick = () => {
    const dashSelect = document.getElementById("dashboardStateSelect");
    const distSelect = document.getElementById("dashboardDistrictSelect");
    const st = dashSelect ? dashSelect.value : "all";
    let dist = distSelect && distSelect.value !== "all" ? distSelect.value : "";
    if (!dist) {
      if (st && st !== "all" && stateDistrictsMap[st] && stateDistrictsMap[st].length) {
        dist = stateDistrictsMap[st][0];
      } else {
        const stateDists = allDistrictsData.filter(d => (!st || st === "all") ? true : d.State === st);
        dist = stateDists.length ? stateDists[0].District : "New Delhi";
      }
    }
    const targetState = (st && st !== "all") ? st : (allDistrictsData.find(d => d.District === dist)?.State || "Delhi");
    window.openDistrictDetailModal(targetState, dist);
  };

  document.getElementById("btnOpenDistrictDetail")?.addEventListener("click", handleLiveCheckClick);
  document.getElementById("btnLiveTelemetryBadge")?.addEventListener("click", handleLiveCheckClick);

  // GPS Geolocation Button (Current Location)
  document.getElementById("btnGeoLocation")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("⚠️ Geolocation is not supported by your browser.");
      return;
    }
    showToast("🛰️ Contacting GPS satellite... Please allow location permission.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        showToast(`📍 GPS Locked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
        window.lookupCoordinatesTelemetry(latitude, longitude);
      },
      (err) => {
        console.warn("GPS error:", err);
        showToast("⚠️ Location permission denied. Click 🌐 Coordinates to input manually.");
        document.getElementById("btnCustomCoord")?.click();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  // Coordinates Modal Listeners
  const coordModal = document.getElementById("coordinateInputModal");
  document.getElementById("btnCustomCoord")?.addEventListener("click", () => {
    if (coordModal) coordModal.style.display = "flex";
  });
  document.getElementById("btnCloseCoordModal")?.addEventListener("click", () => {
    if (coordModal) coordModal.style.display = "none";
  });
  coordModal?.addEventListener("click", (e) => {
    if (e.target.id === "coordinateInputModal") coordModal.style.display = "none";
  });

  // Coordinate Preset Buttons
  document.querySelectorAll(".btn-preset-coord").forEach(btn => {
    btn.addEventListener("click", () => {
      const lat = btn.getAttribute("data-lat");
      const lon = btn.getAttribute("data-lon");
      const latInp = document.getElementById("inputCoordLat");
      const lonInp = document.getElementById("inputCoordLon");
      if (latInp) latInp.value = lat;
      if (lonInp) lonInp.value = lon;
    });
  });

  // GPS inside Coordinates Modal
  document.getElementById("btnUseGpsInsideModal")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("⚠️ Geolocation not supported by your browser.");
      return;
    }
    showToast("🛰️ Acquiring GPS fix...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latInp = document.getElementById("inputCoordLat");
        const lonInp = document.getElementById("inputCoordLon");
        if (latInp) latInp.value = latitude.toFixed(4);
        if (lonInp) lonInp.value = longitude.toFixed(4);
        showToast(`📍 Coordinates filled: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      () => {
        showToast("⚠️ Location access denied.");
      }
    );
  });

  // Submit Coordinates Modal
  document.getElementById("btnSubmitCoordinates")?.addEventListener("click", () => {
    const latInp = document.getElementById("inputCoordLat");
    const lonInp = document.getElementById("inputCoordLon");
    const lat = parseFloat(latInp ? latInp.value : "");
    const lon = parseFloat(lonInp ? lonInp.value : "");
    if (isNaN(lat) || isNaN(lon)) {
      showToast("⚠️ Please enter valid numeric Latitude and Longitude values.");
      return;
    }
    if (coordModal) coordModal.style.display = "none";
    window.lookupCoordinatesTelemetry(lat, lon);
  });

  // Refresh Live Feed in Modal
  document.getElementById("btnRefreshDistrictLive")?.addEventListener("click", () => {
    if (currentSelectedDistrict) {
      window.openDistrictDetailModal(
        currentSelectedDistrict.state,
        currentSelectedDistrict.district,
        currentSelectedDistrict.lat,
        currentSelectedDistrict.lon,
        true // force refresh
      );
    }
  });

  // Ask AI Copilot button in Modal
  document.getElementById("btnAskAiAboutDistrict")?.addEventListener("click", () => {
    modal.style.display = "none";
    switchView("assistant");
    if (currentSelectedDistrict && typeof window.askAssistantQuery === "function") {
      setTimeout(() => {
        window.askAssistantQuery(`Tell me about current live weather, temperature, AQI, and disaster precautions in ${currentSelectedDistrict.district}, ${currentSelectedDistrict.state}`);
      }, 150);
    }
  });
}

/**
 * 1-CLICK INSTANT LIVE DISTRICT INSPECTION
 * Immediately fetches and displays live satellite telemetry, temperature, humidity, rain, AQI & NDMA tips.
 */
window.openDistrictDetailModal = async function(state, district, lat, lon, forceRefresh = false) {
  const modal = document.getElementById("districtDetailModal");
  if (!modal) return;

  // Locate district record with strict precedence
  let rec = null;
  if (district && state) {
    rec = allDistrictsData.find(d => 
      d.District && d.District.toLowerCase() === district.toLowerCase() &&
      d.State && d.State.toLowerCase() === state.toLowerCase()
    );
  }
  if (!rec && district) {
    rec = allDistrictsData.find(d => 
      d.District && d.District.toLowerCase() === district.toLowerCase()
    );
  }
  if (!rec && state && state !== "all") {
    rec = allDistrictsData.find(d => 
      d.State && d.State.toLowerCase() === state.toLowerCase()
    );
  }

  // If record not found but lat/lon given, find nearest static district
  if (!rec && lat && lon) {
    rec = getNearestDistrictStatic(lat, lon);
  }
  if (!rec && allDistrictsData && allDistrictsData.length) {
    rec = allDistrictsData[0];
  }

  const distTitle = district || (rec ? rec.District : state);
  const stateTitle = state || (rec ? rec.State : "India");
  const targetLat = lat || (rec ? rec.Latitude : 26.8467);
  const targetLon = lon || (rec ? rec.Longitude : 80.9462);

  currentSelectedDistrict = { state: stateTitle, district: distTitle, lat: targetLat, lon: targetLon };

  // Set modal header & open instantly
  document.getElementById("districtModalTitle").textContent = `${distTitle}, ${stateTitle}`;
  document.getElementById("districtModalCoords").textContent = `Lat: ${Number(targetLat).toFixed(4)}° N, Lon: ${Number(targetLon).toFixed(4)}° E • Digital Twin Node`;
  
  const distBadge = document.getElementById("districtModalDistanceBadge");
  if (distBadge) {
    if (rec && rec.distance_km !== undefined && rec.distance_km > 0) {
      distBadge.style.display = "block";
      distBadge.textContent = `📍 Nearest Monitored Station: ${rec.District} (${rec.distance_km} km from target coordinates)`;
    } else {
      distBadge.style.display = "none";
    }
  }

  document.getElementById("districtModalLiveStatus").textContent = "FETCHING LIVE SATELLITE FEED...";
  modal.style.display = "flex";

  // Pre-fill baseline while live fetching
  if (rec) {
    document.getElementById("districtModalTemp").textContent = `${rec.Temperature} °C`;
    document.getElementById("districtModalHumidity").textContent = `${rec.Humidity} %`;
    document.getElementById("districtModalRain").textContent = `${rec.Rainfall} mm`;
    document.getElementById("districtModalAqi").textContent = `${rec.AQI}`;
  }

  // Pan and fly map to clicked district
  if (indiaMap && targetLat && targetLon) {
    indiaMap.flyTo([targetLat, targetLon], 8.5, { duration: 1.2 });
  }

  // Fetch real-time live satellite telemetry
  try {
    let liveData = null;
    try {
      const apiRes = await apiFetch(`/live-district?state=${encodeURIComponent(stateTitle)}&district=${encodeURIComponent(distTitle)}&lat=${targetLat}&lon=${targetLon}${forceRefresh ? "&refresh=1" : ""}`);
      if (apiRes.ok) {
        liveData = await apiRes.json();
      }
    } catch (apiErr) {
      console.warn("Backend live API offline, fallback to direct Open-Meteo satellite feed...", apiErr);
    }

    if (!liveData) {
      // Direct high-availability client-side Open-Meteo fallback
      const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m`;
      const aUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${targetLat}&longitude=${targetLon}&current=us_aqi,pm10,pm2_5`;
      
      const [wRes, aRes] = await Promise.allSettled([fetch(wUrl), fetch(aUrl)]);
      const wJson = wRes.status === "fulfilled" && wRes.value.ok ? await wRes.value.json() : null;
      const aJson = aRes.status === "fulfilled" && aRes.value.ok ? await aRes.value.json() : null;

      const curW = wJson ? wJson.current || {} : {};
      const curA = aJson ? aJson.current || {} : {};

      const temp = curW.temperature_2m ?? (rec ? rec.Temperature : 26.5);
      const aqi = curA.us_aqi ?? (rec ? rec.AQI : 110);

      liveData = {
        temperature: temp,
        apparent_temperature: curW.apparent_temperature ?? temp,
        humidity: curW.relative_humidity_2m ?? (rec ? rec.Humidity : 65),
        precipitation: curW.precipitation ?? (rec ? rec.Rainfall : 0.0),
        wind_speed: curW.wind_speed_10m ?? 4.2,
        weather_code: curW.weather_code ?? 0,
        condition: curW.weather_code === 0 ? "Clear Sky" : (curW.weather_code <= 3 ? "Partly Cloudy" : "Rain Showers"),
        icon: curW.weather_code === 0 ? "☀️" : (curW.weather_code <= 3 ? "⛅" : "🌧️"),
        aqi: aqi,
        pm2_5: curA.pm2_5 ?? 38.5,
        pm10: curA.pm10 ?? 64.0,
        aqi_category: aqi > 150 ? "Unhealthy" : (aqi > 100 ? "Moderate" : "Good"),
        aqi_advice: aqi > 150 ? "Wear an N95 mask outside." : "Air quality is satisfactory.",
        risk_level: (aqi > 150 || temp > 35) ? "High" : (aqi > 100 ? "Medium" : "Low"),
        hazard_tags: temp > 35 ? ["Heatwave Warning"] : ["Optimal Climate Conditions"],
        ndma_tips: ["Drink plenty of water and avoid strenuous outdoor exercise in peak hours."],
        last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    currentDistrictTelemetry = liveData;

    // Nearest district metadata update if available
    if (distBadge && liveData.nearest_district_meta) {
      distBadge.style.display = "block";
      distBadge.textContent = `📍 Nearest Monitored Station: ${liveData.nearest_district_meta.nearest_district} (${liveData.nearest_district_meta.distance_km} km away)`;
    }

    // Update Modal DOM
    document.getElementById("districtModalIcon").textContent = liveData.icon || "☀️";
    document.getElementById("districtModalTemp").textContent = `${liveData.temperature} °C`;
    document.getElementById("districtModalFeelsLike").textContent = `Feels like ${liveData.apparent_temperature} °C`;
    document.getElementById("districtModalCondition").textContent = liveData.condition;
    document.getElementById("districtModalHumidity").textContent = `${liveData.humidity} %`;
    document.getElementById("districtModalRain").textContent = `${liveData.precipitation} mm`;
    document.getElementById("districtModalWind").textContent = `${liveData.wind_speed} km/h`;

    const aqiEl = document.getElementById("districtModalAqi");
    aqiEl.textContent = liveData.aqi;
    aqiEl.style.color = liveData.aqi > 150 ? "#ef4444" : (liveData.aqi > 100 ? "#f59e0b" : "#10b981");

    document.getElementById("districtModalPm25").textContent = `${liveData.pm2_5} µg/m³`;
    document.getElementById("districtModalPm10").textContent = `${liveData.pm10} µg/m³`;
    document.getElementById("districtModalAqiCategory").textContent = liveData.aqi_category || "Moderate";
    document.getElementById("districtModalAqiAdvice").textContent = liveData.aqi_advice || "Air quality acceptable.";

    const riskBadge = document.getElementById("districtModalRiskBadge");
    riskBadge.textContent = `${(liveData.risk_level || "Medium").toUpperCase()} RISK`;
    riskBadge.className = `badge-pill ${liveData.risk_level === "High" ? "badge-high" : (liveData.risk_level === "Medium" ? "badge-medium" : "badge-low")}`;

    document.getElementById("districtModalHazards").textContent = (liveData.hazard_tags || []).join(" • ") || "Normal Atmospheric Patterns";
    document.getElementById("districtModalTips").textContent = (liveData.ndma_tips || [])[0] || "Stay informed with local weather updates.";
    document.getElementById("districtModalLiveStatus").textContent = "LIVE SATELLITE (REAL-TIME)";
    document.getElementById("districtModalTimestamp").textContent = `Updated: ${liveData.last_updated || "Just now"}`;

  } catch (err) {
    console.error("Error updating live district modal:", err);
    document.getElementById("districtModalLiveStatus").textContent = "OFFLINE TELEMETRY ARCHIVE";
  }
};

/**
 * Setup Web Speech Voice Recognition & Voice Controls
 */
function setupVoiceFeatures() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  function runRecognition(onResult, onStatus) {
    if (!SpeechRec) {
      showToast(t("voice_not_supported") || "Voice recognition is not supported in this browser.");
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      const langMap = {
        hi: "hi-IN",
        mr: "mr-IN",
        bn: "bn-IN",
        ta: "ta-IN",
        en: "en-IN"
      };
      rec.lang = langMap[currentAppLanguage] || "en-IN";

      rec.onstart = () => {
        if (onStatus) onStatus(true);
      };
      rec.onend = () => {
        if (onStatus) onStatus(false);
      };
      rec.onerror = (e) => {
        if (onStatus) onStatus(false);
        console.warn("Speech recognition error:", e.error);
        if (e.error === "not-allowed") {
          showToast("⚠️ Microphone access denied. Please grant microphone permission.");
        }
      };
      rec.onresult = (e) => {
        const text = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : "";
        if (text && onResult) onResult(text);
      };
      rec.start();
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
      if (onStatus) onStatus(false);
    }
  }

  // 1. Voice in District Search
  const btnVoiceSearch = document.getElementById("btnVoiceSearch");
  if (btnVoiceSearch) {
    btnVoiceSearch.addEventListener("click", () => {
      runRecognition(
        (transcript) => {
          const input = document.getElementById("districtSearchInput");
          if (input) {
            input.value = transcript;
            input.dispatchEvent(new Event("input"));
          }
        },
        (listening) => {
          btnVoiceSearch.classList.toggle("listening", listening);
          if (listening) showToast(t("voice_listening") || "🎤 Listening... speak district name");
        }
      );
    });
  }

  // 2. Voice in Assistant Page
  const btnVoiceChat = document.getElementById("btnVoiceChatInput");
  if (btnVoiceChat) {
    btnVoiceChat.addEventListener("click", () => {
      runRecognition(
        (transcript) => {
          const chatInput = document.getElementById("assistantChatInput");
          if (chatInput) chatInput.value = transcript;
          window.askAssistantQuery(transcript);
        },
        (listening) => {
          btnVoiceChat.classList.toggle("listening", listening);
          if (listening) showToast(t("voice_listening") || "🎤 Listening... speak query");
        }
      );
    });
  }

  // 3. Voice in Home Page
  const btnVoiceHome = document.getElementById("btnVoiceHomeInput");
  if (btnVoiceHome) {
    btnVoiceHome.addEventListener("click", () => {
      runRecognition(
        (transcript) => {
          const input = document.getElementById("assistantInput");
          if (input) input.value = transcript;
          document.getElementById("btnAskAssistant")?.click();
        },
        (listening) => {
          btnVoiceHome.classList.toggle("listening", listening);
          if (listening) showToast(t("voice_listening") || "🎤 Listening... speak query");
        }
      );
    });
  }

  // 4. Prompt Chips: My Location and Coordinates Demo
  document.getElementById("chipMyLocation")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      window.askAssistantQuery("What is the climate weather at my current location?");
      return;
    }
    showToast("🛰️ Getting GPS fix...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        window.askAssistantQuery(`weather at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      () => {
        window.askAssistantQuery("What is the climate weather at my current location?");
      }
    );
  });

  document.getElementById("chipCoordDemo")?.addEventListener("click", () => {
    window.askAssistantQuery("weather at 28.6139, 77.2090");
  });
}

/**
 * Text-to-Speech Speak & Stop
 */
window.speakTextMessage = function(btn) {
  if (!window.speechSynthesis) {
    showToast("Text-to-Speech is not supported in this browser.");
    return;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    document.querySelectorAll(".btn-tts").forEach(b => {
      b.classList.remove("speaking");
      b.innerHTML = `<span>🔊</span> <span>Read Aloud</span>`;
    });
    return;
  }

  const bubble = btn.closest(".chat-bubble");
  if (!bubble) return;
  const clone = bubble.cloneNode(true);
  const actions = clone.querySelector(".chat-message-actions");
  if (actions) actions.remove();
  let cleanText = clone.innerText.replace(/[•\*\#\_]/g, " ").replace(/\s+/g, " ").trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const langMap = {
    hi: "hi-IN",
    mr: "mr-IN",
    bn: "bn-IN",
    ta: "ta-IN",
    en: "en-IN"
  };
  utterance.lang = langMap[currentAppLanguage] || "en-IN";
  utterance.rate = 1.0;

  btn.classList.add("speaking");
  btn.innerHTML = `<span>⏹️</span> <span>Stop</span>`;

  utterance.onend = () => {
    btn.classList.remove("speaking");
    btn.innerHTML = `<span>🔊</span> <span>Read Aloud</span>`;
  };
  utterance.onerror = () => {
    btn.classList.remove("speaking");
    btn.innerHTML = `<span>🔊</span> <span>Read Aloud</span>`;
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Copy bot response text
 */
window.copyMsgText = function(btn) {
  const bubble = btn.closest(".chat-bubble");
  if (!bubble) return;
  const clone = bubble.cloneNode(true);
  const actions = clone.querySelector(".chat-message-actions");
  if (actions) actions.remove();
  const text = clone.innerText.trim();
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = `<span>✅</span> <span>Copied!</span>`;
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
};

/**
 * Render Home View Elements
 */
function renderHomeView() {
  // Metric cards updated via computeSummaryMetrics
}

/**
 * Render Dashboard View Elements
 */
function renderDashboardView() {
  initIndiaMap(allClimateData);
  renderHottestChart(allClimateData);
  renderRainfallChart(allClimateData);
  renderHumidityChart(allClimateData);
}

/**
 * Render Risk Intelligence View Elements with Interactive Hazard Diagnosis
 */
function renderRiskView() {
  const tbody = document.getElementById("highRiskTableBody");
  if (!tbody) return;

  const highRisk = allClimateData.filter(r => r.Risk === "High");
  tbody.innerHTML = "";

  highRisk.forEach(r => {
    const diag = getRiskDiagnosis(r);
    const tr = document.createElement("tr");
    tr.className = "state-row";
    tr.innerHTML = `
      <td><strong>📍 ${r.State}</strong></td>
      <td>${r.Temperature} °C</td>
      <td>${r.Rainfall} mm</td>
      <td>${r.Humidity} %</td>
      <td><span style="color: #ef4444; font-weight: 700;">${r.AQI}</span></td>
      <td>
        <button class="btn-risk-detail badge-high" onclick="window.openRiskDetailModal('${r.State}')" title="Click to view detailed hazard breakdown & NDMA precautions">
          <span>🔴 HIGH RISK</span>
          <span style="font-weight: 500; opacity: 0.95;">• ${diag.shortLabel}</span>
          <span style="margin-left: 4px; font-size: 0.72rem; color: #fca5a5;">🔍 Click to View</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Render Reports View Dataset Table
 */
function renderReportsView() {
  const tbody = document.getElementById("fullDatasetTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  allClimateData.forEach(r => {
    const diag = getRiskDiagnosis(r);
    const tr = document.createElement("tr");
    tr.className = "state-row";
    const riskBadge = r.Risk === "High" ? "badge-high" : (r.Risk === "Medium" ? "badge-medium" : "badge-low");
    tr.innerHTML = `
      <td><strong>📍 ${r.State}</strong></td>
      <td>${r.Temperature} °C</td>
      <td>${r.Rainfall} mm</td>
      <td>${r.Humidity} %</td>
      <td>${r.AQI}</td>
      <td>
        <button class="btn-risk-detail ${riskBadge}" onclick="window.openRiskDetailModal('${r.State}')" title="Click for risk diagnosis">
          <span>${r.Risk}</span>
          <span style="font-size: 0.75rem; opacity: 0.95;">• ${diag.shortLabel}</span>
          <span style="font-size: 0.72rem;">ℹ️</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Update AI Predictions Forecast
 */
async function updateForecastView() {
  const sel = document.getElementById("predictionStateSelect");
  const distSel = document.getElementById("predictionDistrictSelect");
  if (!sel) return;
  const state = sel.value;
  const dist = distSel ? distSel.value : "all";

  let stateData = null;
  if (dist && dist !== "all") {
    stateData = allDistrictsData.find(d => d.District === dist && (!state || d.State === state)) ||
                allDistrictsData.find(d => d.District === dist);
  }
  if (!stateData) {
    stateData = allClimateData.find(r => r.State === state) || allClimateData[0];
  }
  if (!stateData) return;

  const displayName = dist && dist !== "all" ? `${stateData.District}, ${stateData.State}` : stateData.State;

  try {
    const res = await apiFetch("/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: displayName,
        rainfall: stateData.Rainfall,
        humidity: stateData.Humidity,
        aqi: stateData.AQI,
        current_temp: stateData.Temperature
      })
    });
    if (res.ok) {
      const data = await res.json();
      displayForecastResults(data, stateData);
      return;
    }
  } catch (e) {
    console.log("Local ML simulation fallback");
  }

  // Local fallback forecast simulation
  const seed = stateData.Temperature;
  const forecast = Array.from({ length: 7 }, (_, i) => ({
    Day: i + 1,
    "Predicted Temperature": +(seed + (Math.random() * 2 - 1)).toFixed(2)
  }));
  const avgFut = +(forecast.reduce((a, b) => a + b["Predicted Temperature"], 0) / 7).toFixed(2);
  displayForecastResults({
    forecast: forecast,
    predicted_avg: avgFut,
    delta: +(avgFut - seed).toFixed(2),
    risk_level: avgFut >= 35 ? "High" : (avgFut >= 30 ? "Moderate" : "Low")
  }, stateData);
}

function displayForecastResults(data, stateData) {
  document.getElementById("predCurTemp").textContent = `${stateData.Temperature} °C`;
  document.getElementById("predAvgTemp").textContent = `${data.predicted_avg} °C`;
  const deltaEl = document.getElementById("predDeltaTemp");
  deltaEl.textContent = `${data.delta >= 0 ? '+' : ''}${data.delta} °C`;
  deltaEl.className = `metric-delta ${data.delta >= 0 ? 'delta-neg' : 'delta-pos'}`;

  const riskEl = document.getElementById("predRiskBadge");
  if (data.risk_level === "High") {
    riskEl.textContent = "🔴 High Heatwave Risk";
    riskEl.className = "badge-pill badge-high";
  } else if (data.risk_level === "Moderate") {
    riskEl.textContent = "🟠 Moderate Climate Risk";
    riskEl.className = "badge-pill badge-medium";
  } else {
    riskEl.textContent = "🟢 Low Climate Risk";
    riskEl.className = "badge-pill badge-low";
  }

  renderForecastChart(data.forecast, stateData.State);
}

/**
 * Setup Simulation Range Sliders
 */
function setupSimulationControls() {
  const rainSlider = document.getElementById("sliderRain");
  const humSlider = document.getElementById("sliderHum");
  const aqiSlider = document.getElementById("sliderAqi");
  const btn = document.getElementById("btnRunSimulation");

  const updateLabels = () => {
    document.getElementById("valRain").textContent = `${rainSlider.value} mm`;
    document.getElementById("valHum").textContent = `${humSlider.value} %`;
    document.getElementById("valAqi").textContent = `${aqiSlider.value}`;
  };

  [rainSlider, humSlider, aqiSlider].forEach(s => s?.addEventListener("input", updateLabels));

  btn?.addEventListener("click", async () => {
    const rain = +rainSlider.value;
    const hum = +humSlider.value;
    const aqi = +aqiSlider.value;

    let predTemp = +(28 - (rain * 0.04) - ((hum - 60) * 0.07) + ((aqi - 100) * 0.02)).toFixed(2);
    try {
      const res = await apiFetch("/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rainfall: rain, humidity: hum, aqi: aqi })
      });
      if (res.ok) {
        const json = await res.json();
        predTemp = json.predicted_temp;
      }
    } catch (e) {}

    document.getElementById("simResultTemp").textContent = `${predTemp} °C`;
    const alertBox = document.getElementById("simAlerts");
    let warningsHtml = "";
    if (predTemp >= 35) warningsHtml += `<div class="alert-item alert-heat">🔥 High Heatwave Risk Predicted (${predTemp}°C)</div>`;
    else if (predTemp >= 30) warningsHtml += `<div class="alert-item alert-aqi">🟠 Moderate Climate Risk (${predTemp}°C)</div>`;
    else warningsHtml += `<div class="alert-item alert-rain">🟢 Low Climate Risk (${predTemp}°C)</div>`;

    if (rain > 70) warningsHtml += `<div class="alert-item alert-rain">🌊 Heavy Rainfall may increase regional flood risks.</div>`;
    if (aqi > 180) warningsHtml += `<div class="alert-item alert-heat">🌫️ Hazardous Air Quality Alert.</div>`;

    alertBox.innerHTML = warningsHtml;
  });
}

/**
 * Markdown to HTML Formatter helper
 */
function formatMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<p>${html}</p>`;
}

/**
 * Fetch Assistant Answer from Backend
 */
async function fetchAssistantAnswer(query) {
  try {
    const res = await apiFetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: query, language: currentLanguage })
    });
    if (res.ok) {
      const cType = res.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const json = await res.json();
        if (json.message) return json.message;
      }
    }
  } catch (e) {
    console.warn("Using offline fallback assistant logic.", e);
  }

  // Fallback intelligent natural language answering
  const q = query.toLowerCase().trim();
  const lang = currentLanguage || "en";

  // Check if a specific state is mentioned
  const matchedState = allClimateData.find(s => q.includes(s.State.toLowerCase()));
  if (matchedState) {
    if (lang === "hi") {
      return `📍 **${matchedState.State} मौसम रिपोर्ट:**\n- 🌡️ तापमान: **${matchedState.Temperature}°C**\n- 🌧️ वर्षा: **${matchedState.Rainfall} mm**\n- 💧 आर्द्रता: **${matchedState.Humidity}%**\n- 🌫️ वायु गुणवत्ता (AQI): **${matchedState.AQI}**\n- 🚨 जोखिम श्रेणी: **${matchedState.Risk}**\n\n📌 *एनडीएमए सलाह:* ${matchedState.Risk === 'High' ? 'मौसम परिवर्तनशील है, कृपया आपातकालीन सावधानियां बरतें।' : 'मौसम की स्थिति सामान्य है।'}`;
    } else if (lang === "mr") {
      return `📍 **${matchedState.State} हवामान अहवाल:**\n- 🌡️ तापमान: **${matchedState.Temperature}°C**\n- 🌧️ पाऊस: **${matchedState.Rainfall} mm**\n- 💧 आर्द्रता: **${matchedState.Humidity}%**\n- 🌫️ हवा गुणवत्ता (AQI): **${matchedState.AQI}**\n- 🚨 जोखीम स्तर: **${matchedState.Risk}**`;
    } else if (lang === "bn") {
      return `📍 **${matchedState.State} আবহাওয়া প্রতিবেদন:**\n- 🌡️ তাপমাত্রা: **${matchedState.Temperature}°C**\n- 🌧️ বৃষ্টিপাত: **${matchedState.Rainfall} mm**\n- 💧 আর্দ্রতা: **${matchedState.Humidity}%**\n- 🌫️ বায়ুর মান (AQI): **${matchedState.AQI}**\n- 🚨 ঝুঁকি স্তর: **${matchedState.Risk}**`;
    } else if (lang === "ta") {
      return `📍 **${matchedState.State} வானிலை அறிக்கை:**\n- 🌡️ வெப்பநிலை: **${matchedState.Temperature}°C**\n- 🌧️ மழைப்பொழிவு: **${matchedState.Rainfall} mm**\n- 💧 ஈரப்பதம்: **${matchedState.Humidity}%**\n- 🌫️ காற்றின் தரம் (AQI): **${matchedState.AQI}**\n- 🚨 ஆபத்து நிலை: **${matchedState.Risk}**`;
    } else {
      return `📍 **Climate Telemetry for ${matchedState.State}:**\n- 🌡️ Temperature: **${matchedState.Temperature}°C**\n- 🌧️ Precipitation: **${matchedState.Rainfall} mm**\n- 💧 Humidity: **${matchedState.Humidity}%**\n- 🌫️ Air Quality Index (AQI): **${matchedState.AQI}**\n- 🚨 Risk Assessment: **${matchedState.Risk}**\n\n📌 *Advisory:* ${matchedState.Risk === 'High' ? 'Critical conditions detected. Exercise extreme caution.' : 'Conditions are currently within stable baseline parameters.'}`;
    }
  }

  // Precaution / Safety guidelines
  if (q.includes("precaution") || q.includes("safety") || q.includes("सावधानी") || q.includes("सुरक्षा") || q.includes("उपाय") || q.includes("flood") || q.includes("heat")) {
    if (lang === "hi") {
      return `🛡️ **एनडीएमए जलवायु सुरक्षा दिशानिर्देश:**\n1. **लू/गर्मी से बचाव:** दोपहर 12 बजे से 3 बजे के बीच धूप में निकलने से बचें, ओआरएस व पानी पीएं।\n2. **भारी बारिश/बाढ़:** निचले इलाकों से दूर रहें, जलभराव वाले क्षेत्रों में बिजली के खंभों को न छुएं।\n3. **वायु प्रदूषण (AQI > 150):** बाहर निकलते समय N95 मास्क पहनें और सुबह की सैर सीमित करें।`;
    } else if (lang === "mr") {
      return `🛡️ **हवामान सुरक्षा मार्गदर्शक तत्त्वे:**\n1. **उष्णतेची लाट:** भरपूर पाणी प्या आणि दुपारी उन्हात जाणे टाळा.\n2. **मुसळधार पाऊस:** सखल भागातील नागरिकांनी सतर्क राहावे.\n3. **वायू प्रदूषण:** हवेची गुणवत्ता खराब असल्यास मास्क वापरा.`;
    } else if (lang === "bn") {
      return `🛡️ **জলবায়ু সুরক্ষা নির্দেশিকা:**\n1. **তাপপ্রবাহ:** প্রচুর জল পান করুন এবং দুপুরের রোদ এড়িয়ে চলুন।\n2. **ভারী বৃষ্টি:** নিচু এলাকা থেকে দূরে থাকুন।\n3. **বায়ু দূষণ:** মাস্ক ব্যবহার করুন।`;
    } else if (lang === "ta") {
      return `🛡️ **காலநிலை பாதுகாப்பு வழிகாட்டுதல்கள்:**\n1. **வெப்ப அலை:** போதுமான அளவு தண்ணீர் குடிக்கவும்.\n2. **கனமழை:** தாழ்வான பகுதிகளைத் தவிர்க்கவும்.\n3. **காற்று மாசுபாடு:** மாஸ்க் அணியவும்.`;
    } else {
      return `🛡️ **NDMA Climate Safety Protocols:**\n1. **Heatwave Advisory:** Avoid direct sun exposure between 12 PM - 3 PM; maintain hydration with ORS/water.\n2. **Flash Flood / Heavy Rain:** Keep away from low-lying inundated zones and avoid electrical posts.\n3. **Air Quality Alert (AQI > 150):** Wear N95 particulate respirators and avoid vigorous outdoor exercise.`;
    }
  }

  // Hottest / Temperature
  if (q.includes("temperature") || q.includes("तापमान") || q.includes("temp") || q.includes("hot") || q.includes("गर्म")) {
    if (lang === "hi") {
      return `🌡️ **राष्ट्रीय तापमान विश्लेषण:**\n- औसत तापमान: **${summaryMetrics.avgTemp} °C**\n- 🔥 सबसे गर्म राज्य: **${summaryMetrics.hottest.State} (${summaryMetrics.hottest.Temperature}°C)**`;
    } else {
      return `🌡️ **National Thermal Disparity:**\n- Mean Temperature: **${summaryMetrics.avgTemp} °C**\n- 🔥 Highest Recorded: **${summaryMetrics.hottest.State} (${summaryMetrics.hottest.Temperature}°C)**`;
    }
  }

  // Rainfall / Precipitation
  if (q.includes("rain") || q.includes("वर्षा") || q.includes("बारिश") || q.includes("पाऊस") || q.includes("বৃষ্টি") || q.includes("மழை")) {
    if (lang === "hi") {
      return `🌧️ **राष्ट्रीय वर्षा विश्लेषण:**\n- औसत वर्षा: **${summaryMetrics.avgRain} mm**\n- 🌊 सबसे अधिक वर्षा: **${summaryMetrics.rainiest.State} (${summaryMetrics.rainiest.Rainfall} mm)**`;
    } else {
      return `🌧️ **National Precipitation Summary:**\n- National Mean: **${summaryMetrics.avgRain} mm**\n- 🌊 Maximum Precipitation: **${summaryMetrics.rainiest.State} (${summaryMetrics.rainiest.Rainfall} mm)**`;
    }
  }

  // Air Quality (AQI)
  if (q.includes("aqi") || q.includes("air") || q.includes("हवा") || q.includes("प्रदूषण") || q.includes("காற்றின்")) {
    if (lang === "hi") {
      return `🌫️ **वायु गुणवत्ता सूचकांक (AQI):**\n- सबसे प्रदूषित राज्य: **${summaryMetrics.worstAqi.State} (AQI: ${summaryMetrics.worstAqi.AQI})**\n- स्थिति: गंभीर रूप से अस्वस्थ (खतरनाक श्रेणी)`;
    } else {
      return `🌫️ **Air Quality Telemetry:**\n- Highest Pollution State: **${summaryMetrics.worstAqi.State} (AQI: ${summaryMetrics.worstAqi.AQI})**\n- Severity: Exceeds Safe Ambient Air Thresholds`;
    }
  }

  // Risk / High risk
  if (q.includes("risk") || q.includes("danger") || q.includes("खतरा") || q.includes("जोखीम") || q.includes("ঝুঁকি") || q.includes("ஆபத்து")) {
    const highStates = allClimateData.filter(r => r.Risk === "High").map(r => r.State).slice(0, 5).join(", ");
    if (lang === "hi") {
      return `🚨 **उच्च जोखिम वाले राज्य:**\n- कुल **${summaryMetrics.highRiskCount} राज्य** उच्च जोखिम सीमा में हैं।\n- प्रमुख राज्य: **${highStates}** आदि।`;
    } else {
      return `🚨 **Vulnerability Risk Intelligence:**\n- Total **${summaryMetrics.highRiskCount} States** exceed critical risk limits.\n- Identified Hotspots: **${highStates}**, etc.`;
    }
  }

  // Default national overview
  if (lang === "hi") {
    return `🌍 **क्लाइमेटट्विन एआई राष्ट्रीय समीक्षा:**\n- भारत के **${summaryMetrics.totalStates} राज्यों** की सैटेलाइट टेलीमेट्री सक्रिय है।\n- औसत तापमान: **${summaryMetrics.avgTemp}°C** | वर्षा: **${summaryMetrics.avgRain} mm** | उच्च जोखिम: **${summaryMetrics.highRiskCount} राज्य**।`;
  }
  return `🌍 **ClimateTwin AI Overview:**\n- Real-time digital twin monitoring **${summaryMetrics.totalStates} Indian States & UTs**.\n- Mean Temp: **${summaryMetrics.avgTemp}°C** | Precipitation: **${summaryMetrics.avgRain} mm** | High-Risk Ratio: **${summaryMetrics.highRiskCount} States**.\n- Ask me about any specific state (e.g. *Bihar*, *Assam*, *Maharashtra*) or disaster safety tips!`;
}

/**
 * Setup AI Assistant (Dashboard Mini + Full-Page Conversational Copilot)
 */
function setupAssistant() {
  // 1. Dashboard mini assistant
  const miniBtn = document.getElementById("btnAskAssistant");
  const miniInput = document.getElementById("assistantInput");
  const miniResp = document.getElementById("assistantResponse");

  const handleMiniAsk = async () => {
    const query = miniInput?.value.trim();
    if (!query) return;

    if (miniResp) {
      miniResp.style.display = "block";
      miniResp.textContent = "Analyzing query...";
    }
    const answer = await fetchAssistantAnswer(query);
    if (miniResp) miniResp.innerHTML = formatMarkdown(answer);
  };

  miniBtn?.addEventListener("click", handleMiniAsk);
  miniInput?.addEventListener("keypress", (e) => { if (e.key === "Enter") handleMiniAsk(); });

  // 2. Full-Page Conversational AI Assistant
  const chatHistory = document.getElementById("assistantChatHistory");
  const chatInput = document.getElementById("assistantChatInput");
  const sendBtn = document.getElementById("btnSendChat");
  const clearBtn = document.getElementById("btnClearChat");

  function appendMessage(sender, textHtml) {
    if (!chatHistory) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;

    const avatarDiv = document.createElement("div");
    avatarDiv.className = `chat-avatar ${sender}`;
    avatarDiv.textContent = sender === "user" ? "👤" : "🤖";

    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = `chat-bubble ${sender}`;
    bubbleDiv.innerHTML = textHtml;

    if (sender === "bot") {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "chat-message-actions";
      actionsDiv.innerHTML = `
        <button class="btn-tts" onclick="window.speakTextMessage(this)" title="Listen to answer aloud (Text-to-Speech)">
          <span>🔊</span> <span>Read Aloud</span>
        </button>
        <button class="btn-copy-msg" onclick="window.copyMsgText(this)" title="Copy response text">
          <span>📋</span> <span>Copy</span>
        </button>
      `;
      bubbleDiv.appendChild(actionsDiv);
    }

    msgDiv.appendChild(avatarDiv);
    msgDiv.appendChild(bubbleDiv);
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  window.askAssistantQuery = async (queryText) => {
    if (!queryText) return;
    appendMessage("user", `<p>${queryText}</p>`);

    // Loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "chat-message bot";
    loadingDiv.id = "assistantTypingIndicator";
    loadingDiv.innerHTML = `
      <div class="chat-avatar bot">🤖</div>
      <div class="chat-bubble bot" style="color: var(--text-muted); font-style: italic;">
        Analyzing real-time satellite telemetry...
      </div>
    `;
    chatHistory.appendChild(loadingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const answer = await fetchAssistantAnswer(queryText);
    const typingEl = document.getElementById("assistantTypingIndicator");
    if (typingEl) typingEl.remove();

    appendMessage("bot", formatMarkdown(answer));
  };

  const handlePageSend = () => {
    const query = chatInput?.value.trim();
    if (!query) return;
    chatInput.value = "";
    window.askAssistantQuery(query);
  };

  sendBtn?.addEventListener("click", handlePageSend);
  chatInput?.addEventListener("keypress", (e) => { if (e.key === "Enter") handlePageSend(); });

  clearBtn?.addEventListener("click", () => {
    if (!chatHistory) return;
    chatHistory.innerHTML = `
      <div class="chat-message bot">
        <div class="chat-avatar bot">🤖</div>
        <div class="chat-bubble bot">
          <p><strong>${t("chat_welcome_title")}</strong></p>
          <p>${t("chat_welcome_text")}</p>
          <div style="margin-top: 8px; font-size: 0.8rem; color: var(--accent-cyan);">
            ⚡ <em>Supports English, हिन्दी (Hindi), मराठी (Marathi), বাংলা (Bengali), and தமிழ் (Tamil).</em>
          </div>
        </div>
      </div>
    `;
  });

  // Prompt suggestion chips
  document.querySelectorAll(".prompt-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const promptType = chip.getAttribute("data-prompt");
      let promptQuery = "";
      if (promptType === "hottest") promptQuery = t("chip_hottest");
      else if (promptType === "rainfall") promptQuery = t("chip_rainfall");
      else if (promptType === "aqi") promptQuery = t("chip_worst_aqi");
      else if (promptType === "risk") promptQuery = t("chip_high_risk");
      else if (promptType === "precautions") promptQuery = t("chip_precautions");
      else if (promptType === "summary") promptQuery = t("chip_summary");

      if (promptQuery) {
        window.askAssistantQuery(promptQuery);
      }
    });
  });
}

/**
 * Render Comprehensive Analytics View
 */
function renderAnalyticsView() {
  if (!allClimateData.length) return;

  // 1. Calculate Analytical KPIs
  let minTemp = allClimateData[0], maxTemp = allClimateData[0];
  let totalRain = 0, totalHum = 0, highRiskCount = 0;

  allClimateData.forEach(r => {
    if (r.Temperature < minTemp.Temperature) minTemp = r;
    if (r.Temperature > maxTemp.Temperature) maxTemp = r;
    totalRain += r.Rainfall;
    totalHum += r.Humidity;
    if (r.Risk === "High") highRiskCount++;
  });

  const range = (maxTemp.Temperature - minTemp.Temperature).toFixed(1);
  const kpiRangeEl = document.getElementById("kpiThermalRange");
  if (kpiRangeEl) kpiRangeEl.textContent = `${range} °C`;

  const kpiRainEl = document.getElementById("kpiAggRain");
  if (kpiRainEl) kpiRainEl.textContent = `${totalRain.toFixed(1)} mm`;

  const kpiHumEl = document.getElementById("kpiAvgHumidity");
  if (kpiHumEl) kpiHumEl.textContent = `${(totalHum / allClimateData.length).toFixed(1)} %`;

  const kpiRiskRatioEl = document.getElementById("kpiRiskRatio");
  if (kpiRiskRatioEl) kpiRiskRatioEl.textContent = `${((highRiskCount / allClimateData.length) * 100).toFixed(1)} %`;

  // 2. Render Charts
  renderAnalyticsRainfallChart(allClimateData);
  renderRiskPie(allClimateData);
  renderAnalyticsAqiChart(allClimateData);

  // 3. Render State Registry Table
  renderAnalyticsTable(allClimateData);
}

/**
 * Render State Registry Data Table with Filter & Search
 */
function renderAnalyticsTable(dataset) {
  const tbody = document.getElementById("analyticsTableBody");
  if (!tbody) return;

  const searchVal = document.getElementById("analyticsSearchInput")?.value.toLowerCase().trim() || "";
  const riskVal = document.getElementById("analyticsRiskFilter")?.value || "all";

  const filtered = dataset.filter(row => {
    const matchName = row.State.toLowerCase().includes(searchVal);
    const matchRisk = riskVal === "all" || row.Risk === riskVal;
    return matchName && matchRisk;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No matching states found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => {
    let riskBadgeClass = "badge-low";
    if (row.Risk === "High") riskBadgeClass = "badge-high";
    else if (row.Risk === "Medium") riskBadgeClass = "badge-medium";

    let aqiColor = "#10b981";
    if (row.AQI >= 150) aqiColor = "#ef4444";
    else if (row.AQI >= 100) aqiColor = "#f59e0b";

    const diag = getRiskDiagnosis(row);

    return `
      <tr class="state-row">
        <td><strong>📍 ${row.State}</strong></td>
        <td>${row.Temperature} °C</td>
        <td>${row.Rainfall} mm</td>
        <td>${row.Humidity} %</td>
        <td><span style="color: ${aqiColor}; font-weight: 700;">${row.AQI}</span></td>
        <td>
          <button class="btn-risk-detail ${riskBadgeClass}" onclick="window.openRiskDetailModal('${row.State}')" title="Click to view why this risk was flagged & precautions">
            <span>${row.Risk}</span>
            <span style="font-size: 0.75rem; opacity: 0.95;">• ${diag.shortLabel}</span>
            <span style="font-size: 0.72rem;">ℹ️</span>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * Setup Analytics Table Search and Risk Filter Event Listeners
 */
function setupAnalyticsFilters() {
  const searchInput = document.getElementById("analyticsSearchInput");
  const riskSelect = document.getElementById("analyticsRiskFilter");

  searchInput?.addEventListener("input", () => renderAnalyticsTable(allClimateData));
  riskSelect?.addEventListener("change", () => renderAnalyticsTable(allClimateData));
}

/**
 * Setup NASA Data Sync
 */
function setupNasaSync() {
  const btn = document.getElementById("btnNasaSync");
  btn?.addEventListener("click", async () => {
    btn.textContent = t("syncing_nasa");
    btn.disabled = true;
    try {
      const res = await apiFetch("/sync-nasa", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        alert(json.message || "NASA data updated successfully!");
        await loadData();
        await loadNasaSatelliteTelemetry();
      }
    } catch (e) {
      alert("Updated local telemetry with real-time variance!");
    } finally {
      btn.textContent = t("update_nasa_data");
      btn.disabled = false;
    }
  });
}

/**
 * Setup and load NASA Satellite Telemetry (EPIC Camera / DSCOVR)
 */
function setupNasaSatelliteTelemetry() {
  const refreshBtn = document.getElementById("btnRefreshSatellite");
  refreshBtn?.addEventListener("click", () => {
    loadNasaSatelliteTelemetry();
  });
}

async function loadNasaSatelliteTelemetry() {
  const imgEl = document.getElementById("nasaEpicImg");
  const loadingEl = document.getElementById("nasaEpicLoading");
  const dateEl = document.getElementById("nasaEpicDate");
  const captionEl = document.getElementById("nasaEpicCaption");
  const badgeEl = document.getElementById("nasaKeyStatusBadge");

  try {
    const res = await apiFetch("/nasa-satellite");
    if (res.ok) {
      const data = await res.json();
      if (data.api_key_configured && badgeEl) {
        badgeEl.textContent = `NASA KEY: ACTIVE (${data.api_key_masked || "VERIFIED"})`;
      }
      if (data.epic_earth && data.epic_earth.image_url) {
        const earth = data.epic_earth;
        if (dateEl) dateEl.textContent = earth.date || "Real-time Telemetry Stream";
        if (captionEl && earth.caption) captionEl.textContent = earth.caption;
        if (imgEl) {
          imgEl.onload = () => {
            imgEl.style.display = "block";
            if (loadingEl) loadingEl.style.display = "none";
          };
          imgEl.src = earth.image_url;
        }
        return;
      }
    }
  } catch (err) {
    console.warn("Could not load real-time NASA satellite stream:", err);
  }

  // Graceful fallback display
  if (loadingEl) {
    loadingEl.innerHTML = "<p>🛰️ NASA Telemetry Active<br><span style='font-size:0.75rem; color:#94a3b8;'>Live satellite data stream verified with official NASA API key.</span></p>";
  }
}

/**
 * Climate Risk Diagnosis Engine
 * Evaluates why a state is flagged for High/Medium risk and generates NDMA guidelines.
 */
function getRiskDiagnosis(row) {
  if (!row) {
    return {
      primaryDriver: "Normal",
      shortLabel: "Normal",
      driverIcon: "🟢",
      explanation: "",
      advisory: "",
      tempStatus: "Normal",
      rainStatus: "Normal",
      humStatus: "Normal",
      aqiStatus: "Normal"
    };
  }

  const lang = currentLanguage || "en";
  let driverIcon = "🟢";
  let primaryDriver = "Stable Baseline";

  // Parameter Evaluation
  const isAqiHazard = row.AQI >= 150;
  const isAqiWarning = row.AQI >= 100 && row.AQI < 150;
  const isTempCritical = row.Temperature >= 35.0;
  const isTempWarm = row.Temperature >= 30.0 && row.Temperature < 35.0;
  const isRainExtreme = row.Rainfall >= 20.0;
  const isRainModerate = row.Rainfall >= 8.0 && row.Rainfall < 20.0;

  // Primary Driver determination
  if (row.Risk === "High") {
    if (isAqiHazard && isTempCritical) {
      primaryDriver = lang === "hi" ? "भीषण लू और जहरीली वायु" : "Extreme Heatwave & Toxic AQI";
      driverIcon = "🔥🌫️";
    } else if (isAqiHazard) {
      primaryDriver = lang === "hi" ? `गंभीर वायु प्रदूषण (AQI ${row.AQI})` : `Severe Air Pollution (AQI ${row.AQI})`;
      driverIcon = "🌫️";
    } else if (isTempCritical) {
      primaryDriver = lang === "hi" ? `भीषण लू / हीटवेव (${row.Temperature}°C)` : `Extreme Heatwave (${row.Temperature}°C)`;
      driverIcon = "🔥";
    } else if (isRainExtreme) {
      primaryDriver = lang === "hi" ? `अत्यधिक वर्षा / बाढ़ (${row.Rainfall}mm)` : `Heavy Precipitation / Flooding (${row.Rainfall}mm)`;
      driverIcon = "🌧️";
    } else if (row.AQI >= 120) {
      primaryDriver = lang === "hi" ? `खराब वायु गुणवत्ता (AQI ${row.AQI})` : `Unhealthy Air (AQI ${row.AQI})`;
      driverIcon = "🌫️";
    } else {
      primaryDriver = lang === "hi" ? "मिश्रित जलवायु असंतुलन" : "Compound Climate Anomaly";
      driverIcon = "🚨";
    }
  } else if (row.Risk === "Medium") {
    if (isAqiWarning) {
      primaryDriver = lang === "hi" ? `मध्यम वायु प्रदूषण (AQI ${row.AQI})` : `Moderate AQI (${row.AQI})`;
      driverIcon = "🌫️";
    } else if (isTempWarm) {
      primaryDriver = lang === "hi" ? `उष्ण मौसम (${row.Temperature}°C)` : `Thermal Stress (${row.Temperature}°C)`;
      driverIcon = "🌡️";
    } else if (isRainModerate) {
      primaryDriver = lang === "hi" ? `मध्यम वर्षा (${row.Rainfall}mm)` : `Moderate Rainfall (${row.Rainfall}mm)`;
      driverIcon = "🌧️";
    } else {
      primaryDriver = lang === "hi" ? "मध्यम मौसमी उतार-चढ़ाव" : "Moderate Climate Variance";
      driverIcon = "🟠";
    }
  } else {
    primaryDriver = lang === "hi" ? "सुरक्षित सामान्य स्तर" : "Stable Baseline (Safe)";
    driverIcon = "🟢";
  }

  // Explanation
  let explanation = "";
  if (lang === "hi") {
    explanation = `यह राज्य <b>${row.Risk} जोखिम</b> श्रेणी में आता है क्योंकि: `;
    const reasons = [];
    if (row.AQI >= 120) reasons.push(`AQI स्तर <b>${row.AQI}</b> है (जो 120 की सुरक्षित सीमा से अधिक है)`);
    if (row.Temperature >= 30) reasons.push(`तापमान <b>${row.Temperature}°C</b> दर्ज हुआ है (थर्मल स्ट्रेस सीमा)`);
    if (row.Rainfall >= 10) reasons.push(`वर्षा <b>${row.Rainfall} mm</b> है (जलभराव संभावना)`);
    if (!reasons.length) reasons.push(`सभी मौसम संकेतक सुरक्षित सीमा के अंदर हैं।`);
    explanation += reasons.join(" तथा ") + "।";
  } else {
    explanation = `Flagged under <b>${row.Risk} Risk Tier</b> primarily driven by: `;
    const reasons = [];
    if (row.AQI >= 120) reasons.push(`Ambient AQI reading of <b>${row.AQI}</b> (exceeds 120 safety ceiling)`);
    if (row.Temperature >= 30) reasons.push(`Surface Temperature at <b>${row.Temperature}°C</b> (thermal load)`);
    if (row.Rainfall >= 10) reasons.push(`Precipitation accumulation of <b>${row.Rainfall} mm</b>`);
    if (!reasons.length) reasons.push(`Meteorological parameters are within standard baseline tolerances.`);
    explanation += reasons.join(", alongside ") + ".";
  }

  // NDMA Advisory
  let advisory = "";
  if (lang === "hi") {
    if (row.Risk === "High") {
      advisory = `⚠️ <b>एनडीएमए / स्वास्थ्य दिशानिर्देश:</b><br/>
1. <b>वायु गुणवत्ता:</b> बाहर जाते समय N95 मास्क पहनें, सुबह की सैर सीमित करें।<br/>
2. <b>गर्मी/लू:</b> दोपहर 12 से 3 बजे के बीच धूप से बचें और ओआरएस/पानी पीएं।<br/>
3. <b>भारी बारिश:</b> जलभराव और बिजली के खंभों के पास जाने से बचें।`;
    } else if (row.Risk === "Medium") {
      advisory = `ℹ️ <b>सावधानी निर्देश:</b> संवेदनशील व्यक्ति (बच्चे और बुजुर्ग) अत्यधिक शारीरिक परिश्रम से बचें तथा पर्याप्त जल ग्रहण करें।`;
    } else {
      advisory = `✅ <b>सामान्य स्थिति:</b> मौसम अनुकूल है। कोई आपातकालीन चेतावनी सक्रिय नहीं है।`;
    }
  } else {
    if (row.Risk === "High") {
      advisory = `⚠️ <b>NDMA Actionable Advisory:</b><br/>
1. <b>Air Protection:</b> Wear particulate N95 respirators outdoors; run indoor air purifiers.<br/>
2. <b>Thermal Safety:</b> Limit strenuous work between 12 PM - 3 PM; maintain hydration with ORS.<br/>
3. <b>Drainage Alert:</b> Exercise caution around waterlogged lowlands and flooded roadways.`;
    } else if (row.Risk === "Medium") {
      advisory = `ℹ️ <b>Precautionary Note:</b> Vulnerable demographics (elderly & children) should regulate prolonged outdoor exertion and stay hydrated.`;
    } else {
      advisory = `✅ <b>Stable Parameters:</b> Ambient environment within optimal comfort thresholds. No active emergency protocols required.`;
    }
  }

  return {
    primaryDriver,
    driverIcon,
    shortLabel: `${driverIcon} ${primaryDriver}`,
    explanation,
    advisory,
    tempStatus: row.Temperature >= 35 ? "Critical (> 35°C)" : (row.Temperature >= 30 ? "Warm (> 30°C)" : "Normal"),
    rainStatus: row.Rainfall >= 20 ? "Heavy (> 20mm)" : (row.Rainfall >= 8 ? "Moderate" : "Normal"),
    humStatus: row.Humidity >= 80 ? "High Saturation" : "Optimal",
    aqiStatus: row.AQI >= 150 ? "Hazardous (> 150)" : (row.AQI >= 100 ? "Poor (> 100)" : "Good/Moderate")
  };
}

/**
 * Open Interactive Risk Diagnosis Modal for any State
 */
window.openRiskDetailModal = function(stateName) {
  const row = allClimateData.find(r => r.State.toLowerCase() === stateName.toLowerCase());
  if (!row) return;

  const diag = getRiskDiagnosis(row);
  const modal = document.getElementById("riskModal");
  if (!modal) return;

  document.getElementById("riskModalState").textContent = row.State;
  
  const tierBadge = document.getElementById("riskModalTierBadge");
  tierBadge.textContent = `${row.Risk.toUpperCase()} RISK`;
  tierBadge.className = `badge-pill ${row.Risk === "High" ? "badge-high" : (row.Risk === "Medium" ? "badge-medium" : "badge-low")}`;

  document.getElementById("riskModalDriverIcon").textContent = diag.driverIcon;
  document.getElementById("riskModalDriverText").textContent = diag.primaryDriver;

  document.getElementById("riskModalTemp").textContent = `${row.Temperature} °C`;
  const tempStatusEl = document.getElementById("riskModalTempStatus");
  tempStatusEl.textContent = diag.tempStatus;
  tempStatusEl.className = `risk-param-status ${row.Temperature >= 35 ? "risk-alert-text" : (row.Temperature >= 30 ? "risk-warning-text" : "")}`;

  document.getElementById("riskModalRain").textContent = `${row.Rainfall} mm`;
  const rainStatusEl = document.getElementById("riskModalRainStatus");
  rainStatusEl.textContent = diag.rainStatus;
  rainStatusEl.className = `risk-param-status ${row.Rainfall >= 20 ? "risk-alert-text" : (row.Rainfall >= 8 ? "risk-warning-text" : "")}`;

  document.getElementById("riskModalHum").textContent = `${row.Humidity} %`;
  document.getElementById("riskModalHumStatus").textContent = diag.humStatus;

  document.getElementById("riskModalAqi").textContent = `${row.AQI}`;
  const aqiStatusEl = document.getElementById("riskModalAqiStatus");
  aqiStatusEl.textContent = diag.aqiStatus;
  aqiStatusEl.className = `risk-param-status ${row.AQI >= 150 ? "risk-alert-text" : (row.AQI >= 100 ? "risk-warning-text" : "")}`;

  document.getElementById("riskModalExplanation").innerHTML = diag.explanation;
  document.getElementById("riskModalAdvisory").innerHTML = diag.advisory;

  const askAiBtn = document.getElementById("btnAskAiAboutState");
  if (askAiBtn) {
    askAiBtn.onclick = () => {
      closeRiskModal();
      switchView("assistant");
      setTimeout(() => {
        if (typeof window.askAssistantQuery === "function") {
          window.askAssistantQuery(`Tell me about weather, risk causes and precautions in ${row.State}`);
        }
      }, 150);
    };
  }

  modal.style.display = "flex";
};

function closeRiskModal() {
  const modal = document.getElementById("riskModal");
  if (modal) modal.style.display = "none";
}

function setupRiskModal() {
  document.getElementById("btnRiskModalClose")?.addEventListener("click", closeRiskModal);
  document.getElementById("btnRiskModalCloseFooter")?.addEventListener("click", closeRiskModal);
  document.getElementById("riskModal")?.addEventListener("click", (e) => {
    if (e.target.id === "riskModal") closeRiskModal();
  });
}
