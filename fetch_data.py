import pandas as pd
import requests
import time
from datetime import datetime, timedelta

# State coordinates load karo
states = pd.read_csv("data/state_coordinates.csv")

# NASA data usually 1 day delay se update hota hai
today = datetime.now()
yesterday = today - timedelta(days=1)
date = yesterday.strftime("%Y%m%d")

all_data = []

for _, row in states.iterrows():
    state = row["State"]
    lat = row["Latitude"]
    lon = row["Longitude"]

    print(f"Fetching data for {state}...")

    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"parameters=T2M,PRECTOTCORR,RH2M&"
        f"community=RE&"
        f"longitude={lon}&latitude={lat}&"
        f"start={date}&end={date}&"
        f"format=JSON"
    )

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()

        params = data["properties"]["parameter"]

        temperature = list(params["T2M"].values())[0]
        rainfall = list(params["PRECTOTCORR"].values())[0]
        humidity = list(params["RH2M"].values())[0]

        all_data.append({
            "State": state,
            "Temperature": temperature,
            "Rainfall": rainfall,
            "Humidity": humidity,
            "Latitude": lat,
            "Longitude": lon
        })

        time.sleep(1)

    except Exception as e:
        print(f"❌ Error in {state}: {e}")

# Save CSV
df = pd.DataFrame(all_data)
df.to_csv("data/climate_data.csv", index=False)

print(f"✅ climate_data.csv updated successfully for {date}!")