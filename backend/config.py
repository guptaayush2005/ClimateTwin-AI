"""
ClimateTwin AI - Backend Configuration
Defines paths, API endpoints, constants, and default thresholds.
"""
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
ASSETS_DIR = BASE_DIR / "assets"

# Data Files
CLIMATE_DATA_FILE = DATA_DIR / "climate_data.csv"
STATE_COORDINATES_FILE = DATA_DIR / "state_coordinates.csv"
GEOJSON_FILE = DATA_DIR / "india_states.geojson"

# Model Files
SAVED_MODEL_FILE = MODELS_DIR / "saved_model.pkl"
MODEL_TREES_FILE = MODELS_DIR / "model_trees.json"

# NASA POWER API Settings
NASA_API_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
NASA_PARAMETERS = "T2M,PRECTOTCORR,RH2M"
NASA_COMMUNITY = "RE"
NASA_DATE_DELAY_DAYS = 3  # NASA daily data is usually delayed by 2-3 days

# Climate Thresholds
THRESHOLDS = {
    "HEATWAVE_TEMP_HIGH": 35.0,     # °C
    "HEATWAVE_TEMP_MODERATE": 30.0, # °C
    "HEAVY_RAINFALL": 70.0,         # mm
    "POOR_AQI": 120,                # AQI index
    "HAZARDOUS_AQI": 180,           # AQI index
}
