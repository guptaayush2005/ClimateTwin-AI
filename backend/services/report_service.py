"""
ClimateTwin AI - Backend Report Service
Generates professional PDF and CSV analytical reports using ReportLab and Pandas.
"""
from __future__ import annotations
import tempfile
from datetime import datetime
from typing import Optional
import pandas as pd
try:
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from backend.services.data_service import load_climate_data, get_summary_metrics


def generate_pdf_report(df: Optional[pd.DataFrame] = None, language: str = "en") -> str:
    """
    Generates a structured PDF report and returns the temporary file path.
    """
    if df is None or df.empty:
        df = load_climate_data()

    metrics = get_summary_metrics(df)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")

    if not REPORTLAB_AVAILABLE:
        # Graceful fallback: write clean text report if reportlab is not installed
        with open(temp_file.name, "w", encoding="utf-8") as f:
            f.write(f"ClimateTwin AI - Climate Intelligence Report\n")
            f.write(f"Generated On: {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}\n\n")
            f.write(f"Average Temperature: {metrics['avg_temperature']} °C\n")
            f.write(f"Average Rainfall: {metrics['avg_rainfall']} mm\n")
            f.write(f"Average Humidity: {metrics['avg_humidity']} %\n")
            f.write(f"High Risk States: {metrics['high_risk_states_count']}\n")
        return temp_file.name
    doc = SimpleDocTemplate(
        temp_file.name,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0f172a"),
        alignment=1,  # Center
        spaceAfter=14
    )
    subtitle_style = ParagraphStyle(
        "CustomSubTitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#475569"),
        alignment=1,
        spaceAfter=20
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=14,
        spaceAfter=8
    )
    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e293b")
    )

    elements = []

    # Title & Subtitle
    elements.append(Paragraph("ClimateTwin AI - Climate Intelligence Report", title_style))
    elements.append(Paragraph(
        f"Generated On: {datetime.now().strftime('%d-%m-%Y %H:%M:%S')} | Target: India Climate Monitoring",
        subtitle_style
    ))
    elements.append(Spacer(1, 10))

    # Executive Summary Heading
    elements.append(Paragraph("1. Executive Climate Summary", heading_style))

    summary_data = [
        ["Indicator", "Value"],
        ["Total States Analysed", str(metrics["total_states"])],
        ["Average Temperature", f"{metrics['avg_temperature']} °C"],
        ["Average Rainfall", f"{metrics['avg_rainfall']} mm"],
        ["Average Humidity", f"{metrics['avg_humidity']} %"],
        ["High Risk States Count", str(metrics["high_risk_states_count"])],
    ]
    summary_table = Table(summary_data, colWidths=[240, 240])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 15))

    # AI Alerts Section
    elements.append(Paragraph("2. AI Climate Risk Alerts", heading_style))
    hottest = metrics["hottest"]
    rainiest = metrics["rainiest"]
    worst_aqi = metrics["worst_aqi"]

    alerts_data = [
        ["Risk Category", "State", "Observed Value", "Advisory"],
        ["Heatwave", hottest["State"], f"{hottest['Temperature']} °C", "Extreme heat monitoring active"],
        ["Heavy Rainfall", rainiest["State"], f"{rainiest['Rainfall']} mm", "Potential flood precaution advisory"],
        ["Air Quality", worst_aqi["State"], f"AQI {worst_aqi['AQI']}", "Elevated pollution health advisory"],
    ]
    alerts_table = Table(alerts_data, colWidths=[110, 130, 100, 140])
    alerts_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#dc2626")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#fca5a5")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#fef2f2")]),
    ]))
    elements.append(alerts_table)
    elements.append(Spacer(1, 20))

    # Notes
    elements.append(Paragraph(
        "<i>Note: ClimateTwin AI models and NASA POWER API data are designed for predictive climate research, scenario simulation, and awareness.</i>",
        body_style
    ))

    doc.build(elements)
    return temp_file.name
