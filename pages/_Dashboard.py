"""
ClimateTwin AI - Dashboard Page (Multipage Route)
Delegates to frontend.views.dashboard_view
"""
from frontend.styles import apply_theme
from frontend.i18n.language_manager import init_language
from frontend.components.sidebar import render_sidebar
from frontend.views.dashboard_view import render_dashboard_view

init_language()
apply_theme()
render_sidebar()
render_dashboard_view()