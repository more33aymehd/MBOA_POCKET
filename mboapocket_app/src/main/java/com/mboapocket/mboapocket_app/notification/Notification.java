package com.mboapocket.mboapocket_app.notification;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String type; // PAIEMENT | BUDGET | TONTINE | DEAL | CASH | SYSTEM

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false)
    private String message;

    private String dataId;      // id de l'entité liée (paiement, tontine, etc.)

    private Boolean lue;

    @Column(nullable = false)
    private LocalDateTime date;

    @PrePersist
    void defaults() {
        if (lue == null) lue = false;
        if (date == null) date = LocalDateTime.now();
    }
}
