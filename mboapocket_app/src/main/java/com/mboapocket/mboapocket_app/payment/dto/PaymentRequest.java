package com.mboapocket.mboapocket_app.payment.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long categoryId;
    private BigDecimal montant;
    private String methode;       // ORANGE_MONEY | MTN_MOMO | CASH | MOCK
    private String phoneFrom;     // numéro mobile money du payeur (ex: 237690000000)
    private String merchantName;
    private String description;
}
