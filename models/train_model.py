import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

df = pd.read_csv("data/climate_data.csv")

X = df[["Rainfall", "Humidity", "AQI"]]
y = df["Temperature"]

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

model.fit(X, y)

joblib.dump(model, "models/saved_model.pkl")

print("Model Trained Successfully!")