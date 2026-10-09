"""
ClimateTwin AI - Hero Component
Renders the premium hero header banner with glassmorphism and gradient accents.
"""
import streamlit as st
from frontend.i18n.language_manager import t


def render_hero():
    """
    Renders top hero banner with localized title, subtitle, and badges.
    """
    st.markdown(f"""
    <div style="
        text-align: center;
        padding: 42px 24px;
        background: linear-gradient(135deg, #0b1329 0%, #172554 50%, #1e3a8a 100%);
        border-radius: 24px;
        color: white;
        box-shadow: 0 15px 35px -5px rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.12);
        margin-bottom: 24px;
    ">
        <div style="
            display: inline-block;
            background: rgba(59, 130, 246, 0.25);
            border: 1px solid rgba(96, 165, 250, 0.4);
            border-radius: 9999px;
            padding: 4px 14px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            text-transform: uppercase;
        ">
            🇮🇳 {t('app_badge')}
        </div>
        <h1 style="font-size: 42px; margin: 0 0 10px 0; color: #ffffff; letter-spacing: -0.02em;">
            🌍 {t('hero_heading')}
        </h1>
        <p style="font-size: 19px; opacity: 0.95; margin: 0 0 12px 0; font-weight: 500; color: #bfdbfe;">
            {t('hero_subheading')}
        </p>
        <p style="font-size: 13px; opacity: 0.75; margin: 0; color: #e2e8f0; letter-spacing: 0.02em;">
            {t('app_tagline')}
        </p>
    </div>
    """, unsafe_allow_html=True)
