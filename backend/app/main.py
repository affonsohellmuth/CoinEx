from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.core.config import API_TITLE, API_DESCRIPTION, API_VERSION, ALLOWED_ORIGINS

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, tags=["Conversão e Histórico"])

@app.get("/", tags=["Health Check"])
def health_check():
    return {"status": "ok", "version": API_VERSION}