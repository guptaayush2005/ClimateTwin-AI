"""
ClimateTwin AI - Real-time Live Weather & Air Quality Telemetry Service
Fetches live, up-to-the-minute atmospheric telemetry (Temperature, Humidity, Precipitation,
Wind, Weather Condition, US AQI, PM2.5, PM10) from high-precision Open-Meteo APIs (0 API key required).
Provides real-time hazard classification and NDMA/IMD emergency precautions for any Indian district.
"""
import time
import requests
from typing import Dict, Any, Optional
from datetime import datetime

# In-memory telemetry cache: key -> {"timestamp": float, "data": dict}
_TELEMETRY_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes cache

WEATHER_CODE_MAP = {
    0: {"label": "Clear Sky", "icon": "☀️", "label_hi": "साफ आसमान"},
    1: {"label": "Mainly Clear", "icon": "🌤️", "label_hi": "मुख्य रूप से साफ"},
    2: {"label": "Partly Cloudy", "icon": "⛅", "label_hi": "आंशिक रूप से बादल"},
    3: {"label": "Overcast", "icon": "☁️", "label_hi": "घने बादल"},
    45: {"label": "Foggy", "icon": "🌫️", "label_hi": "कोहरा"},
    48: {"label": "Depositing Rime Fog", "icon": "🌫️", "label_hi": "घना कोहरा"},
    51: {"label": "Light Drizzle", "icon": "🌦️", "label_hi": "हल्की बूंदाबांदी"},
    53: {"label": "Moderate Drizzle", "icon": "🌦️", "label_hi": "मध्यम बूंदाबांदी"},
    55: {"label": "Dense Drizzle", "icon": "🌧️", "label_hi": "तेज बूंदाबांदी"},
    61: {"label": "Slight Rain", "icon": "🌧️", "label_hi": "हल्की बारिश"},
    63: {"label": "Moderate Rain", "icon": "🌧️", "label_hi": "मध्यम बारिश"},
    65: {"label": "Heavy Rain", "icon": "⛈️", "label_hi": "भारी बारिश"},
    71: {"label": "Slight Snowfall", "icon": "🌨️", "label_hi": "हल्की बर्फबारी"},
    73: {"label": "Moderate Snowfall", "icon": "❄️", "label_hi": "मध्यम बर्फबारी"},
    75: {"label": "Heavy Snowfall", "icon": "❄️", "label_hi": "भारी बर्फबारी"},
    80: {"label": "Slight Rain Showers", "icon": "🌦️", "label_hi": "हल्की बौछारें"},
    81: {"label": "Moderate Rain Showers", "icon": "🌧️", "label_hi": "मध्यम बौछारें"},
    82: {"label": "Violent Rain Showers", "icon": "⛈️", "label_hi": "मूसलाधार बारिश"},
    95: {"label": "Thunderstorm", "icon": "⚡", "label_hi": "आंधी-तूफान"},
    96: {"label": "Thunderstorm with Hail", "icon": "⛈️", "label_hi": "ओलावृष्टि के साथ तूफान"},
    99: {"label": "Heavy Thunderstorm with Hail", "icon": "⛈️", "label_hi": "भारी ओलावृष्टि तूफान"}
}


def get_weather_description(code: int) -> Dict[str, str]:
    return WEATHER_CODE_MAP.get(code, {"label": "Clear", "icon": "🌤️", "label_hi": "सामान्य मौसम"})


def get_aqi_category(aqi: int) -> Dict[str, str]:
    if aqi <= 50:
        return {"category": "Good", "color": "#10b981", "advice": "Air quality is satisfactory and poses little or no health risk."}
    elif aqi <= 100:
        return {"category": "Moderate", "color": "#f59e0b", "advice": "Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion."}
    elif aqi <= 150:
        return {"category": "Unhealthy for Sensitive Groups", "color": "#f97316", "advice": "Children, elderly, and people with respiratory diseases should reduce prolonged outdoor exertion."}
    elif aqi <= 200:
        return {"category": "Unhealthy", "color": "#ef4444", "advice": "Everyone may begin to experience health effects. Wear N95 masks outdoors and avoid intense exercise."}
    elif aqi <= 300:
        return {"category": "Very Unhealthy", "color": "#8b5cf6", "advice": "Health alert: The risk of health effects is increased for everyone. Keep indoor air purifiers running."}
    else:
        return {"category": "Hazardous", "color": "#7f1d1d", "advice": "Emergency condition: The entire population is more likely to be affected. Avoid all outdoor activities."}


