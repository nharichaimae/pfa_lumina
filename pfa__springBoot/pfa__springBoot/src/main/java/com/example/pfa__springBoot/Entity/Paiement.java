package com.example.pfa__springBoot.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "paiement")
@Getter
@Setter
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double montant;
    private Long userId;

    @Column(name = "stripe_payment_intent_id", unique = true)
    private String stripePaymentIntentId;

    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;

    private String statut; // SUCCESS / FAILED

    @ManyToOne(optional = true)
    @JoinColumn(name = "abonnement_id", nullable = true)
    private Abonnement abonnement;

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public void setAbonnement(Abonnement abonnement) {
        this.abonnement = abonnement;
    }
}