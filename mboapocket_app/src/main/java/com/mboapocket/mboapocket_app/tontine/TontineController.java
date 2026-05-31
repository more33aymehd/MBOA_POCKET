package com.mboapocket.mboapocket_app.tontine;

import com.mboapocket.mboapocket_app.tontine.dto.*;
import com.mboapocket.mboapocket_app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tontines")
@RequiredArgsConstructor
public class TontineController {

    private final TontineService tontineService;

    @PostMapping
    ResponseEntity<TontineResponse> create(@AuthenticationPrincipal User user,
                                           @RequestBody TontineRequest request) {
        return ResponseEntity.ok(tontineService.create(user.getId(), request));
    }

    @GetMapping("/my")
    ResponseEntity<List<TontineResponse>> getMy(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tontineService.getMy(user.getId()));
    }

    @GetMapping("/{id}")
    ResponseEntity<TontineResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tontineService.getById(id));
    }

    @PostMapping("/{id}/join")
    ResponseEntity<TontineResponse> join(@AuthenticationPrincipal User user,
                                         @PathVariable Long id) {
        return ResponseEntity.ok(tontineService.join(id, user.getId()));
    }

    @PostMapping("/{id}/pay")
    ResponseEntity<TontinePaymentResponse> pay(@AuthenticationPrincipal User user,
                                               @PathVariable Long id,
                                               @RequestBody Map<String, Object> body) {
        BigDecimal montant = body.containsKey("montant")
                ? new BigDecimal(body.get("montant").toString()) : null;
        return ResponseEntity.ok(tontineService.pay(id, user.getId(), montant));
    }

    @PutMapping("/{id}/tour")
    ResponseEntity<TontineResponse> advanceTour(@AuthenticationPrincipal User user,
                                                @PathVariable Long id) {
        return ResponseEntity.ok(tontineService.advanceTour(id, user.getId()));
    }

    @ExceptionHandler({RuntimeException.class, IllegalArgumentException.class})
    ResponseEntity<Map<String, String>> handleError(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
