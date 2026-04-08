<?php

namespace App\DTO\auth;

class LoginResponseDTO
{
    public bool $authenticated;
    public string $token;
    public int $id;
    public string $email;
    public string $role;
    public string $nom;
    public string $prenom;
    public bool $mustChangePassword;

    public function __construct(
        bool $authenticated,
        string $token,
        int $id,
        string $email,
        string $role,
        string $nom,
        string $prenom,
        bool $mustChangePassword
    ) {
        $this->authenticated = $authenticated;
        $this->token = $token;
        $this->id = $id;
        $this->email = $email;
        $this->role = $role;
        $this->nom = $nom;
        $this->prenom = $prenom;
        $this->mustChangePassword = $mustChangePassword;
    }
}