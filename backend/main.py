import requests
from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel
from datetime import date
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API de Cotações de Moedas",
    description="Uma API para obter cotações de moedas, utilizando dados da Frankfurter.app.",
    version="1.1.0"
)

origins = [
    "http://localhost",
    "http://localhost:5500", 
    "http://127.0.0.1:5500",
    "null" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXTERNAL_API_URL = "https://api.frankfurter.app"

SUPPORTED_CURRENCIES = {
    "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
    "HKD", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR",
    "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
}

class CotacaoResponse(BaseModel):
    moeda_base: str
    moeda_destino: str
    valor_convertido: float
    data_cotacao: date
    fonte: str

@app.get("/cotacao/{moeda_base}/{moeda_destino}", response_model=CotacaoResponse)
def obter_cotacao(
    moeda_base: str = Path(..., description="Código da moeda de origem (ex: USD)."),
    moeda_destino: str = Path(..., description="Código da moeda de destino (ex: BRL).")
):

    base = moeda_base.upper()
    destino = moeda_destino.upper()

    if base not in SUPPORTED_CURRENCIES:
        raise HTTPException(status_code=400, detail=f"Moeda de base '{base}' não é suportada.")
    if destino not in SUPPORTED_CURRENCIES:
        raise HTTPException(status_code=400, detail=f"Moeda de destino '{destino}' não é suportada.")
    if base == destino:
        raise HTTPException(status_code=400, detail="Moeda de base e destino não podem ser iguais.")

    try:

        url = f"{EXTERNAL_API_URL}/latest?from={base}&to={destino}"
        response = requests.get(url)
        response.raise_for_status()  

        data = response.json()

        taxa = data.get("rates", {}).get(destino)
        if taxa is None:
            raise HTTPException(status_code=500, detail="API externa não retornou a taxa esperada.")

        resposta_formatada = CotacaoResponse(
            moeda_base=data.get("base"),
            moeda_destino=destino,
            valor_convertido=taxa,
            data_cotacao=data.get("date"),
            fonte="Frankfurter.app"
        )
        return resposta_formatada

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Erro ao contatar o serviço externo: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro inesperado: {e}")


@app.get("/")
def health_check():
    return {"status": "ok"}