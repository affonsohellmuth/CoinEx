import time

crypto_cache = {}
CACHE_DURATION_SECONDS = 300

def get_from_cache(key: str):
    if key in crypto_cache:
        cached_data = crypto_cache[key]
        if time.time() - cached_data['timestamp'] < CACHE_DURATION_SECONDS:
            print(f"CACHE HIT: Retornando valor cacheado para {key}")
            return cached_data['rate']
    print(f"CACHE MISS: Chave {key} não encontrada ou expirada.")
    return None

def set_in_cache(key: str, rate: float):
    print(f"CACHE SET: Adicionando valor para {key}")
    crypto_cache[key] = {
        'rate': rate,
        'timestamp': time.time()
    }