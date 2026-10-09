"""
ClimateTwin AI - Predictions View
"""
import streamlit as st
from frontend.styles import apply_theme
from frontend.i18n.language_manager import t
from frontend.components.charts import render_forecast_chart
from backend.services.data_service import load_climate_data, get_states_list
from backend.services.ml_service import get_7_day_forecast


def render_predictions_view():
    apply_theme()

    st.title(t("predictions_title"))
    st.caption(t("predictions_subtitle"))

    df = load_climate_data()
    states_list = get_states_list()

    if not states_list:
        st.warning("No state climate data available for predictions.")
        return

    selected_state = st.selectbox(
        t("select_state"),
        states_list,
        key="pred_state_selector"
    )

    state_rows = df[df["State"] == selected_state]
    if state_rows.empty:
        st.warning("Selected state not found in dataset.")
        return

    state_data = state_rows.iloc[0]
    current_temp = float(state_data["Temperature"])
    rain = float(state_data["Rainfall"])
    humidity = float(state_data["Humidity"])
    aqi = float(state_data["AQI"])

    # ML Forecast via Backend Service
    forecast_result = get_7_day_forecast(
        state_name=selected_state,
        rainfall=rain,
        humidity=humidity,
        aqi=aqi,
        current_temp=current_temp
    )

    # Render Line Chart
    render_forecast_chart(forecast_result["forecast_df"], selected_state)

    st.divider()

    # Metric Comparison
    c1, c2, c3 = st.columns(3)
    with c1:
        st.metric(
            label=t("current_temp"),
            value=f"{current_temp:.2f} °C"
        )
    with c2:
        st.metric(
            label=t("predicted_avg"),
            value=f"{forecast_result['predicted_avg']:.2f} °C"
        )
    with c3:
        st.metric(
            label=t("temp_change"),
            value=f"{forecast_result['delta']:+.2f} °C",
            delta=f"{forecast_result['delta']:+.2f} °C"
        )

    st.subheader(f"🌡️ {t('risk')}")
    risk_level = forecast_result["risk_level"]
    if risk_level == "High":
        st.error(t("high_risk_alert"))
    elif risk_level == "Moderate":
        st.warning(t("moderate_risk_alert"))
    else:
        st.success(t("low_risk_alert"))
