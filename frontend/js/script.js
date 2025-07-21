document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://127.0.0.1:8000';
    const valorBaseInput = document.getElementById('valor-base');
    const valorDestinoInput = document.getElementById('valor-destino');
    const moedaBaseSelect = document.getElementById('moeda-base');
    const moedaDestinoSelect = document.getElementById('moeda-destino');
    const btnConverter = document.getElementById('btn-converter');
    const infoTaxaDiv = document.getElementById('info-taxa');
    const tabelaTbody = document.getElementById('tabela-tbody');
    const dataInicioInput = document.getElementById('data-inicio');
    const dataFimInput = document.getElementById('data-fim');
    const graficoCanvas = document.getElementById('grafico-historico');
    const infoHistoricoDiv = document.getElementById('info-historico');
    let historicoChart;

    const moedas = [
        { codigo: "BTC", nome: "Bitcoin", tipo: "Criptomoeda" },
        { codigo: "ETH", nome: "Ethereum", tipo: "Criptomoeda" },
        { codigo: "XRP", nome: "XRP", tipo: "Criptomoeda" },
        { codigo: "LTC", nome: "Litecoin", tipo: "Criptomoeda" },
        { codigo: "BCH", nome: "Bitcoin Cash", tipo: "Criptomoeda" },
        { codigo: "ADA", nome: "Cardano", tipo: "Criptomoeda" },
        { codigo: "DOT", nome: "Polkadot", tipo: "Criptomoeda" },
        { codigo: "LINK", nome: "Chainlink", tipo: "Criptomoeda" },
        { codigo: "BNB", nome: "BNB", tipo: "Criptomoeda" },
        { codigo: "DOGE", nome: "Dogecoin", tipo: "Criptomoeda" },
        { codigo: "USDT", nome: "Tether", tipo: "Criptomoeda" },
        { codigo: "XLM", nome: "Stellar", tipo: "Criptomoeda" },
        { codigo: "USD", nome: "Dólar Americano", tipo: "Estados Unidos" },
        { codigo: "EUR", nome: "Euro", tipo: "Zona do Euro" },
        { codigo: "BRL", nome: "Real Brasileiro", tipo: "Brasil" },
        { codigo: "JPY", nome: "Iene Japonês", tipo: "Japão" },
        { codigo: "GBP", nome: "Libra Esterlina", tipo: "Reino Unido" },
        { codigo: "AUD", nome: "Dólar Australiano", tipo: "Austrália" },
        { codigo: "CAD", nome: "Dólar Canadense", tipo: "Canadá" },
        { codigo: "CHF", nome: "Franco Suíço", tipo: "Suíça" },
        { codigo: "CNY", nome: "Yuan Chinês", tipo: "China" },
        { codigo: "ZAR", nome: "Rand Sul-Africano", tipo: "África do Sul" },
        { codigo: "BGN", nome: "Lev Búlgaro", tipo: "Bulgária" },
        { codigo: "CZK", nome: "Coroa Checa", tipo: "República Tcheca" },
        { codigo: "DKK", nome: "Coroa Dinamarquesa", tipo: "Dinamarca" },
        { codigo: "HUF", nome: "Forint Húngaro", tipo: "Hungria" },
        { codigo: "IDR", nome: "Rupia Indonésia", tipo: "Indonésia" },
        { codigo: "ILS", nome: "Shekel Israelense", tipo: "Israel" },
        { codigo: "INR", nome: "Rúpia Indiana", tipo: "Índia" },
        { codigo: "ISK", nome: "Coroa Islandesa", tipo: "Islândia" },
        { codigo: "KRW", nome: "Won Sul-Coreano", tipo: "Coreia do Sul" },
        { codigo: "MXN", nome: "Peso Mexicano", tipo: "México" },
        { codigo: "MYR", nome: "Ringgit Malaio", tipo: "Malásia" },
        { codigo: "NOK", nome: "Coroa Norueguesa", tipo: "Noruega" },
        { codigo: "NZD", nome: "Dólar Neozelandês", tipo: "Nova Zelândia" },
        { codigo: "PHP", nome: "Peso Filipino", tipo: "Filipinas" },
        { codigo: "PLN", nome: "Zloty Polonês", tipo: "Polônia" },
        { codigo: "RON", nome: "Leu Romeno", tipo: "Romênia" },
        { codigo: "SEK", nome: "Coroa Sueca", tipo: "Suécia" },
        { codigo: "SGD", nome: "Dólar de Singapura", tipo: "Singapura" },
        { codigo: "THB", nome: "Baht Tailandês", tipo: "Tailândia" },
        { codigo: "TRY", nome: "Lira Turca", tipo: "Turquia" },
    ];
    
    const cryptoCurrencies = moedas.filter(m => m.tipo === 'Criptomoeda').map(m => m.codigo);
    const fiatCurrencies = moedas.filter(m => m.tipo !== 'Criptomoeda').map(m => m.codigo);

    const popularSelects = () => {
        const criarOptgroup = (label, moedasArray) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = label;
            moedasArray.forEach(codigo => {
                optgroup.appendChild(new Option(codigo, codigo));
            });
            return optgroup;
        };

        moedaBaseSelect.appendChild(criarOptgroup('Criptomoedas', cryptoCurrencies));
        moedaBaseSelect.appendChild(criarOptgroup('Moedas Fiduciárias', fiatCurrencies));
        moedaDestinoSelect.appendChild(criarOptgroup('Criptomoedas', cryptoCurrencies));
        moedaDestinoSelect.appendChild(criarOptgroup('Moedas Fiduciárias', fiatCurrencies));

        moedaBaseSelect.value = "BTC";
        moedaDestinoSelect.value = "USD";
    };

    const popularTabela = () => {
        tabelaTbody.innerHTML = ''; 
        moedas.forEach(moeda => {
            const tr = document.createElement('tr'); 
            tr.innerHTML = `
                <td>${moeda.codigo}</td>
                <td>${moeda.nome}</td>
                <td>${moeda.tipo}</td>
            `;
            tabelaTbody.appendChild(tr); 
        });
    };

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
    const buscarHistorico = async () => {
        const base = moedaBaseSelect.value;
        const destino = moedaDestinoSelect.value;
        const dataInicio = dataInicioInput.value;
        const dataFim = dataFimInput.value;

        if (!fiatCurrencies.includes(base) || !fiatCurrencies.includes(destino)) {
            infoHistoricoDiv.textContent = "Histórico disponível apenas para moedas fiduciárias.";
            return;
        }
        if (!dataInicio || !dataFim) {
            infoHistoricoDiv.textContent = "Por favor, selecione data de início e fim.";
            return;
        }

        infoHistoricoDiv.textContent = "Buscando histórico...";

        try {
            const url = `${API_URL}/historico/${base}/${destino}?data_inicio=${dataInicio}&data_fim=${dataFim}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Não foi possível buscar o histórico.');
            }
            const data = await response.json();

            if (data.length === 0) {
                infoHistoricoDiv.textContent = "Nenhum dado encontrado para o período selecionado.";
                return;
            }

            const labels = data.map(ponto => ponto.data);
            const valores = data.map(ponto => ponto.valor);

            desenharGrafico(labels, valores, `${base} / ${destino}`);
            infoHistoricoDiv.textContent = `Exibindo histórico de ${base} para ${destino}.`;

        } catch (error) {
            infoHistoricoDiv.textContent = `Erro: ${error.message}`;
        }
    };
    const desenharGrafico = (labels, data, label) => {
        if (historicoChart) {
            historicoChart.destroy(); // Destrói o gráfico anterior para criar um novo
        }
        historicoChart = new Chart(graficoCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: '#f0db23',
                    backgroundColor: 'rgba(240, 219, 35, 0.2)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#e0e0e0' } } },
                scales: {
                    x: { ticks: { color: '#b0b0b0' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    y: { ticks: { color: '#b0b0b0' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
                }
            }
        });
    };

    const init = () => {
        popularSelects();
        popularTabela();

        const hoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        dataFimInput.value = hoje.toISOString().split('T')[0];
        dataInicioInput.value = trintaDiasAtras.toISOString().split('T')[0];

        btnConverter.addEventListener('click', converterMoeda);
        btnConverter.addEventListener('click', buscarHistorico);
        valorBaseInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') converterMoeda(); });
    };

    init();
});