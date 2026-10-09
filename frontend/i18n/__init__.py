"""
ClimateTwin AI - Internationalization Package
"""
from frontend.i18n.language_manager import (
    init_language,
    get_language,
    set_language,
    get_supported_languages,
    t
)

__all__ = [
    "init_language",
    "get_language",
    "set_language",
    "get_supported_languages",
    "t"
]
