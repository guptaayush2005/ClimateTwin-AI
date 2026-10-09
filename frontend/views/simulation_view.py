"""
ClimateTwin AI - Simulation View
"""
import streamlit as st
from frontend.styles import apply_theme
from frontend.i18n.language_manager import t
from backend.services.ml_service import simulate_scenario


def render_simulation_view():
    apply_theme()

    st.title(t("simulation_title"))
    st.caption(t("simulation_subtitle"))

    st.subheader(t("adjust_params"))

    rain = st.slider(
        t("param_rainfall"),
        min_value=0,
        max_value=120,
        value=20,
        key="sim_slider_rain"
    )

    humidity = st.slider(
        t("param_humidity"),
        min_value=15,
        max_value=100,
        value=60,
        key="sim_slider_humidity"
    )

    aqi = st.slider(
        t("param_aqi"),
        min_value=30,
        max_value=350,
        value=100,
        key="sim_slider_aqi"
    )

    if st.button(t("run_simulation_btn"), key="btn_run_sim"):
        sim_result = simulate_scenario(rain, humidity, aqi)
        pred_temp = sim_result["predicted_temp"]
        risk_level = sim_result["risk_level"]
        warnings = sim_result["warnings"]

        st.metric(
            label=t("predicted_temp_result"),
            value=f"{pred_temp:.2f} °C"
        )

        st.divider()

        # Risk classification
        if risk_level == "High":
            st.error(f"🔥 {t('high_risk_alert')}")
        elif risk_level == "Moderate":
            st.warning(f"🟠 {t('moderate_risk_alert')}")
        else:
            st.success(f"🟢 {t('low_risk_alert')}")

        # Extra alerts
        if "flood_warning" in warnings:
            st.warning(t("flood_sim_warning"))
        if "air_quality_warning" in warnings:
            st.error(t("air_sim_warning"))

        st.info(t("sim_complete"))
