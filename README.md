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
NASA POWER API
       ↓
fetch_data.py
       ↓
climate_data.csv
       ↓
Dashboard & Analytics
       ↓
Reports & Risk Intelligence
```

---

## 📂 Project Structure

```text
ClimateTwin-AI/
│
├── app.py
├── fetch_data.py
├── styles.py
├── requirements.txt
│
├── data/
│   ├── climate_data.csv
│   └── state_coordinates.csv
│
├── models/
│   ├── predict.py
│   ├── train_model.py
│   └── saved_model.pkl
│
├── pages/
│   ├── _Dashboard.py
│   ├── _AI_Predictions.py
│   ├── _Analytics.py
│   ├── _Climate_Simulation.py
│   ├── _Reports.py
│   ├── _PDF_Report.py
│   └── _Risk_Intelligence.py
│
└── assets/
    └── logo.png
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