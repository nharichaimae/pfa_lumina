package com.example.pfa__springBoot.Controller;

import com.example.pfa__springBoot.DTO.PaiementDTO;
import com.example.pfa__springBoot.Service.HistoriqueClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/historique")
@RequiredArgsConstructor
public class HistoriqueClientController {

    private final HistoriqueClientService historiqueClientService;

    @GetMapping("/{userId}")
    public List<PaiementDTO> getHistoriqueClient(@PathVariable Long userId) {
        return historiqueClientService.getHistoriqueClient(userId);
    }
}