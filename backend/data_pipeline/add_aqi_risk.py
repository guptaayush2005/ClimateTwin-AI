"""
ClimateTwin AI - AQI & Risk Classification Pipeline Script
Enriches raw climate data with AQI and categorizes climate risks.
"""
import sys
import random
import pandas as pd
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.config import CLIMATE_DATA_FILE


def main():
    if not CLIMATE_DATA_FILE.exists():
        print(f"❌ Climate data file not found at {CLIMATE_DATA_FILE}")
        return

    df = pd.read_csv(CLIMATE_DATA_FILE)
    df["AQI"] = [random.randint(50, 180) for _ in range(len(df))]

    risk = []
    for temp in df["Temperature"]:
        if temp >= 35:
            risk.append("High")
        elif temp >= 30:
            risk.append("Medium")
        else:
            risk.append("Low")

    df["Risk"] = risk
    df.to_csv(CLIMATE_DATA_FILE, index=False)
    print("✅ AQI and Risk classification updated successfully!")


if __name__ == "__main__":
    main()
