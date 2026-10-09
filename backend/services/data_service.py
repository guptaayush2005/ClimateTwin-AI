"""
ClimateTwin AI - Backend Data Service
Handles data loading, sanitization, filtering, summary metric calculations, and CSV exports.
"""
import pandas as pd
from typing import Optional, Dict, Any, List
from backend.config import CLIMATE_DATA_FILE, STATE_COORDINATES_FILE


def load_climate_data(state: Optional[str] = None) -> pd.DataFrame:
    """
    Loads climate data from CSV and applies optional state filter.
    """
    try:
        df = pd.read_csv(CLIMATE_DATA_FILE)
    except Exception as e:
        # Fallback empty dataframe if file missing
        print(f"Error loading climate data: {e}")
        return pd.DataFrame()

    # Ensure required numeric columns exist and are typed
    numeric_cols = ["Temperature", "Rainfall", "Humidity", "AQI", "Latitude", "Longitude"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "Risk" not in df.columns:
        df["Risk"] = "Medium"

    if state and state != "All States" and state != "सभी राज्य":
        df = df[df["State"] == state]

    return df


def get_states_list() -> List[str]:
    """
    Returns a sorted list of unique state names.
    """
    df = load_climate_data()
    if not df.empty and "State" in df.columns:
        return sorted(df["State"].dropna().unique().tolist())
    return []


def get_state_record(state: str) -> Optional[Dict[str, Any]]:
    """
    Returns a dictionary of climate attributes for a specific state.
    """
    df = load_climate_data()
    match = df[df["State"] == state]
    if not match.empty:
        return match.iloc[0].to_dict()
    return None


def get_summary_metrics(df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    """
    Computes key summary statistics and extreme records.
    """
    if df is None or df.empty:
        df = load_climate_data()

    if df.empty:
        return {
            "total_states": 0,
            "avg_temperature": 0.0,
            "avg_rainfall": 0.0,
            "avg_humidity": 0.0,
            "high_risk_states_count": 0,
            "hottest": {"State": "N/A", "Temperature": 0.0},
            "rainiest": {"State": "N/A", "Rainfall": 0.0},
            "worst_aqi": {"State": "N/A", "AQI": 0},
        }

    avg_temp = round(float(df["Temperature"].mean()), 2)
    avg_rain = round(float(df["Rainfall"].mean()), 2)
    avg_humidity = round(float(df["Humidity"].mean()), 2)
    high_risk_count = int((df["Risk"] == "High").sum())

    hottest_idx = df["Temperature"].idxmax()
    rainiest_idx = df["Rainfall"].idxmax()
    worst_aqi_idx = df["AQI"].idxmax()

    hottest_row = df.loc[hottest_idx]
    rainiest_row = df.loc[rainiest_idx]
    worst_aqi_row = df.loc[worst_aqi_idx]

    return {
        "total_states": len(df),
        "avg_temperature": avg_temp,
        "avg_rainfall": avg_rain,
        "avg_humidity": avg_humidity,
        "high_risk_states_count": high_risk_count,
        "hottest": {
            "State": hottest_row["State"],
            "Temperature": round(float(hottest_row["Temperature"]), 2)
        },
        "rainiest": {
            "State": rainiest_row["State"],
            "Rainfall": round(float(rainiest_row["Rainfall"]), 2)
        },
        "worst_aqi": {
            "State": worst_aqi_row["State"],
            "AQI": int(worst_aqi_row["AQI"])
        }
    }


def get_high_risk_states_df(df: Optional[pd.DataFrame] = None) -> pd.DataFrame:
    """
    Returns only records classified as High Risk.
    """
    if df is None:
        df = load_climate_data()
    return df[df["Risk"] == "High"].copy()


def export_dataframe_to_csv(df: pd.DataFrame) -> str:
    """
    Encodes dataframe to CSV string for download.
    """
    return df.to_csv(index=False)
