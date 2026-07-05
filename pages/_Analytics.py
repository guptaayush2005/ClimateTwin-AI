from styles import apply_theme
apply_theme()
import streamlit as st
import pandas as pd
import plotly.express as px

st.title("📊 Climate Analytics")

df = pd.read_csv("data/climate_data.csv")

# State Filter
state = st.selectbox(
    "Select State",
    ["All States"] + sorted(df["State"].tolist())
)

if state != "All States":
    df = df[df["State"] == state]

# Temperature Distribution
st.subheader("🌡️ Temperature Distribution")

if state != "All States":
    st.info(
        f"Temperature in {state}: "
        f"{df.iloc[0]['Temperature']} °C"
    )
else:
    fig = px.histogram(
        df,
        x="Temperature",
        nbins=10,
        color_discrete_sequence=["#2563EB"]
    )

    st.plotly_chart(fig, use_container_width=True)

# Rainfall Analysis
st.subheader("🌧️ Rainfall Analysis")

if state != "All States":
    st.info(
        f"Rainfall in {state}: "
        f"{df.iloc[0]['Rainfall']} mm"
    )
else:
    fig = px.bar(
        df.sort_values("Rainfall", ascending=False),
        x="State",
        y="Rainfall",
        color="Rainfall",
        color_continuous_scale="Blues"
    )
    st.plotly_chart(fig, use_container_width=True)

# AQI Analysis
st.subheader("🌫️ AQI Analysis")

if state != "All States":
    st.info(
        f"AQI in {state}: "
        f"{df.iloc[0]['AQI']}"
    )
else:
    fig = px.scatter(
        df,
        x="Temperature",
        y="AQI",
        color="Risk",
        size="AQI",
        hover_name="State"
    )
    st.plotly_chart(fig, use_container_width=True)

# Risk Distribution
st.subheader("⚠️ Climate Risk")

if state != "All States":
    risk = df.iloc[0]["Risk"]

    if risk == "High":
        st.error(f"🔴 {state} is High Risk")
    elif risk == "Medium":
        st.warning(f"🟠 {state} is Medium Risk")
    else:
        st.success(f"🟢 {state} is Low Risk")
else:
    risk_count = (
        df["Risk"]
        .value_counts()
        .reset_index()
    )
    risk_count.columns = ["Risk", "Count"]

    fig = px.pie(
        risk_count,
        names="Risk",
        values="Count",
        hole=0.5
    )

    st.plotly_chart(fig, use_container_width=True)
st.divider()

st.subheader("📥 Export Data")

st.download_button(
    "Download Climate Dataset CSV",
    df.to_csv(index=False),
    file_name="climate_data.csv",
    mime="text/csv"
)