<?php

namespace App\auth\Mapper;

use App\DTO\auth\SetPasswordRequestDTO;
use App\DTO\auth\SetPasswordResponseDTO;

class SetPasswordMapper
{
    public static function toRequestDTO(array $data): SetPasswordRequestDTO
    {
        return new SetPasswordRequestDTO(
            $data['token'] ?? '',
            $data['password'] ?? ''
        );
    }

    public static function toResponseDTO(string $message): SetPasswordResponseDTO
    {
        return new SetPasswordResponseDTO($message);
    }

    public static function toArray(SetPasswordResponseDTO $dto): array
    {
        return [
            'message' => $dto->getMessage()
        ];
    }
}