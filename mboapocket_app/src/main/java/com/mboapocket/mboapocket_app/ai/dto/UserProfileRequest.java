package com.mboapocket.mboapocket_app.ai.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class UserProfileRequest {
    private BigDecimal revenuMensuel;
    private String situation;       // salarie, commercant, fonctionnaire, autre
    private String foyer;           // seul, 2-3, 4-5, 6+
    private List<String> priorites; // epargne, alimentation, logement, sante
    private String loyer;           // non | montant en FCFA
    private String objectif;        // epargner, equilibrer, investir, rembourser
}
