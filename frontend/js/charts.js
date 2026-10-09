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

    const popupHtml = `
      <div style="font-family: inherit; font-size: 13px; line-height: 1.4; color: #0f172a;">
        <strong style="font-size: 14px; color: #1e3a8a;">📍 ${row.State}</strong><br/>
        🌡️ <b>Temp:</b> ${row.Temperature} °C<br/>
        🌧️ <b>Rain:</b> ${row.Rainfall} mm<br/>
        💧 <b>Humidity:</b> ${row.Humidity} %<br/>
        🌫️ <b>AQI:</b> ${row.AQI} (<span style="color:${markerColor}; font-weight:700;">${row.Risk}</span>)
      </div>
    `;

    circle.bindPopup(popupHtml);
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
  const values = forecastDays.map(f => f["Predicted Temperature"]);

  if (forecastChartInstance) forecastChartInstance.destroy();

  forecastChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: `Temperature Forecast - ${stateName} (°C)`,
        data: values,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#60a5fa",
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#f8fafc" } }
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } }
      }
    }
  });
}
