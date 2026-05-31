package com.mboapocket.mboapocket_app.qr.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QrDecodeResponse {
    private String merchant;        // nom du marchand
    private String merchantCode;    // code / numéro marchand
    private Integer suggestedAmount; // montant suggéré (null si absent)
    private String method;          // ORANGE_MONEY | MTN_MOMO | MOCK
    private String phoneNumber;     // numéro de téléphone (si présent)
}
