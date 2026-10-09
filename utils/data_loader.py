"""
ClimateTwin AI - Utils Data Loader Bridge
Delegates to backend.services.data_service
"""
from backend.services.data_service import (
    load_climate_data,
    get_states_list,
    get_state_record,
    get_summary_metrics,
    get_high_risk_states_df,
    export_dataframe_to_csv
)

__all__ = [
    "load_climate_data",
    "get_states_list",
    "get_state_record",
    "get_summary_metrics",
    "get_high_risk_states_df",
    "export_dataframe_to_csv"
]
