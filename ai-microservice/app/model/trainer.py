import pickle
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

DATA_PATH  = "app/data/smarthome_enrichi.xlsx"
MODEL_PATH = "app/model/model.pkl"

EQUIPMENTS = ["Lumiere_ON", "Clim_ON", "Chauffage_ON"]
FEATURES   = ["Heure", "Temperature", "is_daylight",
               "is_holiday", "is_weekend", "day_type_enc"]

def train_model():
    df = pd.read_excel(DATA_PATH)

    le = LabelEncoder()
    df["day_type_enc"] = le.fit_transform(df["day_type"])

    models  = {}
    metrics = {}

    for equip in EQUIPMENTS:
        X = df[FEATURES]
        y = df[equip]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        clf = RandomForestClassifier(
            n_estimators=150, max_depth=10,
            min_samples_leaf=2, random_state=42,
        )
        clf.fit(X_train, y_train)

        acc = accuracy_score(y_test, clf.predict(X_test))
        models[equip]  = clf
        metrics[equip] = round(float(acc), 3)
        print(f"  {equip}: accuracy = {acc:.2%}")

    with open(MODEL_PATH, "wb") as f:
        pickle.dump({
            "models":        models,
            "label_encoder": le,
            "metrics":       metrics,
            "trained_at":    datetime.now().isoformat(),
            "dataset_size":  len(df),
        }, f)

    print(f" Modèles sauvegardés ({len(df)} lignes)")
    return models, metrics