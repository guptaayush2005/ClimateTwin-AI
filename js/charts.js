/**
 * ClimateTwin AI - Interactive Charts and Geospatial Mapping (Chart.js & Leaflet.js)
 */

let indiaMap = null;
let markersLayer = null;
let hottestChartInstance = null;
let rainfallChartInstance = null;
let humidityChartInstance = null;
let aqiScatterInstance = null;
let riskPieInstance = null;
let forecastChartInstance = null;
let forecastAqiChartInstance = null;
let analyticsRainfallChartInstance = null;
let analyticsAqiChartInstance = null;

/**
 * Initializes or updates Leaflet India Geospatial Risk Map
 */
function initIndiaMap(records) {
  const mapElement = document.getElementById("mapContainer");
  if (!mapElement) return;

  if (!indiaMap) {
    indiaMap = L.map("mapContainer", {
      center: [22.8, 80.5],
      zoom: 4.5,
      zoomControl: true,
      attributionControl: false
    });

    // Premium Dark Canvas (No API Key Required)
    const darkLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16,
      attribution: '&copy; Esri &mdash; ClimateTwin AI'
    });

    // OpenStreetMap Alternative (No API Key Required)
    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    });

    darkLayer.addTo(indiaMap);

    // Layer Switcher
    L.control.layers({
      "Dark Canvas (NASA Theme)": darkLayer,
      "Street Map": osmLayer
    }, null, { position: "topright" }).addTo(indiaMap);

    markersLayer = L.layerGroup().addTo(indiaMap);

    // Interactive Click on Map to inspect coordinates & nearest district telemetry
    indiaMap.on("click", (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      if (lat < 5.0 || lat > 38.0 || lon < 66.0 || lon > 99.0) return;
      if (typeof window.handleMapCoordinateClick === "function") {
        window.handleMapCoordinateClick(lat, lon);
      }
    });
  }

  // Ensure map tiles render smoothly without container size bugs
  setTimeout(() => {
    if (indiaMap) indiaMap.invalidateSize();
  }, 100);

  markersLayer.clearLayers();

  records.forEach((row) => {
    if (!row.Latitude || !row.Longitude) return;

    let markerColor = "#10b981"; // Low Risk
    if (row.Risk === "High" || row.AQI > 120) {
      markerColor = "#ef4444";
    } else if (row.Risk === "Medium" || row.AQI > 80) {
      markerColor = "#f59e0b";
    }

    const radius = Math.max(7, Math.min(row.AQI / 8, 20));

    const circle = L.circleMarker([row.Latitude, row.Longitude], {
      radius: radius,
      fillColor: markerColor,
      color: "#ffffff",
      weight: 1.5,
      opacity: 0.9,
      fillOpacity: 0.75
    });

    const title = row.District ? `${row.District}, ${row.State}` : row.State;
    const isDistrict = Boolean(row.District);

    let diagTag = "";
    if (isDistrict) {
      diagTag = `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #cbd5e1; font-size: 11px;">
        <button onclick="window.openDistrictDetailModal('${row.State.replace(/'/g, "\\'")}', '${row.District.replace(/'/g, "\\'")}', ${row.Latitude}, ${row.Longitude})" style="background: #2563eb; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-weight: 700; cursor: pointer; width: 100%; display: block; margin-top: 4px;">⚡ 1-Click Live Telemetry</button>
      </div>`;
    } else if (typeof getRiskDiagnosis === "function") {
      const diag = getRiskDiagnosis(row);
      diagTag = `<div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #cbd5e1; font-size: 11px;">
        <b>Hazard Trigger:</b> <span style="color: ${markerColor}; font-weight: 700;">${diag.shortLabel}</span><br/>
        <a href="javascript:void(0)" onclick="window.openRiskDetailModal('${row.State.replace(/'/g, "\\'")}')" style="display: inline-block; margin-top: 4px; color: #2563eb; font-weight: 700; text-decoration: underline;">🔍 Hazard Diagnosis & NDMA Tips</a>
      </div>`;
    }

    const popupHtml = `
      <div style="font-family: inherit; font-size: 13px; line-height: 1.4; color: #0f172a;">
        <strong style="font-size: 14px; color: #1e3a8a;">📍 ${title}</strong><br/>
        🌡️ <b>Temp:</b> ${row.Temperature} °C<br/>
        🌧️ <b>Rain:</b> ${row.Rainfall} mm<br/>
        💧 <b>Humidity:</b> ${row.Humidity} %<br/>
        🌫️ <b>AQI:</b> ${row.AQI} (<span style="color:${markerColor}; font-weight:700;">${row.Risk}</span>)
        ${diagTag}
      </div>
    `;

    circle.bindPopup(popupHtml);
    circle.on("click", () => {
      if (isDistrict && typeof window.openDistrictDetailModal === "function") {
        window.openDistrictDetailModal(row.State, row.District, row.Latitude, row.Longitude);
      }
    });
    markersLayer.addLayer(circle);
  });
}

