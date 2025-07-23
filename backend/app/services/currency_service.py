import requests
from fastapi import HTTPException
from app.core.config import (
    FIAT_API_URL, CRYPTO_API_URL, CRYPTO_API_KEY
)
from app.utils.cache import get_from_cache, set_in_cache

def get_fiat_rate(base: str, destino: str) -> float:
    url = f"{FIAT_API_URL}/latest?from={base}&to={destino}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    rate = data.get("rates", {}).get(destino)
    if rate is None:
        raise HTTPException(status_code=500, detail="API externa de FIAT não retornou a taxa esperada.")
    return rate

def get_crypto_rate(base: str, destino: str) -> float:
    cache_key = f"{base}-{destino}"
    cached_rate = get_from_cache(cache_key)
    if cached_rate:
        return cached_rate

    if not CRYPTO_API_KEY:
        raise HTTPException(status_code=500, detail="Chave da API de criptomoedas não configurada.")
    
    url = f"{CRYPTO_API_URL}?fsyms={base}&tsyms={destino}&api_key={CRYPTO_API_KEY}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    if "Response" in data and data["Response"] == "Error":
        raise HTTPException(status_code=404, detail=data.get("Message", "Par de moedas não encontrado na API de Cripto."))

    rate = data.get(base, {}).get(destino)
    if rate is None:
        raise HTTPException(status_code=500, detail="API externa de Cripto não retornou a taxa esperada.")
    
    set_in_cache(cache_key, rate)
    return rate

def get_fiat_history(base: str, destino: str, data_inicio: str, data_fim: str):
    url = f"{FIAT_API_URL}/{data_inicio}..{data_fim}?from={base}&to={destino}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        rates = data.get("rates", {})
        if not rates:
            return []
        
        resultado = [
            {"data": dia, "valor": valores.get(destino)}
            for dia, valores in sorted(rates.items()) if valores.get(destino) is not None
        ]
        return resultado
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Erro ao buscar dados da API de histórico: {e}")