from datetime import datetime, date
from fastapi import WebSocket
from app.model.predictor import predict_all
import geocoder
from astral import Observer
from astral.sun import sun
import pandas as pd
import json
import shutil
import os
import asyncio

EXCEL_PATH    = "app/data/smarthome_enrichi.xlsx"
SHEET_NAME    = "Dataset"
MISSED_PATH   = "app/data/missed_notifications.json"
FLAG_PATH     = "app/data/data_ready.flag"
COUNTER_PATH  = "app/data/real_count.txt"

EQUIPMENT_MAP = {
    "Lumiere_ON":   "Lumiere_ON",
    "Clim_ON":      "Clim_ON",
    "Chauffage_ON": "Chauffage_ON",
    "Lumiere":      "Lumiere_ON",
    "Clim":         "Clim_ON",
    "Chauffage":    "Chauffage_ON",
}

# Sauvegarde initiale uniquement si le fichier existe
if os.path.exists(EXCEL_PATH):
    backup_path = EXCEL_PATH + ".bak"
    shutil.copy2(EXCEL_PATH, backup_path)


def get_real_count() -> int:
    if not os.path.exists(COUNTER_PATH):
        return 0
    with open(COUNTER_PATH, "r") as f:
        return int(f.read().strip() or 0)


def increment_real_count() -> int:
    count = get_real_count() + 1
    with open(COUNTER_PATH, "w") as f:
        f.write(str(count))
    return count


def get_client_location(lat=None, lon=None):
    if lat is not None and lon is not None:
        return lat, lon
    try:
        g = geocoder.ip('me')
        if g.ok:
            return g.latlng
    except Exception:
        pass
    return 34.68, -1.91


def get_sun_times(lat, lon):
    observer = Observer(latitude=lat, longitude=lon)
    s = sun(observer, date=date.today())
    sunrise_str = s["sunrise"].strftime("%H:%M")
    sunset_str  = s["sunset"].strftime("%H:%M")
    return sunrise_str, sunset_str


def get_feedback_context(lat=None, lon=None):
    lat, lon = get_client_location(lat, lon)
    sunrise, sunset = get_sun_times(lat, lon)
    hour_now = datetime.now().hour

    sunrise_h = int(sunrise.split(":")[0])
    sunset_h  = int(sunset.split(":")[0])
    is_daylight = 1 if sunrise_h <= hour_now <= sunset_h else 0

    return {
        "lat":         lat,
        "lon":         lon,
        "sunrise":     sunrise,
        "sunset":      sunset,
        "hour_now":    hour_now,
        "is_daylight": is_daylight
    }


MAX_ROWS_FAKE = 2000


def replace_with_real_excel(
    equipment, hour, temperature, is_daylight,
    day_type, action, sunrise="07:00", sunset="18:00"
):
    # Dataset complet
    if os.path.exists(FLAG_PATH):
        print("Dataset complet (2000 lignes réelles), aucune modification.")
        return "dataset_full"

    try:
        action = int(action)
    except Exception:
        print(f"Action invalide : {action}")
        return "ignored"

    if action not in (0, 1):
        print(f"Action invalide : {action}")
        return "ignored"

    backup_path = EXCEL_PATH + ".bak"
    try:
        if os.path.exists(EXCEL_PATH):
            shutil.copy2(EXCEL_PATH, backup_path)
        else:
            os.makedirs(os.path.dirname(EXCEL_PATH), exist_ok=True)
            pd.DataFrame(columns=[
                "Date", "Heure", "Temperature", "Sunrise", "Sunset",
                "is_daylight", "day_type", "is_holiday", "is_weekend",
                "Lumiere_ON", "Clim_ON", "Chauffage_ON"
            ]).to_excel(EXCEL_PATH, sheet_name=SHEET_NAME, index=False)

        df = pd.read_excel(EXCEL_PATH, sheet_name=SHEET_NAME)

        if len(df) >= MAX_ROWS_FAKE:
            df = df.iloc[1:].reset_index(drop=True)

        new_row = {
            "Date":         date.today().strftime("%d/%m/%Y"),
            "Heure":        hour,
            "Temperature":  temperature,
            "Sunrise":      sunrise,
            "Sunset":       sunset,
            "is_daylight":  is_daylight,
            "day_type":     day_type,
            "is_holiday":   1 if day_type == "holiday" else 0,
            "is_weekend":   1 if day_type == "weekend" else 0,
            "Lumiere_ON":   0,
            "Clim_ON":      0,
            "Chauffage_ON": 0,
        }

        col = EQUIPMENT_MAP.get(equipment)
        if col:
            new_row[col] = action
        else:
            print(f"Équipement inconnu : '{equipment}'")
            return "unknown_equipment"

        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        df.to_excel(EXCEL_PATH, sheet_name=SHEET_NAME, index=False)

        total_real = increment_real_count()
        print(f"✅ {equipment} = {'ON' if action == 1 else 'OFF'} | lignes réelles : {total_real}/{MAX_ROWS_FAKE}")

        if total_real >= MAX_ROWS_FAKE:
            with open(FLAG_PATH, "w") as f:
                f.write(f"Dataset complet le {date.today().isoformat()}\n")
            print("✅ 2000 lignes réelles atteintes — flag créé, Excel figé.")

        if os.path.exists(backup_path):
            os.remove(backup_path)

        return f"{equipment} = {'ON' if action == 1 else 'OFF'}"

    except Exception as e:
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, EXCEL_PATH)
        print(f"❌ Erreur écriture Excel, backup restauré : {e}")
        raise


# ─── Missed notifications ───────────────────────────────────────────────────

def load_missed() -> dict:
    if not os.path.exists(MISSED_PATH):
        return {}
    try:
        with open(MISSED_PATH, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return {}
            return json.loads(content)
    except json.JSONDecodeError:
        return {}


def save_missed(data: dict):
    os.makedirs(os.path.dirname(MISSED_PATH), exist_ok=True)
    with open(MISSED_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def add_missed_notif(user_id: str, notif: dict):
    data = load_missed()
    if user_id not in data:
        data[user_id] = []

    exists = any(
        n["equipementId"] == notif["equipementId"] and n["missedAt"] == notif["missedAt"]
        for n in data[user_id]
    )

    if not exists:
        data[user_id].append(notif)
        save_missed(data)


def get_missed_notifs(user_id: str) -> list:
    data = load_missed()
    return data.get(user_id, [])


def delete_missed_notif(user_id: str, equipement_id: int):
    data = load_missed()
    if user_id in data:
        data[user_id] = [
            n for n in data[user_id]
            if n["equipementId"] != equipement_id
        ]
        save_missed(data)