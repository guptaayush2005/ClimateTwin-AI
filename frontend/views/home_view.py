"""
ClimateTwin AI - Home Landing View
"""
import streamlit as st
from frontend.styles import apply_theme
from frontend.i18n.language_manager import t
from frontend.components.hero import render_hero
from frontend.components.metrics import render_metrics_cards
from backend.services.data_service import load_climate_data, get_summary_metrics


def render_home_view():
    apply_theme()
    render_hero()

    df = load_climate_data()
    metrics = get_summary_metrics(df)

    # 4 Metric cards
    render_metrics_cards(metrics)

    st.divider()

    # Features Section
    st.subheader(t("features_heading"))
    c1, c2 = st.columns(2)
    with c1:
        st.markdown(f"""
        - {t('feat_1')}
        - {t('feat_2')}
        - {t('feat_3')}
        - {t('feat_4')}
        """)
    with c2:
        st.markdown(f"""
        - {t('feat_5')}
        - {t('feat_6')}
        - {t('feat_7')}
        """)

    st.divider()

    # Information Box
    st.info(t("info_box"))
