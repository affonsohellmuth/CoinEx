from pydantic import BaseModel
from datetime import datetime, date
from typing import List

class CotacaoResponse(BaseModel):
    moeda_base: str
    moeda_destino: str
    valor_convertido: float
    fonte: str
    ultima_atualizacao_utc: datetime

class HistoricoDataPoint(BaseModel):
    data: date
    valor: float

class Moeda(BaseModel):
    codigo: str
    tipo: str

class MoedasSuportadasResponse(BaseModel):
    fiat: List[str]
    crypto: List[str]