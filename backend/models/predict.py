"""
ClimateTwin AI - ML Prediction Model Wrapper
Provides the ClimatePredictor class for inference on climate indicators.
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Optional, List, Tuple
from backend.config import SAVED_MODEL_FILE

FEATURE_NAMES = ["Rainfall", "Humidity", "AQI"]


class ClimatePredictor:
    """
    RandomForest inference engine for Temperature and Climate prediction.
    """
    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or SAVED_MODEL_FILE
        self._model = None
        self._load_model()

    def _load_model(self):
        try:
            if self.model_path.exists():
                self._model = joblib.load(self.model_path)
            else:
                self._model = None
        except Exception as e:
            print(f"Error loading model from {self.model_path}: {e}")
            self._model = None

    @property
    def is_ready(self) -> bool:
        return self._model is not None

    def predict(self, rainfall: float, humidity: float, aqi: float) -> float:
        """
        Predicts temperature given Rainfall (mm), Humidity (%), and AQI.
        """
        if self._model is not None:
            features_df = pd.DataFrame(
                [[float(rainfall), float(humidity), float(aqi)]],
                columns=FEATURE_NAMES
            )
            pred = self._model.predict(features_df)[0]
            return float(pred)
        else:
            # Baseline estimation formula fallback
            estimate = 28.0 - (rainfall * 0.05) - ((humidity - 60) * 0.08) + ((aqi - 100) * 0.02)
            return float(np.clip(estimate, 12.0, 48.0))

    def predict_7_day_forecast(
        self,
        rainfall: float,
        humidity: float,
        aqi: float,
        base_temp: Optional[float] = None
    ) -> List[Tuple[int, float]]:
        """
        Generates 7-day forecast values [(day_num, predicted_temp), ...].
        """
        seed_pred = self.predict(rainfall, humidity, aqi)
        np.random.seed(int(rainfall + humidity + aqi) % 1000)

        forecast = []
        for day in range(1, 8):
            variation = np.random.uniform(-1.0, 1.0)
            day_temp = round(seed_pred + variation, 2)
            forecast.append((day, day_temp))

        return forecast
