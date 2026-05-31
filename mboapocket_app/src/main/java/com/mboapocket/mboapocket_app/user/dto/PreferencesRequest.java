package com.mboapocket.mboapocket_app.user.dto;

import lombok.Data;

@Data
public class PreferencesRequest {
    private Boolean notificationsEnabled;
    private Boolean modeSombre;
    private Boolean partagerStats;
    private String langue;
}
