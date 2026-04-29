<?php

namespace App\Repository\auth;

use App\Entity\auth\PasswordSetupToken;
use App\Entity\user\Utilisateur;

interface IPasswordSetupTokenRepository
{
    public function findByToken(string $token): ?PasswordSetupToken;

    public function findActiveTokenByUser(Utilisateur $user): ?PasswordSetupToken;

    public function save(PasswordSetupToken $token): void;

    public function delete(PasswordSetupToken $token): void;
}