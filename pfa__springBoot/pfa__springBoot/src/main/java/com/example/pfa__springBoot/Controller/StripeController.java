package com.example.pfa__springBoot.Controller;

import com.example.pfa__springBoot.DTO.PaymentRequest;
import com.example.pfa__springBoot.Service.StripePaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/paiement")
public class StripeController {

    private final StripePaymentService stripePaymentService;

    public StripeController(StripePaymentService stripePaymentService) {
        this.stripePaymentService = stripePaymentService;
    }

    // ----------------------
    // Paiement One-Shot
    // ----------------------
    @PostMapping("/one-shot")
    public ResponseEntity<Map<String, String>> createOneShotPayment(
            @RequestBody PaymentRequest request) throws StripeException {

        PaymentIntent paymentIntent =
                stripePaymentService.createOneShotPayment(
                        request.getUserId(),
                        request.getMontant()
                );

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());

        return ResponseEntity.ok(response);
    }

    // ----------------------
    // Abonnement
    // ----------------------
    @PostMapping("/create-abonnement")
    public ResponseEntity<Map<String, String>> createAbonnement(@RequestBody Map<String, String> request) throws StripeException {

        Long userId = Long.valueOf(request.get("userId"));
        String email = request.get("email");
        String stripePriceId = request.get("stripePriceId");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email manquant"));
        }

        // ✅ Appel du service (qui doit gérer abonnement + paiement)
        PaymentIntent paymentIntent = stripePaymentService.createAbonnement(userId, email, stripePriceId);

        // ✅ Réponse simple
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());

        return ResponseEntity.ok(response);
    }
}