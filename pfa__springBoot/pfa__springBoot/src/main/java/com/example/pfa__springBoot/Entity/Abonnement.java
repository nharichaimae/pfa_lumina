package com.example.pfa__springBoot.Entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "abonnement")
@Getter @Setter
public class Abonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String stripeSubscriptionId;
    private String stripePriceId;
    private String stripeCustomerId;
    private boolean bloqueIA;


    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;
    private String statut;


    @OneToMany(mappedBy = "abonnement")
    private List<Paiement> paiements;

    @Column(nullable = false)
    private boolean bloqueManuel = false;

    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }


    public void setUserId(Long userId) {
        this.userId = userId;
    }
}