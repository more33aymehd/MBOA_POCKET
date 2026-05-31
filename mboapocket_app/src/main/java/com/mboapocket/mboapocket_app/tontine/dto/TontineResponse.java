package com.mboapocket.mboapocket_app.tontine.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data @Builder
public class TontineResponse {
    private Long id;
    private Long creatorId;
    private String nom;
    private String description;
    private BigDecimal montantParTour;
    private String frequence;
    private Integer nbTours;
    private Integer tourActuel;
    private String statut;
    private LocalDate dateCreation;
    private int nbMembres;
    private BigDecimal totalParTour;   // montantParTour × nbMembres
    private List<TontineMemberResponse> membres;
    private List<TontinePaymentResponse> paiements;
    private String prochainBeneficiaire; // nom du prochain à recevoir
}
