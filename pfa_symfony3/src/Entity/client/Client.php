<?php
namespace App\Entity\client;

use Doctrine\ORM\Mapping as ORM;
use App\Entity\user\Utilisateur;
use DateTimeImmutable;

#[ORM\Entity]
class Client extends Utilisateur
{
    #[ORM\Column(length: 20)]
    private string $telephone;

    #[ORM\Column(length: 20)]
    private string $cin;

    #[ORM\Column(nullable: true)]
    private ?string $photoProfil = null;

    #[ORM\Column(length: 10, options: ["default" => "ACTIVE"])]
    private string $status = 'ACTIVE';

    #[ORM\Column(type: 'datetime_immutable')]
    private DateTimeImmutable $createdAt;

    public function __construct()
    {
        parent::__construct();
        $this->createdAt = new DateTimeImmutable();
        $this->status = 'ACTIVE';
    }

    // --- Getters & Setters ---

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

     public function getTelephone(): string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): self
    {
        $this->telephone = $telephone;
        return $this;
    }

    public function getCin(): string
    {
        return $this->cin;
    }

    public function setCin(string $cin): self
    {
        $this->cin = $cin;
        return $this;
    }

    public function getPhotoProfil(): ?string
    {
        return $this->photoProfil;
    }

    public function setPhotoProfil(?string $photoProfil): self
    {
        $this->photoProfil = $photoProfil;
        return $this;
    }
}
