"""
ClimateTwin AI - Model Training Script
Trains RandomForestRegressor on climate indicators and saves the model artifact.
"""
import sys
from pathlib import Path
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.config import CLIMATE_DATA_FILE, SAVED_MODEL_FILE


def train():
    if not CLIMATE_DATA_FILE.exists():
        print(f"❌ Cannot train model: {CLIMATE_DATA_FILE} not found.")
        return

    print("🤖 Training Climate RandomForestRegressor model...")
    df = pd.read_csv(CLIMATE_DATA_FILE)

    X = df[["Rainfall", "Humidity", "AQI"]]
    y = df["Temperature"]

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42
    )

    model.fit(X, y)
    SAVED_MODEL_FILE.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, SAVED_MODEL_FILE)

    print(f"✅ Model trained successfully and saved to {SAVED_MODEL_FILE}!")


if __name__ == "__main__":
    train()
