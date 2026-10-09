"""
ClimateTwin AI - Frontend Styling & Design System
Applies premium CSS theme, modern typography, glassmorphic accents, and micro-interactions.
"""
import streamlit as st


def apply_theme():
    """
    Injects custom CSS design system into the Streamlit app.
    """
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    /* BASE TYPOGRAPHY */
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* FULL APP BACKGROUND */
    .stApp {
        background: radial-gradient(circle at 10% 10%, #f0f7ff 0%, #f8fbff 60%, #e8f2fc 100%);
    }

    /* SIDEBAR STYLING */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0b1329 0%, #111e47 50%, #0f172a 100%) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    section[data-testid="stSidebar"] * {
        color: #f1f5f9;
    }

    /* SIDEBAR NAVIGATION ITEMS */
    section[data-testid="stSidebar"] ul li div a {
        border-radius: 8px;
        transition: all 0.2s ease-in-out;
    }

    section[data-testid="stSidebar"] ul li div a:hover {
        background: rgba(255, 255, 255, 0.12) !important;
        transform: translateX(4px);
    }

    /* HEADINGS */
    h1, h2, h3 {
        color: #0f172a;
        font-weight: 700 !important;
        letter-spacing: -0.02em;
    }

    /* METRIC CARDS */
    [data-testid="stMetric"] {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        padding: 20px 22px;
        border-radius: 16px;
        color: white;
        box-shadow: 0 10px 25px -5px rgba(30, 64, 175, 0.25), 0 8px 10px -6px rgba(30, 64, 175, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.15);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    [data-testid="stMetric"]:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px -5px rgba(30, 64, 175, 0.35);
    }

    [data-testid="stMetric"] label {
        color: #e0e7ff !important;
        font-size: 0.9rem !important;
        font-weight: 600 !important;
    }

    [data-testid="stMetric"] div {
        color: #ffffff !important;
        font-weight: 800 !important;
        font-size: 1.85rem !important;
    }

    /* ACTION BUTTONS */
    .stButton>button {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white !important;
        border-radius: 10px;
        border: none;
        padding: 9px 20px;
        font-weight: 600;
        letter-spacing: 0.01em;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        transition: all 0.2s ease-in-out;
    }

    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    }

    /* DOWNLOAD BUTTONS */
    .stDownloadButton>button {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        color: white !important;
        border-radius: 10px;
        border: none;
        padding: 9px 20px;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
        transition: all 0.2s ease-in-out;
    }

    .stDownloadButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(5, 150, 105, 0.45);
        background: linear-gradient(135deg, #047857 0%, #065f46 100%);
    }

    /* GLASS CARD CONTAINER */
    .climate-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        padding: 24px;
        border-radius: 18px;
        box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
        border: 1px solid rgba(226, 232, 240, 0.8);
        margin-bottom: 20px;
    }

    /* ALERT CARDS */
    .alert-card {
        padding: 16px 20px;
        border-radius: 14px;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
    }

    .alert-heatwave {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        border: 1px solid #fca5a5;
        color: #991b1b;
    }

    .alert-rain {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 1px solid #93c5fd;
        color: #1e40af;
    }

    .alert-aqi {
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        border: 1px solid #fcd34d;
        color: #92400e;
    }

    /* BADGES */
    .badge-pill {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .badge-high {
        background-color: #fee2e2;
        color: #991b1b;
    }
    .badge-medium {
        background-color: #fef3c7;
        color: #92400e;
    }
    .badge-low {
        background-color: #dcfce7;
        color: #166534;
    }

    /* INPUT FIELDS */
    .stTextInput>div>div>input {
        border-radius: 10px;
        border: 1.5px solid #cbd5e1;
        padding: 10px 14px;
    }
    .stTextInput>div>div>input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    /* SELECTBOX */
    div[data-baseweb="select"] {
        border-radius: 10px;
    }

    /* DIVIDER */
    hr {
        border-color: #e2e8f0;
        margin: 28px 0;
    }
    </style>
    """, unsafe_allow_html=True)
