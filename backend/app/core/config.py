import os
from dotenv import load_dotenv

load_dotenv()

API_TITLE = "CoinEx API"
API_DESCRIPTION = "API para obter cotações de moedas e históricos."
API_VERSION = "3.0.0"

ALLOWED_ORIGINS = ["http://localhost", "http://localhost:5500", "http://127.0.0.1:5500", "null"]

CRYPTO_API_KEY = os.getenv("CRYPTO_API_KEY")
CRYPTO_API_URL = "https://min-api.cryptocompare.com/data/pricemulti"
FIAT_API_URL = "https://api.frankfurter.app"

SUPPORTED_FIAT = {
    "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
    "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD",
    "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
}
SUPPORTED_CRYPTO = {
    "BTC", "ETH", "XRP", "LTC", "BCH", "ADA", "DOT", "LINK", "BNB", "XLM", "USDT", "DOGE"
}