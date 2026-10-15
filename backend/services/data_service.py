"""
ClimateTwin AI - Backend Data Service
Handles data loading, sanitization, filtering, summary metric calculations, and CSV exports.
"""
import pandas as pd
from typing import Optional, Dict, Any, List
import json
from backend.config import (
    CLIMATE_DATA_FILE,
    STATE_COORDINATES_FILE,
    DISTRICTS_DATA_FILE,
    DISTRICTS_JSON_FILE,
    STATE_DISTRICTS_MAP_FILE
)


def load_districts_data(state: Optional[str] = None, district: Optional[str] = None) -> pd.DataFrame:
    """
    Loads all India district data from CSV or JSON with optional state/district filtering.
    """
    try:
        if DISTRICTS_DATA_FILE.exists():
            df = pd.read_csv(DISTRICTS_DATA_FILE)
        elif DISTRICTS_JSON_FILE.exists():
            df = pd.read_json(DISTRICTS_JSON_FILE)
        else:
            return pd.DataFrame()
    except Exception as e:
        print(f"Error loading districts data: {e}")
        return pd.DataFrame()

    numeric_cols = ["Temperature", "Rainfall", "Humidity", "AQI", "Latitude", "Longitude"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "Risk" not in df.columns:
        df["Risk"] = "Medium"

    if state and state not in ["All States", "सभी राज्य", "all"]:
        df = df[df["State"] == state]

    if district and district not in ["All Districts", "सभी ज़िले", "all"]:
        df = df[df["District"] == district]

    return df


def get_state_districts_map() -> Dict[str, List[str]]:
    """
    Returns state -> list of district names mapping for frontend dropdowns.
    """
    if STATE_DISTRICTS_MAP_FILE.exists():
        try:
            with open(STATE_DISTRICTS_MAP_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    df = load_districts_data()
    if not df.empty:
        mapping = {}
        for state, group in df.groupby("State"):
            mapping[state] = sorted(group["District"].dropna().unique().tolist())
        return mapping
    return {}


def get_districts_for_state(state: str) -> List[str]:
    """
    Returns list of districts belonging to a specific state.
    """
    st_map = get_state_districts_map()
    return st_map.get(state, [])


def get_district_record(state: str, district: str) -> Optional[Dict[str, Any]]:
    """
    Returns baseline or cached climate metrics for a specific district.
    """
    df = load_districts_data(state=state, district=district)
    if not df.empty:
        return df.iloc[0].to_dict()
    # Try searching district name directly
    df_all = load_districts_data()
    match = df_all[df_all["District"].str.lower() == district.lower()]
    if not match.empty:
        return match.iloc[0].to_dict()
    return None


def search_locations(query: str) -> List[Dict[str, Any]]:
    """
    Searches across all Indian states and districts matching query.
    Returns up to 15 best matches with coordinates and metadata.
    """
    if not query:
        return []
    q = query.lower().strip()
    df = load_districts_data()
    if df.empty:
        return []

    # Search matches in District and State
    matches = df[df["District"].str.lower().str.contains(q, na=False) | df["State"].str.lower().str.contains(q, na=False)]
    results = []
    for _, row in matches.head(20).iterrows():
        results.append({
            "type": "district",
            "name": f"{row['District']}, {row['State']}",
            "district": row["District"],
            "state": row["State"],
            "lat": float(row["Latitude"]),
            "lon": float(row["Longitude"]),
            "temp": float(row["Temperature"]),
            "rain": float(row["Rainfall"]),
            "humidity": float(row["Humidity"]),
            "aqi": int(row["AQI"]),
            "risk": row["Risk"]
        })
    return results


def get_nearest_district(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """
    Finds the nearest Indian district for any given latitude and longitude coordinates.
    Computes Euclidean distance across 786 districts with approximate km distance.
    """
    df = load_districts_data()
    if df.empty or "Latitude" not in df.columns or "Longitude" not in df.columns:
        return None

    # Calculate squared Euclidean distance in degree coordinates
    distances = (df["Latitude"] - lat) ** 2 + (df["Longitude"] - lon) ** 2
    closest_idx = distances.idxmin()
    closest_row = df.loc[closest_idx]
    
    # Approximate distance in km (1 degree ~ 111 km)
    dist_degrees = float((distances.loc[closest_idx]) ** 0.5)
    approx_km = round(dist_degrees * 111.0, 1)

    rec = closest_row.to_dict()
    rec["distance_km"] = approx_km
    rec["target_lat"] = lat
    rec["target_lon"] = lon
    return rec




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
