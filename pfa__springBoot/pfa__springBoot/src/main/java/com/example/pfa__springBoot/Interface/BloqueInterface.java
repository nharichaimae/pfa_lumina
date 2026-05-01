package com.example.pfa__springBoot.Interface;

public interface BloqueInterface {

    void verifierTousLesAbonnements();

    // 🔹 blocage spécifique au microservice IA
    boolean isBlockedForIA(Long userId);

    void notifierSemaineDeGrace();
}