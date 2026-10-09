"""
ClimateTwin AI - Predict Model Entrypoint
Delegates to backend.models.predict
"""
from backend.models.predict import ClimatePredictor

__all__ = ["ClimatePredictor"]
