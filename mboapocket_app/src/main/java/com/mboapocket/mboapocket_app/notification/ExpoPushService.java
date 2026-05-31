package com.mboapocket.mboapocket_app.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ExpoPushService {

    private final RestClient restClient;

    public ExpoPushService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://exp.host")
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Accept-Encoding", "gzip, deflate")
                .build();
    }

    public void send(String pushToken, String title, String body, Map<String, String> data) {
        if (pushToken == null || !pushToken.startsWith("ExponentPushToken")) return;
        try {
            var payload = Map.of(
                    "to", pushToken,
                    "title", title,
                    "body", body,
                    "data", data != null ? data : Map.of(),
                    "sound", "default",
                    "priority", "high"
            );
            restClient.post()
                    .uri("/api/v2/push/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Push Expo échoué pour token {}: {}", pushToken, e.getMessage());
        }
    }

    public void sendToMany(List<String> pushTokens, String title, String body, Map<String, String> data) {
        pushTokens.stream()
                .filter(t -> t != null && t.startsWith("ExponentPushToken"))
                .forEach(t -> send(t, title, body, data));
    }
}
