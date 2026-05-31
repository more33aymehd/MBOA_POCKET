package com.mboapocket.mboapocket_app.payment;

import com.mboapocket.mboapocket_app.payment.dto.PaymentRequest;
import com.mboapocket.mboapocket_app.payment.dto.PaymentResponse;
import com.mboapocket.mboapocket_app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    ResponseEntity<PaymentResponse> initiate(@AuthenticationPrincipal User user,
                                             @RequestBody PaymentRequest req) {
        try {
            return ResponseEntity.ok(paymentService.initiate(user.getId(), req));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @GetMapping("/status/{reference}")
    ResponseEntity<Map<String, String>> status(@AuthenticationPrincipal User user,
                                               @PathVariable String reference) {
        try {
            String status = paymentService.checkStatus(reference, user.getId());
            return ResponseEntity.ok(Map.of("status", status));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @GetMapping("/history")
    ResponseEntity<List<PaymentResponse>> history(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.getHistory(user.getId()));
    }

    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<Map<String, String>> handleError(RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Erreur paiement"));
    }
}
