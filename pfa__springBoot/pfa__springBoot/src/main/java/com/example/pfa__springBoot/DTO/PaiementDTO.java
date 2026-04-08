package com.example.pfa__springBoot.DTO;

import java.time.LocalDateTime;

public record PaiementDTO(
        Long id,
        Double montant,
        LocalDateTime datePaiement,
        String statut,
        Long abonnementId,
        Long userId
) {}