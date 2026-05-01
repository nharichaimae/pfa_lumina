<?php

namespace App\Repository\auth;

use App\Entity\auth\PasswordSetupToken;
use App\Entity\user\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PasswordSetupTokenRepository extends ServiceEntityRepository implements IPasswordSetupTokenRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PasswordSetupToken::class);
    }

    public function findByToken(string $token): ?PasswordSetupToken
    {
        return $this->findOneBy(['token' => $token]);
    }

    public function findActiveTokenByUser(Utilisateur $user): ?PasswordSetupToken
    {
        return $this->createQueryBuilder('t')
            ->where('t.user = :user')
            ->andWhere('t.used = false')
            ->andWhere('t.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(PasswordSetupToken $token): void
    {
        $em = $this->getEntityManager();
        $em->persist($token);
        $em->flush();
    }

    public function delete(PasswordSetupToken $token): void
    {
        $em = $this->getEntityManager();
        $em->remove($token);
        $em->flush();
    }
}