package com.example.pfa__springBoot.Repository;

import com.example.pfa__springBoot.Entity.Abonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository  // ✅ annotation manquante !
public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {

    List<Abonnement> findByUserId(Long userId);

    Optional<Abonnement> findByStripeSubscriptionId(String subscriptionId);

    // 🔥 Récupère le DERNIER abonnement du user
    // 🔹 Récupérer le dernier abonnement d’un utilisateur
    Optional<Abonnement> findTopByUserIdOrderByDateDebutDesc(Long userId);

    // 🔹 Récupérer tous les userId distincts pour vérification automatique
    @Query("SELECT DISTINCT a.userId FROM Abonnement a")
    List<Long> findDistinctUserIds();    // ✅ findByStripeSubscriptionId supprimé car champ absent dans l'entité



    // Méthode pour récupérer l'abonnement actif le plus récent
    default Abonnement findActiveByUserId(Long userId) {
        return findByUserId(userId).stream()
                .max((a1, a2) -> a1.getDateFin().compareTo(a2.getDateFin()))
                .orElse(null);
    }}