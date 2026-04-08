package com.example.pfa__springBoot.Service;

import com.example.pfa__springBoot.Entity.Abonnement;
import com.example.pfa__springBoot.Entity.Paiement;
import com.example.pfa__springBoot.Repository.AbonnementRepository;
import com.example.pfa__springBoot.Repository.PaiementRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Customer;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Transactional
public class StripePaymentService {

    private final PaiementRepository paiementRepository;
    private final AbonnementRepository abonnementRepository;

    public StripePaymentService(PaiementRepository paiementRepository, AbonnementRepository abonnementRepository) {
        this.paiementRepository = paiementRepository;
        this.abonnementRepository = abonnementRepository;
    }

    // ----------------------
    // Paiement One-Shot
    // ----------------------
    public PaymentIntent createOneShotPayment(Long userId, double montant) throws StripeException {
        System.out.println("Création One-Shot payment pour userId = " + userId + ", montant = " + montant);

        // 1️⃣ Créer le PaymentIntent Stripe
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (montant * 100))
                .setCurrency("MAD")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // 2️⃣ Créer le Paiement en base avec ID Stripe
        Paiement paiement = new Paiement();
        paiement.setUserId(userId);
        paiement.setAbonnement(null);
        paiement.setMontant(montant);
        paiement.setDatePaiement(LocalDateTime.now());
        paiement.setStatut("PAYE");
        paiement.setStripePaymentIntentId(paymentIntent.getId());
        paiementRepository.save(paiement);

        System.out.println("One-Shot Payment enregistré avec Stripe ID : " + paymentIntent.getId());

        return paymentIntent;
    }

    // ----------------------
    // Création Abonnement + Paiement initial
    // ----------------------
    public PaymentIntent createAbonnement(Long userId, String email, String stripePriceId) throws StripeException {
        System.out.println("Création de l'abonnement pour userId = " + userId + ", email = " + email);

        // 1️⃣ Créer le Customer Stripe
        Customer customer = Customer.create(
                CustomerCreateParams.builder()
                        .setName("user-" + userId)
                        .setEmail(email)
                        .setDescription("Customer for user " + userId)
                        .build()
        );
        String stripeCustomerId = customer.getId();
        System.out.println("Customer Stripe créé : " + stripeCustomerId);

        // 2️⃣ Créer l'abonnement en base
        Abonnement abonnement = new Abonnement();
        abonnement.setUserId(userId);
        abonnement.setEmail(email);
        abonnement.setDateDebut(LocalDate.now());
        abonnement.setDateFin(LocalDate.now().plusMonths(1));
        abonnement.setStatut("ACTIF");
        abonnement.setStripePriceId(stripePriceId);
        abonnement.setStripeCustomerId(stripeCustomerId);
        abonnementRepository.save(abonnement);

        // 3️⃣ Créer l'abonnement côté Stripe
        com.stripe.model.Subscription stripeSub = com.stripe.model.Subscription.create(
                com.stripe.param.SubscriptionCreateParams.builder()
                        .setCustomer(stripeCustomerId)
                        .addItem(
                                com.stripe.param.SubscriptionCreateParams.Item.builder()
                                        .setPrice(stripePriceId)
                                        .build()
                        )
                        .setPaymentBehavior(
                                com.stripe.param.SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE
                        )
                        .addExpand("latest_invoice.payment_intent")
                        .build()
        );

        // 4️⃣ Sauvegarder l'ID Stripe de l'abonnement
        abonnement.setStripeSubscriptionId(stripeSub.getId());
        abonnementRepository.save(abonnement);
        System.out.println("Stripe Subscription ID enregistré : " + stripeSub.getId());

        // 5️⃣ Créer un paiement en base pour ce PaymentIntent
        PaymentIntent paymentIntent = stripeSub.getLatestInvoiceObject().getPaymentIntentObject();
        Paiement paiement = new Paiement();
        paiement.setAbonnement(abonnement);
        paiement.setUserId(userId);
        paiement.setMontant(paymentIntent.getAmount() / 100.0);
        paiement.setDatePaiement(LocalDateTime.now());
        paiement.setStatut("PAYE");
        paiement.setStripePaymentIntentId(paymentIntent.getId());
        paiementRepository.save(paiement);

        System.out.println("Paiement initial pour abonnement enregistré avec Stripe ID : " + paymentIntent.getId());

        return paymentIntent;
    }
}