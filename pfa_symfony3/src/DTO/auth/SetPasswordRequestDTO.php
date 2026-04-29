<?php

namespace App\DTO\auth;

class SetPasswordRequestDTO
{
    public function __construct(
        private string $token,
        private string $password
    ) {}

    public function getToken(): string
    {
        return $this->token;
    }

    public function getPassword(): string
    {
        return $this->password;
    }
}