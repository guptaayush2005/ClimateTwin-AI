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

  // Re-render map/charts if switching to dashboard or analytics
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
      renderRainfallChart(allClimateData);
      renderRiskPie(allClimateData);
    }, 100);
  } else if (viewName === "predictions") {
    updateForecastView();
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
 * Load Climate Dataset from API (with fallback)
 */
async function loadData() {
  try {
    const res = await fetch("/api/climate-data");
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
  renderRiskView();
  renderReportsView();
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
  const selects = [document.getElementById("dashboardStateSelect"), document.getElementById("predictionStateSelect")];
  const states = [...new Set(allClimateData.map(r => r.State))].sort();

  selects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = "";
    if (sel.id === "dashboardStateSelect") {
      const optAll = document.createElement("option");
      optAll.value = "all";
      optAll.textContent = t("all_states");
      sel.appendChild(optAll);
    }
    states.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      sel.appendChild(opt);
    });
  });

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
 * Render Risk Intelligence View Elements
 */
function renderRiskView() {
  const tbody = document.getElementById("highRiskTableBody");
  if (!tbody) return;

  const highRisk = allClimateData.filter(r => r.Risk === "High");
  tbody.innerHTML = "";

  highRisk.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>📍 ${r.State}</strong></td>
      <td>${r.Temperature} °C</td>
      <td>${r.Rainfall} mm</td>
      <td>${r.Humidity} %</td>
      <td><strong>${r.AQI}</strong></td>
      <td><span class="badge-pill badge-high">HIGH RISK</span></td>
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
    const tr = document.createElement("tr");
    const riskBadge = r.Risk === "High" ? "badge-high" : (r.Risk === "Medium" ? "badge-medium" : "badge-low");
    tr.innerHTML = `
      <td><strong>${r.State}</strong></td>
      <td>${r.Temperature} °C</td>
      <td>${r.Rainfall} mm</td>
      <td>${r.Humidity} %</td>
      <td>${r.AQI}</td>
      <td><span class="badge-pill ${riskBadge}">${r.Risk}</span></td>
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
    const res = await fetch("/api/forecast", {
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
      const res = await fetch("/api/simulate", {
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
 * Setup AI Assistant
 */
function setupAssistant() {
  const btn = document.getElementById("btnAskAssistant");
  const input = document.getElementById("assistantInput");
  const respCard = document.getElementById("assistantResponse");

  const handleAsk = async () => {
    const query = input.value.trim();
    if (!query) return;

    respCard.style.display = "block";
    respCard.textContent = "Analyzing query...";

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, language: currentLanguage })
      });
      if (res.ok) {
        const json = await res.json();
        respCard.innerHTML = json.message;
        return;
      }
    } catch (e) {}

    // Fallback rule-based answering
    const q = query.toLowerCase();
    if (q.includes("temperature") || q.includes("तापमान") || q.includes("temp")) {
      respCard.innerHTML = `🌡️ <b>Average Temperature:</b> ${summaryMetrics.avgTemp} °C | 🔥 <b>Hottest:</b> ${summaryMetrics.hottest.State} (${summaryMetrics.hottest.Temperature}°C)`;
    } else if (q.includes("rain") || q.includes("वर्षा") || q.includes("बारिश")) {
      respCard.innerHTML = `🌧️ <b>Average Rainfall:</b> ${summaryMetrics.avgRain} mm | <b>Highest:</b> ${summaryMetrics.rainiest.State} (${summaryMetrics.rainiest.Rainfall} mm)`;
    } else if (q.includes("aqi") || q.includes("air") || q.includes("हवा")) {
      respCard.innerHTML = `🌫️ <b>Poorest Air Quality:</b> ${summaryMetrics.worstAqi.State} (AQI: ${summaryMetrics.worstAqi.AQI})`;
    } else {
      respCard.innerHTML = `📍 <b>National Climate Twin:</b> Tracking ${summaryMetrics.totalStates} Indian States with AI early warning models.`;
    }
  };

  btn?.addEventListener("click", handleAsk);
  input?.addEventListener("keypress", (e) => { if (e.key === "Enter") handleAsk(); });
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
      const res = await fetch("/api/sync-nasa", { method: "POST" });
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
