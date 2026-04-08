package com.example.pfa__springBoot.Controller;

import com.example.pfa__springBoot.DTO.PaiementDTO;
import com.example.pfa__springBoot.Entity.Paiement;
import com.example.pfa__springBoot.Mapper.HistoriqueClientMapper;
import com.example.pfa__springBoot.Service.PaiementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:4200")
public class PaiementController {

    private final PaiementService paiementService;

    public PaiementController(PaiementService paiementService) {
        this.paiementService = paiementService;
    }

    @GetMapping("/{userId}/paiements")
    public List<PaiementDTO> getHistorique(@PathVariable Long userId) {

        List<Paiement> paiements =
                paiementService.getHistoriquePaiements(userId);

        return paiements.stream()
                .map(HistoriqueClientMapper::toDTO)
                .collect(Collectors.toList());
    }
}