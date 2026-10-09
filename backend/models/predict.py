"""
ClimateTwin AI - ML Prediction Model Wrapper
Provides the ClimatePredictor class for inference on climate indicators.
Supports pure NumPy decision tree evaluation (no scikit-learn/scipy required),
with graceful fallback to joblib/sklearn or heuristic estimation.
"""
import json
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Optional, List, Tuple
from backend.config import SAVED_MODEL_FILE, MODEL_TREES_FILE

FEATURE_NAMES = ["Rainfall", "Humidity", "AQI"]


class ClimatePredictor:
    """
    RandomForest inference engine for Temperature and Climate prediction.
    Uses pure NumPy decision tree inference for ultra-fast, lightweight execution on Vercel.
    """
    def __init__(
        self,
        trees_path: Optional[Path] = None,
        model_path: Optional[Path] = None
    ):
        self.trees_path = trees_path or MODEL_TREES_FILE
        self.model_path = model_path or SAVED_MODEL_FILE
        self._trees = None
        self._model = None
        self._load_model()

    def _load_model(self):
        # 1. First priority: Pure JSON trees (zero heavy dependencies)
        if self.trees_path and self.trees_path.exists():
            try:
                with open(self.trees_path, "r", encoding="utf-8") as f:
                    self._trees = json.load(f)
                return
            except Exception as e:
                print(f"[ClimatePredictor] Error loading trees from {self.trees_path}: {e}")
                self._trees = None

        # 2. Second priority: Scikit-learn joblib model if installed
        if self.model_path and self.model_path.exists():
            try:
                import joblib
                self._model = joblib.load(self.model_path)
                return
            except Exception as e:
                print(f"[ClimatePredictor] Error loading pickle model from {self.model_path}: {e}")
                self._model = None

    @property
    def is_ready(self) -> bool:
        return self._trees is not None or self._model is not None

    def _predict_with_trees(self, rainfall: float, humidity: float, aqi: float) -> float:
        """
        Evaluates the 200 RandomForest decision trees using pure NumPy.
        """
        x = [float(rainfall), float(humidity), float(aqi)]
        tree_preds = []
        for tree in self._trees:
            cl = tree["children_left"]
            cr = tree["children_right"]
            feat = tree["feature"]
            thresh = tree["threshold"]
            val = tree["value"]
            node = 0
            while cl[node] != -1:
                if x[feat[node]] <= thresh[node]:
                    node = cl[node]
                else:
                    node = cr[node]
            tree_preds.append(val[node])
        return float(np.mean(tree_preds))

    def predict(self, rainfall: float, humidity: float, aqi: float) -> float:
        """
        Predicts temperature given Rainfall (mm), Humidity (%), and AQI.
        """
        if self._trees is not None:
            return self._predict_with_trees(rainfall, humidity, aqi)
        elif self._model is not None:
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
