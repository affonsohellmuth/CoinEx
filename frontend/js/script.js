document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://127.0.0.1:8000';

    const valorBaseInput = document.getElementById('valor-base');
    const valorDestinoInput = document.getElementById('valor-destino');
    const moedaBaseSelect = document.getElementById('moeda-base');
    const moedaDestinoSelect = document.getElementById('moeda-destino');
    const btnConverter = document.getElementById('btn-converter');
    const infoTaxaDiv = document.getElementById('info-taxa');

    const fiatCurrencies = [
        "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
        "HKD", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR",
        "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
    ];

    const cryptoCurrencies = [
        "BTC", "ETH", "XRP", "LTC", "BCH", "ADA", "DOT", "LINK", "BNB", "XLM", "USDT", "DOGE"
    ]

    const popularMoedas = () => {
        moedaBaseSelect.innerHTML = '';
        moedaDestinoSelect.innerHTML = '';

        const cryptoGroupBase = document.createElement('optgroup');
        cryptoGroupBase.label = 'Criptomoedas';
        const cryptoGroupDest = document.createElement('optgroup');
        cryptoGroupDest.label = 'Criptomoedas';

        cryptoCurrencies.forEach(c => {
            cryptoGroupBase.appendChild(new Option(c, c));
            cryptoGroupDest.appendChild(new Option(c, c));
        });

        moedaBaseSelect.appendChild(cryptoGroupBase);
        moedaDestinoSelect.appendChild(cryptoGroupDest);

        // Adiciona Moedas Fiduciárias
        const fiatGroupBase = document.createElement('optgroup');
        fiatGroupBase.label = 'Moedas Fiduciárias';
        const fiatGroupDest = document.createElement('optgroup');
        fiatGroupDest.label = 'Moedas Fiduciárias';
        
        fiatCurrencies.forEach(c => {
            fiatGroupBase.appendChild(new Option(c, c));
            fiatGroupDest.appendChild(new Option(c, c));
        });

        moedaBaseSelect.appendChild(fiatGroupBase);
        moedaDestinoSelect.appendChild(fiatGroupDest);
    };

    popularMoedas();

    moedaBaseSelect.value = "BTC";
    moedaDestinoSelect.value = "USD";

    const converterMoeda = async () => {
        const valor = parseFloat(valorBaseInput.value);
        const base = moedaBaseSelect.value;
        const destino = moedaDestinoSelect.value;

        if (isNaN(valor) || valor <= 0) {
            infoTaxaDiv.textContent = 'Por favor, insira um valor válido.';
            return;
        }
        if (base === destino) {
            infoTaxaDiv.textContent = 'As moedas de origem e destino devem ser diferentes.';
            return;
        }

        infoTaxaDiv.textContent = `Buscando cotação de ${base} para ${destino}...`;
        valorDestinoInput.value = '...';

        try {
            const response = await fetch(`${API_URL}/cotacao/${base}/${destino}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Não foi possível obter a cotação.');
            }
            const data = await response.json();
            const taxa = data.valor_convertido;
            
            const valorFinal = valor * taxa;

            const isDestinoCrypto = cryptoCurrencies.includes(destino);
            const options = {
                minimumFractionDigits: 2,
                maximumFractionDigits: isDestinoCrypto ? 8 : 2
            };
            valorDestinoInput.value = valorFinal.toLocaleString('pt-BR', options);

            infoTaxaDiv.textContent = `Taxa: 1 ${base} = ${taxa.toFixed(8)} ${destino}`;

        } catch (error) {
            infoTaxaDiv.textContent = `Erro: ${error.message}`;
            valorDestinoInput.value = '';
        }
    };

    btnConverter.addEventListener('click', converterMoeda);
    
    valorBaseInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            converterMoeda();
        }
    });
});