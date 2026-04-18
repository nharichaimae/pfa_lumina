import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks
import pandas as pd
from pydantic import BaseModel
from datetime import date, datetime
import pickle
import asyncio
import os

from app.api.feedback_utils import (
    EQUIPMENT_MAP, EXCEL_PATH, MAX_ROWS_FAKE, SHEET_NAME,
    FLAG_PATH, increment_real_count,
    replace_with_real_excel, get_feedback_context,
    add_missed_notif, get_missed_notifs, delete_missed_notif
)
from app.api.websocket import manager
from app.model.trainer import train_model
from app.model.predictor import predict_all, predict_test

router = APIRouter()

# ─── Intervalle d'envoi WebSocket (secondes) ────────────────────────────────
WS_SEND_INTERVAL = 30


class FeedbackRequest(BaseModel):
    equipment: str
    confirmed: bool
    day_type:  str = "workday"


# ─── WebSocket notifications ─────────────────────────────────────────────────

@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(
    websocket:   WebSocket,
    user_id:     str,
    # Params envoyés par Angular dans l'URL (?hour=21&temperature=-1&...)
    hour:        int   = None,
    temperature: float = 20.0,
    is_daylight: int   = 1,
    is_holiday:  int   = 0,
    is_weekend:  int   = 0,
    day_type:    str   = "workday",
):
    await websocket.accept()
    await manager.connect(websocket)

    print(f"🔌 Client {user_id} connecté | params: hour={hour}, temp={temperature}, "
          f"daylight={is_daylight}, holiday={is_holiday}, weekend={is_weekend}, day_type={day_type}")

    try:
        while True:
            # ✅ Prédit avec les params reçus du front (pas l'heure système)
            predictions = predict_all(
                hour=hour,
                temperature=temperature,
                is_daylight=is_daylight,
                is_holiday=is_holiday,
                is_weekend=is_weekend,
                day_type=day_type,
            )

            notifications = [
                {
                    "id":         pred["equipment"],
                    "equipment":  pred["equipment"],
                    "message":    pred.get("message", f"Voulez-vous allumer {pred['equipment']} ?"),
                    "confidence": pred.get("confidence", 0),
                    "expires_at": 15,
                    "timestamp":  datetime.now().isoformat()
                }
                for pred in predictions
            ] if predictions else []

            await websocket.send_json({"type": "batch", "notifications": notifications})
            print(f"📤 Batch envoyé à {user_id} : {len(notifications)} notification(s)")

            # Attendre WS_SEND_INTERVAL secondes ou un message du client
            try:
                raw = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=float(WS_SEND_INTERVAL)
                )
                try:
                    data     = json.loads(raw)
                    # Le client peut mettre à jour les params en cours de session
                    new_params = data.get("params", {})
                    if new_params:
                        hour        = new_params.get("hour",        hour)
                        temperature = new_params.get("temperature", temperature)
                        is_daylight = new_params.get("is_daylight", is_daylight)
                        is_holiday  = new_params.get("is_holiday",  is_holiday)
                        is_weekend  = new_params.get("is_weekend",  is_weekend)
                        day_type    = new_params.get("day_type",    day_type)
                        print(f"🔄 Params mis à jour pour {user_id} : {new_params}")

                    responses = data.get("responses", {})
                    if responses:
                        print(f"💬 Réponses reçues du client {user_id}: {responses}")
                except json.JSONDecodeError:
                    pass

            except asyncio.TimeoutError:
                # Timeout normal → on reboucle et envoie de nouvelles prédictions
                pass

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"🔌 Client {user_id} déconnecté proprement")
    except Exception as e:
        print(f"❌ Erreur WebSocket [{user_id}]: {e}")
        manager.disconnect(websocket)


# ─── Predict ─────────────────────────────────────────────────────────────────

@router.get("/predict")
def get_predictions():
    predictions = predict_all()
    return {
        "timestamp":           datetime.now().isoformat(),
        "suggestions":         predictions,
        "notifications_count": len(predictions)
    }


@router.get("/predict/test")
def test_prediction(
    hour:        int,
    temperature: float,
    is_daylight: int,
    is_holiday:  int,
    is_weekend:  int,
    day_type:    str
):
    return predict_test(hour, temperature, is_daylight, is_holiday, is_weekend, day_type)


# ─── Feedback ────────────────────────────────────────────────────────────────

