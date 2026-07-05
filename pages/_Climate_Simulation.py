from styles import apply_theme
apply_theme()
import streamlit as st
import joblib
import numpy as np

st.title("🌦️ Climate Simulation")
st.caption("Simulate future climate scenarios using AI.")

# Load model
model = joblib.load("models/saved_model.pkl")

st.subheader("Adjust Climate Parameters")

rain = st.slider(
    "🌧️ Rainfall (mm)",
    min_value=0,
    max_value=100,
    value=20
)

humidity = st.slider(
    "💧 Humidity (%)",
    min_value=20,
    max_value=100,
    value=60
)

aqi = st.slider(
    "🌫️ AQI",
    min_value=50,
    max_value=300,
    value=100
)

if st.button("🚀 Run Simulation"):

    pred_temp = model.predict([[rain, humidity, aqi]])[0]

    st.metric(
        "🌡️ Predicted Temperature",
        f"{pred_temp:.2f} °C"
    )

    st.divider()

    if pred_temp >= 35:
        st.error("🔥 High Heatwave Risk Predicted")
    elif pred_temp >= 30:
        st.warning("🟠 Moderate Climate Risk")
    else:
        st.success("🟢 Low Climate Risk")

    # Extra insights
    if rain > 70:
        st.warning("🌊 Heavy Rainfall may increase flood risk.")

    if aqi > 180:
        st.error("🌫️ Poor Air Quality Alert.")

    st.info("AI model based climate simulation complete.")