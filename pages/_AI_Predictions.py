from styles import apply_theme
apply_theme()
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import joblib

st.title("🤖 AI Climate Predictions")

# Load data and model
df = pd.read_csv("data/climate_data.csv")
model = joblib.load("models/saved_model.pkl")

# State selection
state = st.selectbox(
    "Select State",
    sorted(df["State"].tolist())
)

state_data = df[df["State"] == state].iloc[0]

current_temp = state_data["Temperature"]
rain = state_data["Rainfall"]
humidity = state_data["Humidity"]
aqi = state_data["AQI"]

# Real ML prediction
pred_temp = model.predict([[rain, humidity, aqi]])[0]

days = np.arange(1, 8)

predicted_temp = [
    round(pred_temp + np.random.uniform(-1, 1), 2)
    for _ in days
]

pred_df = pd.DataFrame({
    "Day": days,
    "Predicted Temperature": predicted_temp
})

st.subheader(f"7-Day Temperature Forecast - {state}")

fig = px.line(
    pred_df,
    x="Day",
    y="Predicted Temperature",
    markers=True,
    title=f"Temperature Forecast for {state}"
)

st.plotly_chart(fig, use_container_width=True)

avg_future = round(np.mean(predicted_temp), 2)

st.divider()

c1, c2, c3 = st.columns(3)

with c1:
    st.metric(
        "Current Temperature",
        f"{current_temp:.2f} °C"
    )

with c2:
    st.metric(
        "Predicted Avg",
        f"{avg_future:.2f} °C"
    )

with c3:
    change = round(avg_future - current_temp, 2)
    st.metric(
        "Temperature Change",
        f"{change:+.2f} °C"
    )

st.subheader("🌡️ Climate Risk Level")

if avg_future >= 35:
    st.error("🔴 High Heatwave Risk")
elif avg_future >= 30:
    st.warning("🟠 Moderate Climate Risk")
else:
    st.success("🟢 Low Climate Risk")