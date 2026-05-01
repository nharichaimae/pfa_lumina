<?php

namespace App\Repository\auth;

use App\Entity\user\Utilisateur;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\DTO\auth\LoginRequestDTO;
use App\DTO\auth\LoginResponseDTO;

interface IUser
{

    public function login(
        LoginRequestDTO $log,
        UserPasswordHasherInterface $passwordHasher
    ): ?Utilisateur;
     public function find(int $id): ?object;
    public function findByEmail(string $email): ?Utilisateur;
    public function findByResetToken(string $token): ?Utilisateur;
    public function save(Utilisateur $user): void;
}
