<?php

namespace App\DTO\user;

final class UtilisateurReadDto
{
    public function __construct(
        public readonly int $id,
        public readonly string $email,
        public readonly ?string $nom = null,
        public readonly ?string $prenom = null,
        public readonly ?string $role = null,
    ) {}
}
