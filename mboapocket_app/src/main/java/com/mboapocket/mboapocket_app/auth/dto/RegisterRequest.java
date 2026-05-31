package com.mboapocket.mboapocket_app.auth.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nom;
    private String email;
    private String telephone;
    private String password;
}
