<?php

namespace App\DTO\client;

class ClientCreateDTO
{
    public string $nom;
    public string $prenom;
    public string $email;
    public string $password;
    public string $telephone;
    public string $cin;
    public ?string $photoProfil = null;
}