package com.mboapocket.mboapocket_app.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CamPayService {

    @Value("${campay.base-url}")
    private String baseUrl;

    @Value("${campay.token}")
    private String token;

    @Value("${campay.mock}")
    private boolean mockMode;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public record CollectResult(String reference, String status) {}

    /** Initie un paiement mobile money. Retourne la référence + statut initial. */
    public CollectResult collect(String phoneFrom, java.math.BigDecimal amount,
                                  String description, String externalRef)
            throws IOException, InterruptedException {

        if (mockMode) {
            // Mock simulator : succès immédiat, référence simulée
            String mockRef = "MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            return new CollectResult(mockRef, "SUCCESSFUL");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("amount", amount.toPlainString());
        body.put("currency", "XAF");
        body.put("from", phoneFrom);
        body.put("description", description);
        body.put("external_reference", externalRef);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/collect/"))
                .header("Authorization", "Token " + token)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode node = mapper.readTree(response.body());

        if (response.statusCode() != 200) {
            throw new RuntimeException("CAM PAY erreur: " + node.path("detail").asText(response.body()));
        }

        String ref = node.path("reference").asText();
        String status = node.path("status").asText("PENDING");
        return new CollectResult(ref, status);
    }

    /** Vérifie le statut d'une transaction. */
    public String checkStatus(String reference) throws IOException, InterruptedException {
        if (mockMode || reference.startsWith("MOCK-")) {
            return "SUCCESSFUL";
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/transaction/" + reference + "/"))
                .header("Authorization", "Token " + token)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode node = mapper.readTree(response.body());
        return node.path("status").asText("PENDING");
    }
}
