"""
ClimateTwin AI - Charts Component
Plotly visualizers for geo-mapping, bar distributions, risk classification, and trends.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
from frontend.i18n.language_manager import t


def render_india_risk_map(df: pd.DataFrame):
    """
    Renders India scatter geo map for climate risk and AQI distribution.
    """
    if df.empty or "Latitude" not in df.columns or "Longitude" not in df.columns:
        st.info("No geospatial coordinate data available.")
        return

    fig = px.scatter_geo(
        df,
        lat="Latitude",
        lon="Longitude",
        color="AQI",
        size="AQI",
        hover_name="State",
        hover_data={
            "Temperature": True,
            "Rainfall": True,
            "Humidity": True,
            "AQI": True,
            "Risk": True,
            "Latitude": False,
            "Longitude": False
        },
        scope="asia",
        projection="natural earth",
        color_continuous_scale="RdYlGn_r"
    )

    fig.update_geos(
        visible=False,
        showcountries=True,
        countrycolor="#334155",
        lataxis_range=[6, 38],
        lonaxis_range=[68, 98],
        showland=True,
        landcolor="#f8fafc",
        subunitcolor="#cbd5e1"
    )

    fig.update_layout(
        height=480,
        margin=dict(l=0, r=0, t=10, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )

    st.plotly_chart(fig, use_container_width=True)


def render_hottest_states_chart(df: pd.DataFrame):
    """
    Renders Top 10 hottest states bar chart.
    """
    if df.empty or "Temperature" not in df.columns:
        return

    temp_df = df.sort_values("Temperature", ascending=False).head(10)
    fig = px.bar(
        temp_df,
        x="State",
        y="Temperature",
        color="Temperature",
        color_continuous_scale="Turbo",
        labels={"State": t("select_state"), "Temperature": f"{t('temperature')} (°C)"}
    )
    fig.update_layout(
        margin=dict(l=10, r=10, t=20, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    st.plotly_chart(fig, use_container_width=True)


def render_rainfall_states_chart(df: pd.DataFrame):
    """
    Renders Top 10 rainfall states bar chart.
    """
    if df.empty or "Rainfall" not in df.columns:
        return

    rain_df = df.sort_values("Rainfall", ascending=False).head(10)
    fig = px.bar(
        rain_df,
        x="State",
        y="Rainfall",
        color="Rainfall",
        color_continuous_scale="Blues",
        labels={"State": t("select_state"), "Rainfall": f"{t('rainfall')} (mm)"}
    )
    fig.update_layout(
        margin=dict(l=10, r=10, t=20, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    st.plotly_chart(fig, use_container_width=True)


def render_humidity_chart(df: pd.DataFrame):
    """
    Renders humidity line chart.
    """
    if df.empty or "Humidity" not in df.columns:
        return

    hum_df = df.sort_values("Humidity")
    fig = px.line(
        hum_df,
        x="State",
        y="Humidity",
        markers=True,
        labels={"State": t("select_state"), "Humidity": f"{t('humidity')} (%)"},
        color_discrete_sequence=["#0284c7"]
    )
    fig.update_layout(
        margin=dict(l=10, r=10, t=20, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    st.plotly_chart(fig, use_container_width=True)


def render_aqi_scatter(df: pd.DataFrame):
    """
    Renders Temperature vs AQI scatter plot.
    """
    if df.empty:
        return

    fig = px.scatter(
        df,
        x="Temperature",
        y="AQI",
        color="Risk",
        size="AQI",
        hover_name="State",
        color_discrete_map={"High": "#dc2626", "Medium": "#f59e0b", "Low": "#10b981"},
        labels={"Temperature": f"{t('temperature')} (°C)", "AQI": t("aqi")}
    )
    fig.update_layout(
        margin=dict(l=10, r=10, t=20, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    st.plotly_chart(fig, use_container_width=True)


def render_risk_pie(df: pd.DataFrame):
    """
    Renders climate risk breakdown donut chart.
    """
    if df.empty or "Risk" not in df.columns:
        return

    risk_count = df["Risk"].value_counts().reset_index()
    risk_count.columns = ["Risk", "Count"]

    fig = px.pie(
        risk_count,
        names="Risk",
        values="Count",
        hole=0.45,
        color="Risk",
        color_discrete_map={"High": "#dc2626", "Medium": "#f59e0b", "Low": "#10b981"}
    )
    fig.update_layout(
        margin=dict(l=10, r=10, t=20, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    st.plotly_chart(fig, use_container_width=True)


def render_forecast_chart(forecast_df: pd.DataFrame, state_name: str):
    """
    Renders 7-day temperature forecast chart.
    """
    fig = px.line(
        forecast_df,
        x="Day",
        y="Predicted Temperature",
        markers=True,
        title=f"{t('forecast_chart_title')} - {state_name}",
        color_discrete_sequence=["#2563eb"],
        labels={"Day": "Day / दिन", "Predicted Temperature": f"{t('temperature')} (°C)"}
    )
    fig.update_layout(
        margin=dict(l=10, r=10, t=40, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    st.plotly_chart(fig, use_container_width=True)
