<?php

namespace App\Mapper\admin;

use App\Entity\admin\Administrateur;
use App\DTO\admin\AdminReadDto;
use App\DTO\admin\AdminUpdateDto;
use App\DTO\user\UtilisateurReadDto;

final class AdminMapper
{
    public function toReadDto(Administrateur $admin): AdminReadDto
    {
        $userDto = new UtilisateurReadDto(
            id: (int) $admin->getId(),
            email: $admin->getEmail(),
            nom: $admin->getNom(),
            prenom: $admin->getPrenom(),
            role: $admin->getRole(),
        );

        return new AdminReadDto($userDto);
    }

    public function applyUpdateDto(Administrateur $admin, AdminUpdateDto $dto): void
    {
        $u = $dto->user;

        if ($u->email !== null)  $admin->setEmail($u->email);
        if ($u->nom !== null)    $admin->setNom($u->nom);
        if ($u->prenom !== null) $admin->setPrenom($u->prenom);
    }
}
