<?php

namespace App\Repository\admin;

use App\Entity\admin\Administrateur;
use App\Dto\admin\AdminUpdateDto;

interface Iadministrateur
{
    public function getAdminProfile(int $id): ?Administrateur;

    public function updateAdminProfile(int $id, AdminUpdateDto $updateDto): ?Administrateur;

    public function save(): void;
}
