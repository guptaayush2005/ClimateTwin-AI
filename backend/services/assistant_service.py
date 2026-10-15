"""
ClimateTwin AI - Backend AI Assistant Service
Processes natural language climate queries with multilingual understanding and localized responses.
Supports English, Hindi (हिन्दी), Marathi (मराठी), Bengali (বাংলা), Tamil (தமிழ்).
"""
import re
from typing import Dict, Any, Optional
import pandas as pd
from backend.services.data_service import load_climate_data, get_summary_metrics, load_districts_data, get_nearest_district
from backend.services.live_weather_service import fetch_live_district_telemetry


def ask_climate_assistant(question: str, df: Optional[pd.DataFrame] = None, language: str = "en") -> Dict[str, Any]:
    """
    Interprets user queries and returns answer in requested language.
    Supports English, Hindi, Hinglish, Marathi, Bengali, Tamil.
    """
    if df is None or df.empty:
        df = load_climate_data()

    if not question or df.empty:
        empty_msgs = {
            "hi": "कृपया जलवायु डेटा के बारे में कोई प्रश्न पूछें।",
            "mr": "कृपया हवामान डेटाबद्दल प्रश्न विचारा.",
            "bn": "অনুগ্রহ করে জলবায়ু তথ্য সম্পর্কে প্রশ্ন জিজ্ঞাসা করুন।",
            "ta": "தயவுசெய்து காலநிலை தகவல்கள் பற்றி கேள்வி கேட்கவும்.",
            "en": "Please enter a question about climate data."
        }
        return {
            "type": "empty",
            "message": empty_msgs.get(language, empty_msgs["en"])
        }

    q = question.lower().strip()
    metrics = get_summary_metrics(df)

    # 0. Greetings & Identity
    if any(k in q for k in ["hello", "hi", "hey", "namaste", "namaskar", "namaskaram", "vanakkam", "kaise ho", "who are you"]):
        greetings = {
            "hi": "🙏 **नमस्ते!** मैं ClimateTwin AI का जलवायु सहायक हूँ। आप मुझसे भारत के किसी भी राज्य का तापमान, बारिश, एक्यूआई (AQI), या उच्च जोखिम की स्थिति पूछ सकते हैं।",
            "mr": "🙏 **नमस्कार!** मी ClimateTwin AI चा हवामान सहाय्यक आहे. तुम्ही मला कोणत्याही राज्यातील तापमान, पाऊस, हवा प्रदूषण (AQI) आणि धोक्याची माहिती विचारू शकता.",
            "bn": "🙏 **নমস্কার!** আমি ClimateTwin AI এর জলবায়ু সহকারী। আপনি আমাকে যেকোনো রাজ্যের তাপমাত্রা, বৃষ্টিপাত, বাতাসের মান (AQI) বা ঝুঁকি সম্পর্কে জিজ্ঞাসা করতে পারেন।",
            "ta": "🙏 **வணக்கம்!** நான் ClimateTwin AI கால நிலை உதவியாளர். இந்தியாவின் எந்த மாநிலத்தின் வெப்பநிலை, மழை, காற்று தரம் (AQI) அல்லது ஆபத்து நிலை பற்றியும் என்னிடம் கேட்கலாம்.",
            "en": "👋 **Hello!** I am the ClimateTwin AI Copilot. You can ask me about temperature, rainfall, humidity, AQI, high-risk states, or specific weather conditions in any Indian state!"
        }
        return {"type": "success", "message": greetings.get(language, greetings["en"])}

    # 0.4 Check Coordinates in query (e.g. "28.61, 77.20" or "lat 26.85 lon 80.95")
    coord_matches = re.findall(r"[-+]?\d{1,3}\.\d+", q)
    if len(coord_matches) >= 2:
        try:
            c_lat = float(coord_matches[0])
            c_lon = float(coord_matches[1])
            if 6.0 <= c_lat <= 38.0 and 68.0 <= c_lon <= 98.0:
                nearest = get_nearest_district(c_lat, c_lon)
                dist_name = nearest.get("District", "Target Coordinate") if nearest else "Coordinate Node"
                state_name = nearest.get("State", "India") if nearest else "India"
                dist_km = nearest.get("distance_km", 0.0) if nearest else 0.0

                live = fetch_live_district_telemetry(c_lat, c_lon, state=state_name, district=dist_name)
                temp = live["temperature"]
                feels = live["apparent_temperature"]
                rain = live["precipitation"]
                hum = live["humidity"]
                wind = live["wind_speed"]
                aqi = live["aqi"]
                cond = live["condition_hi"] if language in ["hi", "mr"] else live["condition"]
                icon = live["icon"]
                risk = live["risk_level"]
                hazards = ", ".join(live["hazard_tags"])
                advice = live["ndma_tips"][0] if live["ndma_tips"] else "मौसम अनुकूल है।"

                if language == "hi":
                    msg = (
                        f"🌐 **निर्देशांक ({c_lat:.4f}° N, {c_lon:.4f}° E) — निकटतम जिला: {dist_name} ({state_name}, दूरी {dist_km} km):**\n\n"
                        f"• {icon} **वर्तमान मौसम:** {cond}\n"
                        f"• 🌡️ **लाइव तापमान:** **{temp} °C** (महसूस: {feels} °C)\n"
                        f"• 🌧️ **वर्षा:** **{rain} mm** | 💧 **आर्द्रता:** **{hum} %**\n"
                        f"• 💨 **हवा की गति:** **{wind} km/h**\n"
                        f"• 🌫️ **वायु गुणवत्ता (AQI):** **{aqi}** ({live['aqi_category']})\n"
                        f"• 🚨 **जोखिम स्तर:** **{risk} Risk** ({hazards})\n\n"
                        f"🛡️ **सुरक्षा सलाह (NDMA):** {advice}"
                    )
                elif language == "mr":
                    msg = (
                        f"🌐 **निर्देशांक ({c_lat:.4f}° N, {c_lon:.4f}° E) — जवळचा जिल्हा: {dist_name} ({state_name}, अंतर {dist_km} km):**\n\n"
                        f"• {icon} **सध्याचे हवामान:** {cond}\n"
                        f"• 🌡️ **थेट तापमान:** **{temp} °C** (अनुभव: {feels} °C)\n"
                        f"• 🌧️ **पाऊस:** **{rain} mm** | 💧 **आर्द्रता:** **{hum} %**\n"
                        f"• 💨 **वाऱ्याचा वेग:** **{wind} km/h**\n"
                        f"• 🌫️ **हवेची गुणवत्ता (AQI):** **{aqi}** ({live['aqi_category']})\n"
                        f"• 🚨 **धोका पातळी:** **{risk} Risk** ({hazards})\n\n"
                        f"🛡️ **सुरक्षा सल्ला (NDMA):** {advice}"
                    )
                elif language == "bn":
                    msg = (
                        f"🌐 **স্থানাঙ্ক ({c_lat:.4f}° N, {c_lon:.4f}° E) — নিকটতম জেলা: {dist_name} ({state_name}, দূরত্ব {dist_km} km):**\n\n"
                        f"• {icon} **বর্তমান আবহাওয়া:** {cond}\n"
                        f"• 🌡️ **সরাসরি তাপমাত্রা:** **{temp} °C** (অনুভূত: {feels} °C)\n"
                        f"• 🌧️ **বৃষ্টিপাত:** **{rain} mm** | 💧 **আর্দ্রতা:** **{hum} %**\n"
                        f"• 💨 **বাতাসের গতি:** **{wind} km/h**\n"
                        f"• 🌫️ **বায়ু গুণমান (AQI):** **{aqi}** ({live['aqi_category']})\n"
                        f"• 🚨 **ঝুঁকির মাত্রা:** **{risk} Risk** ({hazards})\n\n"
                        f"🛡️ **এনডিএমএ সতর্কতা:** {advice}"
                    )
                elif language == "ta":
                    msg = (
                        f"🌐 **ஆயத்தொலைவுகள் ({c_lat:.4f}° N, {c_lon:.4f}° E) — அருகிலுள்ள மாவட்டம்: {dist_name} ({state_name}, தூரம் {dist_km} km):**\n\n"
                        f"• {icon} **தற்போதைய வானிலை:** {cond}\n"
                        f"• 🌡️ **நேரலை வெப்பநிலை:** **{temp} °C** (உணரப்படுவது: {feels} °C)\n"
                        f"• 🌧️ **மழைப்பொழிவு:** **{rain} mm** | 💧 **ஈரப்பதம்:** **{hum} %**\n"
                        f"• 💨 **காற்றின் வேகம்:** **{wind} km/h**\n"
                        f"• 🌫️ **காற்றின் தரம் (AQI):** **{aqi}** ({live['aqi_category']})\n"
                        f"• 🚨 **ஆபத்து நிலை:** **{risk} Risk** ({hazards})\n\n"
                        f"🛡️ **பாதுகாப்பு வழிகாட்டல்:** {advice}"
                    )
                else:
                    msg = (
                        f"🌐 **Coordinates ({c_lat:.4f}° N, {c_lon:.4f}° E) — Nearest District: {dist_name} ({state_name}, {dist_km} km away):**\n\n"
                        f"• {icon} **Current Condition:** {cond}\n"
                        f"• 🌡️ **Live Temperature:** **{temp} °C** (Feels like {feels} °C)\n"
                        f"• 🌧️ **Precipitation:** **{rain} mm** | 💧 **Humidity:** **{hum} %**\n"
                        f"• 💨 **Wind Speed:** **{wind} km/h**\n"
                        f"• 🌫️ **Air Quality (AQI):** **{aqi}** ({live['aqi_category']})\n"
                        f"• 🚨 **Risk Severity:** **{risk} Risk** ({hazards})\n\n"
                        f"🛡️ **NDMA Advisory:** {advice}"
                    )
                return {"type": "success", "message": msg, "district_data": live}
        except Exception:
            pass

    # 0.5 Check Indian Districts First
    districts_df = load_districts_data()
    if not districts_df.empty:
        for _, d_row in districts_df.iterrows():
            d_name = str(d_row["District"]).lower()
            d_clean = d_name.split("(")[0].strip()
            if len(d_clean) > 3 and d_clean in q:
                state_name = d_row["State"]
                dist_name = d_row["District"]
                lat = float(d_row["Latitude"])
                lon = float(d_row["Longitude"])
                
                live = fetch_live_district_telemetry(lat, lon, state=state_name, district=dist_name)
                temp = live["temperature"]
                feels = live["apparent_temperature"]
                rain = live["precipitation"]
                hum = live["humidity"]
                wind = live["wind_speed"]
                aqi = live["aqi"]
                cond = live["condition_hi"] if language == "hi" else live["condition"]
                icon = live["icon"]
                risk = live["risk_level"]
                hazards = ", ".join(live["hazard_tags"])
                advice = live["ndma_tips"][0] if live["ndma_tips"] else "मौसम अनुकूल है।"

                if language == "hi":
                    msg = (
                        f"📍 **{dist_name} ({state_name}) — लाइव सैटेलाइट मौसम व जलवायु:**\n\n"
                        f"• {icon} **वर्तमान स्थिति:** {cond}\n"
                        f"• 🌡️ **तापमान:** **{temp} °C** (महसूस: {feels} °C)\n"
                        f"• 🌧️ **वर्षा:** **{rain} mm** | 💧 **आर्द्रता:** **{hum} %**\n"
                        f"• 💨 **हवा की गति:** **{wind} km/h**\n"
                        f"• 🌫️ **वायु गुणवत्ता (AQI):** **{aqi}** ({live['aqi_category']})\n"
                        f"• 🚨 **जोखिम स्तर:** **{risk} Risk** ({hazards})\n\n"
                        f"🛡️ **सुरक्षा परामर्श:** {advice}"
                    )
                else:
                    msg = (
                        f"📍 **{dist_name} ({state_name}) — Real-Time Climate Telemetry:**\n\n"
                        f"• {icon} **Condition:** {cond}\n"
                        f"• 🌡️ **Temperature:** **{temp} °C** (Feels like {feels} °C)\n"
                        f"• 🌧️ **Precipitation:** **{rain} mm** | 💧 **Humidity:** **{hum} %**\n"
                        f"• 💨 **Wind Speed:** **{wind} km/h**\n"
                        f"• 🌫️ **Air Quality (AQI):** **{aqi}** ({live['aqi_category']})\n"
                        f"• 🚨 **Vulnerability Risk:** **{risk} Risk** ({hazards})\n\n"
                        f"🛡️ **NDMA Precaution:** {advice}"
                    )
                return {"type": "success", "message": msg}

    # 1. Specific State Query Check
    for _, row in df.iterrows():
        state_name = str(row["State"]).lower()
        if state_name in q:
            s_name = row["State"]
            temp = row["Temperature"]
            rain = row["Rainfall"]
            hum = row["Humidity"]
            aqi = row["AQI"]
            risk = row["Risk"]

            risk_badge = f"🚨 {risk} Risk" if risk == "High" else (f"⚠️ {risk} Risk" if risk == "Medium" else f"✅ {risk} Risk")

            if language == "hi":
                msg = (
                    f"📍 **{s_name} जलवायु स्थिति:**\n\n"
                    f"• 🌡️ **तापमान:** {temp} °C\n"
                    f"• 🌧️ **वर्षा:** {rain} mm\n"
                    f"• 💧 **आर्द्रता:** {hum} %\n"
                    f"• 🌫️ **वायु गुणवत्ता (AQI):** {aqi}\n"
                    f"• ⚠️ **जोखिम स्तर:** **{risk_badge}**\n\n"
                    f"💡 *सुझाव:* " + ("लू से बचाव रखें और पर्याप्त पानी पिएं।" if temp > 32 else ("बारिश और जलभराव से सतर्क रहें।" if rain > 20 else "मौसम सामान्य एवं अनुकूल है।"))
                )
            elif language == "mr":
                msg = (
                    f"📍 **{s_name} हवामान अहवाल:**\n\n"
                    f"• 🌡️ **तापमान:** {temp} °C\n"
                    f"• 🌧️ **पाऊस:** {rain} mm\n"
                    f"• 💧 **आर्द्रता:** {hum} %\n"
                    f"• 🌫️ **हवा प्रदूषण (AQI):** {aqi}\n"
                    f"• ⚠️ **धोक्याची पातळी:** **{risk_badge}**"
                )
            elif language == "bn":
                msg = (
                    f"📍 **{s_name} জলবায়ু পরিস্থিতি:**\n\n"
                    f"• 🌡️ **তাপমাত্রা:** {temp} °C\n"
                    f"• 🌧️ **বৃষ্টিপাত:** {rain} mm\n"
                    f"• 💧 **আর্দ্রতা:** {hum} %\n"
                    f"• 🌫️ **বাতাসের মান (AQI):** {aqi}\n"
                    f"• ⚠️ **ঝুঁকি স্তর:** **{risk_badge}**"
                )
            elif language == "ta":
                msg = (
                    f"📍 **{s_name} காலநிலை விவரம்:**\n\n"
                    f"• 🌡️ **வெப்பநிலை:** {temp} °C\n"
                    f"• 🌧️ **மழைப்பொழிவு:** {rain} mm\n"
                    f"• 💧 **ஈரப்பதம்:** {hum} %\n"
                    f"• 🌫️ **காற்று தரம் (AQI):** {aqi}\n"
                    f"• ⚠️ **ஆபத்து நிலை:** **{risk_badge}**"
                )
            else:
                msg = (
                    f"📍 **{s_name} Climate Intelligence:**\n\n"
                    f"• 🌡️ **Temperature:** {temp} °C\n"
                    f"• 🌧️ **Rainfall:** {rain} mm\n"
                    f"• 💧 **Humidity:** {hum} %\n"
                    f"• 🌫️ **Air Quality (AQI):** {aqi}\n"
                    f"• ⚠️ **Risk Classification:** **{risk_badge}**\n\n"
                    f"💡 *Advisory:* " + ("Hydration recommended due to elevated thermal stress." if temp > 32 else ("Monitor drainage and road advisories." if rain > 20 else "Conditions are within normal seasonal range."))
                )
            return {"type": "success", "message": msg}

    # 2. National Climate Summary
    if any(k in q for k in ["summary", "overview", "haal", "saransh", "nation", "desh", "पूरा हाल", "सारांश"]):
        hottest = metrics["hottest"]
        rainiest = metrics["rainiest"]
        worst = metrics["worst_aqi"]
        high_cnt = metrics["high_risk_states_count"]

        if language == "hi":
            msg = (
                f"📊 **राष्ट्रीय जलवायु सारांश (National Overview):**\n\n"
                f"• 🌡️ **राष्ट्रीय औसत तापमान:** {metrics['avg_temperature']} °C\n"
                f"• 🔥 **सर्वाधिक गर्म राज्य:** {hottest['State']} ({hottest['Temperature']} °C)\n"
                f"• 🌧️ **सर्वाधिक वर्षा वाला राज्य:** {rainiest['State']} ({rainiest['Rainfall']} mm)\n"
                f"• 🌫️ **सर्वाधिक प्रदूषित राज्य (AQI):** {worst['State']} (AQI {worst['AQI']})\n"
                f"• 🚨 **उच्च जोखिम वाले राज्य:** कुल **{high_cnt} राज्य** उच्च जोखिम में हैं।"
            )
        elif language == "mr":
            msg = (
                f"📊 **राष्ट्रीय हवामान सारांश (National Overview):**\n\n"
                f"• 🌡️ **सरासरी तापमान:** {metrics['avg_temperature']} °C\n"
                f"• 🔥 **सर्वाधिक उष्ण राज्य:** {hottest['State']} ({hottest['Temperature']} °C)\n"
                f"• 🌧️ **सर्वाधिक पाऊस:** {rainiest['State']} ({rainiest['Rainfall']} mm)\n"
                f"• 🌫️ **सर्वाधिक AQI:** {worst['State']} (AQI {worst['AQI']})\n"
                f"• 🚨 **उच्च धोक्याची राज्ये:** **{high_cnt} राज्ये**"
            )
        elif language == "bn":
            msg = (
                f"📊 **জাতীয় জলবায়ু সারসংক্ষেপ:**\n\n"
                f"• 🌡️ **গড় তাপমাত্রা:** {metrics['avg_temperature']} °C\n"
                f"• 🔥 **সবচেয়ে উষ্ণ রাজ্য:** {hottest['State']} ({hottest['Temperature']} °C)\n"
                f"• 🌧️ **সর্বোচ্চ বৃষ্টিপাত:** {rainiest['State']} ({rainiest['Rainfall']} mm)\n"
                f"• 🌫️ **সর্বোচ্চ AQI:** {worst['State']} (AQI {worst['AQI']})\n"
                f"• 🚨 **উচ্চ ঝুঁকিপূর্ণ রাজ্য:** মোট **{high_cnt} টি রাজ্য**"
            )
        elif language == "ta":
            msg = (
                f"📊 **தேசிய காலநிலை சுருக்கம்:**\n\n"
                f"• 🌡️ **சராசரி வெப்பநிலை:** {metrics['avg_temperature']} °C\n"
                f"• 🔥 **அதிக வெப்பம்:** {hottest['State']} ({hottest['Temperature']} °C)\n"
                f"• 🌧️ **அதிக மழை:** {rainiest['State']} ({rainiest['Rainfall']} mm)\n"
                f"• 🌫️ **மோசமான AQI:** {worst['State']} (AQI {worst['AQI']})\n"
                f"• 🚨 **அதிக ஆபத்துள்ள மாநிலங்கள்:** **{high_cnt} மாநிலங்கள்**"
            )
        else:
            msg = (
                f"📊 **National Climate Intelligence Summary:**\n\n"
                f"• 🌡️ **Average Temperature:** {metrics['avg_temperature']} °C\n"
                f"• 🔥 **Hottest State:** {hottest['State']} ({hottest['Temperature']} °C)\n"
                f"• 🌧️ **Highest Rainfall:** {rainiest['State']} ({rainiest['Rainfall']} mm)\n"
                f"• 🌫️ **Poorest Air Quality (AQI):** {worst['State']} (AQI {worst['AQI']})\n"
                f"• 🚨 **High-Risk Threshold Count:** **{high_cnt} States/UTs** under active alert."
            )
        return {"type": "success", "message": msg}

    # 3. Precautions & Safety Advisory
    if any(k in q for k in ["precaution", "safety", "upay", "bache", "advisory", "suraksha", "बचाव", "सुरक्षा", "उपाय"]):
        if language == "hi":
            msg = (
                f"🛡️ **जलवायु एवं मौसम सुरक्षा दिशा-निर्देश (NDMA Guidelines):**\n\n"
                f"☀️ **भीषण गर्मी / लू (Heatwave) से बचाव:**\n"
                f"1. दोपहर 12 बजे से 3 बजे के बीच धूप में निकलने से बचें।\n"
                f"2. ओआरएस (ORS), नींबू पानी और पर्याप्त पानी का सेवन करें।\n"
                f"3. हल्के रंग के सूती कपड़े पहनें और सिर को ढकें।\n\n"
                f"🌧️ **भारी बारिश एवं बाढ़ सुरक्षा:**\n"
                f"1. जलभराव वाले रास्तों और खुले नालों से दूर रहें।\n"
                f"2. आपातकालीन दवाइयां और टॉर्च तैयार रखें।\n\n"
                f"🌫️ **खराब वायु गुणवत्ता (AQI > 150):**\n"
                f"1. बाहर निकलते समय N95 मास्क का प्रयोग करें।\n"
                f"2. सुबह की तेज धूप/धुंध में भारी व्यायाम न करें।"
            )
        elif language == "mr":
            msg = (
                f"🛡️ **हवामान सुरक्षा आणि खबरदारी मार्गदर्शक तत्त्वे:**\n\n"
                f"☀️ **उष्णतेची लाट (Heatwave):**\n"
                f"1. दुपारी १२ ते ३ दरम्यान उन्हात जाणे टाळा.\n"
                f"2. भरपूर पाणी आणि लिंबू पाणी प्या.\n\n"
                f"🌧️ **मुसळधार पाऊस:**\n"
                f"1. पुराच्या पाण्याच्या संपर्कात जाणे टाळा.\n"
                f"2. विजेच्या तारांपासून लांब रहा.\n\n"
                f"🌫️ **हवा प्रदूषण (AQI):**\n"
                f"1. N95 मास्कचा वापर करा."
            )
        elif language == "bn":
            msg = (
                f"🛡️ **জলবায়ু ও দুর্যোগ সুরক্ষা পরামর্শ:**\n\n"
                f"☀️ **তীব্র তাপপ্রবাহ (Heatwave):**\n"
                f"1. দুপুর ১২টা থেকে ৩টা পর্যন্ত রোদে বের হবেন না।\n"
                f"2. পর্যাপ্ত জল এবং ওআরএস পান করুন।\n\n"
                f"🌧️ **ভারী বৃষ্টি ও বন্যা:**\n"
                f"1. জলাবদ্ধ রাস্তা এড়িয়ে চলুন।\n\n"
                f"🌫️ **বায়ু দূষণ (AQI):**\n"
                f"1. N95 মাস্ক ব্যবহার করুন।"
            )
        elif language == "ta":
            msg = (
                f"🛡️ **வானிலை பாதுகாப்பு வழிகாட்டுதல்கள்:**\n\n"
                f"☀️ **வெப்ப அலை பாதுகாப்பு:**\n"
                f"1. மதியம் 12 மணி முதல் 3 மணி வரை வெளியே செல்வதைத் தவிர்க்கவும்.\n"
                f"2. போதுமான தண்ணீர் மற்றும் பழச்சாறுகள் அருந்தவும்.\n\n"
                f"🌧️ **கனமழை பாதுகாப்பு:**\n"
                f"1. வெள்ளம் சூழ்ந்த பகுதிகளைத் தவிர்க்கவும்.\n\n"
                f"🌫️ **காற்று மாசுபாடு (AQI):**\n"
                f"1. N95 முகக்கவசம் அணியவும்."
            )
        else:
            msg = (
                f"🛡️ **Climate Safety & Disaster Preparedness Advisory (NDMA Grounded):**\n\n"
                f"☀️ **Heatwave Resilience:**\n"
                f"• Avoid direct midday sun exposure between 12:00 PM – 3:00 PM.\n"
                f"• Maintain strict electrolyte hydration (ORS, coconut water).\n"
                f"• Wear lightweight, loose, light-colored cotton clothing.\n\n"
                f"🌧️ **Heavy Precipitation & Flash Floods:**\n"
                f"• Never attempt to cross flooded roadways or waterlogged lowlands.\n"
                f"• Keep emergency power banks, torches, and first-aid kits ready.\n\n"
                f"🌫️ **Severe Air Quality & Smog (AQI > 150):**\n"
                f"• Wear N95 certified filtration masks outdoors.\n"
                f"• Vulnerable populations (children, seniors, asthmatics) should stay indoors."
            )
        return {"type": "success", "message": msg}

    # 4. Temperature query
    if any(k in q for k in ["temperature", "temp", "तापमान", "taapman", "गर्मी", "garmi", "hot", "उष्णता"]):
        if any(k in q for k in ["hottest", "highest", "max", "सबसे गर्म", "sabse garm", "adhiktam", "सर्वाधिक"]):
            hottest = metrics["hottest"]
            if language == "hi":
                msg = f"🔥 भारत का सबसे गर्म राज्य: **{hottest['State']}** ({hottest['Temperature']} °C)"
            elif language == "mr":
                msg = f"🔥 सर्वाधिक उष्ण राज्य: **{hottest['State']}** ({hottest['Temperature']} °C)"
            elif language == "bn":
                msg = f"🔥 সবচেয়ে উষ্ণ রাজ্য: **{hottest['State']}** ({hottest['Temperature']} °C)"
            elif language == "ta":
                msg = f"🔥 அதிக வெப்பமான மாநிலம்: **{hottest['State']}** ({hottest['Temperature']} °C)"
            else:
                msg = f"🔥 Hottest State in India: **{hottest['State']}** ({hottest['Temperature']} °C)"
            return {"type": "success", "message": msg}
        else:
            avg_temp = metrics["avg_temperature"]
            if language == "hi":
                msg = f"🌡️ भारत का औसत तापमान: **{avg_temp} °C**"
            elif language == "mr":
                msg = f"🌡️ भारताचे सरासरी तापमान: **{avg_temp} °C**"
            elif language == "bn":
                msg = f"🌡️ ভারতের গড় তাপমাত্রা: **{avg_temp} °C**"
            elif language == "ta":
                msg = f"🌡️ இந்தியாவின் சராசரி வெப்பநிலை: **{avg_temp} °C**"
            else:
                msg = f"🌡️ National Average Temperature across India: **{avg_temp} °C**"
            return {"type": "success", "message": msg}

    # 5. Rainfall query
    elif any(k in q for k in ["rain", "rainfall", "बारिश", "वर्षा", "barish", "varsa", "paus", "বৃষ্টি"]):
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
                msg = f"🌧️ Highest Rainfall State: **{rainiest['State']}** ({rainiest['Rainfall']} mm)"
            return {"type": "success", "message": msg}
        else:
            avg_rain = metrics["avg_rainfall"]
            if language == "hi":
                msg = f"🌧️ राष्ट्रीय औसत वर्षा: **{avg_rain} mm**"
            elif language == "mr":
                msg = f"🌧️ राष्ट्रीय सरासरी पाऊस: **{avg_rain} mm**"
            elif language == "bn":
                msg = f"🌧️ জাতীয় গড় বৃষ্টিপাত: **{avg_rain} mm**"
            elif language == "ta":
                msg = f"🌧️ தேசிய சராசரி மழைப்பொழிவு: **{avg_rain} mm**"
            else:
                msg = f"🌧️ National Average Rainfall: **{avg_rain} mm**"
            return {"type": "success", "message": msg}

    # 6. Humidity query
    elif any(k in q for k in ["humidity", "नमी", "आर्द्रता", "nami", "aadrata"]):
        avg_hum = metrics["avg_humidity"]
        if language == "hi":
            msg = f"💧 राष्ट्रीय औसत आर्द्रता (नमी): **{avg_hum} %**"
        elif language == "mr":
            msg = f"💧 राष्ट्रीय सरासरी आर्द्रता: **{avg_hum} %**"
        elif language == "bn":
            msg = f"💧 জাতীয় গড় আর্দ্রতা: **{avg_hum} %**"
        elif language == "ta":
            msg = f"💧 தேசிய சராசரி ஈரப்பதம்: **{avg_hum} %**"
        else:
            msg = f"💧 National Average Relative Humidity: **{avg_hum} %**"
        return {"type": "success", "message": msg}

    # 7. AQI / Air Quality query
    elif any(k in q for k in ["aqi", "air", "quality", "वायु", "हवा", "pradushan", "प्रदूषण"]):
        worst = metrics["worst_aqi"]
        if language == "hi":
            msg = f"🌫️ सबसे खराब वायु गुणवत्ता: **{worst['State']}** (AQI **{worst['AQI']}** - गंभीर/अस्वस्थ)"
        elif language == "mr":
            msg = f"🌫️ सर्वाधिक हवा प्रदूषण: **{worst['State']}** (AQI **{worst['AQI']}**)"
        elif language == "bn":
            msg = f"🌫️ সবচেয়ে খারাপ বাতাসের মান: **{worst['State']}** (AQI **{worst['AQI']}**)"
        elif language == "ta":
            msg = f"🌫️ மோசமான காற்று தரம்: **{worst['State']}** (AQI **{worst['AQI']}**)"
        else:
            msg = f"🌫️ Poorest Air Quality: **{worst['State']}** (AQI **{worst['AQI']}** - Unhealthy/Hazardous)"
        return {"type": "success", "message": msg}

    # 8. High Risk / Threat query
    elif any(k in q for k in ["high risk", "risk", "danger", "threat", "जोखिम", "खतरा", "khatra", "dhoka"]):
        high_risk = df[df["Risk"] == "High"]
        if len(high_risk) > 0:
            states_str = ", ".join(high_risk["State"].tolist())
            if language == "hi":
                msg = f"🚨 **उच्च जलवायु जोखिम वाले राज्य ({len(high_risk)}):**\n\n{states_str}\n\n*कारण:* अत्यधिक तापमान, भारी वर्षा या उच्च एक्यूआई स्तर।"
            elif language == "mr":
                msg = f"🚨 **उच्च धोक्याची राज्ये ({len(high_risk)}):**\n\n{states_str}"
            elif language == "bn":
                msg = f"🚨 **উচ্চ ঝুঁকিপূর্ণ রাজ্যসমূহ ({len(high_risk)}):**\n\n{states_str}"
            elif language == "ta":
                msg = f"🚨 **அதிக ஆபத்துள்ள மாநிலங்கள் ({len(high_risk)}):**\n\n{states_str}"
            else:
                msg = f"🚨 **High Climate Risk States ({len(high_risk)}):**\n\n{states_str}\n\n*Key Drivers:* Thermal anomalies, heavy precipitation, or critical AQI degradation."
        else:
            msg = "✅ No states currently classified under critical high risk." if language == "en" else "✅ वर्तमान में कोई भी राज्य गंभीर उच्च जोखिम में नहीं है।"
        return {"type": "success", "message": msg}

    # 9. Fallback with helpful suggestions
    else:
        if language == "hi":
            msg = (
                "ℹ️ मैं आपकी सहायता के लिए तैयार हूँ! आप मुझसे इनमें से कुछ भी पूछ सकते हैं:\n\n"
                "• *'सबसे गर्म राज्य कौन सा है?'*\n"
                "• *'दिल्ली / महाराष्ट्र का मौसम कैसा है?'*\n"
                "• *'सबसे ज्यादा बारिश कहां है?'*\n"
                "• *'उच्च जोखिम वाले राज्य दिखाओ'* \n"
                "• *'गर्मी और प्रदूषण से बचाव के उपाय बताओ'*"
            )
        elif language == "mr":
            msg = (
                "ℹ️ मी तुम्हाला मदत करू शकतो! तुम्ही मला खालील प्रश्न विचारू शकता:\n\n"
                "• *'सर्वाधिक उष्ण राज्य कोणते?'*\n"
                "• *'महाराष्ट्राचे हवामान कसे आहे?'*\n"
                "• *'उच्च धोक्याची राज्ये कोणती?'*\n"
                "• *'उष्णतेपासून संरक्षणाचे उपाय सांगा'*"
            )
        elif language == "bn":
            msg = (
                "ℹ️ আপনি আমাকে এই বিষয়গুলি জিজ্ঞাসা করতে পারেন:\n\n"
                "• *'সবচেয়ে উষ্ণ রাজ্য কোনটি?'*\n"
                "• *'সর্বোচ্চ বৃষ্টিপাত কোথায় হচ্ছে?'*\n"
                "• *'উচ্চ ঝুঁকিপূর্ণ রাজ্যগুলি দেখান'*\n"
                "• *'গরম থেকে বাঁচার উপায় কী?'*"
            )
        elif language == "ta":
            msg = (
                "ℹ️ நீங்கள் என்னிடம் இவற்றைக் கேட்கலாம்:\n\n"
                "• *'வெப்பமான மாநிலம் எது?'*\n"
                "• *'அதிக மழை எங்கே பெய்கிறது?'*\n"
                "• *'அதிக ஆபத்துள்ள மாநிலங்கள் எவை?'*\n"
                "• *'வெப்பத்திலிருந்து பாதுகாப்பு குறிப்புகள்'*"
            )
        else:
            msg = (
                "ℹ️ I can assist you with comprehensive climate intelligence. Try asking:\n\n"
                "• *'Which state is the hottest?'*\n"
                "• *'What is the climate in Delhi or Maharashtra?'*\n"
                "• *'Where is the highest rainfall?'*\n"
                "• *'List all high risk states'*\n"
                "• *'Safety tips for heatwaves and air pollution'*"
            )
        return {"type": "info", "message": msg}
