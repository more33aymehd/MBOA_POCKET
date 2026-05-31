package com.mboapocket.mboapocket_app.tontine.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class TontineRequest {
    private String nom;
    private String description;
    private BigDecimal montantParTour;
    private String frequence;      // MENSUEL | HEBDOMADAIRE | BIMENSUEL
    private Integer nbTours;
    private List<String> membresEmails; // emails des membres invités
}
