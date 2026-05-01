import requests
from fastapi import FastAPI, HTTPException

app = FastAPI()

SPRING_URL = "http://localhost:8080/api/admin/isBlockedIA/"

def is_user_blocked(user_id: int):
    try:
        response = requests.get(f"{SPRING_URL}{user_id}")

        # sécurité HTTP
        if response.status_code != 200:
            return True

        return response.json()

    except Exception as e:
        print("Erreur Spring:", e)
        return True  # sécurité maximale

@app.post("/ask-ai")
def ask_ai(user_id: int, question: str):

    # 🔴 Vérification AVANT IA
    if is_user_blocked(user_id):
        raise HTTPException(
            status_code=403,
            detail="Accès IA bloqué ❌"
        )

    # ✅ traitement IA normal
    return {
        "response": f"Réponse IA pour: {question}"
    }