package br.com.oracle.sentiment_api.service;

import br.com.oracle.sentiment_api.dto.SentimentRequest;
import br.com.oracle.sentiment_api.dto.SentimentResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SentimentService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.api.url}")
    private String mlApiUrl;

    public SentimentResponse analyze(@NotNull SentimentRequest request) {
        Map<String, String> payload = Map.of("text", request.text());

        try {
            System.out.println("Tentando conectar em: " + mlApiUrl);

            return restTemplate.postForObject(
                    mlApiUrl,
                    payload,
                    SentimentResponse.class
            );
        } catch (Exception e) {
            System.err.println("ERRO AO CONECTAR NA API PYTHON: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Falha na comunicação com serviço de IA", e);
        }
    }
}


