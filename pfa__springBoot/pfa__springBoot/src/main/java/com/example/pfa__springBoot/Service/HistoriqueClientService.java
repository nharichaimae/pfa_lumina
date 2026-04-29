package com.example.pfa__springBoot.Service;

import com.example.pfa__springBoot.DTO.PaiementDTO;
import com.example.pfa__springBoot.Entity.Paiement;
import com.example.pfa__springBoot.Mapper.HistoriqueClientMapper;
import com.example.pfa__springBoot.Repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoriqueClientService {

    private final PaiementRepository paiementRepository;

    public List<PaiementDTO> getHistoriqueClient(Long userId) {
        List<Paiement> paiements = paiementRepository.findByUserId(userId);

        return paiements.stream()
                .map(HistoriqueClientMapper::toDTO)
                .toList();
    }
}
