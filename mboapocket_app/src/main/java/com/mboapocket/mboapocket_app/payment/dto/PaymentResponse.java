package com.mboapocket.mboapocket_app.payment.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private BigDecimal montant;
    private String methode;
    private String statut;
    private String reference;
    private String merchantName;
    private String categoryNom;
    private String categoryIcone;
    private LocalDateTime dateCreation;
}
