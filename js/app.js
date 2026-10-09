/**
 * ClimateTwin AI - Main Application Logic & API Client (Pure JavaScript)
 */

// Global State
let allClimateData = [];
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
  setupRiskModal();

  // 3. Load Data & Render Views
  await loadData();
});

/**
 * Setup SPA Tab Navigation
 */
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const view = item.getAttribute("data-view");
      switchView(view);
    });
  });
}

function switchView(viewName) {
  currentActiveView = viewName;

  // Update nav item active states
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-view") === viewName);
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
    if (chatInput) chatInput.focus();
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

  computeSummaryMetrics();
  populateStateSelectors();
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
 * Populate State Selectors
 */
function populateStateSelectors() {
  const selects = [
    document.getElementById("dashboardStateSelect"),
    document.getElementById("predictionStateSelect"),
    document.getElementById("assistantStateSelect")
  ];
  const states = [...new Set(allClimateData.map(r => r.State))].sort();

  selects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = "";
    if (sel.id === "dashboardStateSelect") {
      const optAll = document.createElement("option");
      optAll.value = "all";
      optAll.textContent = t("all_states");
      sel.appendChild(optAll);
    } else if (sel.id === "assistantStateSelect") {
      const optPrompt = document.createElement("option");
      optPrompt.value = "";
      optPrompt.textContent = "-- Choose State for Climate Intel --";
      sel.appendChild(optPrompt);
    }
    states.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      sel.appendChild(opt);
    });
  });

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

  const dashSelect = document.getElementById("dashboardStateSelect");
  if (dashSelect) {
    dashSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "all") {
        computeSummaryMetrics(allClimateData);
        initIndiaMap(allClimateData);
      } else {
        const filtered = allClimateData.filter(r => r.State === val);
        computeSummaryMetrics(filtered);
        initIndiaMap(filtered);
      }
    });
  }

  const predSelect = document.getElementById("predictionStateSelect");
  if (predSelect) {
    predSelect.addEventListener("change", () => updateForecastView());
  }
}

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
  if (!sel) return;
  const state = sel.value;
  const stateData = allClimateData.find(r => r.State === state) || allClimateData[0];

  try {
    const res = await apiFetch("/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: stateData.State,
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
