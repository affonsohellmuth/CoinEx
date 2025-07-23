let historicoChart = null;

const elements = {
    valorBaseInput: document.getElementById('valor-base'),
    valorDestinoInput: document.getElementById('valor-destino'),
    moedaBaseSelect: document.getElementById('moeda-base'),
    moedaDestinoSelect: document.getElementById('moeda-destino'),
    btnConverter: document.getElementById('btn-converter'),
    infoTaxaDiv: document.getElementById('info-taxa'),
    tabelaTbody: document.getElementById('tabela-tbody'),
    dataInicioInput: document.getElementById('data-inicio'),
    dataFimInput: document.getElementById('data-fim'),
    graficoCanvas: document.getElementById('grafico-historico'),
    infoHistoricoDiv: document.getElementById('info-historico'),
};

export const getElements = () => elements;

export const getConversionInputs = () => ({
    valor: parseFloat(elements.valorBaseInput.value),
    base: elements.moedaBaseSelect.value,
    destino: elements.moedaDestinoSelect.value,
});

export const getHistoryInputs = () => ({
    base: elements.moedaBaseSelect.value,
    destino: elements.moedaDestinoSelect.value,
    dataInicio: elements.dataInicioInput.value,
    dataFim: elements.dataFimInput.value,
});

export function setDestinoValue(value) {
    elements.valorDestinoInput.value = value;
}

export function showInfoMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

export function popularSelects(fiat, crypto) {
    const criarOptgroup = (label, moedasArray) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = label;
        moedasArray.forEach(codigo => {
            optgroup.appendChild(new Option(codigo, codigo));
        });
        return optgroup;
    };
    
    elements.moedaBaseSelect.innerHTML = '';
    elements.moedaDestinoSelect.innerHTML = '';
    
    elements.moedaBaseSelect.appendChild(criarOptgroup('Criptomoedas', crypto));
    elements.moedaBaseSelect.appendChild(criarOptgroup('Moedas Fiduciárias', fiat));
    elements.moedaDestinoSelect.appendChild(criarOptgroup('Criptomoedas', crypto));
    elements.moedaDestinoSelect.appendChild(criarOptgroup('Moedas Fiduciárias', fiat));

    elements.moedaBaseSelect.value = "BTC";
    elements.moedaDestinoSelect.value = "USD";
}

export function popularTabela(fiat, crypto) {
    elements.tabelaTbody.innerHTML = '';
    const moedas = [
        ...crypto.map(c => ({ codigo: c, tipo: "Criptomoeda" })),
        ...fiat.map(f => ({ codigo: f, tipo: "Fiduciária" }))
    ].sort((a, b) => a.codigo.localeCompare(b.codigo));
    
    moedas.forEach(moeda => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${moeda.codigo}</td>
            <td>${moeda.codigo}</td>
            <td>${moeda.tipo}</td>
        `;
        elements.tabelaTbody.appendChild(tr);
    });
}

export function setInitialDates() {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    
    elements.dataFimInput.value = hoje.toISOString().split('T')[0];
    elements.dataInicioInput.value = trintaDiasAtras.toISOString().split('T')[0];
}

export function clearChart() {
    if (historicoChart) {
        historicoChart.destroy();
        historicoChart = null;
    }
}

export function desenharGrafico(labels, data, label) {
    clearChart();
    
    historicoChart = new Chart(elements.graficoCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: '#f0db23',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0, 
                pointBackgroundColor: '#bda406ff',
                pointRadius: 4,
                pointHoverRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    labels: { 
                        color: '#e0e0e0', 
                        font: { size: 14 } 
                    } 
                }
            },
            scales: {
                x: { 
                    ticks: {
                        color: '#b0b0b0',
                        autoSkip: true, 
                        maxRotation: 0, 
                        minRotation: 0
                    }
                },
                y: { 
                    ticks: { 
                        color: '#b0b0b0' 
                    }, 
                    grid: { 
                        color: 'rgba(255, 255, 255, 0.1)' 
                    } 
                }
            }
        }
    });
}