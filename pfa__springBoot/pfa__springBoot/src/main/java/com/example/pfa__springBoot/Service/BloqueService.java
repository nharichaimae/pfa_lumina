package com.example.pfa__springBoot.Service;

import com.example.pfa__springBoot.Entity.Abonnement;
import com.example.pfa__springBoot.Interface.BloqueInterface;
import com.example.pfa__springBoot.Repository.AbonnementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BloqueService implements BloqueInterface {

    private final AbonnementRepository abonnementRepository;
    private final NotificationService notificationService;

    // 🔹 Vérification automatique chaque jour (minuit)
    @Scheduled(cron = "0 0 0 * * ?")
    public void verifierTousLesAbonnements() {

        List<Long> userIds = abonnementRepository.findDistinctUserIds();
        LocalDate today = LocalDate.now();

        for (Long userId : userIds) {

            Abonnement last = abonnementRepository
                    .findTopByUserIdOrderByDateDebutDesc(userId)
                    .orElse(null);

            if (last == null) continue;

            // 🔴 PRIORITÉ : blocage manuel
            if (last.isBloqueManuel()) {
                last.setBloqueIA(true);
                abonnementRepository.save(last);
                continue;
            }

            // 🔍 Blocage automatique (après 7 jours de grâce)
            LocalDate dateGraceFin = last.getDateFin().plusDays(7);

            if (today.isAfter(dateGraceFin)) {
                last.setBloqueIA(true);   // ❌ bloque فقط IA
            } else {
                last.setBloqueIA(false);  // ✅ IA autorisée
            }

            abonnementRepository.save(last);
        }
    }

    // 🔹 Vérifier si l'utilisateur est bloqué pour IA
    @Override
    public boolean isBlockedForIA(Long userId) {

        Abonnement last = abonnementRepository
                .findTopByUserIdOrderByDateDebutDesc(userId)
                .orElse(null);

        if (last == null) return true;

        // blocage manuel
        if (last.isBloqueManuel()) return true;

        return last.isBloqueIA();
    }

    // 🔹 Notifications pendant la semaine de grâce (9h chaque jour)
    @Scheduled(cron = "0 0 9 * * ?")
    public void notifierSemaineDeGrace() {

        List<Abonnement> abonnements = abonnementRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Abonnement ab : abonnements) {

            // seulement abonnements ACTIFS
            if ("ACTIF".equals(ab.getStatut())) {

                LocalDate dateFin = ab.getDateFin();
                long joursRestantsGrace =
                        ChronoUnit.DAYS.between(today, dateFin.plusDays(7));

                // entre 0 et 6 jours
                if (joursRestantsGrace >= 0 && joursRestantsGrace <= 6) {

                    String to = ab.getEmail();

                    if (to != null && !to.isEmpty()) {

                        String subject = "Rappel : paiement de votre abonnement";

                        String body = "Bonjour, votre abonnement a expiré le " + dateFin +
                                ". Vous êtes en période de grâce. Merci d'effectuer le paiement dans les " +
                                joursRestantsGrace +
                                " jours pour éviter le blocage du service IA.";

                        log.info("Envoi email à : {}", to);

                        notificationService.envoyerEmail(to, subject, body);
                    }
                }
            }
        }
    }
}