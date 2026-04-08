<?php
namespace App\Mapper\client;

use App\DTO\client\ClientCreateDTO;
use App\DTO\client\ClientSearchDTO;
use App\Entity\client\Client;

class ClientMapper
{
    // DTO → Entity
    public static function fromCreateDTO(ClientCreateDTO $dto): Client
    {
        $client = new Client();
        $client->setNom($dto->nom);
        $client->setPrenom($dto->prenom);
        $client->setEmail($dto->email);
        $client->setPassword(password_hash($dto->password, PASSWORD_BCRYPT));
        $client->setTelephone($dto->telephone);
        $client->setCin($dto->cin);
        $client->setPhotoProfil($dto->photoProfil);

        return $client;
    }

    // Entity → Array JSON
    public static function toArray(Client $client): array
    {
        return [
            'id' => $client->getId(),
            'nom' => $client->getNom(),
            'prenom' => $client->getPrenom(),
            'email' => $client->getEmail(),
            'telephone' => $client->getTelephone(),
            'cin' => $client->getCin(),
            'photoProfil' => $client->getPhotoProfil()
        ];
    }

    // Optionnel : si tu veux map un array vers DTO
    public static function arrayToCreateDTO(array $data): ClientCreateDTO
    {
        $dto = new ClientCreateDTO();
        $dto->nom = $data['nom'] ?? '';
        $dto->prenom = $data['prenom'] ?? '';
        $dto->email = $data['email'] ?? '';
        $dto->password = $data['password'] ?? '';
        $dto->telephone = $data['telephone'] ?? '';
        $dto->cin = $data['cin'] ?? '';
        $dto->photoProfil = $data['photoProfil'] ?? null;

        return $dto;
    }
}
