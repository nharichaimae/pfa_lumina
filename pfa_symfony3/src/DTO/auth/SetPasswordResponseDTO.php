<?php

namespace App\DTO\auth;

class SetPasswordResponseDTO
{
    public function __construct(
        private string $message
    ) {}

    public function getMessage(): string
    {
        return $this->message;
    }
}