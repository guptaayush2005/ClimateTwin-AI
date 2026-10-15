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
    Generates a 7-day temperature and AQI forecast dataset, summary delta, and multi-hazard risk evaluation.
    """
    predictor = get_predictor()
    res = predictor.predict_7_day_forecast(rainfall, humidity, aqi, base_temp=current_temp)
    if isinstance(res, tuple) and len(res) == 2:
        temp_pairs, aqi_pairs = res
    else:
        temp_pairs = res
        aqi_pairs = [(d, round(aqi + np.random.uniform(-4, 4), 1)) for d, _ in temp_pairs]

    days = [p[0] for p in temp_pairs]
    temps = [p[1] for p in temp_pairs]
    aqis = [p[1] for p in aqi_pairs]

    forecast_df = pd.DataFrame({
        "Day": days,
        "Predicted Temperature": temps
    })

    aqi_forecast_df = pd.DataFrame({
        "Day": days,
        "Predicted AQI": aqis
    })

    avg_future_temp = round(float(np.mean(temps)), 2)
    delta_temp = round(avg_future_temp - current_temp, 2)
    avg_future_aqi = round(float(np.mean(aqis)), 1)
    delta_aqi = round(avg_future_aqi - aqi, 1)

    # Multi-hazard evaluation (Heatwave + Toxic Air)
    is_high_heat = avg_future_temp >= THRESHOLDS["HEATWAVE_TEMP_HIGH"]
    is_mod_heat = avg_future_temp >= THRESHOLDS["HEATWAVE_TEMP_MODERATE"]
    is_high_aqi = avg_future_aqi >= THRESHOLDS["HAZARDOUS_AQI"] or aqi >= 150
    is_mod_aqi = avg_future_aqi >= THRESHOLDS["POOR_AQI"] or aqi >= 100

    if is_high_heat or is_high_aqi:
        risk_level = "High"
    elif is_mod_heat or is_mod_aqi:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    return {
        "state": state_name,
        "current_temp": current_temp,
        "predicted_avg": avg_future_temp,
        "delta": delta_temp,
        "current_aqi": aqi,
        "predicted_avg_aqi": avg_future_aqi,
        "delta_aqi": delta_aqi,
        "risk_level": risk_level,
        "forecast_df": forecast_df,
        "aqi_forecast_df": aqi_forecast_df
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
