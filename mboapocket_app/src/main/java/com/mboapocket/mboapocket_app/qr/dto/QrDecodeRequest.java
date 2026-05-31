package com.mboapocket.mboapocket_app.qr.dto;

import lombok.Data;

@Data
public class QrDecodeRequest {
    private String content;   // contenu du QR ou numéro marchand saisi
}
