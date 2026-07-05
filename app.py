from styles import apply_theme
apply_theme()

import streamlit as st
if "data_updated" not in st.session_state:
    with st.spinner("Updating climate data from NASA..."):
        import fetch_data
    st.session_state.data_updated = True

# ---------------- PAGE CONFIG ----------------
st.set_page_config(
    page_title="ClimateTwin AI",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------- SIDEBAR ----------------
st.sidebar.image("assets/logo.png", width=150)

st.sidebar.title("🌍 ClimateTwin AI")
st.sidebar.success("AI-Powered Digital Twin of India's Climate")

st.sidebar.markdown("""
- 📊 Dashboard  
- 🤖 AI Predictions  
- 📈 Analytics  
- 🌦 Climate Simulation  
- 📄 Reports  
- 🚨 Risk Intelligence  
""")

# ---------------- HERO SECTION ----------------
st.markdown("""
<div style="
text-align:center;
padding:40px;
background: linear-gradient(135deg, #0f172a, #1e3a8a);
border-radius:20px;
color:white;
box-shadow:0 10px 30px rgba(0,0,0,0.3);
">

<h1 style="font-size:48px; margin-bottom:10px;">
🌍 ClimateTwin AI
</h1>

<p style="font-size:20px; opacity:0.9;">
AI-Powered Digital Twin of India's Climate System
</p>

<p style="font-size:14px; opacity:0.7;">
Real-time Monitoring • AI Predictions • Risk Intelligence • Climate Simulation
</p>

</div>
""", unsafe_allow_html=True)

st.write("")

# ---------------- METRICS ----------------
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Temperature", "28.6°C", "+2.4°C")

with col2:
    st.metric("Rainfall", "125 mm", "+18%")

with col3:
    st.metric("Humidity", "65%", "-5%")

with col4:
    st.metric("AQI", "72", "Moderate")

st.divider()

# ---------------- FEATURES ----------------
st.markdown("""
## 🚀 Platform Features

✔ Real-time Climate Monitoring  
✔ AI-based Predictions  
✔ Heatwave & Flood Risk Analysis  
✔ Climate Simulation Engine  
✔ Risk Intelligence Dashboard  
✔ Analytics & Insights  
✔ PDF & CSV Reports  
""")

# ---------------- INFO BOX ----------------
st.info("""
🌍 ClimateTwin AI integrates real climate data + AI models 
to help in disaster prediction, environmental analysis 
and policy decision support system.
""")