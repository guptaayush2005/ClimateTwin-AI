# 🌍 ClimateTwin AI

> An AI-Powered Digital Twin of India's Climate System using NASA climate data, interactive analytics, and climate intelligence tools.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Streamlit](https://img.shields.io/badge/Streamlit-Web%20App-red)
![NASA](https://img.shields.io/badge/Data-NASA%20POWER-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🚀 About the Project

ClimateTwin AI is an AI-powered climate intelligence platform designed to monitor, analyze, and simulate climate conditions across India.

The platform integrates climate data from the **NASA POWER API** and provides interactive dashboards, analytics, risk intelligence, and reporting tools to support climate awareness and data-driven decision-making.

This project was developed as part of my participation in the **Bharatiya Antariksh Hackathon**.

---

## ✨ Features

### 📊 Real-Time Climate Dashboard
- Average Temperature
- Average Rainfall
- Average Humidity
- AQI Monitoring
- India Climate Risk Map
- AI Alerts

### 📈 Climate Analytics
- Temperature Distribution
- Rainfall Analysis
- Humidity Analysis
- AQI Analysis
- Risk Distribution

### 🤖 AI Predictions (Prototype)
- AI-based temperature prediction
- Climate forecasting demonstration

### 🌦 Climate Simulation
- Simulate different climate scenarios
- Predict risk levels based on changing parameters

### 🚨 Risk Intelligence
- Heatwave Alerts
- Heavy Rainfall Alerts
- Poor Air Quality Alerts
- High Risk State Identification

### 📄 Reports
- PDF Climate Report
- CSV Data Export

### 🤖 AI Climate Assistant
- Ask questions about climate data
- Get instant insights and summaries

### 🔄 NASA Data Update
- On-demand climate data refresh from NASA POWER API

---

## 🛰️ Data Source

The project uses:

- **NASA POWER API**
- Temperature (T2M)
- Rainfall (PRECTOTCORR)
- Humidity (RH2M)

---

## 🛠️ Tech Stack

### Frontend
- Streamlit

### Backend
- Python

### Data Processing
- Pandas
- NumPy

### Visualization
- Plotly

### Machine Learning
- Scikit-Learn
- Joblib

### Reports
- ReportLab

### API Integration
- Requests Library

### Deployment
- GitHub
- Streamlit Community Cloud

---

## 🏗️ Project Architecture

```text
NASA POWER API / Real-time Telemetry
               ↓
┌──────────────────────────────────────────────┐
│                   BACKEND                    │
│  • Services (Data, ML, Risk, Reports, NASA)  │
│  • ML Predictor & Training Pipelines         │
│  • Multilingual AI Assistant Engine          │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│                   FRONTEND                   │
│  • Internationalization (i18n): EN/HI/MR/BN  │
│  • Component Design System (Glassmorphic)    │
│  • Views: Dashboard, Predict, Sim, Risk, Rep │
│  • Dynamic Streamlit Navigation Routing      │
└──────────────────────────────────────────────┘
```

---

## 🌐 Multilingual Support (बहुभाषी समर्थन)

ClimateTwin AI now natively supports multiple Indian languages:
- 🇬🇧 **English**
- 🇮🇳 **हिन्दी (Hindi)**
- 🇮🇳 **मराठी (Marathi)**
- 🇮🇳 **বাংলা (Bengali)**
- 🇮🇳 **தமிழ் (Tamil)**

Users can switch languages on-the-fly from the sidebar, updating UI titles, KPI metrics, chart labels, early warning alerts, and the AI Climate Assistant response language.

---

## 📂 Project Structure

```text
ClimateTwin-AI/
│
├── backend/                              # Complete Backend Subsystem
│   ├── __init__.py
│   ├── config.py                         # Unified configs, paths & thresholds
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_service.py               # Data loading, metrics & CSV export
│   │   ├── ml_service.py                 # 7-day forecast & scenario simulation
│   │   ├── risk_service.py               # Heatwave, rain & AQI risk intelligence
│   │   ├── report_service.py             # Professional PDF dossier generation
│   │   ├── assistant_service.py          # Multilingual AI query processor
│   │   └── nasa_service.py               # NASA POWER API client & real-time sync
│   ├── models/
│   │   ├── __init__.py
│   │   ├── train_model.py                # RandomForest model training pipeline
│   │   ├── predict.py                    # ClimatePredictor inference engine
│   │   └── saved_model.pkl               # Trained model weights
│   └── data_pipeline/
│       ├── __init__.py
│       ├── fetch_data.py                 # NASA ingestion pipeline script
│       └── add_aqi_risk.py               # AQI & risk classification pipeline
│
├── frontend/                             # Complete Frontend Subsystem
│   ├── __init__.py
│   ├── styles.py                         # Modern design system & CSS themes
│   ├── i18n/
│   │   ├── __init__.py
│   │   ├── translations.py               # Multilingual translation dictionaries
│   │   └── language_manager.py           # Language state & `t()` translation helper
│   ├── components/
│   │   ├── __init__.py
│   │   ├── sidebar.py                    # Multilingual sidebar with NASA sync
│   │   ├── hero.py                       # Glassmorphic hero banner
│   │   ├── metrics.py                    # KPI cards layout
│   │   ├── charts.py                     # Plotly maps, bar & line charts
│   │   └── alerts.py                     # Early warning alert notices
│   └── views/
│       ├── __init__.py
│       ├── home_view.py                  # Landing page
│       ├── dashboard_view.py             # Climate Intelligence dashboard
│       ├── predictions_view.py           # 7-day AI temperature forecasting
│       ├── analytics_view.py             # Statistical distributions & charts
│       ├── simulation_view.py            # What-If scenario simulation
│       ├── risk_view.py                  # Early warning risk intelligence
│       └── reports_view.py               # Verifiable PDF & CSV reporting
│
├── pages/                                # Streamlit Multipage Routes (Forwarding)
│   ├── _Dashboard.py
│   ├── _AI_Predictions.py
│   ├── _Analytics.py
│   ├── _Climate_Simulation.py
│   ├── _Risk_Intelligence.py
│   ├── _Reports.py
│   └── _PDF_Report.py
│
├── data/                                 # Climate Datasets
│   ├── climate_data.csv
│   └── state_coordinates.csv
│
├── assets/
│   └── logo.png
│
├── app.py                                # Main Application Entrypoint
├── styles.py                             # Root styles bridge
├── fetch_data.py                         # Root data fetch bridge
├── add_aqi_risk.py                       # Root risk calculation bridge
└── requirements.txt                      # Project dependencies
```

---

## 🌐 Live Demo

https://climatetwin-ai-xrqzvi56xx7zku7slpmmaj.streamlit.app/

---

## 💻 GitHub Repository

https://github.com/guptaayush2005/ClimateTwin-AI

---

## 🎯 Future Scope

- Real AQI API Integration
- Real-Time Weather Forecasting
- Satellite Data Integration
- Flood Prediction System
- Drought Prediction System
- Advanced AI Forecasting Models
- Disaster Management Support

---

## 👨‍💻 Developer

**Ayush Gupta**  
B.Tech – Computer Science & Information Technology (CSIT)  
Dronacharya Group of Institutions, AKTU

LinkedIn: https://www.linkedin.com/in/guptaayush2005/

---

## 📜 License

This project is licensed under the MIT License.

---

⭐ If you like this project, consider giving it a star on GitHub!