from styles import apply_theme
apply_theme()
import streamlit as st
import pandas as pd
import plotly.express as px

# ---------------- CSS ----------------
 

# ---------------- TITLE ----------------
st.title("🌍 Climate Intelligence Dashboard")
st.caption("AI-powered real-time climate monitoring system for India")

# ---------------- LOAD DATA ----------------
df = pd.read_csv("data/climate_data.csv")

# ---------------- STATE FILTER ----------------
state = st.selectbox(
    "Select State",
    ["All States"] + sorted(df["State"].tolist())
)

if state != "All States":
    df = df[df["State"] == state]

# ---------------- METRICS ----------------
avg_temp = round(df["Temperature"].mean(), 2)
avg_rain = round(df["Rainfall"].mean(), 2)
avg_humidity = round(df["Humidity"].mean(), 2)

high_risk_states = (df["Risk"] == "High").sum()

c1, c2, c3, c4 = st.columns(4)

with c1:
    st.metric("Avg Temperature", f"{avg_temp} °C")

with c2:
    st.metric("Avg Rainfall", f"{avg_rain} mm")

with c3:
    st.metric("Avg Humidity", f"{avg_humidity} %")

with c4:
    st.metric("High Risk States", int(high_risk_states))

st.divider()

# ---------------- MAP + ALERTS ----------------
left, right = st.columns([2, 1])

with left:
    st.subheader("🗺️ India Climate Risk Map")

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
        countrycolor="black",
        lataxis_range=[6, 38],
        lonaxis_range=[68, 98]
    )

    fig.update_layout(
        height=500,
        margin=dict(l=0, r=0, t=0, b=0),
        paper_bgcolor="white",
        plot_bgcolor="white"
    )

    st.plotly_chart(fig, use_container_width=True)

with right:
    st.subheader("🚨 AI Alerts")

    hottest = df.loc[df["Temperature"].idxmax()]
    rainiest = df.loc[df["Rainfall"].idxmax()]
    highest_aqi = df.loc[df["AQI"].idxmax()]

    st.error(
        f"🔥 Heatwave Risk\n\n{hottest['State']} ({hottest['Temperature']}°C)"
    )

    st.warning(
        f"🌧 Heavy Rainfall\n\n{rainiest['State']} ({rainiest['Rainfall']} mm)"
    )

    st.error(
        f"🌫 Poor Air Quality\n\n{highest_aqi['State']} (AQI {highest_aqi['AQI']})"
    )

st.divider()

# ---------------- CHARTS ----------------
col1, col2 = st.columns(2)

with col1:
    st.subheader("🌡️ Top Hottest States")

    temp_df = df.sort_values(
        "Temperature",
        ascending=False
    ).head(10)

    fig1 = px.bar(
        temp_df,
        x="State",
        y="Temperature",
        color="Temperature",
        color_continuous_scale="Turbo"
    )

    st.plotly_chart(fig1, use_container_width=True)

with col2:
    st.subheader("🌧️ Top Rainfall States")

    rain_df = df.sort_values(
        "Rainfall",
        ascending=False
    ).head(10)

    fig2 = px.bar(
        rain_df,
        x="State",
        y="Rainfall",
        color="Rainfall",
        color_continuous_scale="Blues"
    )

    st.plotly_chart(fig2, use_container_width=True)

st.divider()

# ---------------- HUMIDITY ----------------
st.subheader("💧 Humidity Analysis")

fig3 = px.line(
    df.sort_values("Humidity"),
    x="State",
    y="Humidity",
    markers=True
)

st.plotly_chart(fig3, use_container_width=True)

st.divider()

# ---------------- AI ASSISTANT ----------------
st.subheader("🤖 AI Climate Assistant")

question = st.text_input(
    "Ask anything about climate data..."
)

if question:

    q = question.lower()

    if "temperature" in q:
        st.success(
            f"🌡️ Average Temperature: "
            f"{round(df['Temperature'].mean(),2)} °C"
        )

    elif "rain" in q or "rainfall" in q:
        st.success(
            f"🌧️ Average Rainfall: "
            f"{round(df['Rainfall'].mean(),2)} mm"
        )

    elif "humidity" in q:
        st.success(
            f"💧 Average Humidity: "
            f"{round(df['Humidity'].mean(),2)} %"
        )

    elif "aqi" in q:
        worst = df.loc[df["AQI"].idxmax()]
        st.success(
            f"🌫️ Highest AQI is in "
            f"{worst['State']} (AQI {worst['AQI']})"
        )

    elif "high risk" in q:
        risk = df[df["Risk"] == "High"]

        if len(risk) > 0:
            st.success(
                "🚨 High Risk States: " +
                ", ".join(risk["State"])
            )
        else:
            st.success(
                "No high risk states found."
            )

    elif "hottest" in q or "hot" in q:
        hottest = df.loc[df["Temperature"].idxmax()]
        st.success(
            f"🔥 Hottest State: "
            f"{hottest['State']} "
            f"({hottest['Temperature']} °C)"
        )

    elif "rainiest" in q:
        rainiest = df.loc[df["Rainfall"].idxmax()]
        st.success(
            f"🌧️ Highest Rainfall: "
            f"{rainiest['State']} "
            f"({rainiest['Rainfall']} mm)"
        )

    elif "states" in q:
        st.success(
            f"📍 Total States/UTs: {len(df)}"
        )

    else:
        st.warning(
            "Sorry, I can answer questions about "
            "temperature, rainfall, humidity, AQI, "
            "high risk states and climate statistics."
        )