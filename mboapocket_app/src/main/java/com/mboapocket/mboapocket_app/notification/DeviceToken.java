package com.mboapocket.mboapocket_app.notification;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_tokens")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DeviceToken {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String pushToken; // ExponentPushToken[...]

    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}
