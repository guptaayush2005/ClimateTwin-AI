"""
ClimateTwin AI - Root Server Launcher
Runs the backend REST API server and serves the HTML/CSS/JS frontend on http://localhost:8000
Automatically uses the project's virtual environment (.venv) if available.
"""
import sys
import os
import subprocess
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Auto-detect and use .venv if not already active
venv_python = Path(__file__).resolve().parent / ".venv" / "Scripts" / "python.exe"
if venv_python.exists():
    try:
        is_same = Path(sys.executable).resolve().samefile(venv_python.resolve())
    except Exception:
        is_same = str(Path(sys.executable).resolve()).lower() == str(venv_python.resolve()).lower()

    if not is_same:
        sys.exit(subprocess.call([str(venv_python)] + sys.argv))

# Run the backend FastAPI server
from backend.server import run

if __name__ == "__main__":
    run()
