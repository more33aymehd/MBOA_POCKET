package com.mboapocket.mboapocket_app.tontine;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tontine_members")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TontineMember {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long tontineId;

    private Long userId;       // null si invité non encore inscrit

    @Column(nullable = false)
    private String userEmail;

    private String userNom;

    @Column(nullable = false)
    private Integer ordre;     // ordre de passage pour recevoir

    private Boolean aRecu;    // a-t-il déjà reçu le pot ?

    @Column(nullable = false)
    private LocalDate dateAdhesion;

    @PrePersist
    void prePersist() {
        if (dateAdhesion == null) dateAdhesion = LocalDate.now();
        if (aRecu == null) aRecu = false;
    }
}
