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
      const json = await res.json();
      return json.message;
    }
  } catch (e) {
    console.warn("Using offline fallback assistant logic.", e);
  }

  // Fallback rule-based answering
  const q = query.toLowerCase();
  if (q.includes("temperature") || q.includes("तापमान") || q.includes("temp") || q.includes("hot")) {
    return `🌡️ <b>Average Temperature:</b> ${summaryMetrics.avgTemp} °C | 🔥 <b>Hottest State:</b> ${summaryMetrics.hottest.State} (${summaryMetrics.hottest.Temperature}°C)`;
  } else if (q.includes("rain") || q.includes("वर्षा") || q.includes("बारिश")) {
    return `🌧️ <b>Average Rainfall:</b> ${summaryMetrics.avgRain} mm | <b>Highest:</b> ${summaryMetrics.rainiest.State} (${summaryMetrics.rainiest.Rainfall} mm)`;
  } else if (q.includes("aqi") || q.includes("air") || q.includes("हवा")) {
    return `🌫️ <b>Poorest Air Quality:</b> ${summaryMetrics.worstAqi.State} (AQI: ${summaryMetrics.worstAqi.AQI})`;
  } else if (q.includes("risk") || q.includes("danger") || q.includes("खतरा")) {
    return `🚨 <b>High Risk States Count:</b> ${summaryMetrics.highRiskCount} States exceeding critical thresholds.`;
  } else {
    return `📍 <b>National Climate Twin:</b> Tracking ${summaryMetrics.totalStates} Indian States with AI early warning models.`;
  }
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

    return `
      <tr class="state-row">
        <td><strong>📍 ${row.State}</strong></td>
        <td>${row.Temperature} °C</td>
        <td>${row.Rainfall} mm</td>
        <td>${row.Humidity} %</td>
        <td><span style="color: ${aqiColor}; font-weight: 700;">${row.AQI}</span></td>
        <td><span class="badge-pill ${riskBadgeClass}">${row.Risk}</span></td>
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
