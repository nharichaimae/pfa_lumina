package com.example.pfa__springBoot.Controller;

import com.example.pfa__springBoot.Entity.Abonnement;
import com.example.pfa__springBoot.Entity.Paiement;
import com.example.pfa__springBoot.Repository.AbonnementRepository;
import com.example.pfa__springBoot.Repository.PaiementRepository;
import com.stripe.model.*;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    @Value("${stripe.webhook.key}")
    private String stripeWebhookKey;

    private final PaiementRepository paiementRepository;
    private final AbonnementRepository abonnementRepository;

    public StripeWebhookController(PaiementRepository paiementRepository,
                                   AbonnementRepository abonnementRepository) {
        this.paiementRepository = paiementRepository;
        this.abonnementRepository = abonnementRepository;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookKey);

            System.out.println("===== WEBHOOK RECU =====");
            System.out.println("Event type: " + event.getType());

            switch (event.getType()) {

                // ----------------------------
                // ONE-SHOT SUCCESS
                // ----------------------------
                case "payment_intent.succeeded": {

                    PaymentIntent pi = (PaymentIntent) event
                            .getDataObjectDeserializer()
                            .deserializeUnsafe();

                    System.out.println("PaymentIntent SUCCESS : " + pi.getId());

                    Paiement paiement = paiementRepository
                            .findByStripePaymentIntentId(pi.getId())
                            .orElse(null);

                    if (paiement != null) {
                        paiement.setStatut("SUCCESS");
                        paiementRepository.save(paiement);
                    }

                    break;
                }

                // ----------------------------
                // ONE-SHOT FAILED
                // ----------------------------
                case "payment_intent.payment_failed": {

                    PaymentIntent pi = (PaymentIntent) event
                            .getDataObjectDeserializer()
                            .deserializeUnsafe();

                    Paiement paiement = paiementRepository
                            .findByStripePaymentIntentId(pi.getId())
                            .orElse(null);

                    if (paiement != null) {
                        paiement.setStatut("FAILED");
                        paiementRepository.save(paiement);
                    }

                    break;
                }

                // ----------------------------
                // ABONNEMENT SUCCESS
                // ----------------------------
                case "invoice.payment_succeeded": {

                    Invoice invoice = (Invoice) event
                            .getDataObjectDeserializer()
                            .deserializeUnsafe();

                    String paymentIntentId = invoice.getPaymentIntent();
                    String subscriptionId = invoice.getSubscription();

                    System.out.println("Invoice SUCCESS - PI: " + paymentIntentId);
                    System.out.println("Subscription ID: " + subscriptionId);

                    updatePaiementWithAbonnement(paymentIntentId, subscriptionId, "SUCCESS");

                    break;
                }

                // ----------------------------
                // ABONNEMENT FAILED
                // ----------------------------
                case "invoice.payment_failed": {

                    Invoice invoice = (Invoice) event
                            .getDataObjectDeserializer()
                            .deserializeUnsafe();

                    String paymentIntentId = invoice.getPaymentIntent();
                    String subscriptionId = invoice.getSubscription();

                    updatePaiementWithAbonnement(paymentIntentId, subscriptionId, "FAILED");

                    break;
                }

                default:
                    System.out.println("Event non géré: " + event.getType());
            }

            return ResponseEntity.ok("");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body("Webhook error");
        }
    }

    // 🔥 MÉTHODE IMPORTANTE
    private void updatePaiementWithAbonnement(String paymentIntentId,
                                              String subscriptionId,
                                              String statut) {

        if (subscriptionId == null) {
            System.out.println("SubscriptionId NULL !");
            return;
        }

        // 🔥 1. récupérer abonnement
        Optional<Abonnement> abonnementOpt =
                abonnementRepository.findByStripeSubscriptionId(subscriptionId);

        if (abonnementOpt.isEmpty()) {
            System.out.println("Abonnement non trouvé !");
            return;
        }

        Abonnement abonnement = abonnementOpt.get();

        // 🔥 2. récupérer paiement PENDING
        Paiement paiement = paiementRepository
                .findTopByAbonnementAndStatut(abonnement, "PENDING")
                .orElse(null);

        if (paiement == null) {
            System.out.println("Paiement non trouvé !");
            return;
        }

        // 🔥 3. mise à jour
        paiement.setStatut(statut);
        paiement.setAbonnement(abonnement);

        paiementRepository.save(paiement);

        System.out.println("Paiement mis à jour avec abonnement !");
    }
}