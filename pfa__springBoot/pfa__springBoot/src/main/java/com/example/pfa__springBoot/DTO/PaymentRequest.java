package com.example.pfa__springBoot.DTO;


public class PaymentRequest {

    private Long userId;
    private double montant;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public double getMontant() {
        return montant;
    }

    public void setMontant(double montant) {
        this.montant = montant;
    }
}