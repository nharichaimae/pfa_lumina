<?php

namespace App\Repository\auth;

use App\DTO\auth\LoginRequestDTO;
use App\Entity\user\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserRepository extends ServiceEntityRepository implements IUser
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Utilisateur::class);
    }

    public function login(LoginRequestDTO $log, UserPasswordHasherInterface $passwordHasher): ?Utilisateur
    {
        $user = $this->findOneBy(['email' => $log->getEmail()]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $log->getPassword())) {
            return null;
        }

        return $user;
    }

    public function findByEmail(string $email): ?Utilisateur
    {
        return $this->findOneBy(['email' => $email]);
    }

    public function findByResetToken(string $token): ?Utilisateur
    {
        return $this->findOneBy(['resetToken' => $token]);
    }

    public function save(Utilisateur $user): void
    {
        $em = $this->getEntityManager();
        $em->persist($user);
        $em->flush();
    }
}