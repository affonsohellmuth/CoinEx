document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://127.0.0.1:8000';

    const valorBaseInput = document.getElementById('valor-base');
    const valorDestinoInput = document.getElementById('valor-destino');
    const moedaBaseSelect = document.getElementById('moeda-base');
    const moedaDestinoSelect = document.getElementById('moeda-destino');
    const btnConverter = document.getElementById('btn-converter');
    const infoTaxaDiv = document.getElementById('info-taxa');

    const supportedCurrencies = [
        "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
        "HKD", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR",
        "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
    ];

    supportedCurrencies.forEach(currency => {
        const optionBase = new Option(currency, currency);
        const optionDestino = new Option(currency, currency);
        moedaBaseSelect.appendChild(optionBase);
        moedaDestinoSelect.appendChild(optionDestino);
    });

    moedaBaseSelect.value = "USD";
    moedaDestinoSelect.value = "BRL";

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

        infoTaxaDiv.textContent = 'Buscando...';
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

            valorDestinoInput.value = valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: destino });

            infoTaxaDiv.textContent = `Taxa: 1 ${base} = ${taxa.toFixed(6)} ${destino}`;

        } catch (error) {
            infoTaxaDiv.textContent = `Erro: ${error.message}`;
            valorDestinoInput.value = '';
        }
    };

    btnConverter.addEventListener('click', converterMoeda);
});