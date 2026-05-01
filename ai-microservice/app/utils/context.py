from datetime import datetime

# ──────────────────────────────────────────────────────────────
# PHASE TEST → modifiez ces 4 valeurs pour simuler un contexte
# PHASE PROD → décommentez le bloc capteurs plus bas
# ──────────────────────────────────────────────────────────────
TEST_TEMPERATURE = 30.0
TEST_IS_DAYLIGHT = 1
TEST_IS_HOLIDAY  = 0
TEST_IS_WEEKEND  = 0

def get_current_context() -> dict:
    now  = datetime.now()
    hour = now.hour

    # ── TEST ──
    temperature = TEST_TEMPERATURE
    is_daylight = TEST_IS_DAYLIGHT
    is_holiday  = TEST_IS_HOLIDAY
    is_weekend  = TEST_IS_WEEKEND

    # ── PROD (décommenter) ──
    # from app.utils.weather import get_current_temperature
    # temperature = get_current_temperature()
    # is_daylight = 1 if 6 <= hour <= 20 else 0
    # is_weekend  = 1 if now.weekday() >= 5 else 0
    # is_holiday  = 0  # votre logique jours fériés

    if is_holiday:
        day_type = "holiday"
    elif is_weekend:
        day_type = "weekend"
    else:
        day_type = "workday"

    return {
        "hour":        hour,
        "temperature": temperature,
        "is_daylight": is_daylight,
        "is_holiday":  is_holiday,
        "is_weekend":  is_weekend,
        "day_type":    day_type,
    }