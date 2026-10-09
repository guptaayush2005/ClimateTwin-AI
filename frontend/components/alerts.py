"""
ClimateTwin AI - Alerts Component
Renders AI Climate Risk Alerts for Heatwave, Heavy Rainfall, and Air Quality.
"""
import streamlit as st
from typing import Dict, Any
from frontend.i18n.language_manager import t


def render_ai_alerts(hottest: Dict[str, Any], rainiest: Dict[str, Any], worst_aqi: Dict[str, Any]):
    """
    Renders styled alert notices with localized text.
    """
    st.subheader(t("ai_alerts_title"))

    # Heatwave Alert
    if hottest and "State" in hottest:
        st.error(
            f"**{t('heatwave_alert')}**\n\n"
            f"📍 **{hottest['State']}** ({hottest.get('Temperature', 0)} °C)"
        )

    # Heavy Rain Alert
    if rainiest and "State" in rainiest:
        st.warning(
            f"**{t('heavy_rain_alert')}**\n\n"
            f"📍 **{rainiest['State']}** ({rainiest.get('Rainfall', 0)} mm)"
        )

    # Poor AQI Alert
    if worst_aqi and "State" in worst_aqi:
        st.error(
            f"**{t('poor_aqi_alert')}**\n\n"
            f"📍 **{worst_aqi['State']}** (AQI: **{worst_aqi.get('AQI', 0)}**)"
        )
