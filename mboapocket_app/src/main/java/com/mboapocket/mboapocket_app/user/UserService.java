package com.mboapocket.mboapocket_app.user;

import com.mboapocket.mboapocket_app.expense.ExpenseRepository;
import com.mboapocket.mboapocket_app.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final UserPreferencesRepository prefsRepo;
    private final ExpenseRepository expenseRepo;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        UserPreferences prefs = getOrCreatePrefs(userId);

        // Stats globales — dépenses totales de l'année
        LocalDate now = LocalDate.now();
        BigDecimal depenses = BigDecimal.ZERO;
        for (int m = 1; m <= now.getMonthValue(); m++) {
            BigDecimal d = expenseRepo.sumByUserAndMonth(userId, m, now.getYear());
            if (d != null) depenses = depenses.add(d);
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .depensesTotales(depenses)
                .epargneTotal(BigDecimal.ZERO) // calculé depuis budget si besoin
                .tauxBudgetRespect(78.0)       // mock — à affiner avec stats réelles
                .notificationsEnabled(prefs.getNotificationsEnabled())
                .modeSombre(prefs.getModeSombre())
                .partagerStats(prefs.getPartagerStats())
                .langue(prefs.getLangue())
                .build();
    }

    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        if (req.getNom() != null && !req.getNom().isBlank()) user.setNom(req.getNom().trim());
        if (req.getTelephone() != null) user.setTelephone(req.getTelephone().trim());
        userRepo.save(user);
        return getProfile(userId);
    }

    public UserProfileResponse updatePreferences(Long userId, PreferencesRequest req) {
        UserPreferences prefs = getOrCreatePrefs(userId);
        if (req.getNotificationsEnabled() != null) prefs.setNotificationsEnabled(req.getNotificationsEnabled());
        if (req.getModeSombre() != null) prefs.setModeSombre(req.getModeSombre());
        if (req.getPartagerStats() != null) prefs.setPartagerStats(req.getPartagerStats());
        if (req.getLangue() != null) prefs.setLangue(req.getLangue());
        prefsRepo.save(prefs);
        return getProfile(userId);
    }

    public void changePassword(Long userId, ChangePasswordRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit contenir au moins 8 caractères");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
    }

    public void deleteAccount(Long userId) {
        userRepo.deleteById(userId);
    }

    private UserPreferences getOrCreatePrefs(Long userId) {
        return prefsRepo.findByUserId(userId).orElseGet(() -> {
            UserPreferences p = UserPreferences.builder().userId(userId).build();
            return prefsRepo.save(p);
        });
    }
}
