from fastapi import APIRouter, HTTPException, Path, Query
from datetime import datetime, date
from typing import List
from app.schemas.currency import CotacaoResponse, HistoricoDataPoint, MoedasSuportadasResponse
from app.services import currency_service
from app.core.config import SUPPORTED_CRYPTO, SUPPORTED_FIAT
import requests

router = APIRouter()

@router.get(
    "/cotacao/{moeda_base}/{moeda_destino}",
    response_model=CotacaoResponse,
    summary="Obtém a cotação entre duas moedas"
)
def obter_cotacao_unificada(
    moeda_base: str = Path(..., description="Código da moeda de origem (ex: USD, BTC)."),
    moeda_destino: str = Path(..., description="Código da moeda de destino (ex: BRL, ETH).")
):
    base, destino = moeda_base.upper(), moeda_destino.upper()
    is_base_crypto, is_destino_crypto = base in SUPPORTED_CRYPTO, destino in SUPPORTED_CRYPTO
    is_base_fiat, is_destino_fiat = base in SUPPORTED_FIAT, destino in SUPPORTED_FIAT

    if not (is_base_crypto or is_base_fiat) or not (is_destino_crypto or is_destino_fiat):
        raise HTTPException(status_code=400, detail="Uma ou ambas as moedas não são suportadas.")
    if base == destino:
        raise HTTPException(status_code=400, detail="As moedas não podem ser iguais.")

    try:
        rate, fonte = 0.0, ""
        if is_base_fiat and is_destino_fiat:
            rate = currency_service.get_fiat_rate(base, destino)
            fonte = "Frankfurter.app"
        else:
            rate = currency_service.get_crypto_rate(base, destino)
            fonte = "CryptoCompare"
        
        return CotacaoResponse(
            moeda_base=base, moeda_destino=destino, valor_convertido=rate,
            fonte=fonte, ultima_atualizacao_utc=datetime.utcnow()
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Erro ao contatar o serviço externo: {e}")
    except Exception as e:
        # Logar o erro `e` em um sistema de monitoramento na vida real
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro inesperado: {str(e)}")

@router.get(
    "/historico/{moeda_base}/{moeda_destino}",
    response_model=List[HistoricoDataPoint],
    summary="Obtém o histórico de cotações entre duas moedas fiduciárias"
)
def get_historico_moeda(
    moeda_base: str = Path(..., description="Código da moeda FIAT de origem."),
    moeda_destino: str = Path(..., description="Código da moeda FIAT de destino."),
    data_inicio: date = Query(..., description="Data de início no formato AAAA-MM-DD"),
    data_fim: date = Query(..., description="Data de fim no formato AAAA-MM-DD")
):
    base, destino = moeda_base.upper(), moeda_destino.upper()
    if base not in SUPPORTED_FIAT or destino not in SUPPORTED_FIAT:
        raise HTTPException(status_code=400, detail="Histórico disponível apenas para moedas fiduciárias.")
    
    return currency_service.get_fiat_history(base, destino, str(data_inicio), str(data_fim))

@router.get(
    "/moedas",
    response_model=MoedasSuportadasResponse,
    summary="Lista todas as moedas suportadas pela API"
)
def get_moedas_suportadas():
    """Retorna uma lista de todas as moedas fiduciárias e criptomoedas suportadas."""
    return {
        "fiat": sorted(list(SUPPORTED_FIAT)),
        "crypto": sorted(list(SUPPORTED_CRYPTO))
    }