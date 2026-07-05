import pandas as pd
import random

df = pd.read_csv("data/climate_data.csv")

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

df.to_csv("data/climate_data.csv", index=False)

print("AQI and Risk added successfully!")