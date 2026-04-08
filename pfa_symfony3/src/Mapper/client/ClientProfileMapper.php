<?php
namespace App\Mapper\client;

use App\Entity\client\Client; 
use App\DTO\client\ClientReadDto;
use App\DTO\client\ClientUpdateDto;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class ClientProfileMapper
{
    public function toReadDto(Client $client): ClientReadDto
    {
        return new ClientReadDto(
            id: $client->getId(),
            email: $client->getEmail(),
            nom: $client->getNom(),
            prenom: $client->getPrenom(),
            telephone: $client->getTelephone(),
            cin: $client->getCin(),
            photoProfil: $client->getPhotoProfil(),
        );
    }

    public function applyUpdateDto(
    Client $client,
    ClientUpdateDto $dto,
    UserPasswordHasherInterface $hasher  
    ): void {
    if ($dto->nom !== null) $client->setNom($dto->nom);
    if ($dto->prenom !== null) $client->setPrenom($dto->prenom);
    if ($dto->telephone !== null) $client->setTelephone($dto->telephone);
    if ($dto->cin !== null) $client->setCin($dto->cin);
    if ($dto->photoProfil !== null) $client->setPhotoProfil($dto->photoProfil);

    if (!empty($dto->password)) {
    $client->setPassword($hasher->hashPassword($client, $dto->password));
     }

}

}
