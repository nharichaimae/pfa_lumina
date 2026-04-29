package com.example.pfa__springBoot.Mapper;

import com.example.pfa__springBoot.DTO.PaiementDTO;
import com.example.pfa__springBoot.Entity.Paiement;

public class HistoriqueClientMapper {

    public static PaiementDTO toDTO(Paiement paiement) {

        if (paiement == null) {
            return null;
        }

        return new PaiementDTO(
                paiement.getId(),
                paiement.getMontant(),
                paiement.getDatePaiement(),
                paiement.getStatut(),
                paiement.getAbonnement() != null ? paiement.getAbonnement().getId() : null,
                paiement.getUserId()
        );
    }
}