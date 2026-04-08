package com.example.pfa__springBoot.Service;

import com.example.pfa__springBoot.Entity.Abonnement;
import com.example.pfa__springBoot.Repository.AbonnementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@SpringBootApplication(scanBasePackages = "com.example.pfa__springBoot")
@EnableScheduling
public class BloqueService {

    private final AbonnementRepository abonnementRepository;
    private final NotificationService notificationService;

    // 🔹 Méthode automatique (chaque jour)
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
                last.setStatut("INACTIF");
                abonnementRepository.save(last);
                continue;
            }

            // 🔍 Blocage automatique
            LocalDate dateGraceFin = last.getDateFin().plusDays(7);

            if (today.isAfter(dateGraceFin)) {
                last.setStatut("INACTIF");
            } else {
                last.setStatut("ACTIF");
            }

            abonnementRepository.save(last);
        }
    }

    // 🔹 Vérifier si user bloqué
    public boolean isBlocked(Long userId) {

        Abonnement last = abonnementRepository
                .findTopByUserIdOrderByDateDebutDesc(userId)
                .orElse(null);

        if (last == null) return true;

        // 🔴 blocage manuel
        if (last.isBloqueManuel()) {
            return true;
        }

        // 🔍 blocage automatique
        LocalDate dateGraceFin = last.getDateFin().plusDays(7);

        return LocalDate.now().isAfter(dateGraceFin);
    }

    // Scheduler : chaque jour à 9h
    @Scheduled(cron = "0 0 9 * * ?")
    public void notifierSemaineDeGrace() {
        List<Abonnement> abonnements = abonnementRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Abonnement ab : abonnements) {
            // On ne s’intéresse qu’aux abonnements ACTIFS
            if ("ACTIF".equals(ab.getStatut())) {
                LocalDate dateFin = ab.getDateFin();
                long joursRestantsGrace = ChronoUnit.DAYS.between(today, dateFin.plusDays(7));

                // Envoyer email uniquement pendant la semaine de grâce (0 à 6 jours restants)
                if (joursRestantsGrace >= 0 && joursRestantsGrace <= 6) {
                    String to = ab.getEmail();
                    if (to != null && !to.isEmpty()) {
                        String subject = "Rappel : paiement de votre abonnement";
                        String body = "Bonjour, votre abonnement a expiré le " + dateFin +
                                ". Vous êtes en période de grâce. Merci d'effectuer le paiement dans les " +
                                joursRestantsGrace + " jours pour éviter le blocage.";
                        log.info("Envoi email à : {}", to);
                        notificationService.envoyerEmail(to, subject, body);
                        System.out.println("Email envoyé à : " + to); // pour debug
                    }
                }
            }
        }
    }
}