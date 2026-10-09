"""
ClimateTwin AI - Metrics Component
Renders key climate metrics cards with localized labels and visual indicators.
"""
import streamlit as st
from typing import Dict, Any, Optional
from frontend.i18n.language_manager import t


def render_metrics_cards(metrics: Dict[str, Any], deltas: Optional[Dict[str, str]] = None):
    """
    Renders 4 KPI cards in a responsive layout.
    """
    col1, col2, col3, col4 = st.columns(4)

    temp_delta = deltas.get("temperature", "+2.4°C") if deltas else None
    rain_delta = deltas.get("rainfall", "+18%") if deltas else None
    hum_delta = deltas.get("humidity", "-5%") if deltas else None

    with col1:
        st.metric(
            label=f"🌡️ {t('avg_temperature')}",
            value=f"{metrics.get('avg_temperature', 0.0)} °C",
            delta=temp_delta
        )

    with col2:
        st.metric(
            label=f"🌧️ {t('avg_rainfall')}",
            value=f"{metrics.get('avg_rainfall', 0.0)} mm",
            delta=rain_delta
        )

    with col3:
        st.metric(
            label=f"💧 {t('avg_humidity')}",
            value=f"{metrics.get('avg_humidity', 0.0)} %",
            delta=hum_delta
        )

    with col4:
        st.metric(
            label=f"🚨 {t('high_risk_states')}",
            value=str(metrics.get("high_risk_states_count", 0)),
            delta=f"{metrics.get('total_states', 0)} total"
        )
