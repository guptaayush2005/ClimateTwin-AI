"""
ClimateTwin AI - Backend Risk Service
Analyzes climate risk intelligence, identifies high-risk areas, and generates alerts.
"""
import pandas as pd
from typing import Dict, Any
from backend.services.data_service import load_climate_data
from backend.config import THRESHOLDS


def get_risk_intelligence(df: pd.DataFrame = None) -> Dict[str, Any]:
    """
    Computes complete risk intelligence insights and alerts.
    """
    if df is None or df.empty:
        df = load_climate_data()

    if df.empty:
        return {
            "hottest": {},
            "rainiest": {},
            "worst_aqi": {},
            "high_risk_count": 0,
            "risk_breakdown": {},
            "high_risk_df": pd.DataFrame(),
            "alerts": []
        }

    hottest_idx = df["Temperature"].idxmax()
    rainiest_idx = df["Rainfall"].idxmax()
    worst_aqi_idx = df["AQI"].idxmax()

    hottest = df.loc[hottest_idx].to_dict()
    rainiest = df.loc[rainiest_idx].to_dict()
    worst_aqi = df.loc[worst_aqi_idx].to_dict()

    high_risk_df = df[df["Risk"] == "High"].copy()
    risk_breakdown = df["Risk"].value_counts().to_dict()

    alerts = []
    # Heatwave check
    if hottest["Temperature"] >= THRESHOLDS["HEATWAVE_TEMP_HIGH"]:
        alerts.append({
            "type": "heatwave",
            "state": hottest["State"],
            "value": f"{hottest['Temperature']} °C",
            "level": "error"
        })

    # Heavy rainfall check
    if rainiest["Rainfall"] >= 20.0:  # mm
        alerts.append({
            "type": "heavy_rain",
            "state": rainiest["State"],
            "value": f"{rainiest['Rainfall']} mm",
            "level": "warning"
        })

    # Poor AQI check
    if worst_aqi["AQI"] >= THRESHOLDS["POOR_AQI"]:
        alerts.append({
            "type": "poor_aqi",
            "state": worst_aqi["State"],
            "value": f"AQI {worst_aqi['AQI']}",
            "level": "error"
        })

    return {
        "hottest": hottest,
        "rainiest": rainiest,
        "worst_aqi": worst_aqi,
        "high_risk_count": len(high_risk_df),
        "risk_breakdown": risk_breakdown,
        "high_risk_df": high_risk_df,
        "alerts": alerts
    }
