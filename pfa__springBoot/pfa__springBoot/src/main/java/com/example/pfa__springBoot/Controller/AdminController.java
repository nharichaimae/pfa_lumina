package com.example.pfa__springBoot.Controller;

import com.example.pfa__springBoot.DTO.HistoriqueAdminDTO;
import com.example.pfa__springBoot.DTO.UserDTO;
import com.example.pfa__springBoot.Entity.Abonnement;
import com.example.pfa__springBoot.Entity.Paiement;
import com.example.pfa__springBoot.Interface.BloqueInterface;
import com.example.pfa__springBoot.Interface.PaiementInterface;
import com.example.pfa__springBoot.Mapper.PaiementMapper;
import com.example.pfa__springBoot.Repository.AbonnementRepository;
import com.example.pfa__springBoot.Service.BloqueService;
import com.example.pfa__springBoot.Service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PaiementInterface paiementService;
    private final PaiementMapper paiementMapper;
    private final BloqueInterface bloqueService;
    private final AbonnementRepository abonnementRepository;

    // 🔹 Historique des paiements
    @GetMapping("/historique")
    public List<HistoriqueAdminDTO> getHistorique(@RequestHeader("Authorization") String authHeader) {
        List<Paiement> paiements = paiementService.getPaiements();

        return paiements.stream()
                .filter(p -> p.getAbonnement() != null)
                .map(p -> {
                    Long userId = p.getAbonnement().getUserId();
                    UserDTO user = paiementService.getUserById(userId, authHeader);

                    boolean blocked = bloqueService.isBlockedForIA(userId); // ✅ correction

                    return paiementMapper.toHistoriqueAdminDTO(p, user, blocked);
                })
                .toList();
    }
    // 🔹 Bloquer un utilisateur
    @PutMapping("/bloquer/{userId}")
    public Map<String, String> bloquerUtilisateur(@PathVariable Long userId) {
        Abonnement last = abonnementRepository
                .findTopByUserIdOrderByDateDebutDesc(userId)
                .orElse(null);

        Map<String, String> resp = new HashMap<>();
        if (last == null) {
            resp.put("message", "Utilisateur introuvable");
            return resp;
        }

        last.setBloqueManuel(true); // bloquer
        abonnementRepository.save(last);

        resp.put("message", "Utilisateur bloqué");
        return resp;
    }

    @PutMapping("/debloquer/{userId}")
    public Map<String, String> debloquerUtilisateur(@PathVariable Long userId) {
        Abonnement last = abonnementRepository
                .findTopByUserIdOrderByDateDebutDesc(userId)
                .orElse(null);

        Map<String, String> resp = new HashMap<>();
        if (last == null) {
            resp.put("message", "Utilisateur introuvable");
            return resp;
        }

        last.setBloqueManuel(false); // débloquer
        abonnementRepository.save(last);

        resp.put("message", "Utilisateur débloqué");
        return resp;
    }
    @GetMapping("/isBlockedIA/{userId}")
    public boolean isBlockedIA(@PathVariable Long userId) {
        return bloqueService.isBlockedForIA(userId);
    }
}