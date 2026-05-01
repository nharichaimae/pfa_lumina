package com.example.pfa__springBoot.Interface;

import com.example.pfa__springBoot.DTO.UserDTO;
import com.example.pfa__springBoot.Entity.Paiement;

import java.util.List;

public interface PaiementInterface {
    public List<Paiement> getPaiements();
    public UserDTO getUserById(Long userId, String authHeader);
    public List<Paiement> getHistoriquePaiements(Long userId);



}
