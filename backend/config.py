"""
ClimateTwin AI - Backend Configuration
Defines paths, API endpoints, constants, and default thresholds.
Robust against local development, Docker, and Vercel Serverless environments.
"""
import os
from pathlib import Path

# Base Paths
_file_base = Path(__file__).resolve().parent.parent
_cwd_base = Path(os.getcwd())

if (_file_base / "data" / "climate_data.csv").exists():
    BASE_DIR = _file_base
elif (_cwd_base / "data" / "climate_data.csv").exists():
    BASE_DIR = _cwd_base
else:
    BASE_DIR = _file_base

BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "public" if (BASE_DIR / "public").exists() else BASE_DIR / "frontend"
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
ASSETS_DIR = FRONTEND_DIR / "assets"

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
