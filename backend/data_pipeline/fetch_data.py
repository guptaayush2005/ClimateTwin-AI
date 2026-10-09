"""
ClimateTwin AI - NASA Data Fetching Pipeline Script
Fetches daily parameters from NASA POWER API and updates climate_data.csv.
"""
import sys
from pathlib import Path

# Safe UTF-8 console output for Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add project root to path if executed standalone
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# Auto-detect and use .venv if not already active
venv_python = root_dir / ".venv" / "Scripts" / "python.exe"
if venv_python.exists():
    try:
        is_same = Path(sys.executable).resolve().samefile(venv_python.resolve())
    except Exception:
        is_same = str(Path(sys.executable).resolve()).lower() == str(venv_python.resolve()).lower()

    if not is_same:
        import subprocess
        sys.exit(subprocess.call([str(venv_python)] + sys.argv))

from backend.services.nasa_service import sync_nasa_climate_data


def main():
    print("🌍 Starting NASA POWER API Climate Data Sync...")
    result = sync_nasa_climate_data(
        progress_callback=lambda curr, total, state: print(f"[{curr}/{total}] Syncing {state}...")
    )
    if result.get("success"):
        print(f"✅ {result.get('message')}")
    else:
        print(f"❌ {result.get('message')}")


if __name__ == "__main__":
    main()
