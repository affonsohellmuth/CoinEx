import * as api from './apiService.js';
import * as ui from './ui.js';

const state = {
    currencies: {
        fiat: [],
        crypto: []
    },
};

async function handleConversion() {
    const { valor, base, destino } = ui.getConversionInputs();

    if (isNaN(valor) || valor <= 0) {
        ui.showInfoMessage('info-taxa', 'Por favor, insira um valor numérico válido e maior que zero.');
        return;
    }
    if (base === destino) {
        ui.showInfoMessage('info-taxa', 'As moedas de origem e destino devem ser diferentes.');
        return;
    }

    ui.showInfoMessage('info-taxa', `Buscando cotação de ${base} para ${destino}...`);
    ui.setDestinoValue('...');

    try {
        const data = await api.getConversionRate(base, destino);
        const valorFinal = valor * data.valor_convertido;
        const isDestinoCrypto = state.currencies.crypto.includes(destino);

        const options = {
            minimumFractionDigits: 2,
            maximumFractionDigits: isDestinoCrypto ? 8 : 2
        };

        ui.setDestinoValue(valorFinal.toLocaleString('pt-BR', options));
        ui.showInfoMessage('info-taxa', `Taxa: 1 ${base} ≈ ${data.valor_convertido.toFixed(8)} ${destino}`);

    } catch (error) {
        ui.showInfoMessage('info-taxa', `Erro: ${error.message}`);
        ui.setDestinoValue('');
    }
}

async function handleHistory() {
    const { base, destino, dataInicio, dataFim } = ui.getHistoryInputs();

    if (!state.currencies.fiat.includes(base) || !state.currencies.fiat.includes(destino)) {
        ui.showInfoMessage('info-historico', "Histórico disponível apenas para moedas fiduciárias.");
        ui.clearChart();
        return;
    }
    if (!dataInicio || !dataFim) {
        ui.showInfoMessage('info-historico', "Por favor, selecione as datas de início e fim.");
        return;
    }

    ui.showInfoMessage('info-historico', "Buscando histórico...");
    
    try {
        const data = await api.getHistory(base, destino, dataInicio, dataFim);
        if (data.length === 0) {
            ui.showInfoMessage('info-historico', "Nenhum dado encontrado para o período selecionado.");
            ui.clearChart();
            return;
        }

        const labels = data.map(ponto => ponto.data);
        const valores = data.map(ponto => ponto.valor);

        ui.desenharGrafico(labels, valores, `${base} / ${destino}`);
        ui.showInfoMessage('info-historico', `Exibindo histórico de ${base} para ${destino}.`);

    } catch (error) {
        ui.showInfoMessage('info-historico', `Erro: ${error.message}`);
        ui.clearChart();
    }
}

async function init() {
    try {
        const currencies = await api.getSupportedCurrencies();
        state.currencies = currencies;
        
        ui.popularSelects(currencies.fiat, currencies.crypto);
        ui.popularTabela(currencies.fiat, currencies.crypto);
        ui.setInitialDates();

    } catch (error) {
        console.error("Erro fatal ao inicializar a aplicação:", error);
        ui.showInfoMessage('info-taxa', 'Não foi possível carregar os dados da aplicação. Tente recarregar a página.');
    }

    const elements = ui.getElements();
    elements.btnConverter.addEventListener('click', () => {
        handleConversion();
        handleHistory();
    });
    
    elements.valorBaseInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            elements.btnConverter.click();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);