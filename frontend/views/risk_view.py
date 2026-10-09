"""
ClimateTwin AI - Risk Intelligence View
"""
import streamlit as st
from frontend.styles import apply_theme
from frontend.i18n.language_manager import t
from backend.services.data_service import (
    load_climate_data,
    get_high_risk_states_df,
    export_dataframe_to_csv
)
from backend.services.risk_service import get_risk_intelligence


def render_risk_view():
    apply_theme()

    st.title(t("risk_intel_title"))
    st.caption(t("risk_intel_subtitle"))

    df = load_climate_data()
    risk_intel = get_risk_intelligence(df)

    hottest = risk_intel["hottest"]
    rainiest = risk_intel["rainiest"]
    worst_aqi = risk_intel["worst_aqi"]
    high_risk_count = risk_intel["high_risk_count"]

    st.subheader(t("extreme_conditions"))
    c1, c2 = st.columns(2)
    c3, c4 = st.columns(2)

    with c1:
        st.metric(
            label=t("hottest_state"),
            value=hottest.get("State", "N/A"),
            delta=f"{hottest.get('Temperature', 0)} °C"
        )

    with c2:
        st.metric(
            label=t("rainiest_state"),
            value=rainiest.get("State", "N/A"),
            delta=f"{rainiest.get('Rainfall', 0)} mm"
        )

    with c3:
        st.metric(
            label=t("worst_aqi_state"),
            value=worst_aqi.get("State", "N/A"),
            delta=f"AQI {worst_aqi.get('AQI', 0)}"
        )

    with c4:
        st.metric(
            label=t("high_risk_states"),
            value=str(high_risk_count)
        )

    st.divider()

    # High Risk States Data Table
    st.subheader(t("high_risk_states_table"))
    high_risk_df = get_high_risk_states_df(df)

    if not high_risk_df.empty:
        display_cols = ["State", "Temperature", "Rainfall", "Humidity", "AQI", "Risk"]
        valid_cols = [c for c in display_cols if c in high_risk_df.columns]
        st.dataframe(high_risk_df[valid_cols], use_container_width=True)
    else:
        st.success(t("no_high_risk_msg"))

    st.divider()

    # Export Buttons
    st.subheader(t("export_data"))
    col_dl1, col_dl2 = st.columns(2)

    with col_dl1:
        st.download_button(
            label=t("download_high_risk_csv"),
            data=export_dataframe_to_csv(high_risk_df),
            file_name="high_risk_states.csv",
            mime="text/csv",
            key="dl_high_risk_csv"
        )

    with col_dl2:
        st.download_button(
            label=t("download_full_csv"),
            data=export_dataframe_to_csv(df),
            file_name="climate_data.csv",
            mime="text/csv",
            key="dl_full_risk_csv"
        )
