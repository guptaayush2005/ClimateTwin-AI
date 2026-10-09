"""
ClimateTwin AI - Sidebar Component
Renders the navigation sidebar, multilingual language selector, NASA API sync trigger, and badges.
"""
import streamlit as st
from pathlib import Path
from frontend.i18n.language_manager import (
    get_language,
    set_language,
    get_supported_languages,
    t
)
from backend.services.nasa_service import sync_nasa_climate_data
from backend.config import ASSETS_DIR


def render_sidebar():
    """
    Renders sidebar elements consistently across all views.
    """
    # 1. Logo
    logo_path = ASSETS_DIR / "logo.png"
    if logo_path.exists():
        st.sidebar.image(str(logo_path), width=140)

    # 2. Platform Branding
    st.sidebar.markdown(f"### 🌍 {t('sidebar_title')}")
    st.sidebar.caption(t('sidebar_subtitle'))

    # 3. Multilingual Selector
    st.sidebar.markdown("---")
    lang_map = get_supported_languages()
    current_code = get_language()

    codes = list(lang_map.keys())
    labels = list(lang_map.values())
    current_index = codes.index(current_code) if current_code in codes else 0

    selected_label = st.sidebar.selectbox(
        t("select_language"),
        options=labels,
        index=current_index,
        key="global_lang_selector"
    )

    selected_code = codes[labels.index(selected_label)]
    if selected_code != current_code:
        set_language(selected_code)
        st.rerun()

    # 4. NASA Real-time Data Sync Trigger
    st.sidebar.markdown("---")
    if st.sidebar.button(t("update_nasa_data"), key="sidebar_sync_nasa_btn", use_container_width=True):
        with st.spinner(t("updating_nasa")):
            result = sync_nasa_climate_data()
        if result.get("success"):
            st.sidebar.success(result.get("message", t("nasa_updated_success")))
        else:
            st.sidebar.error(result.get("message", "Sync failed"))
        st.rerun()

    # 5. Features Summary
    st.sidebar.markdown("---")
    st.sidebar.markdown(f"**{t('sidebar_features_heading')}**")
    st.sidebar.markdown(f"""
    - 📊 {t('nav_dashboard')}
    - 🤖 {t('nav_predictions')}
    - 📈 {t('nav_analytics')}
    - 🌦 {t('nav_simulation')}
    - 🚨 {t('nav_risk')}
    - 📄 {t('nav_reports')}
    """)

    # 6. Footer badge
    st.sidebar.markdown("---")
    st.sidebar.markdown(
        f"<div style='font-size:11px; opacity:0.75; text-align:center;'>{t('app_badge')} • v2.0 Modular</div>",
        unsafe_allow_html=True
    )
