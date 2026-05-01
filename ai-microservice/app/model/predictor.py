import pickle
import pandas as pd
from datetime import datetime

MODEL_PATH = "app/model/model.pkl"

EQUIPMENT_META = {
    "Lumiere_ON":   {"label": "la lumière",   "room": "salon",   "icon": "lightbulb"},
    "Clim_ON":      {"label": "la clim",      "room": "chambre", "icon": "ac_unit"},
    "Chauffage_ON": {"label": "le chauffage", "room": "maison",  "icon": "thermostat"},
}

CONFIDENCE_THRESHOLD = 0.70


def _load_model():
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def _build_input(hour, temperature, is_daylight, is_holiday, is_weekend, day_type, le):
    day_type_enc = le.transform([day_type])[0]
    return pd.DataFrame([{
        "Heure":        hour,
        "Temperature":  temperature,
        "is_daylight":  is_daylight,
        "is_holiday":   is_holiday,
        "is_weekend":   is_weekend,
        "day_type_enc": day_type_enc,
    }])


def _run_predictions(X, models):
    suggestions = []
    for equip, model in models.items():
        pred  = model.predict(X)[0]
        proba = model.predict_proba(X)[0][1]
        meta  = EQUIPMENT_META.get(equip, {})

        if pred == 1 and proba >= CONFIDENCE_THRESHOLD:
            suggestions.append({
                "equipment":  equip,
                "confidence": round(float(proba), 2),
                "message":    f"Voulez-vous allumer {meta.get('label', equip)} dans le {meta.get('room', '')} ?",
                "label":      meta.get("label", equip),
                "room":       meta.get("room", ""),
                "icon":       meta.get("icon", "power"),
                "action":     1,
            })
    return suggestions


def predict_all(
    hour:        int   = None,
    temperature: float = 20.0,
    is_daylight: int   = 1,
    is_holiday:  int   = 0,
    is_weekend:  int   = 0,
    day_type:    str   = "workday",
):
    """
    Prédit les équipements à allumer.
    Si les params ne sont pas fournis, utilise le contexte système actuel.
    """
    data = _load_model()

    # Fallback sur le contexte système uniquement si aucun param fourni
    if hour is None:
        from app.utils.context import get_current_context
        ctx = get_current_context()
    else:
        ctx = {
            "hour":        hour,
            "temperature": temperature,
            "is_daylight": is_daylight,
            "is_holiday":  is_holiday,
            "is_weekend":  is_weekend,
            "day_type":    day_type,
        }

    X       = _build_input(**ctx, le=data["label_encoder"])
    results = _run_predictions(X, data["models"])

    print(f"🔍 Contexte utilisé : {ctx}")
    print(f"📊 Résultat brut modèle : {results}")

    for s in results:
        s["context"] = ctx
    return results


def predict_test(hour, temperature, is_daylight, is_holiday, is_weekend, day_type):
    data   = _load_model()
    models = data["models"]
    le     = data["label_encoder"]
    X      = _build_input(hour, temperature, is_daylight, is_holiday, is_weekend, day_type, le)

    details     = []
    suggestions = []

    for equip, model in models.items():
        pred  = model.predict(X)[0]
        proba = model.predict_proba(X)[0][1]
        meta  = EQUIPMENT_META.get(equip, {})

        details.append({
            "equipment":   equip,
            "label":       meta.get("label", equip),
            "prediction":  "ON" if pred == 1 else "OFF",
            "proba_ON":    f"{proba:.0%}",
            "proba_OFF":   f"{1 - proba:.0%}",
            "will_notify": bool(pred == 1 and proba >= CONFIDENCE_THRESHOLD),
        })

        if pred == 1 and proba >= CONFIDENCE_THRESHOLD:
            suggestions.append({
                "equipment":  equip,
                "confidence": round(float(proba), 2),
                "message":    f"Voulez-vous allumer {meta.get('label', equip)} dans le {meta.get('room', '')} ?",
                "icon":       meta.get("icon", "power"),
            })

    return {
        "parametres": {
            "hour": hour, "temperature": temperature,
            "is_daylight": is_daylight, "is_holiday": is_holiday,
            "is_weekend": is_weekend, "day_type": day_type,
        },
        "details":             details,
        "suggestions":         suggestions,
        "notifications_count": len(suggestions),
    }