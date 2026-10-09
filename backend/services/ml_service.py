"""
ClimateTwin AI - Backend ML Service
Provides high-level APIs for temperature forecasting, scenario simulation, and risk advisory.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from backend.models.predict import ClimatePredictor
from backend.config import THRESHOLDS

_predictor = None


def get_predictor() -> ClimatePredictor:
    """
    Singleton getter for ClimatePredictor instance.
    """
    global _predictor
    if _predictor is None:
        _predictor = ClimatePredictor()
    return _predictor


def predict_temperature(rainfall: float, humidity: float, aqi: float) -> float:
    """
    Predicts single-point temperature.
    """
    predictor = get_predictor()
    return round(predictor.predict(rainfall, humidity, aqi), 2)


def get_7_day_forecast(
    state_name: str,
    rainfall: float,
    humidity: float,
    aqi: float,
    current_temp: float
) -> Dict[str, Any]:
    """
    Generates a 7-day temperature forecast dataset and summary delta.
    """
    predictor = get_predictor()
    forecast_pairs = predictor.predict_7_day_forecast(rainfall, humidity, aqi, base_temp=current_temp)

    days = [p[0] for p in forecast_pairs]
    temps = [p[1] for p in forecast_pairs]

    forecast_df = pd.DataFrame({
        "Day": days,
        "Predicted Temperature": temps
    })

    avg_future = round(float(np.mean(temps)), 2)
    delta = round(avg_future - current_temp, 2)

    if avg_future >= THRESHOLDS["HEATWAVE_TEMP_HIGH"]:
        risk_level = "High"
    elif avg_future >= THRESHOLDS["HEATWAVE_TEMP_MODERATE"]:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    return {
        "state": state_name,
        "current_temp": current_temp,
        "predicted_avg": avg_future,
        "delta": delta,
        "risk_level": risk_level,
        "forecast_df": forecast_df
    }


def simulate_scenario(rainfall: float, humidity: float, aqi: float) -> Dict[str, Any]:
    """
    Simulates climate impact based on interactive slider inputs.
    """
    pred_temp = predict_temperature(rainfall, humidity, aqi)

    if pred_temp >= THRESHOLDS["HEATWAVE_TEMP_HIGH"]:
        risk_level = "High"
    elif pred_temp >= THRESHOLDS["HEATWAVE_TEMP_MODERATE"]:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    warnings = []
    if rainfall > THRESHOLDS["HEAVY_RAINFALL"]:
        warnings.append("flood_warning")
    if aqi > THRESHOLDS["HAZARDOUS_AQI"]:
        warnings.append("air_quality_warning")
    elif aqi > THRESHOLDS["POOR_AQI"]:
        warnings.append("moderate_air_warning")

    return {
        "predicted_temp": pred_temp,
        "risk_level": risk_level,
        "warnings": warnings
    }
