package com.mboapocket.mboapocket_app.user;

import com.mboapocket.mboapocket_app.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    ResponseEntity<UserProfileResponse> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user.getId()));
    }

    @PutMapping("/me")
    ResponseEntity<UserProfileResponse> updateMe(@AuthenticationPrincipal User user,
                                                  @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(user.getId(), req));
    }

    @PutMapping("/me/preferences")
    ResponseEntity<UserProfileResponse> updatePrefs(@AuthenticationPrincipal User user,
                                                     @RequestBody PreferencesRequest req) {
        return ResponseEntity.ok(userService.updatePreferences(user.getId(), req));
    }

    @PostMapping("/me/change-password")
    ResponseEntity<Map<String, String>> changePassword(@AuthenticationPrincipal User user,
                                                        @RequestBody ChangePasswordRequest req) {
        userService.changePassword(user.getId(), req);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }

    @DeleteMapping("/me")
    ResponseEntity<Map<String, String>> deleteAccount(@AuthenticationPrincipal User user) {
        userService.deleteAccount(user.getId());
        return ResponseEntity.ok(Map.of("message", "Compte supprimé"));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> handleError(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
