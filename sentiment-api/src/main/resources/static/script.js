
/**
 * Módulo principal da UI de Análise de Sentimento
 */
const SentimentUI = (function() {

    const API_ENDPOINT = '/sentiment';

    // Estado da aplicação
    let analysisHistory = [];
    let isProcessing = false;

    // Cache de elementos DOM
    const elements = {
        textInput: document.getElementById('textInput'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        resultSection: document.getElementById('resultSection'),
        loading: document.getElementById('loading'),
        errorMessage: document.getElementById('errorMessage'),
        charCount: document.getElementById('charCount'),
        sentimentIcon: document.getElementById('sentimentIcon'),
        sentimentLabel: document.getElementById('sentimentLabel'),
        probabilityValue: document.getElementById('probabilityValue'),
        progressFill: document.getElementById('progressFill'),
        confidenceValue: document.getElementById('confidenceValue'),
        historyList: document.getElementById('historyList'),
        apiStatusIcon: document.getElementById('apiStatusIcon'),
        apiStatusText: document.getElementById('apiStatusText')
    };

    /**
     * Inicializa a aplicação
     */
    function init() {
        setupEventListeners();
        updateCharCount();
        setApiStatus(true, 'Conectado à API');
    }

    function setupEventListeners() {
        elements.textInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                analyzeSentiment();
            }
        });
    }

    function updateCharCount() {
        const length = elements.textInput.value.length;
        elements.charCount.textContent = `${length} caracteres`;
        elements.analyzeBtn.disabled = length < 5 || isProcessing;
    }

    function setApiStatus(connected, message) {
        elements.apiStatusIcon.className =
            connected ? 'fas fa-circle connected' : 'fas fa-circle disconnected';
        elements.apiStatusText.textContent = message;
        elements.apiStatusText.style.color = connected ? '#10b981' : '#ef4444';
    }

    /**
     * Analisa o sentimento
     */
    async function analyzeSentiment() {
        const text = elements.textInput.value.trim();

        if (text.length < 5 || isProcessing) {
            return;
        }

        isProcessing = true;
        updateCharCount();

        elements.loading.classList.add('show');
        hideError();
        elements.resultSection.classList.remove('show');

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                const msg =
                    response.status === 429
                        ? 'Serviço de IA está acordando. Tente novamente em alguns segundos.'
                        : `Erro ${response.status}`;
                throw new Error(msg);
            }

            const data = await response.json();
            displayResult(data);
            addToHistory(text, data);

        } catch (error) {
            showError(error.message);
        } finally {
            isProcessing = false;
            updateCharCount();
            elements.loading.classList.remove('show');
        }
    }

    function displayResult(data) {
        const sentiment = data.previsao.toLowerCase();
        const probability = data.probabilidade * 100;

        elements.sentimentLabel.textContent = sentiment.toUpperCase();
        elements.confidenceValue.textContent = `${Math.round(probability)}%`;
        elements.probabilityValue.textContent = `${Math.round(probability)}%`;
        elements.progressFill.style.width = `${probability}%`;

        elements.resultSection.classList.add('show');
    }

    function addToHistory(text, data) {
        analysisHistory.unshift({
            id: Date.now(),
            text,
            sentiment: data.previsao,
            probability: data.probabilidade
        });
    }

    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.classList.add('show');
    }

    function hideError() {
        elements.errorMessage.classList.remove('show');
    }

    return {
        init,
        analyzeSentiment,
        updateCharCount
    };
})();

document.addEventListener('DOMContentLoaded', SentimentUI.init);
window.SentimentUI = SentimentUI;
