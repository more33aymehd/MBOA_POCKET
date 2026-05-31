package com.mboapocket.mboapocket_app.tontine;

import com.mboapocket.mboapocket_app.tontine.dto.*;
import com.mboapocket.mboapocket_app.user.User;
import com.mboapocket.mboapocket_app.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TontineService {

    private final TontineRepository tontineRepo;
    private final TontineMemberRepository memberRepo;
    private final TontinePaymentRepository paymentRepo;
    private final UserRepository userRepo;

    public TontineResponse create(Long creatorId, TontineRequest req) {
        User creator = userRepo.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        Tontine tontine = Tontine.builder()
                .creatorId(creatorId)
                .nom(req.getNom())
                .description(req.getDescription())
                .montantParTour(req.getMontantParTour())
                .frequence(req.getFrequence() != null ? req.getFrequence() : "MENSUEL")
                .nbTours(req.getNbTours() != null ? req.getNbTours() : 10)
                .tourActuel(1)
                .statut("ACTIVE")
                .dateCreation(LocalDate.now())
                .build();

        tontine = tontineRepo.save(tontine);

        // Ajouter le créateur comme premier membre
        int ordre = 1;
        TontineMember creatorMember = TontineMember.builder()
                .tontineId(tontine.getId())
                .userId(creatorId)
                .userEmail(creator.getEmail())
                .userNom(creator.getNom())
                .ordre(ordre++)
                .aRecu(false)
                .dateAdhesion(LocalDate.now())
                .build();
        memberRepo.save(creatorMember);

        // Ajouter les membres invités
        if (req.getMembresEmails() != null) {
            for (String email : req.getMembresEmails()) {
                if (email.equalsIgnoreCase(creator.getEmail())) continue;
                Optional<User> userOpt = userRepo.findByEmail(email);
                TontineMember member = TontineMember.builder()
                        .tontineId(tontine.getId())
                        .userId(userOpt.map(User::getId).orElse(null))
                        .userEmail(email)
                        .userNom(userOpt.map(User::getNom).orElse(email.split("@")[0]))
                        .ordre(ordre++)
                        .aRecu(false)
                        .dateAdhesion(LocalDate.now())
                        .build();
                memberRepo.save(member);
            }
        }

        return toResponse(tontine, true);
    }

    public TontineResponse join(Long tontineId, Long userId) {
        Tontine tontine = tontineRepo.findById(tontineId)
                .orElseThrow(() -> new IllegalArgumentException("Tontine introuvable"));
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        // Vérifier si déjà membre (via email ou userId)
        Optional<TontineMember> existing = memberRepo.findByTontineIdAndUserId(tontineId, userId);
        if (existing.isPresent()) throw new IllegalArgumentException("Vous êtes déjà membre de cette tontine");

        // Vérifier si invité par email → mettre à jour
        Optional<TontineMember> invited = memberRepo.findByTontineIdAndUserEmail(tontineId, user.getEmail());
        if (invited.isPresent()) {
            TontineMember m = invited.get();
            m.setUserId(userId);
            m.setUserNom(user.getNom());
            memberRepo.save(m);
        } else {
            long count = memberRepo.countByTontineId(tontineId);
            TontineMember member = TontineMember.builder()
                    .tontineId(tontineId)
                    .userId(userId)
                    .userEmail(user.getEmail())
                    .userNom(user.getNom())
                    .ordre((int) count + 1)
                    .aRecu(false)
                    .dateAdhesion(LocalDate.now())
                    .build();
            memberRepo.save(member);
        }

        return toResponse(tontine, true);
    }

    public TontinePaymentResponse pay(Long tontineId, Long userId, BigDecimal montant) {
        Tontine tontine = tontineRepo.findById(tontineId)
                .orElseThrow(() -> new IllegalArgumentException("Tontine introuvable"));

        TontineMember member = memberRepo.findByTontineIdAndUserId(tontineId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Vous n'êtes pas membre de cette tontine"));

        // Vérifier si déjà payé ce tour
        Optional<TontinePayment> alreadyPaid = paymentRepo
                .findByTontineIdAndPayerIdAndTourNumero(tontineId, userId, tontine.getTourActuel());
        if (alreadyPaid.isPresent() && "PAYE".equals(alreadyPaid.get().getStatut())) {
            throw new IllegalArgumentException("Vous avez déjà payé pour ce tour");
        }

        User user = userRepo.findById(userId).orElseThrow();

        TontinePayment payment = TontinePayment.builder()
                .tontineId(tontineId)
                .payerId(userId)
                .payerNom(user.getNom())
                .montant(montant != null ? montant : tontine.getMontantParTour())
                .tourNumero(tontine.getTourActuel())
                .statut("PAYE")
                .date(LocalDate.now())
                .build();

        payment = paymentRepo.save(payment);
        return toPaymentResponse(payment);
    }

    public TontineResponse advanceTour(Long tontineId, Long userId) {
        Tontine tontine = tontineRepo.findById(tontineId)
                .orElseThrow(() -> new IllegalArgumentException("Tontine introuvable"));

        if (!tontine.getCreatorId().equals(userId)) {
            throw new IllegalArgumentException("Seul le créateur peut avancer le tour");
        }

        List<TontineMember> membres = memberRepo.findByTontineIdOrderByOrdre(tontineId);
        // Marquer le bénéficiaire actuel comme ayant reçu
        int tourIdx = tontine.getTourActuel() - 1;
        if (tourIdx < membres.size()) {
            TontineMember benef = membres.get(tourIdx);
            benef.setARecu(true);
            memberRepo.save(benef);
        }

        if (tontine.getTourActuel() >= tontine.getNbTours()) {
            tontine.setStatut("TERMINEE");
        } else {
            tontine.setTourActuel(tontine.getTourActuel() + 1);
        }

        tontine = tontineRepo.save(tontine);
        return toResponse(tontine, true);
    }

    public List<TontineResponse> getMy(Long userId) {
        Set<Long> ids = new HashSet<>();
        List<Tontine> result = new ArrayList<>();

        tontineRepo.findByCreatorId(userId).forEach(t -> {
            if (ids.add(t.getId())) result.add(t);
        });
        tontineRepo.findByMemberUserId(userId).forEach(t -> {
            if (ids.add(t.getId())) result.add(t);
        });

        result.sort(Comparator.comparing(Tontine::getDateCreation).reversed());
        return result.stream().map(t -> toResponse(t, false)).collect(Collectors.toList());
    }

    public TontineResponse getById(Long tontineId) {
        Tontine tontine = tontineRepo.findById(tontineId)
                .orElseThrow(() -> new IllegalArgumentException("Tontine introuvable"));
        return toResponse(tontine, true);
    }

    // ── Mappers ──

    private TontineResponse toResponse(Tontine t, boolean withDetails) {
        List<TontineMember> membres = memberRepo.findByTontineIdOrderByOrdre(t.getId());
        List<TontinePayment> paymentsThisTour = paymentRepo
                .findByTontineIdAndTourNumero(t.getId(), t.getTourActuel());

        Set<Long> payersThisTour = paymentsThisTour.stream()
                .filter(p -> "PAYE".equals(p.getStatut()))
                .map(TontinePayment::getPayerId)
                .collect(Collectors.toSet());

        // Prochain bénéficiaire (ordre == tourActuel, n'a pas encore reçu)
        String prochainBenef = membres.stream()
                .filter(m -> m.getOrdre() == t.getTourActuel() && !Boolean.TRUE.equals(m.getARecu()))
                .map(TontineMember::getUserNom)
                .findFirst()
                .orElse("—");

        BigDecimal totalParTour = t.getMontantParTour()
                .multiply(BigDecimal.valueOf(membres.size()));

        List<TontineMemberResponse> membresResp = withDetails ? membres.stream().map(m -> {
            String statutPaiement = payersThisTour.contains(m.getUserId()) ? "PAYE" : "EN_ATTENTE";
            return TontineMemberResponse.builder()
                    .id(m.getId())
                    .userId(m.getUserId())
                    .userEmail(m.getUserEmail())
                    .userNom(m.getUserNom())
                    .ordre(m.getOrdre())
                    .aRecu(m.getARecu())
                    .statutPaiementTourActuel(statutPaiement)
                    .montantDu(statutPaiement.equals("EN_ATTENTE")
                            ? t.getMontantParTour().toPlainString() + " FCFA" : null)
                    .build();
        }).collect(Collectors.toList()) : null;

        List<TontinePaymentResponse> paiementsResp = withDetails
                ? paymentRepo.findByTontineIdOrderByDateDesc(t.getId()).stream()
                .map(this::toPaymentResponse).collect(Collectors.toList())
                : null;

        return TontineResponse.builder()
                .id(t.getId())
                .creatorId(t.getCreatorId())
                .nom(t.getNom())
                .description(t.getDescription())
                .montantParTour(t.getMontantParTour())
                .frequence(t.getFrequence())
                .nbTours(t.getNbTours())
                .tourActuel(t.getTourActuel())
                .statut(t.getStatut())
                .dateCreation(t.getDateCreation())
                .nbMembres(membres.size())
                .totalParTour(totalParTour)
                .prochainBeneficiaire(prochainBenef)
                .membres(membresResp)
                .paiements(paiementsResp)
                .build();
    }

    private TontinePaymentResponse toPaymentResponse(TontinePayment p) {
        return TontinePaymentResponse.builder()
                .id(p.getId())
                .payerId(p.getPayerId())
                .payerNom(p.getPayerNom())
                .montant(p.getMontant())
                .tourNumero(p.getTourNumero())
                .statut(p.getStatut())
                .date(p.getDate())
                .build();
    }
}
