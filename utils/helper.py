"""
ClimateTwin AI - Utils Helper Bridge
Provides general utilities and translation accessor helpers.
"""
from frontend.i18n.language_manager import t, get_language, set_language
from backend.services.data_service import get_summary_metrics

__all__ = ["t", "get_language", "set_language", "get_summary_metrics"]
