"""
ClimateTwin AI - Vercel Serverless Function Entrypoint
Exports the FastAPI app for Vercel Python runtime.
"""
import os
import sys
from pathlib import Path

# Ensure repository root and current working directory are on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
CWD_DIR = Path(os.getcwd())

for p in [str(ROOT_DIR), str(CWD_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.server import app
