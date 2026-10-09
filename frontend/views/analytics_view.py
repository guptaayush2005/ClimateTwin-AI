"""
ClimateTwin AI - Analytics View
"""
import streamlit as st
import plotly.express as px
from frontend.styles import apply_theme
from frontend.i18n.language_manager import t
from frontend.components.charts import (
    render_rainfall_states_chart,
    render_aqi_scatter,
    render_risk_pie
)
from backend.services.data_service import (
    load_climate_data,
    get_states_list,
    export_dataframe_to_csv
)


def render_analytics_view():
    apply_theme()

    st.title(f"📊 {t('nav_analytics')}")

    df_full = load_climate_data()
    states_list = get_states_list()
    all_states_label = t("all_states")

    selected_state = st.selectbox(
        t("select_state"),
        [all_states_label] + states_list,
        key="analytics_state_filter"
    )

    if selected_state != all_states_label:
        df = df_full[df_full["State"] == selected_state]
    else:
        df = df_full

    # 1. Temperature Distribution
    st.subheader(f"🌡️ {t('temperature')}")
    if selected_state != all_states_label:
        st.info(f"{t('temperature')} in {selected_state}: **{df.iloc[0]['Temperature']} °C**")
    else:
        fig_temp = px.histogram(
            df,
            x="Temperature",
            nbins=10,
            color_discrete_sequence=["#2563EB"],
            labels={"Temperature": f"{t('temperature')} (°C)"}
        )
        fig_temp.update_layout(
            margin=dict(l=10, r=10, t=10, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)"
        )
        st.plotly_chart(fig_temp, use_container_width=True)

    # 2. Rainfall Analysis
    st.subheader(f"🌧️ {t('rainfall')}")
    if selected_state != all_states_label:
        st.info(f"{t('rainfall')} in {selected_state}: **{df.iloc[0]['Rainfall']} mm**")
    else:
        render_rainfall_states_chart(df)

    # 3. AQI Analysis
    st.subheader(f"🌫️ {t('aqi')}")
    if selected_state != all_states_label:
        st.info(f"{t('aqi')} in {selected_state}: **{df.iloc[0]['AQI']}**")
    else:
        render_aqi_scatter(df)

    # 4. Risk Breakdown
    st.subheader(f"⚠️ {t('risk_distribution')}")
    if selected_state != all_states_label:
        risk_val = df.iloc[0]["Risk"]
        if risk_val == "High":
            st.error(f"🔴 {selected_state}: {t('high_risk_alert')}")
        elif risk_val == "Medium":
            st.warning(f"🟠 {selected_state}: {t('moderate_risk_alert')}")
        else:
            st.success(f"🟢 {selected_state}: {t('low_risk_alert')}")
    else:
        render_risk_pie(df)

    st.divider()

    # Export Button
    st.subheader(t("export_data"))
    csv_bytes = export_dataframe_to_csv(df)
    st.download_button(
        label=t("download_csv"),
        data=csv_bytes,
        file_name="climate_data.csv",
        mime="text/csv",
        key="btn_download_analytics_csv"
    )
