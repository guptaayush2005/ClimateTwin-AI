"""
ClimateTwin AI - Language Manager
Manages localization state and string translation helpers across Streamlit sessions.
"""
import streamlit as st
from typing import Dict
from frontend.i18n.translations import TRANSLATIONS

SUPPORTED_LANGUAGES: Dict[str, str] = {
    "en": "🇬🇧 English",
    "hi": "🇮🇳 हिन्दी (Hindi)",
    "mr": "🇮🇳 मराठी (Marathi)",
    "bn": "🇮🇳 বাংলা (Bengali)",
    "ta": "🇮🇳 தமிழ் (Tamil)",
}


def init_language() -> str:
    """
    Ensures that the language key is initialized in Streamlit session_state.
    """
    if "language" not in st.session_state:
        st.session_state["language"] = "en"
    return st.session_state["language"]


def get_language() -> str:
    """
    Returns the currently active language code.
    """
    return st.session_state.get("language", "en")


def set_language(lang_code: str):
    """
    Updates the active language code.
    """
    if lang_code in SUPPORTED_LANGUAGES:
        st.session_state["language"] = lang_code


def get_supported_languages() -> Dict[str, str]:
    """
    Returns a mapping of language code to display name.
    """
    return SUPPORTED_LANGUAGES


def t(key: str, **kwargs) -> str:
    """
    Translates a key into the active language, with fallback to English, then the key itself.
    """
    lang = get_language()
    lang_dict = TRANSLATIONS.get(lang, TRANSLATIONS.get("en", {}))
    fallback_dict = TRANSLATIONS.get("en", {})

    text = lang_dict.get(key, fallback_dict.get(key, key))
    if kwargs:
        try:
            return text.format(**kwargs)
        except Exception:
            return text
    return text