def fetch_live_district_telemetry(lat: float, lon: float, state: str = "", district: str = "") -> Dict[str, Any]:
    """
    Fetches real-time live current weather and air quality for exact coordinates.
    Cached for 5 minutes per location.
    """
    cache_key = f"{round(lat, 3)}_{round(lon, 3)}"
    now = time.time()
    
    if cache_key in _TELEMETRY_CACHE:
        entry = _TELEMETRY_CACHE[cache_key]
        if now - entry["timestamp"] < CACHE_TTL_SECONDS:
            return entry["data"]

    # Default fallback data
    result = {
        "is_live": False,
        "source": "Open-Meteo Realtime Atmospheric Satellites",
        "state": state,
        "district": district,
        "latitude": lat,
        "longitude": lon,
        "temperature": 27.5,
        "apparent_temperature": 28.5,
        "humidity": 65.0,
        "precipitation": 0.0,
        "wind_speed": 5.0,
        "weather_code": 0,
        "condition": "Mainly Clear",
        "condition_hi": "मुख्य रूप से साफ",
        "icon": "🌤️",
        "aqi": 110,
        "pm2_5": 38.5,
        "pm10": 65.2,
        "aqi_category": "Moderate",
        "aqi_color": "#f59e0b",
        "aqi_advice": "Air quality is acceptable.",
        "risk_level": "Medium",
        "hazard_tags": [],
        "ndma_tips": [],
        "last_updated": datetime.now().strftime("%I:%M %p, %d %b %Y")
    }

    try:
        # 1. Fetch Real-time Weather Telemetry
        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m"
        )
        w_res = requests.get(weather_url, timeout=4)
        if w_res.status_code == 200:
            w_data = w_res.json().get("current", {})
            result["temperature"] = round(float(w_data.get("temperature_2m", result["temperature"])), 1)
            result["apparent_temperature"] = round(float(w_data.get("apparent_temperature", result["temperature"])), 1)
            result["humidity"] = round(float(w_data.get("relative_humidity_2m", result["humidity"])), 1)
            result["precipitation"] = round(float(w_data.get("precipitation", 0.0)), 2)
            result["wind_speed"] = round(float(w_data.get("wind_speed_10m", result["wind_speed"])), 1)
            
            code = int(w_data.get("weather_code", 0))
            result["weather_code"] = code
            desc = get_weather_description(code)
            result["condition"] = desc["label"]
            result["condition_hi"] = desc["label_hi"]
            result["icon"] = desc["icon"]
            result["is_live"] = True

        # 2. Fetch Real-time Air Quality Telemetry
        aqi_url = (
            f"https://air-quality-api.open-meteo.com/v1/air-quality?"
            f"latitude={lat}&longitude={lon}&"
            f"current=us_aqi,pm10,pm2_5"
        )
        a_res = requests.get(aqi_url, timeout=4)
        if a_res.status_code == 200:
            a_data = a_res.json().get("current", {})
            us_aqi = a_data.get("us_aqi")
            if us_aqi is not None:
                result["aqi"] = int(us_aqi)
            if a_data.get("pm2_5") is not None:
                result["pm2_5"] = round(float(a_data.get("pm2_5")), 1)
            if a_data.get("pm10") is not None:
                result["pm10"] = round(float(a_data.get("pm10")), 1)

    except Exception as e:
        # Graceful fallback to baseline calculation if network unavailable
        print(f"Warning: Live telemetry fetch failed for ({lat}, {lon}): {e}")

    # Analyze risk and NDMA precautions
    aqi_cat = get_aqi_category(result["aqi"])
    result["aqi_category"] = aqi_cat["category"]
    result["aqi_color"] = aqi_cat["color"]
    result["aqi_advice"] = aqi_cat["advice"]

    hazards = []
    tips = []

    if result["temperature"] >= 35.0:
        hazards.append("Heatwave Warning")
        tips.append("Stay hydrated, avoid direct sun exposure between 12 PM - 3 PM, and wear light cotton clothing.")
    elif result["temperature"] <= 5.0:
        hazards.append("Cold Wave Alert")
        tips.append("Protect yourself from hypothermia, wear layered woolens, and keep living spaces warm.")

    if result["precipitation"] >= 20.0:
        hazards.append("Torrential Rain / Urban Flooding")
        tips.append("Avoid low-lying inundated roads, disconnect outdoor electrical circuits, and monitor local drainage.")

    if result["wind_speed"] >= 30.0:
        hazards.append("High Wind / Squall")
        tips.append("Stay away from tall trees, dilapidated structures, and unsecured advertising hoardings.")

    if result["aqi"] >= 150:
        hazards.append("Severe Atmospheric Pollution")
        tips.append("Wear certified N95 masks when stepping outdoors, avoid vigorous cardio outside, and keep windows closed.")

    if not hazards:
        hazards.append("Optimal Climate Conditions")
        tips.append("Weather is pleasant. Good conditions for outdoor and agricultural activities.")

    # Risk level determination
    if len(hazards) > 1 or result["aqi"] >= 160 or result["temperature"] >= 36.0 or result["precipitation"] >= 25.0:
        result["risk_level"] = "High"
    elif result["aqi"] >= 100 or result["temperature"] >= 32.0 or result["precipitation"] >= 10.0:
        result["risk_level"] = "Medium"
    else:
        result["risk_level"] = "Low"

    result["hazard_tags"] = hazards
    result["ndma_tips"] = tips

    # Save to memory cache
    _TELEMETRY_CACHE[cache_key] = {"timestamp": now, "data": result}
    return result
