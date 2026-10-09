"""
ClimateTwin AI - Backend AI Assistant Service
Processes natural language climate queries with multilingual understanding and localized responses.
"""
import pandas as pd
from typing import Dict, Any
from backend.services.data_service import load_climate_data, get_summary_metrics


def ask_climate_assistant(question: str, df: pd.DataFrame = None, language: str = "en") -> Dict[str, Any]:
    """
    Interprets user queries and returns answer in requested language.
    Supports English, Hindi, Hinglish, Marathi, etc.
    """
    if df is None or df.empty:
        df = load_climate_data()

    if not question or df.empty:
        return {
            "type": "empty",
            "message": "Please enter a question about climate data." if language == "en" else "कृपया जलवायु डेटा के बारे में कोई प्रश्न पूछें।"
        }

    q = question.lower().strip()
    metrics = get_summary_metrics(df)

    # 1. Temperature query
    if any(k in q for k in ["temperature", "temp", "तापमान", "taapman", "गर्मी", "garmi"]):
        if any(k in q for k in ["hottest", "hot", "highest", "सबसे गर्म", "sabse garm", "adhiktam"]):
            hottest = metrics["hottest"]
            if language == "hi":
                msg = f"🔥 सबसे गर्म राज्य: **{hottest['State']}** ({hottest['Temperature']} °C)"
            elif language == "mr":
                msg = f"🔥 सर्वाधिक उष्ण राज्य: **{hottest['State']}** ({hottest['Temperature']} °C)"
            elif language == "bn":
                msg = f"🔥 সবচেয়ে উষ্ণ রাজ্য: **{hottest['State']}** ({hottest['Temperature']} °C)"
            elif language == "ta":
                msg = f"🔥 வெப்பமான மாநிலம்: **{hottest['State']}** ({hottest['Temperature']} °C)"
            else:
                msg = f"🔥 Hottest State: **{hottest['State']}** ({hottest['Temperature']} °C)"
            return {"type": "success", "message": msg}
        else:
            avg_temp = metrics["avg_temperature"]
            if language == "hi":
                msg = f"🌡️ औसत तापमान: **{avg_temp} °C**"
            elif language == "mr":
                msg = f"🌡️ सरासरी तापमान: **{avg_temp} °C**"
            elif language == "bn":
                msg = f"🌡️ গড় তাপমাত্রা: **{avg_temp} °C**"
            elif language == "ta":
                msg = f"🌡️ சராசரி வெப்பநிலை: **{avg_temp} °C**"
            else:
                msg = f"🌡️ Average Temperature across India: **{avg_temp} °C**"
            return {"type": "success", "message": msg}

    # 2. Rainfall query
    elif any(k in q for k in ["rain", "rainfall", "बारिश", "वर्षा", "barish", "varsa", "paus"]):
        if any(k in q for k in ["rainiest", "highest", "most", "सबसे ज्यादा", "sabse jyada", "sarvadhik"]):
            rainiest = metrics["rainiest"]
            if language == "hi":
                msg = f"🌧️ सर्वाधिक वर्षा वाला राज्य: **{rainiest['State']}** ({rainiest['Rainfall']} mm)"
            elif language == "mr":
                msg = f"🌧️ सर्वाधिक पाऊस पडणारे राज्य: **{rainiest['State']}** ({rainiest['Rainfall']} mm)"
            elif language == "bn":
                msg = f"🌧️ সর্বোচ্চ বৃষ্টিপাতের রাজ্য: **{rainiest['State']}** ({rainiest['Rainfall']} mm)"
            elif language == "ta":
                msg = f"🌧️ அதிக மழை பெய்யும் மாநிலம்: **{rainiest['State']}** ({rainiest['Rainfall']} mm)"
            else:
                msg = f"🌧️ Highest Rainfall: **{rainiest['State']}** ({rainiest['Rainfall']} mm)"
            return {"type": "success", "message": msg}
        else:
            avg_rain = metrics["avg_rainfall"]
            if language == "hi":
                msg = f"🌧️ औसत वर्षा: **{avg_rain} mm**"
            elif language == "mr":
                msg = f"🌧️ सरासरी पाऊस: **{avg_rain} mm**"
            elif language == "bn":
                msg = f"🌧️ গড় বৃষ্টিপাত: **{avg_rain} mm**"
            elif language == "ta":
                msg = f"🌧️ சராசரி மழைப்பொழிவு: **{avg_rain} mm**"
            else:
                msg = f"🌧️ Average Rainfall: **{avg_rain} mm**"
            return {"type": "success", "message": msg}

    # 3. Humidity query
    elif any(k in q for k in ["humidity", "नमी", "आर्द्रता", "nami", "aadrata"]):
        avg_hum = metrics["avg_humidity"]
        if language == "hi":
            msg = f"💧 औसत आर्द्रता / नमी: **{avg_hum} %**"
        elif language == "mr":
            msg = f"💧 सरासरी आर्द्रता: **{avg_hum} %**"
        elif language == "bn":
            msg = f"💧 গড় আর্দ্রতা: **{avg_hum} %**"
        elif language == "ta":
            msg = f"💧 சராசரி ஈரப்பதம்: **{avg_hum} %**"
        else:
            msg = f"💧 Average Humidity: **{avg_hum} %**"
        return {"type": "success", "message": msg}

    # 4. AQI / Air Quality query
    elif any(k in q for k in ["aqi", "air", "quality", "वायु", "हवा", "pradushan", "प्रदूषण"]):
        worst = metrics["worst_aqi"]
        if language == "hi":
            msg = f"🌫️ सबसे खराब वायु गुणवत्ता: **{worst['State']}** (AQI **{worst['AQI']}**)"
        elif language == "mr":
            msg = f"🌫️ सर्वाधिक हवा प्रदूषण: **{worst['State']}** (AQI **{worst['AQI']}**)"
        elif language == "bn":
            msg = f"🌫️ সবচেয়ে খারাপ বাতাসের মান: **{worst['State']}** (AQI **{worst['AQI']}**)"
        elif language == "ta":
            msg = f"🌫️ மோசமான காற்று தரம்: **{worst['State']}** (AQI **{worst['AQI']}**)"
        else:
            msg = f"🌫️ Highest AQI (Poorest Air): **{worst['State']}** (AQI **{worst['AQI']}**)"
        return {"type": "success", "message": msg}

    # 5. Risk / Danger query
    elif any(k in q for k in ["high risk", "risk", "danger", "जोखिम", "खतरा", "khatra", "dhoka"]):
        high_risk = df[df["Risk"] == "High"]
        if len(high_risk) > 0:
            states_str = ", ".join(high_risk["State"].tolist())
            if language == "hi":
                msg = f"🚨 उच्च जोखिम वाले राज्य ({len(high_risk)}): **{states_str}**"
            elif language == "mr":
                msg = f"🚨 उच्च धोक्याचे राज्य ({len(high_risk)}): **{states_str}**"
            elif language == "bn":
                msg = f"🚨 উচ্চ ঝুঁকিপূর্ণ রাজ্য ({len(high_risk)}): **{states_str}**"
            elif language == "ta":
                msg = f"🚨 அதிக ஆபத்துள்ள மாநிலங்கள் ({len(high_risk)}): **{states_str}**"
            else:
                msg = f"🚨 High Risk States ({len(high_risk)}): **{states_str}**"
        else:
            if language == "hi":
                msg = "✅ कोई भी राज्य उच्च जोखिम में नहीं पाया गया।"
            else:
                msg = "✅ No high risk states detected currently."
        return {"type": "success", "message": msg}

    # 6. States count query
    elif any(k in q for k in ["states", "state", "राज्य", "kitne rajya", "total"]):
        count = metrics["total_states"]
        if language == "hi":
            msg = f"📍 कुल ट्रैक किए गए राज्य / केंद्र शासित प्रदेश: **{count}**"
        elif language == "mr":
            msg = f"📍 एकूण ट्रॅक केलेली राज्ये: **{count}**"
        elif language == "bn":
            msg = f"📍 মোট ট্র্যাক করা রাজ্য: **{count}**"
        elif language == "ta":
            msg = f"📍 கண்காணிக்கப்படும் மாநிலங்கள்: **{count}**"
        else:
            msg = f"📍 Total Monitored States/UTs in India: **{count}**"
        return {"type": "success", "message": msg}

    # 7. Fallback
    else:
        if language == "hi":
            msg = "माफ़ कीजिए, मैं तापमान, वर्षा, नमी, AQI, जोखिम वाले राज्यों और जलवायु सांख्यिकी के बारे में उत्तर दे सकता हूँ।"
        elif language == "mr":
            msg = "माफ करा, मी तापमान, पाऊस, आर्द्रता, AQI आणि हवामान जोखमीबद्दल उत्तरे देऊ शकतो."
        elif language == "bn":
            msg = "দুঃখিত, আমি তাপমাত্রা, বৃষ্টিপাত, আর্দ্রতা, AQI এবং জলবায়ু ঝুঁকি সম্পর্কে উত্তর দিতে পারি।"
        elif language == "ta":
            msg = "மன்னிக்கவும், வெப்பநிலை, மழை, ஈரப்பதம், AQI மற்றும் ஆபத்து பற்றி என்னிடம் கேட்கலாம்."
        else:
            msg = "I can answer questions regarding temperature, rainfall, humidity, AQI, high-risk states, and climate analytics."
        return {"type": "warning", "message": msg}
