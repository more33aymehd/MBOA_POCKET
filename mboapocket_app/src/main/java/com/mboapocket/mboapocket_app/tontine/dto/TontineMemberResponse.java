package com.mboapocket.mboapocket_app.tontine.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class TontineMemberResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userNom;
    private Integer ordre;
    private Boolean aRecu;
    private String statutPaiementTourActuel; // PAYE | EN_ATTENTE
    private String montantDu;
}
