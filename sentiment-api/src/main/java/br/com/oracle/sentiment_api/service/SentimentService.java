package br.com.oracle.sentiment_api.service;

import br.com.oracle.sentiment_api.dto.SentimentRequest;
import br.com.oracle.sentiment_api.dto.SentimentResponse;
import jakarta.validation.constraints.NotNull;
import lombok.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SentimentService {

    private final RestTemplate restTemplate = new RestTemplate();

    // quando rodar localmente
    private final String DS_API_URL = "https://api-python-wymy.onrender.com/predict";

    public SentimentResponse analyze( @NotNull SentimentRequest request) {
        Map<String, String> payload = Map.of("text", request.text());

        try {
            System.out.println("Tentando conectar em: " + DS_API_URL); // Log de debug

            return restTemplate.postForObject(
                    DS_API_URL,
                    payload,
                    SentimentResponse.class
            );
        } catch (Exception e) {
            // Isso vai imprimir o erro REAL no console/logs da nuvem
            System.err.println("ERRO AO CONECTAR NA API PYTHON: " + e.getMessage());
            e.printStackTrace();

            // Retorna um erro genérico ou relança para o Controller tratar
            throw new RuntimeException("Falha na comunicação com serviço de IA", e);
        }
    }
}

