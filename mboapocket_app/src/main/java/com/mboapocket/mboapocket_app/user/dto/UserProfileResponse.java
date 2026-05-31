package com.mboapocket.mboapocket_app.user.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class UserProfileResponse {
    private Long id;
    private String nom;
    private String email;
    private String telephone;
    // Stats globales
    private BigDecimal depensesTotales;
    private BigDecimal epargneTotal;
    private Double tauxBudgetRespect; // % des mois avec budget respecté
    // Préférences
    private Boolean notificationsEnabled;
    private Boolean modeSombre;
    private Boolean partagerStats;
    private String langue;
}
