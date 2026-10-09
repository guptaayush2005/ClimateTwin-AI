"""
ClimateTwin AI - FastAPI Backend REST Server
Serves all analytics, ML inference, simulation, reports, and static HTML/CSS/JS frontend.
"""
import sys
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.config import CLIMATE_DATA_FILE, ASSETS_DIR
from backend.services.data_service import (
    load_climate_data,
    get_states_list,
    get_state_record,
    get_summary_metrics,
    get_high_risk_states_df,
    export_dataframe_to_csv,
)
from backend.services.ml_service import (
    predict_temperature,
    get_7_day_forecast,
    simulate_scenario,
)
from backend.services.risk_service import get_risk_intelligence
from backend.services.report_service import generate_pdf_report
from backend.services.assistant_service import ask_climate_assistant
from backend.services.nasa_service import sync_nasa_climate_data

# Initialize FastAPI App
app = FastAPI(
    title="ClimateTwin AI API",
    description="Backend REST API for ClimateTwin AI - Digital Twin of India's Climate System",
    version="2.0.0"
)

# Enable CORS for local development and web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas for Requests
class PredictRequest(BaseModel):
    rainfall: float
    humidity: float
    aqi: float


class ForecastRequest(BaseModel):
    state: str
    rainfall: float
    humidity: float
    aqi: float
    current_temp: float


class SimulateRequest(BaseModel):
    rainfall: float
    humidity: float
    aqi: float


class AssistantQueryRequest(BaseModel):
    question: str
    language: Optional[str] = "en"


# ---------------- API ENDPOINTS ----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "ClimateTwin AI",
        "version": "2.0.0"
    }


@app.get("/api/climate-data")
def get_climate_data_api(state: Optional[str] = None):
    """
    Returns climate data rows, optionally filtered by state.
    """
    df = load_climate_data(state=state)
    return {
        "count": len(df),
        "data": df.to_dict(orient="records")
    }


@app.get("/api/states")
def get_states_api():
    """
    Returns unique list of all monitored Indian states.
    """
    states = get_states_list()
    return {"states": states}


@app.get("/api/summary")
def get_summary_api(state: Optional[str] = None):
    """
    Computes key summary KPIs (Average temp, rainfall, humidity, high risk count, extremes).
    """
    df = load_climate_data(state=state)
    summary = get_summary_metrics(df)
    return summary


@app.get("/api/risk-intelligence")
def get_risk_intelligence_api():
    """
    Computes extreme conditions, active alerts, and high-risk states breakdown.
    """
    df = load_climate_data()
    intel = get_risk_intelligence(df)
    # Serialize dataframes to records
    intel["high_risk_states"] = intel["high_risk_df"].to_dict(orient="records")
    intel.pop("high_risk_df", None)
    return intel


@app.post("/api/predict")
def predict_temperature_api(req: PredictRequest):
    """
    Predicts temperature based on rainfall, humidity, and AQI using RandomForest model.
    """
    temp = predict_temperature(req.rainfall, req.humidity, req.aqi)
    return {
        "inputs": req.dict(),
        "predicted_temperature": temp
    }


@app.post("/api/forecast")
def get_forecast_api(req: ForecastRequest):
    """
    Generates 7-day temperature forecast dataset.
    """
    forecast = get_7_day_forecast(
        state_name=req.state,
        rainfall=req.rainfall,
        humidity=req.humidity,
        aqi=req.aqi,
        current_temp=req.current_temp
    )
    # Convert forecast_df to dict
    forecast["forecast"] = forecast["forecast_df"].to_dict(orient="records")
    forecast.pop("forecast_df", None)
    return forecast


@app.post("/api/simulate")
def simulate_scenario_api(req: SimulateRequest):
    """
    Runs interactive What-If climate simulation.
    """
    result = simulate_scenario(req.rainfall, req.humidity, req.aqi)
    return result


@app.post("/api/sync-nasa")
def sync_nasa_api():
    """
    Fetches latest telemetry from NASA POWER API.
    """
    result = sync_nasa_climate_data()
    return result


@app.post("/api/ask")
def ask_assistant_api(req: AssistantQueryRequest):
    """
    Natural Language Climate Assistant query in user's selected language.
    """
    df = load_climate_data()
    response = ask_climate_assistant(req.question, df=df, language=req.language or "en")
    return response


@app.get("/api/export-csv")
def export_csv_api(high_risk_only: bool = False):
    """
    Exports climate dataset as CSV.
    """
    df = load_climate_data()
    if high_risk_only:
        df = get_high_risk_states_df(df)
    csv_data = export_dataframe_to_csv(df)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={'high_risk_states' if high_risk_only else 'climate_data'}.csv"}
    )


@app.get("/api/export-pdf")
def export_pdf_api(lang: str = "en"):
    """
    Generates and returns professional ReportLab PDF dossier.
    """
    df = load_climate_data()
    pdf_path = generate_pdf_report(df, language=lang)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename="ClimateTwin_AI_Report.pdf"
    )


@app.get("/favicon.ico", include_in_schema=False)
def favicon_api():
    """
    Returns app icon for browser tabs.
    """
    fav_file = FRONTEND_DIR / "favicon.ico"
    if fav_file.exists():
        return FileResponse(fav_file, media_type="image/x-icon")
    logo_file = FRONTEND_DIR / "assets" / "logo.png"
    if logo_file.exists():
        return FileResponse(logo_file, media_type="image/png")
    return Response(status_code=204)


# ---------------- STATIC FILES FOR HTML/CSS/JS FRONTEND ----------------
FRONTEND_DIR = BASE_DIR / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


def run():
    import sys
    if sys.stdout and hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    import uvicorn
    print("[SERVER] Starting ClimateTwin AI Full-Stack Server on http://localhost:8000 ...")
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()
