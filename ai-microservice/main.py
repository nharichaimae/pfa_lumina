from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from app.api.routes import router
from app.model.trainer import train_model
import os

EXCEL_PATH = "app/data/smarthome_enrichi.xlsx"
MODEL_PATH = "app/model/model.pkl"

def init_excel():
    if not os.path.exists(EXCEL_PATH):
        raise FileNotFoundError(f"{EXCEL_PATH} introuvable !")
    print("Fichier Excel trouvé")

def init_model():
    if not os.path.exists(MODEL_PATH):
        print("Entraînement initial du modèle...")
        train_model()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Démarrage du microservice AI...")
    init_excel()
    init_model()
    print("Microservice prêt")
    yield
    print("Microservice arrêté")

app = FastAPI(title="Smart Home AI Microservice", version="1.0.0", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content={}, status_code=200)
        response.headers["Access-Control-Allow-Origin"]      = "http://localhost:4200"
        response.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"]     = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"]      = "http://localhost:4200"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

app.include_router(router)

@app.get("/")
def root():
    return {"status": "Smart Home AI Microservice en ligne"}