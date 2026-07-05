from styles import apply_theme
apply_theme()
import streamlit as st
import pandas as pd
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime
import tempfile

st.title("📄 Climate Report Generator")

df = pd.read_csv("data/climate_data.csv")

if st.button("Generate Professional PDF Report"):

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    )

    doc = SimpleDocTemplate(temp_file.name)
    styles = getSampleStyleSheet()

    elements = []

    # Title
    elements.append(
        Paragraph(
            "ClimateTwin AI - Climate Intelligence Report",
            styles["Title"]
        )
    )

    elements.append(Spacer(1, 20))

    # Date & Time
    elements.append(
        Paragraph(
            f"Generated On: {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}",
            styles["Normal"]
        )
    )

    elements.append(Spacer(1, 20))

    # Summary
    elements.append(
        Paragraph(
            f"Total States Analysed: {len(df)}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"Average Temperature: {round(df['Temperature'].mean(),2)} °C",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"Average Rainfall: {round(df['Rainfall'].mean(),2)} mm",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"Average Humidity: {round(df['Humidity'].mean(),2)} %",
            styles["Normal"]
        )
    )

    high_risk = (df["Risk"] == "High").sum()

    elements.append(
        Paragraph(
            f"High Risk States: {high_risk}",
            styles["Normal"]
        )
    )

    # AI Alerts Summary
    hottest = df.loc[df["Temperature"].idxmax()]
    rainiest = df.loc[df["Rainfall"].idxmax()]
    worst_aqi = df.loc[df["AQI"].idxmax()]

    elements.append(Spacer(1, 20))

    elements.append(
        Paragraph(
            "AI Alerts Summary",
            styles["Heading2"]
        )
    )

    elements.append(
        Paragraph(
            f"Heatwave Alert: {hottest['State']} ({hottest['Temperature']} °C)",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"Heavy Rainfall Alert: {rainiest['State']} ({rainiest['Rainfall']} mm)",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"Poor Air Quality Alert: {worst_aqi['State']} (AQI {worst_aqi['AQI']})",
            styles["Normal"]
        )
    )

    doc.build(elements)

    with open(temp_file.name, "rb") as f:
        st.download_button(
            "📥 Download Climate Report PDF",
            f,
            file_name="ClimateTwin_AI_Report.pdf",
            mime="application/pdf"
        )