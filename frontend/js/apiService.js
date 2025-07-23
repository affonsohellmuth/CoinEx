import { API_URL } from './config.js';

/**
 * @returns {Promise<object>}
 */
export async function getSupportedCurrencies() {
    const response = await fetch(`${API_URL}/moedas`);
    if (!response.ok) {
        throw new Error('Não foi possível carregar a lista de moedas do servidor.');
    }
    return response.json();
}

/**
 * 
 * @param {string} base 
 * @param {string} destination 
 * @returns {Promise<object>} 
 */
export async function getConversionRate(base, destination) {
    const response = await fetch(`${API_URL}/cotacao/${base}/${destination}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Não foi possível obter a cotação.');
    }
    return response.json();
}

/**
 * 
 * @param {string} base 
 * @param {string} destination 
 * @param {string} startDate
 * @param {string} endDate 
 * @returns {Promise<Array>}
 */
export async function getHistory(base, destination, startDate, endDate) {
    const url = `${API_URL}/historico/${base}/${destination}?data_inicio=${startDate}&data_fim=${endDate}`;
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Não foi possível buscar o histórico.');
    }
    return response.json();
}