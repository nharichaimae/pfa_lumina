package com.example.pfa__springBoot.Service;

import com.example.pfa__springBoot.DTO.HistoriqueAdminDTO;
import com.example.pfa__springBoot.DTO.UserDTO;
import com.example.pfa__springBoot.Entity.Paiement;
import com.example.pfa__springBoot.Repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final WebClient webClient;

    // Retourne la liste de Paiement avec info UserDTO attachée
    public List<Paiement> getPaiements() {
        return paiementRepository.findAll();
    }

    public UserDTO getUserById(Long userId, String authHeader) {
        try {
            return webClient.get()
                    .uri("http://localhost:8000/api/users/" + userId)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(UserDTO.class)
                    .block();
        } catch (Exception e) {
            System.out.println("Erreur appel Symfony : " + e.getMessage());
            return null;
        }
    }

    public List<Paiement> getHistoriquePaiements(Long userId) {
        return paiementRepository.findByUserId(userId);
    }
}