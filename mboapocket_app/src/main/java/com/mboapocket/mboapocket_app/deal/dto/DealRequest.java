package com.mboapocket.mboapocket_app.deal.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DealRequest {
    private String titre;
    private String description;
    private String categorie;
    private String icone;
    private Double latitude;
    private Double longitude;
    private Integer rayon;
    private LocalDate expiration;
    private String reduction;
    private Double rating;
    private Integer nbAvis;
    private String adresse;
}
