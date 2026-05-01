<?php
namespace App\DTO\client;
final class ClientUpdateDto
{
    public function __construct(
        public readonly ?string $nom = null,
        public readonly ?string $prenom = null,
        public readonly ?string $telephone = null,
        public readonly ?string $cin = null,
        public readonly ?string $photoProfil = null,
        public readonly ?string $password = null,
    ) {}
}
