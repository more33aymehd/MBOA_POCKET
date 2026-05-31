package com.mboapocket.mboapocket_app.tontine;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tontine_payments")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TontinePayment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long tontineId;

    @Column(nullable = false)
    private Long payerId;

    private String payerNom;

    @Column(nullable = false)
    private BigDecimal montant;

    @Column(nullable = false)
    private Integer tourNumero;

    @Column(nullable = false)
    private String statut; // PAYE | EN_ATTENTE

    @Column(nullable = false)
    private LocalDate date;

    @PrePersist
    void prePersist() {
        if (date == null) date = LocalDate.now();
    }
}
