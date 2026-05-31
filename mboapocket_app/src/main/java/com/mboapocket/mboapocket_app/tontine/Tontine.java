package com.mboapocket.mboapocket_app.tontine;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tontines")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Tontine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long creatorId;

    @Column(nullable = false)
    private String nom;

    private String description;

    @Column(nullable = false)
    private BigDecimal montantParTour;

    @Column(nullable = false)
    private String frequence; // MENSUEL | HEBDOMADAIRE | BIMENSUEL

    @Column(nullable = false)
    private Integer nbTours;

    @Column(nullable = false)
    private Integer tourActuel;  // 1-based

    @Column(nullable = false)
    private String statut; // EN_ATTENTE | ACTIVE | TERMINEE

    @Column(nullable = false)
    private LocalDate dateCreation;

    @PrePersist
    void prePersist() {
        if (dateCreation == null) dateCreation = LocalDate.now();
        if (tourActuel == null) tourActuel = 1;
        if (statut == null) statut = "EN_ATTENTE";
    }
}
