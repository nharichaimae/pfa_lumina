<?php

namespace App\DTO\admin;

use App\DTO\user\UtilisateurUpdateDto;

final class AdminUpdateDto
{
    public function __construct(
        public readonly UtilisateurUpdateDto $user
    ) {}
}
