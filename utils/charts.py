"""
ClimateTwin AI - Utils Charts Bridge
Delegates to frontend.components.charts
"""
from frontend.components.charts import (
    render_india_risk_map,
    render_hottest_states_chart,
    render_rainfall_states_chart,
    render_humidity_chart,
    render_aqi_scatter,
    render_risk_pie,
    render_forecast_chart
)

__all__ = [
    "render_india_risk_map",
    "render_hottest_states_chart",
    "render_rainfall_states_chart",
    "render_humidity_chart",
    "render_aqi_scatter",
    "render_risk_pie",
    "render_forecast_chart"
]