@router.post("/feedback")
def post_feedback(
    equipment:        str,
    confirmed:        bool,
    day_type:         str   = "workday",
    is_daylight:      int   = None,
    temperature:      float = 20.0,
    lat:              float = None,
    lon:              float = None,
    background_tasks: BackgroundTasks = None
):
    if not confirmed:
        return {"status": "ignored", "message": f"{equipment} refusé, non stocké"}

    ctx = get_feedback_context(lat, lon)
    final_is_daylight = is_daylight if is_daylight is not None else ctx["is_daylight"]

    msg = replace_with_real_excel(
        equipment=equipment,
        hour=ctx["hour_now"],
        temperature=temperature,
        is_daylight=final_is_daylight,
        day_type=day_type,
        action=1,
        sunrise=ctx["sunrise"],
        sunset=ctx["sunset"]
    )
    _, metrics = train_model()

    if background_tasks:
        background_tasks.add_task(manager.send_notification, {
            "type":    "feedback_recorded",
            "message": msg,
            "metrics": metrics
        })

    return {"status": "ok", "message": msg, "metrics": metrics}


@router.post("/feedback/batch")
def post_feedback_batch(payload: dict, lat: float = None, lon: float = None):
    ctx         = get_feedback_context(lat, lon)
    actions     = payload.get("equipment_actions", [])
    day_type    = payload.get("day_type", "workday")
    temperature = payload.get("temperature", 20.0)
    is_daylight = payload.get("is_daylight") or ctx["is_daylight"]

    confirmed_actions = [a for a in actions if a.get("confirmed") is True]

    if not confirmed_actions:
        return {"status": "ignored", "message": "Aucune action confirmée"}

    if os.path.exists(FLAG_PATH):
        return {"status": "dataset_full", "message": "Dataset complet, Excel figé"}

    row = {
        "Date":         date.today().strftime("%d/%m/%Y"),
        "Heure":        ctx["hour_now"],
        "Temperature":  temperature,
        "Sunrise":      ctx["sunrise"],
        "Sunset":       ctx["sunset"],
        "is_daylight":  is_daylight,
        "day_type":     day_type,
        "is_holiday":   1 if day_type == "holiday" else 0,
        "is_weekend":   1 if day_type == "weekend" else 0,
        "Lumiere_ON":   0,
        "Clim_ON":      0,
        "Chauffage_ON": 0,
    }

    for action in confirmed_actions:
        col = EQUIPMENT_MAP.get(action["equipment"])
        if col:
            row[col] = 1

    df = pd.read_excel(EXCEL_PATH, sheet_name=SHEET_NAME)
    if len(df) >= MAX_ROWS_FAKE:
        df = df.iloc[1:].reset_index(drop=True)

    df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
    df.to_excel(EXCEL_PATH, sheet_name=SHEET_NAME, index=False)

    total_real = increment_real_count()
    print(f"✅ Batch enregistré | lignes réelles : {total_real}/{MAX_ROWS_FAKE}")

    if total_real >= MAX_ROWS_FAKE:
        with open(FLAG_PATH, "w") as f:
            f.write(f"Dataset complet le {date.today().isoformat()}\n")
        print("✅ 2000 lignes réelles atteintes — flag créé, Excel figé.")

    _, metrics = train_model()
    return {"status": "ok", "metrics": metrics}


# ─── Missed notifications ─────────────────────────────────────────────────────

@router.post("/notifications/missed")
def save_missed_notification(payload: dict):
    user_id = str(payload.get("userId"))
    notif   = payload.get("notif")
    if not user_id or not notif:
        return {"status": "error", "message": "userId et notif requis"}
    add_missed_notif(user_id, notif)
    return {"status": "ok"}


@router.get("/notifications/missed/{user_id}")
def fetch_missed_notifications(user_id: str):
    return {"missed": get_missed_notifs(user_id)}


@router.delete("/notifications/missed/{user_id}/{equipement_id}")
def remove_missed_notification(user_id: str, equipement_id: int):
    delete_missed_notif(user_id, equipement_id)
    return {"status": "ok"}


# ─── Retrain / Metrics ───────────────────────────────────────────────────────

@router.post("/retrain")
def retrain():
    _, metrics = train_model()
    return {"status": "ok", "metrics": metrics}


@router.get("/metrics")
def get_metrics():
    with open("app/model/model.pkl", "rb") as f:
        data = pickle.load(f)
    return {
        "metrics":      data.get("metrics", {}),
        "trained_at":   data.get("trained_at", "N/A"),
        "dataset_size": data.get("dataset_size", "N/A")
    }