/**
 * Top Hottest States Bar Chart
 */
function renderHottestChart(records) {
  const ctx = document.getElementById("hottestChart")?.getContext("2d");
  if (!ctx) return;

  const sorted = [...records].sort((a, b) => b.Temperature - a.Temperature).slice(0, 10);
  const labels = sorted.map(r => r.State);
  const values = sorted.map(r => r.Temperature);

  if (hottestChartInstance) hottestChartInstance.destroy();

  hottestChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperature (°C)",
        data: values,
        backgroundColor: "rgba(239, 68, 68, 0.75)",
        borderColor: "#ef4444",
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } }
      }
    }
  });
}

/**
 * Top Rainfall States Bar Chart
 */
function renderRainfallChart(records) {
  const ctx = document.getElementById("rainfallChart")?.getContext("2d");
  if (!ctx) return;

  const sorted = [...records].sort((a, b) => b.Rainfall - a.Rainfall).slice(0, 10);
  const labels = sorted.map(r => r.State);
  const values = sorted.map(r => r.Rainfall);

  if (rainfallChartInstance) rainfallChartInstance.destroy();

  rainfallChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Rainfall (mm)",
        data: values,
        backgroundColor: "rgba(59, 130, 246, 0.75)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } }
      }
    }
  });
}

/**
 * Humidity Analysis Line Chart
 */
function renderHumidityChart(records) {
  const ctx = document.getElementById("humidityChart")?.getContext("2d");
  if (!ctx) return;

  const sorted = [...records].sort((a, b) => a.Humidity - b.Humidity);
  const labels = sorted.map(r => r.State);
  const values = sorted.map(r => r.Humidity);

  if (humidityChartInstance) humidityChartInstance.destroy();

  humidityChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Humidity (%)",
        data: values,
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.15)",
        fill: true,
        tension: 0.3,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { display: false }, grid: { display: false } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } }
      }
    }
  });
}

/**
 * Risk Distribution Donut Chart
 */
function renderRiskPie(records) {
  const ctx = document.getElementById("riskPieChart")?.getContext("2d");
  if (!ctx) return;

  let high = 0, med = 0, low = 0;
  records.forEach(r => {
    if (r.Risk === "High") high++;
    else if (r.Risk === "Medium") med++;
    else low++;
  });

  if (riskPieInstance) riskPieInstance.destroy();

  riskPieInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["High Risk", "Medium Risk", "Low Risk"],
      datasets: [{
        data: [high, med, low],
        backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#f8fafc", padding: 14 }
        }
      },
      cutout: "68%"
    }
  });
}

/**
 * 7-Day Temperature Forecast Line Chart
 */
