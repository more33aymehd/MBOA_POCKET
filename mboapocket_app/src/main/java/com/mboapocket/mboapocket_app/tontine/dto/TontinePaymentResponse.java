package com.mboapocket.mboapocket_app.tontine.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder
public class TontinePaymentResponse {
    private Long id;
    private Long payerId;
    private String payerNom;
    private BigDecimal montant;
    private Integer tourNumero;
    private String statut;
    private LocalDate date;
}
