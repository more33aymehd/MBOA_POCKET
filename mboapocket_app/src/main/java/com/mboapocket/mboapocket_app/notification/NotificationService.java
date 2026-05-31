package com.mboapocket.mboapocket_app.notification;

import com.mboapocket.mboapocket_app.notification.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final ExpoPushService expoPushService;

    public void create(Long userId, String type, String titre, String message, String dataId) {
        notificationRepository.save(Notification.builder()
                .userId(userId)
                .type(type)
                .titre(titre)
                .message(message)
                .dataId(dataId)
                .lue(false)
                .date(LocalDateTime.now())
                .build());
    }

    public void createAndPush(Long userId, String type, String titre, String message, String dataId) {
        create(userId, type, titre, message, dataId);
        List<String> tokens = deviceTokenRepository.findByUserId(userId)
                .stream().map(DeviceToken::getPushToken).toList();
        if (!tokens.isEmpty()) {
            expoPushService.sendToMany(tokens, titre, message, Map.of("type", type, "dataId", dataId != null ? dataId : ""));
        }
    }

    public List<NotificationResponse> getAll(Long userId, String type) {
        List<Notification> notifs = type != null && !type.isBlank()
                ? notificationRepository.findByUserIdAndTypeOrderByDateDesc(userId, type)
                : notificationRepository.findByUserIdOrderByDateDesc(userId);
        return notifs.stream().map(this::toResponse).toList();
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndLueFalse(userId);
    }

    public NotificationResponse markRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .filter(notif -> notif.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable"));
        n.setLue(true);
        return toResponse(notificationRepository.save(n));
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    public void delete(Long id, Long userId) {
        notificationRepository.findById(id)
                .filter(n -> n.getUserId().equals(userId))
                .ifPresent(notificationRepository::delete);
    }

    public void registerToken(Long userId, String pushToken) {
        DeviceToken token = deviceTokenRepository.findByPushToken(pushToken)
                .orElse(DeviceToken.builder().pushToken(pushToken).build());
        token.setUserId(userId);
        deviceTokenRepository.save(token);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .titre(n.getTitre())
                .message(n.getMessage())
                .dataId(n.getDataId())
                .lue(n.getLue())
                .date(n.getDate())
                .build();
    }

    public Map<String, Long> getStats(Long userId) {
        return Map.of("nonLues", countUnread(userId));
    }
}
