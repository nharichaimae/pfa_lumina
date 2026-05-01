package com.example.pfa__springBoot.Interface;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface StripeInterface {

    public PaymentIntent createOneShotPayment(Long userId, double montant) throws StripeException;
    public PaymentIntent createAbonnement(Long userId, String email, String stripePriceId) throws StripeException;
}
