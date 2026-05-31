package com.mboapocket.mboapocket_app.budget;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "mois", "annee"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "montant_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal montantTotal;

    @Column(name = "objectif_epargne", precision = 15, scale = 2)
    private BigDecimal objectifEpargne;

    @Column(nullable = false)
    private Integer mois;

    @Column(nullable = false)
    private Integer annee;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    void prePersist() {
        dateCreation = LocalDateTime.now();
    }
}
