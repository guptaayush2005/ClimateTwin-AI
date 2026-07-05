from styles import apply_theme
apply_theme()
import streamlit as st
import pandas as pd

st.title("📄 Reports")

# Load data
df = pd.read_csv("data/climate_data.csv")

# Download Button
st.download_button(
    "📥 Download Climate Dataset CSV",
    df.to_csv(index=False),
    file_name="climate_data.csv",
    mime="text/csv"
)

st.divider()

# Show Data
st.subheader("📊 Climate Dataset")
st.dataframe(df)