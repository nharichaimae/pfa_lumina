<?php

namespace App\DTO\user;

final class UtilisateurUpdateDto
{
    public function __construct(
        public readonly ?string $email = null,
        public readonly ?string $nom = null,
        public readonly ?string $prenom = null,
    ) {}
}
