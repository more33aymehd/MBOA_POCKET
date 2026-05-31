package com.mboapocket.mboapocket_app.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_preferences")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserPreferences {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    private Boolean notificationsEnabled;
    private Boolean modeSombre;
    private Boolean partagerStats;
    private String langue;  // fr | en

    @PrePersist
    void defaults() {
        if (notificationsEnabled == null) notificationsEnabled = true;
        if (modeSombre == null) modeSombre = false;
        if (partagerStats == null) partagerStats = false;
        if (langue == null) langue = "fr";
    }
}
