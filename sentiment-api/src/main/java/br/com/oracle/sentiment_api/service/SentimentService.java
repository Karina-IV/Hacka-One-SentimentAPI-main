package br.com.oracle.sentiment_api.service;

import br.com.oracle.sentiment_api.dto.SentimentRequest;
import br.com.oracle.sentiment_api.dto.SentimentResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.Map;

@Service
public class SentimentService {

    private final RestTemplate restTemplate;

    @Value("${ml.api.url}")
    private String mlApiUrl;

    public SentimentService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000); // 5s para conectar
        factory.setReadTimeout(15_000);   // 15s para resposta

        this.restTemplate = new RestTemplate(factory);
    }

    public SentimentResponse analyze(@NotNull SentimentRequest request) {
        Map<String, String> payload = Map.of("text", request.text());

        System.out.println("➡️ Chamando serviço de IA em: " + mlApiUrl);

        try {
            return restTemplate.postForObject(
                    mlApiUrl,
                    payload,
                    SentimentResponse.class
            );

        } catch (HttpClientErrorException.TooManyRequests e) {
            // Render Free: serviço acordando / rate limit
            System.err.println("⚠️ IA ocupada (429). Aguardando e tentando novamente...");
            sleep(3_000);

            try {
                return restTemplate.postForObject(
                        mlApiUrl,
                        payload,
                        SentimentResponse.class
                );
            } catch (Exception retryError) {
                throw new RuntimeException(
                        "Serviço de IA temporariamente indisponível. Tente novamente em alguns segundos."
                );
            }

        } catch (ResourceAccessException e) {
            // Timeout ou conexão recusada
            throw new RuntimeException(
                    "Não foi possível conectar ao serviço de IA. Aguarde alguns segundos e tente novamente."
            );

        } catch (Exception e) {
            System.err.println("❌ Erro inesperado ao chamar IA: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(
                    "Erro interno ao processar a análise de sentimento."
            );
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }
}



