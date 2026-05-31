package com.mboapocket.mboapocket_app.notification;

import com.mboapocket.mboapocket_app.notification.dto.NotificationResponse;
import com.mboapocket.mboapocket_app.notification.dto.RegisterTokenRequest;
import com.mboapocket.mboapocket_app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    ResponseEntity<List<NotificationResponse>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(notificationService.getAll(user.getId(), type));
    }

    @GetMapping("/unread-count")
    ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getStats(user.getId()));
    }

    @PutMapping("/{id}/read")
    ResponseEntity<NotificationResponse> markRead(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id, user.getId()));
    }

    @PutMapping("/read-all")
    ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User user) {
        notificationService.markAllRead(user.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        notificationService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/device-token")
    ResponseEntity<Void> registerToken(
            @AuthenticationPrincipal User user,
            @RequestBody RegisterTokenRequest req) {
        notificationService.registerToken(user.getId(), req.getPushToken());
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
