<?php

namespace App\Repository\client;

use App\DTO\client\ClientReadDto;
use App\DTO\client\ClientUpdateDto;
use App\Dto\client\ClientSearchDTO;
use App\Entity\client\Client;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

interface Iclient
{
  
    public function getAllClients(): array;
      public function ajouterClient(
        array $data,
        UserPasswordHasherInterface $hasher
    ): Client;
    public function getClientById(int $id): ?Client;
    public function supprimerClient(Client $client): void;
    // public function rechercheClient(ClientSearchDTO $dto): array; 

    public function getClientProfile(int $id): ?Client;

    public function updateClientProfile(
        int $id,
        ClientUpdateDto $dto,
        UserPasswordHasherInterface $hasher
    ): bool;
}
