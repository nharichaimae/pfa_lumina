package com.example.pfa__springBoot.Mapper;

import com.example.pfa__springBoot.DTO.HistoriqueAdminDTO;
import com.example.pfa__springBoot.DTO.UserDTO;
import com.example.pfa__springBoot.Entity.Paiement;
import org.springframework.stereotype.Component;

@Component
public class PaiementMapper {

    /**
     * Transforme un Paiement et son UserDTO associé en HistoriqueAdminDTO
     *
     * @param paiement l'entité Paiement
     * @param user l'objet UserDTO récupéré depuis le microservice
     * @param blocked indique si l'utilisateur est bloqué
     * @return HistoriqueAdminDTO correspondant
     */
    public HistoriqueAdminDTO toHistoriqueAdminDTO(Paiement paiement, UserDTO user, boolean blocked) {
        String nom = (user != null && user.getNom() != null) ? user.getNom() : "Inconnu";
        String prenom = (user != null && user.getPrenom() != null) ? user.getPrenom() : "Inconnu";
        String statutAbonnement = (paiement.getAbonnement() != null && paiement.getAbonnement().getStatut() != null)
                ? paiement.getAbonnement().getStatut()
                : "Inconnu";

        // 🔹 Récupérer userId depuis l’abonnement si présent
        Long userId = (paiement.getAbonnement() != null) ? paiement.getAbonnement().getUserId() : null;

        // 🔹 Retourner directement via le constructeur
        return new HistoriqueAdminDTO(
                nom,
                prenom,
                paiement.getMontant(),
                statutAbonnement,
                userId,
                blocked
        );
    }
}