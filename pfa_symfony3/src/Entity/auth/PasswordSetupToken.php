<?php

namespace App\Entity\auth;

use App\Entity\user\Utilisateur;
use Doctrine\ORM\Mapping as ORM;
use DateTimeImmutable;

#[ORM\Entity]
class PasswordSetupToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    private string $token;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Utilisateur $user;

    #[ORM\Column(type: 'datetime_immutable')]
    private DateTimeImmutable $expiresAt;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $used = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;
        return $this;
    }

    public function getUser(): Utilisateur
    {
        return $this->user;
    }

    public function setUser(Utilisateur $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getExpiresAt(): DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(DateTimeImmutable $expiresAt): self
    {
        $this->expiresAt = $expiresAt;
        return $this;
    }

    public function isUsed(): bool
    {
        return $this->used;
    }

    public function setUsed(bool $used): self
    {
        $this->used = $used;
        return $this;
    }

    public function isExpired(): bool
    {
        return $this->expiresAt < new DateTimeImmutable();
    }
}