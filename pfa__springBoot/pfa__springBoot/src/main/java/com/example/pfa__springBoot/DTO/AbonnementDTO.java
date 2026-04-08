package com.example.pfa__springBoot.DTO;

import java.time.LocalDate;

public record AbonnementDTO(
        Long id,
        Long userId,
        String email,
        LocalDate dateDebut,
        LocalDate dateFin,
        String statut
) {}