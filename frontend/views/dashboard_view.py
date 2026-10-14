"""
ClimateTwin AI - Dashboard View
"""
import streamlit as st
from frontend.styles import apply_theme
from frontend.i18n.language_manager import t, get_language
from frontend.components.metrics import render_metrics_cards
from frontend.components.alerts import render_ai_alerts
from frontend.components.charts import (
    render_india_risk_map,
    render_hottest_states_chart,
    render_rainfall_states_chart,
    render_humidity_chart
)
from backend.services.data_service import (
    load_climate_data,
    get_states_list,
    get_summary_metrics
)
from backend.services.risk_service import get_risk_intelligence
from backend.services.assistant_service import ask_climate_assistant


def render_dashboard_view():
    apply_theme()

    st.title(f"🌍 {t('nav_dashboard')}")
    st.caption(t("app_subtitle"))

    # Load Full Data
    df_full = load_climate_data()
    states_list = get_states_list()

    all_states_label = t("all_states")
    col_st, col_dt = st.columns([1, 1])
    with col_st:
        selected_state = st.selectbox(
            t("select_state"),
            [all_states_label] + states_list
        )

    with col_dt:
        from backend.services.data_service import get_districts_for_state, load_districts_data
        from backend.services.live_weather_service import fetch_live_district_telemetry
        dist_options = ["All Districts"]
        if selected_state != all_states_label:
            dist_options += get_districts_for_state(selected_state)
        selected_district = st.selectbox("📍 Select District (ज़िला)", dist_options)

    if selected_district and selected_district != "All Districts":
        dist_df = load_districts_data(state=selected_state, district=selected_district)
        if not dist_df.empty:
            df = dist_df
            d_row = dist_df.iloc[0]
            live = fetch_live_district_telemetry(
                float(d_row["Latitude"]),
                float(d_row["Longitude"]),
                state=selected_state,
                district=selected_district
            )
            st.success(
                f"⚡ **Live Satellite Telemetry ({selected_district}, {selected_state}):** "
                f"{live['icon']} {live['condition']} | 🌡️ {live['temperature']} °C (Feels {live['apparent_temperature']} °C) | "
                f"💧 {live['humidity']}% | 🌧️ {live['precipitation']} mm | 💨 {live['wind_speed']} km/h | "
                f"🌫️ AQI {live['aqi']} ({live['aqi_category']}) | 🚨 {live['risk_level']} Risk"
            )
        else:
            df = df_full[df_full["State"] == selected_state] if selected_state != all_states_label else df_full
    elif selected_state != all_states_label:
        state_dists = load_districts_data(state=selected_state)
        df = state_dists if not state_dists.empty else df_full[df_full["State"] == selected_state]
    else:
        df = df_full

    # Summary Metrics
    metrics = get_summary_metrics(df)
    render_metrics_cards(metrics)

    st.divider()

    # Map + AI Alerts
    risk_intel = get_risk_intelligence(df_full)
    col_map, col_alerts = st.columns([2, 1])

    with col_map:
        st.subheader(t("climate_risk_map"))
        render_india_risk_map(df)

    with col_alerts:
        render_ai_alerts(
            risk_intel["hottest"],
            risk_intel["rainiest"],
            risk_intel["worst_aqi"]
        )

    st.divider()

    # Hottest and Rainfall Charts
    col1, col2 = st.columns(2)
    with col1:
        st.subheader(t("top_hottest_states"))
        render_hottest_states_chart(df)

    with col2:
        st.subheader(t("top_rainfall_states"))
        render_rainfall_states_chart(df)

    st.divider()

    # Humidity Chart
    st.subheader(t("humidity_analysis"))
    render_humidity_chart(df)

    st.divider()

    # Multilingual AI Climate Assistant
    st.subheader(t("assistant_title"))
    st.caption(t("assistant_caption"))

    user_query = st.text_input(
        t("assistant_placeholder"),
        key="dashboard_assistant_query"
    )

    if user_query:
        active_lang = get_language()
        response = ask_climate_assistant(user_query, df_full, language=active_lang)
        resp_type = response.get("type", "success")
        msg = response.get("message", "")

        if resp_type == "success":
            st.success(msg)
        elif resp_type == "warning":
            st.warning(msg)
        else:
            st.info(msg)
