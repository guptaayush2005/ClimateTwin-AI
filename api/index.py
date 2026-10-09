"""
ClimateTwin AI - Vercel Serverless Function Entrypoint
Exports the FastAPI app for Vercel Python runtime.
"""
import sys
from pathlib import Path

# Ensure repository root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.server import app
