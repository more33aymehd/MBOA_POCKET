package com.mboapocket.mboapocket_app.deal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "deals")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Deal {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String description;   // ex: "Réduction 20% après 18h"

    @Column(nullable = false)
    private String categorie;     // RESTOS | SHOPPING | SERVICES | SANTE

    private String icone;         // emoji

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Integer rayon;        // rayon en mètres

    private LocalDate expiration;

    private String reduction;     // texte libre: "20%", "3x2", etc.

    private Double rating;

    private Integer nbAvis;

    private String adresse;
}
