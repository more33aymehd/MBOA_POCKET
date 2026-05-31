package com.mboapocket.mboapocket_app.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String titre;
    private String message;
    private String dataId;
    private Boolean lue;
    private LocalDateTime date;
}
