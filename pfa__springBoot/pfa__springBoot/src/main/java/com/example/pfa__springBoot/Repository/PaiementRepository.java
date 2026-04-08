package com.example.pfa__springBoot.Repository;

import com.example.pfa__springBoot.Entity.Abonnement;
import com.example.pfa__springBoot.Entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    // 🔹 Récupérer tous les paiements d'un utilisateur, qu'ils soient One-Shot ou abonnements
    @Query("SELECT p FROM Paiement p WHERE p.userId = :userId ORDER BY p.datePaiement DESC")
    List<Paiement> findByUserId(@Param("userId") Long userId);

    // 🔹 Retrouver un paiement par stripePaymentIntentId
    Optional<Paiement> findByStripePaymentIntentId(String stripePaymentIntentId);

    // 🔹 Retrouver le dernier paiement réussi d'un abonnement
    Optional<Paiement> findTopByAbonnementAndStatut(Abonnement abonnement, String statut);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Paiement p WHERE p.abonnement.id = :abonnementId AND p.statut = :statut")
    boolean existsByAbonnementIdAndStatut(@Param("abonnementId") Long abonnementId, @Param("statut") String statut);

}