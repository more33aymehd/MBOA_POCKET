package com.mboapocket.mboapocket_app.category;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Category {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String nom;

    private String icone;
    private String couleur;

    @Column(name = "montant_alloue", nullable = false)
    private java.math.BigDecimal montantAlloue;
}
