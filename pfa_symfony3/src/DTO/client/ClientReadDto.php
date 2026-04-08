<?php
namespace App\DTO\client;
final class ClientReadDto
{
    public function __construct(
        public readonly int $id,
        public readonly string $email,
        public readonly string $nom,
        public readonly string $prenom,
        public readonly string $telephone,
        public readonly string $cin,
        public readonly ?string $photoProfil,
    ) {}
}
