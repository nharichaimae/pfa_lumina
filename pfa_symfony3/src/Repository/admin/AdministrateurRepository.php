<?php

namespace App\Repository\admin;

use App\Dto\admin\AdminUpdateDto;
use App\Entity\admin\Administrateur;
use Doctrine\ORM\EntityManagerInterface;

final class AdministrateurRepository implements Iadministrateur
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function getAdminProfile(int $id): ?Administrateur
    {
        return $this->em
            ->getRepository(Administrateur::class)
            ->find($id);
    }

    public function updateAdminProfile(int $id, AdminUpdateDto $updateDto): ?Administrateur
    {
        $admin = $this->getAdminProfile($id);

        if (!$admin) {
            return null;
        }

        $u = $updateDto->user;

        if ($u->email !== null) {
            $admin->setEmail($u->email);
        }

        if ($u->nom !== null) {
            $admin->setNom($u->nom);
        }

        if ($u->prenom !== null) {
            $admin->setPrenom($u->prenom);
        }

        return $admin;
    }


    public function save(): void
    {
        $this->em->flush();
    }
}
