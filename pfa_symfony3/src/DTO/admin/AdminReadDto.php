<?php

namespace App\DTO\admin;

use App\DTO\user\UtilisateurReadDto;

final class AdminReadDto
{
    public function __construct(
        public readonly UtilisateurReadDto $user
    ) {}
}
