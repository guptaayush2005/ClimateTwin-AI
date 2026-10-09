"""
ClimateTwin AI - Risk Intelligence Page (Multipage Route)
Delegates to frontend.views.risk_view
"""
from frontend.styles import apply_theme
from frontend.i18n.language_manager import init_language
from frontend.components.sidebar import render_sidebar
from frontend.views.risk_view import render_risk_view

init_language()
apply_theme()
render_sidebar()
render_risk_view()