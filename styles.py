def apply_theme():
    import streamlit as st

    st.markdown("""
    <style>

    /* FULL APP BACKGROUND */
    .stApp {
        background: linear-gradient(to right, #e0f2ff, #f8fbff);
    }

    /* SIDEBAR PREMIUM BLUE */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f172a, #1e3a8a);
    }

    section[data-testid="stSidebar"] * {
        color: white;
    }

    /* TITLE */
    h1, h2, h3 {
        color: #0f172a;
        font-weight: 700;
    }

    /* METRIC CARDS (MAIN BOX) */
    [data-testid="stMetric"] {
        background: linear-gradient(135deg, #2563eb, #60a5fa);
        padding: 18px;
        border-radius: 18px;
        color: white;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        border: none;
    }

    [data-testid="stMetric"] label {
        color: #e5e7eb !important;
    }

    [data-testid="stMetric"] div {
        color: white !important;
        font-weight: bold;
    }

    /* BUTTON STYLE */
    .stButton>button {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        border-radius: 10px;
        border: none;
        padding: 8px 18px;
    }

    .stButton>button:hover {
        transform: scale(1.03);
    }

    /* CARD EFFECT */
    .card {
        background: white;
        padding: 15px;
        border-radius: 15px;
        box-shadow: 0 6px 15px rgba(0,0,0,0.1);
    }

    </style>
    """, unsafe_allow_html=True)