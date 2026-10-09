"""
ClimateTwin AI - Reports & PDF Generation View
"""
import streamlit as st
from frontend.styles import apply_theme
from frontend.i18n.language_manager import t, get_language
from backend.services.data_service import (
    load_climate_data,
    export_dataframe_to_csv
)
from backend.services.report_service import generate_pdf_report


def render_reports_view():
    apply_theme()

    st.title(t("reports_title"))
    st.caption(t("reports_subtitle"))

    df = load_climate_data()

    col_pdf, col_csv = st.columns(2)

    with col_pdf:
        if st.button(t("generate_pdf_btn"), key="btn_gen_pdf", use_container_width=True):
            with st.spinner(t("generating_pdf_spinner")):
                pdf_path = generate_pdf_report(df, language=get_language())
                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()
                st.session_state["cached_pdf"] = pdf_bytes
            st.success("✅ PDF report synthesized successfully!")

        if "cached_pdf" in st.session_state:
            st.download_button(
                label=t("download_pdf_btn"),
                data=st.session_state["cached_pdf"],
                file_name="ClimateTwin_AI_Report.pdf",
                mime="application/pdf",
                key="btn_dl_cached_pdf",
                use_container_width=True
            )

    with col_csv:
        st.download_button(
            label=f"📥 {t('download_csv')}",
            data=export_dataframe_to_csv(df),
            file_name="climate_data.csv",
            mime="text/csv",
            key="btn_dl_reports_csv",
            use_container_width=True
        )

    st.divider()

    st.subheader(t("dataset_table_title"))
    st.dataframe(df, use_container_width=True)
