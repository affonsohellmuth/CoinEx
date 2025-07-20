import os
import requests
import time
from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CoinEx API",
    description="API unificada para obter cotações de moedas fiduciárias e criptomoedas com cache.",
    version="2.1.0"
)

origins = ["http://localhost", "http://localhost:5500", "http://127.0.0.1:5500", "null"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

crypto_cache = {} 
CACHE_DURATION_SECONDS = 300

CRYPTO_API_KEY = os.getenv("CRYPTO_API_KEY")
CRYPTO_API_URL = "https://min-api.cryptocompare.com/data/pricemulti"
FIAT_API_URL = "https://api.frankfurter.app"

SUPPORTED_FIAT = {
    "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD",
    "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD",
    "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
}
SUPPORTED_CRYPTO = {
    "BTC", "ETH", "XRP", "LTC", "BCH", "ADA", "DOT", "LINK", "BNB", "XLM", "USDT", "DOGE"
}

class CotacaoResponse(BaseModel):
    moeda_base: str
    moeda_destino: str
    valor_convertido: float
    fonte: str
    ultima_atualizacao_utc: datetime

@app.get("/cotacao/{moeda_base}/{moeda_destino}", response_model=CotacaoResponse)
def obter_cotacao_unificada(
    moeda_base: str = Path(..., description="Código da moeda de origem (ex: USD, BTC)."),
    moeda_destino: str = Path(..., description="Código da moeda de destino (ex: BRL, ETH).")
):
    base = moeda_base.upper()
    destino = moeda_destino.upper()

    is_base_crypto = base in SUPPORTED_CRYPTO
    is_destino_crypto = destino in SUPPORTED_CRYPTO
    is_base_fiat = base in SUPPORTED_FIAT
    is_destino_fiat = destino in SUPPORTED_FIAT

    if not (is_base_crypto or is_base_fiat):
        raise HTTPException(status_code=400, detail=f"Moeda de base '{base}' não é suportada.")
    if not (is_destino_crypto or is_destino_fiat):
        raise HTTPException(status_code=400, detail=f"Moeda de destino '{destino}' não é suportada.")
    if base == destino:
        raise HTTPException(status_code=400, detail="As moedas não podem ser iguais.")

    try:
        taxa = 0.0
        fonte = ""

        if is_base_fiat and is_destino_fiat:
            fonte = "Frankfurter.app"
            url = f"{FIAT_API_URL}/latest?from={base}&to={destino}"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            taxa = data.get("rates", {}).get(destino)

        else:
            cache_key = f"{base}-{destino}"
            current_time = time.time()

            if cache_key in crypto_cache:
                cached_data = crypto_cache[cache_key]
                if current_time - cached_data['timestamp'] < CACHE_DURATION_SECONDS:
                    print(f"CACHE HIT: Retornando valor cacheado para {cache_key}")
                    taxa = cached_data['rate']
                    fonte = "CryptoCompare (Cache)"
                
            if taxa == 0.0:
                print(f"CACHE MISS: Buscando novo valor para {cache_key}")
                if not CRYPTO_API_KEY:
                    raise HTTPException(status_code=500, detail="Chave da API de criptomoedas não configurada.")
                
                fonte = "CryptoCompare (Live)"
                url = f"{CRYPTO_API_URL}?fsyms={base}&tsyms={destino}&api_key={CRYPTO_API_KEY}"
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()

                if "Response" in data and data["Response"] == "Error":
                    raise HTTPException(status_code=404, detail=data.get("Message", "Par de moedas não encontrado."))

                taxa = data.get(base, {}).get(destino)

                if taxa is not None:
                    crypto_cache[cache_key] = {
                        'rate': taxa,
                        'timestamp': current_time
                    }

        if taxa is None:
            raise HTTPException(status_code=500, detail="API externa não retornou a taxa esperada.")

        return CotacaoResponse(
            moeda_base=base,
            moeda_destino=destino,
            valor_convertido=taxa,
            fonte=fonte,
            ultima_atualizacao_utc=datetime.utcnow()
        )

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Erro ao contatar o serviço externo: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro inesperado: {str(e)}")

@app.get("/")
def health_check():
    return {"status": "ok", "version": "2.1.0"}
