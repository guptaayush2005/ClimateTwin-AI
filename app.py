"""
ClimateTwin AI - Main Application Entrypoint
Integrates Frontend design system, Multilingual Internationalization,
and Backend analytical services with Streamlit navigation.
"""
import streamlit as st
from frontend.styles import apply_theme
from frontend.i18n.language_manager import init_language, t
from frontend.components.sidebar import render_sidebar
from frontend.views.home_view import render_home_view
from frontend.views.dashboard_view import render_dashboard_view
from frontend.views.predictions_view import render_predictions_view
from frontend.views.analytics_view import render_analytics_view
from frontend.views.simulation_view import render_simulation_view
from frontend.views.risk_view import render_risk_view
from frontend.views.reports_view import render_reports_view

# ---------------- PAGE CONFIG ----------------
st.set_page_config(
    page_title="ClimateTwin AI",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------- INITIALIZE LOCALIZATION & THEME ----------------
init_language()
apply_theme()

# ---------------- SIDEBAR CONTROLS ----------------
render_sidebar()

# ---------------- DYNAMIC PROGRAMMATIC NAVIGATION ----------------
nav_pages = {
    t("nav_section_main"): [
        st.Page(render_home_view, title=t("nav_home"), icon="🌍", default=True),
        st.Page(render_dashboard_view, title=t("nav_dashboard"), icon="📊"),
        st.Page(render_predictions_view, title=t("nav_predictions"), icon="🤖"),
    ],
    t("nav_section_intelligence"): [
        st.Page(render_analytics_view, title=t("nav_analytics"), icon="📈"),
        st.Page(render_simulation_view, title=t("nav_simulation"), icon="🌦"),
        st.Page(render_risk_view, title=t("nav_risk"), icon="🚨"),
        st.Page(render_reports_view, title=t("nav_reports"), icon="📄"),
    ]
}

pg = st.navigation(nav_pages)
pg.run()