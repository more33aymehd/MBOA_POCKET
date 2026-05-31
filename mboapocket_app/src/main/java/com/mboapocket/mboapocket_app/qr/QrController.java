package com.mboapocket.mboapocket_app.qr;

import com.mboapocket.mboapocket_app.qr.dto.QrDecodeRequest;
import com.mboapocket.mboapocket_app.qr.dto.QrDecodeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QrController {

    private final QrService qrService;

    @PostMapping("/decode")
    ResponseEntity<QrDecodeResponse> decode(@RequestBody QrDecodeRequest request) {
        try {
            return ResponseEntity.ok(qrService.decode(request));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<Map<String, String>> handleError(RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
