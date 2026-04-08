<?php

namespace App\DTO\auth;

class ResetPasswordRequestDTO
{
    private string $token;
    private string $newPassword;

    public function __construct(string $token, string $newPassword)
    {
        $this->token = $token;
        $this->newPassword = $newPassword;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getNewPassword(): string
    {
        return $this->newPassword;
    }
}