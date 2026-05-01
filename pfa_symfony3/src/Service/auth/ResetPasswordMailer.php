<?php

namespace App\Service\auth;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class ResetPasswordMailer
{
    private MailerInterface $mailer;

    public function __construct(MailerInterface $mailer)
    {
        $this->mailer = $mailer;
    }

    public function sendResetLink(string $to, string $resetLink): void
    {
        $email = (new Email())
            ->from('no-reply@yourapp.com')
            ->to($to)
            ->subject('Réinitialisation du mot de passe')
            ->html("
                <p>Bonjour,</p>
                <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
                <p><a href='{$resetLink}'>{$resetLink}</a></p>
                <p>Ce lien expire dans 15 minutes.</p>
            ");

        $this->mailer->send($email);
    }
}