<?php

namespace App\auth\Mapper;

use App\Entity\user\Utilisateur;
use App\Entity\client\Client;
use App\DTO\auth\LoginResponseDTO;

class UserMapper
{
    public static function toLoginResponse(Utilisateur $user, string $token): LoginResponseDTO
    {
        $mustChangePassword = false;

        if ($user instanceof Client) {
            $mustChangePassword = $user->isMustChangePassword();
        }

        return new LoginResponseDTO(
            true,
            $token,
            $user->getId(),
            $user->getEmail(),
            $user->getRole(),
            $user->getNom(),
            $user->getPrenom(),
            $mustChangePassword
        );
    }
}