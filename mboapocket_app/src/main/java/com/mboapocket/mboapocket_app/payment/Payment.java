package com.mboapocket.mboapocket_app.payment;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false)
    private String methode; // ORANGE_MONEY | MTN_MOMO | CASH | MOCK

    @Column(nullable = false)
    private String statut; // PENDING | SUCCESSFUL | FAILED

    private String reference;
    private String phoneFrom;

    @Column(name = "merchant_name")
    private String merchantName;

    private String description;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    void prePersist() { dateCreation = LocalDateTime.now(); }
}
