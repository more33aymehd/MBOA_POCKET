package com.mboapocket.mboapocket_app.deal.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data @Builder
public class DealResponse {
    private Long id;
    private String titre;
    private String description;
    private String categorie;
    private String icone;
    private Double latitude;
    private Double longitude;
    private String reduction;
    private LocalDate expiration;
    private Double rating;
    private Integer nbAvis;
    private String adresse;
    private Double distanceKm;   // calculée dynamiquement
}
