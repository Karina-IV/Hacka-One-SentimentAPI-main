/**
 * Módulo principal da UI de Análise de Sentimento
 */
const SentimentUI = (function() {

    const API_ENDPOINT = '/sentiment';

    // Estado da aplicação
    let analysisHistory = [];
    let isConnected = false;

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
        loadHistory();
        checkApiConnection();
        updateCharCount();
    }

    /**
     * Configura os event listeners
     */
    function setupEventListeners() {
        elements.textInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                analyzeSentiment();
            }
        });

        setInterval(checkApiConnection, 30000);
    }

    /**
     * Atualiza o contador de caracteres
     */
    function updateCharCount() {
        const length = elements.textInput.value.length;
        elements.charCount.textContent = `${length} caracteres`;
        elements.analyzeBtn.disabled = length < 5;
    }

    
    async function checkApiConnection() {
        try {
            const response = await fetch('/actuator/health');
            if (response.ok) {
                setApiStatus(true, 'Conectado à API');
            } else {
                setApiStatus(false, 'API não disponível');
            }
        } catch {
            setApiStatus(false, 'API não disponível');
        }
    }

    function setApiStatus(connected, message) {
        isConnected = connected;
        elements.apiStatusIcon.className =
            connected ? 'fas fa-circle connected' : 'fas fa-circle disconnected';
        elements.apiStatusText.textContent = message;
        elements.apiStatusText.style.color = connected ? '#10b981' : '#ef4444';
    }

    
    async function analyzeSentiment(


document.addEventListener('DOMContentLoaded', SentimentUI.init);

window.SentimentUI = SentimentUI;
