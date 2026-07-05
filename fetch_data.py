import pandas as pd
import requests
import time

# State coordinates load karo
states = pd.read_csv("data/state_coordinates.csv")

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
        f"start=20260701&end=20260701&"
        f"format=JSON"
    )

    try:
        response = requests.get(url, timeout=30)
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
        print(f"Error in {state}: {e}")

# Save CSV
df = pd.DataFrame(all_data)

df.to_csv("data/climate_data.csv", index=False)

print("✅ climate_data.csv created successfully!")