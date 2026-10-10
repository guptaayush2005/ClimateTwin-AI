"""
ClimateTwin AI - Backend Services Package
Exports unified interfaces for data, ML, risk, reports, NASA sync, and AI assistant.
"""
from backend.services.data_service import (
    load_climate_data,
    get_states_list,
    get_state_record,
    get_summary_metrics,
    get_high_risk_states_df,
    export_dataframe_to_csv,
)
from backend.services.ml_service import (
    predict_temperature,
    get_7_day_forecast,
    simulate_scenario,
)
from backend.services.risk_service import (
    get_risk_intelligence,
)
from backend.services.report_service import (
    generate_pdf_report,
)
from backend.services.assistant_service import (
    ask_climate_assistant,
)
from backend.services.nasa_service import (
    sync_nasa_climate_data,
    fetch_nasa_satellite_telemetry,
)

__all__ = [
    "load_climate_data",
    "get_states_list",
    "get_state_record",
    "get_summary_metrics",
    "get_high_risk_states_df",
    "export_dataframe_to_csv",
    "predict_temperature",
    "get_7_day_forecast",
    "simulate_scenario",
    "get_risk_intelligence",
    "generate_pdf_report",
    "ask_climate_assistant",
    "sync_nasa_climate_data",
    "fetch_nasa_satellite_telemetry",
]
