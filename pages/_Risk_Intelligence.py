from styles import apply_theme
apply_theme()
import streamlit as st
import pandas as pd

st.title("🚨 Risk Intelligence")

df = pd.read_csv("data/climate_data.csv")

hottest = df.loc[df["Temperature"].idxmax()]
rainiest = df.loc[df["Rainfall"].idxmax()]
worst_aqi = df.loc[df["AQI"].idxmax()]
high_risk = (df["Risk"] == "High").sum()

c1, c2 = st.columns(2)
c3, c4 = st.columns(2)

with c1:
    st.metric(
        "🔥 Hottest State",
        hottest["State"],
        f"{hottest['Temperature']} °C"
    )

with c2:
    st.metric(
        "🌧️ Highest Rainfall",
        rainiest["State"],
        f"{rainiest['Rainfall']} mm"
    )

with c3:
    st.metric(
        "🌫️ Worst AQI",
        worst_aqi["State"],
        f"AQI {worst_aqi['AQI']}"
    )

with c4:
    st.metric(
        "🚨 High Risk States",
        high_risk
    )

st.divider()

st.subheader("⚠️ High Risk States")

risk_df = df[df["Risk"] == "High"]

if len(risk_df) > 0:
    st.dataframe(
        risk_df[
            [
                "State",
                "Temperature",
                "Rainfall",
                "AQI",
                "Risk"
            ]
        ],
        use_container_width=True
    )
else:
    st.success("No high risk states found.")

    st.divider()

st.subheader("📥 Export High Risk Data")

risk_df = df[df["Risk"] == "High"]

st.download_button(
    "Download High Risk States CSV",
    risk_df.to_csv(index=False),
    file_name="high_risk_states.csv",
    mime="text/csv"
)
st.download_button(
    "Download Full Climate Dataset",
    df.to_csv(index=False),
    file_name="climate_data.csv",
    mime="text/csv"
)