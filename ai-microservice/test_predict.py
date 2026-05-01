"""from app.model.predictor import predict_all
import pickle


with open("app/model/model.pkl", "rb") as f:
    data = pickle.load(f)

models = data["models"]
le     = data["label_encoder"]

from datetime import datetime
import numpy as np

now          = datetime.now()
hour         = now.hour
temperature  = 15.0
is_daylight  = 1
is_holiday   = 0
is_weekend   = 0
day_type_enc = le.transform(["workday"])[0]

X = np.array([[hour, temperature, is_daylight, is_holiday, is_weekend, day_type_enc]])

print(f"Heure: {hour}h | Température: {temperature}°C\n")

for equip, model in models.items():
    pred  = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    print(f"{equip} → prédit: {'ON' if pred==1 else 'OFF'} | proba ON: {proba[1]:.2%} | proba OFF: {proba[0]:.2%}")
    """
