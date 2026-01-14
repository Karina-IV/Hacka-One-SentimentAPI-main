/**
 * Módulo principal da UI de Análise de Sentimento
 */
const SentimentUI = (function () {

    const API_ENDPOINT = '/sentiment';
    const HISTORY_KEY = 'sentimentHistory';

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

    /* ===================== INIT ===================== */

    function init() {
        setupEventListeners();
        loadHistory();
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

    /* ===================== UI HELPERS ===================== */

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

    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.classList.add('show');
    }

    function hideError() {
        elements.errorMessage.classList.remove('show');
    }

    /* ===================== MAIN ACTION ===================== */

    async function analyzeSentiment() {
        const text = elements.textInput.value.trim();

        if (text.length < 5 || isProcessing) return;

        isProcessing = true;
        updateCharCount();

        hideError();
        elements.loading.classList.add('show');
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
                if (response.status === 429) {
                    throw new Error(
                        'O serviço de IA está acordando. Aguarde alguns segundos e tente novamente.'
                    );
                }
                throw new Error(`Erro ${response.status}`);
            }

            const data = await response.json();
            displayResult(data);
            addToHistory(text, data);

        } catch (error) {
            showError(error.message || 'API não disponível');
        } finally {
            isProcessing = false;
            updateCharCount();
            elements.loading.classList.remove('show');
        }
    }

    /* ===================== RESULT ===================== */

    function displayResult(data) {
        const sentiment = data.previsao.toLowerCase();
        const probability = Math.round(data.probabilidade * 100);

        elements.sentimentLabel.textContent = sentiment.toUpperCase();
        elements.confidenceValue.textContent = `${probability}%`;
        elements.probabilityValue.textContent = `${probability}%`;
        elements.progressFill.style.width = `${probability}%`;

        elements.resultSection.classList.add('show');
    }

    /* ===================== HISTORY ===================== */

    function addToHistory(text, data) {
        analysisHistory.unshift({
            id: Date.now(),
            text: text.length > 50 ? text.substring(0, 50) + '...' : text,
            sentiment: data.previsao.toLowerCase(),
            probability: data.probabilidade
        });

        if (analysisHistory.length > 10) {
            analysisHistory.pop();
        }

        saveHistory();
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        elements.historyList.innerHTML = '';

        analysisHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';

            const icon =
                item.sentiment === 'positivo'
                    ? '<i class="fas fa-smile"></i>'
                    : '<i class="fas fa-frown"></i>';

            div.innerHTML = `
                <div class="history-text">${item.text}</div>
                <div class="history-sentiment ${item.sentiment}">
                    ${icon} ${item.sentiment.toUpperCase()}
                    (${Math.round(item.probability * 100)}%)
                </div>
            `;

            elements.historyList.appendChild(div);
        });
    }

    function saveHistory() {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(analysisHistory));
    }

    function loadHistory() {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
            analysisHistory = JSON.parse(saved);
            updateHistoryDisplay();
        }
    }

    /* ===================== PUBLIC API ===================== */

    return {
        init,
        analyzeSentiment,
        updateCharCount
    };
})();

document.addEventListener('DOMContentLoaded', SentimentUI.init);
window.SentimentUI = SentimentUI;