function renderForecastChart(forecastDays, stateName) {
  const ctx = document.getElementById("forecastChart")?.getContext("2d");
  if (!ctx) return;

  const labels = forecastDays.map(f => `Day ${f.Day}`);
  const values = forecastDays.map(f => {
    const v = f["Predicted Temperature"] ?? f.temperature ?? f.temp ?? 0;
    return typeof v === "number" ? +v.toFixed(1) : parseFloat(v) || 0;
  });

  if (forecastChartInstance) forecastChartInstance.destroy();

  forecastChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: `Temperature Forecast - ${stateName} (°C)`,
        data: values,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.18)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#60a5fa",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 6,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#f8fafc" } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` Predicted Temp: ${context.parsed.y} °C`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } }
      }
    }
  });
}

/**
 * 7-Day Air Quality Index (AQI) Trajectory Line Chart
 */
function renderForecastAqiChart(forecastAqiDays, locationName) {
  const ctx = document.getElementById("forecastAqiChart")?.getContext("2d");
  if (!ctx) return;

  const labels = (forecastAqiDays || []).map(f => `Day ${f.Day}`);
  const values = (forecastAqiDays || []).map(f => {
    const v = f["Predicted AQI"] ?? f.aqi ?? 100;
    return typeof v === "number" ? Math.round(v) : parseInt(v, 10) || 100;
  });

  if (forecastAqiChartInstance) forecastAqiChartInstance.destroy();

  const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : 100;
  const strokeColor = avg > 150 ? "#ef4444" : (avg > 100 ? "#f59e0b" : "#10b981");
  const fillColor = avg > 150 ? "rgba(239, 68, 68, 0.18)" : (avg > 100 ? "rgba(245, 158, 11, 0.18)" : "rgba(16, 185, 129, 0.18)");
  const pointColor = avg > 150 ? "#f87171" : (avg > 100 ? "#fbbf24" : "#34d399");

  forecastAqiChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: `Air Quality Index (AQI) - ${locationName}`,
        data: values,
        borderColor: strokeColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: pointColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 6,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#f8fafc" } },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed.y;
              const cat = val > 200 ? "Very Unhealthy" : (val > 150 ? "Unhealthy" : (val > 100 ? "Moderate" : (val > 50 ? "Satisfactory" : "Good")));
              return ` AQI: ${val} (${cat})`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          suggestedMin: 30,
          suggestedMax: 200
        }
      }
    }
  });
}

/**
 * Analytics View: Top Rainfall States Bar Chart (Dedicated Instance)
 */
function renderAnalyticsRainfallChart(records) {
  const ctx = document.getElementById("analyticsRainfallChart")?.getContext("2d");
  if (!ctx) return;

  const sorted = [...records].sort((a, b) => b.Rainfall - a.Rainfall).slice(0, 10);
  const labels = sorted.map(r => r.State);
  const values = sorted.map(r => r.Rainfall);

  if (analyticsRainfallChartInstance) analyticsRainfallChartInstance.destroy();

  analyticsRainfallChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Rainfall (mm)",
        data: values,
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "#3b82f6",
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.parsed.y} mm precipitation`
          }
        }
      },
      scales: {
        x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } }
      }
    }
  });
}

/**
 * Analytics View: Top Air Pollution (AQI) States Bar Chart
 */
function renderAnalyticsAqiChart(records) {
  const ctx = document.getElementById("analyticsAqiChart")?.getContext("2d");
  if (!ctx) return;

  const sorted = [...records].sort((a, b) => b.AQI - a.AQI).slice(0, 10);
  const labels = sorted.map(r => r.State);
  const values = sorted.map(r => r.AQI);
  const colors = values.map(v => v >= 150 ? "rgba(239, 68, 68, 0.85)" : (v >= 100 ? "rgba(245, 158, 11, 0.85)" : "rgba(16, 185, 129, 0.85)"));

  if (analyticsAqiChartInstance) analyticsAqiChartInstance.destroy();

  analyticsAqiChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Air Quality Index (AQI)",
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` AQI: ${context.parsed.y} (${context.parsed.y >= 150 ? 'Hazardous' : context.parsed.y >= 100 ? 'Moderate' : 'Good'})`
          }
        }
      },
      scales: {
        x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } }
      }
    }
  });
}

