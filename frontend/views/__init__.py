"""
ClimateTwin AI - Frontend Views Package
Modular view controllers corresponding to application pages.
"""
from frontend.views.home_view import render_home_view
from frontend.views.dashboard_view import render_dashboard_view
from frontend.views.predictions_view import render_predictions_view
from frontend.views.analytics_view import render_analytics_view
from frontend.views.simulation_view import render_simulation_view
from frontend.views.risk_view import render_risk_view
from frontend.views.reports_view import render_reports_view

__all__ = [
    "render_home_view",
    "render_dashboard_view",
    "render_predictions_view",
    "render_analytics_view",
    "render_simulation_view",
    "render_risk_view",
    "render_reports_view"
]
