<?php

namespace App\Controller\auth;

use App\DTO\auth\ForgotPasswordRequestDTO;
use App\DTO\auth\ResetPasswordRequestDTO;
use App\Repository\auth\IUser;
use App\Service\auth\ResetPasswordMailer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class ForgotPasswordController extends AbstractController
{
    private IUser $userRepository;
    private UserPasswordHasherInterface $passwordHasher;
    private ResetPasswordMailer $resetPasswordMailer;

    public function __construct(
        IUser $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        ResetPasswordMailer $resetPasswordMailer
    ) {
        $this->userRepository = $userRepository;
        $this->passwordHasher = $passwordHasher;
        $this->resetPasswordMailer = $resetPasswordMailer;
    }

    #[Route('/api/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
public function forgotPassword(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);

    if (!$data || !isset($data['email']) || empty($data['email'])) {
        return new JsonResponse([
            'message' => 'Email requis'
        ], Response::HTTP_BAD_REQUEST);
    }

    $forgotPasswordDTO = new ForgotPasswordRequestDTO($data['email']);

    $user = $this->userRepository->findByEmail($forgotPasswordDTO->getEmail());

    if (!$user) {
    return new JsonResponse([
        'message' => 'Cet email n\'existe pas'
    ], Response::HTTP_NOT_FOUND);
}
    $token = bin2hex(random_bytes(32));
    $expiresAt = new \DateTime('+15 minutes');

    $user->setResetToken($token);
    $user->setResetTokenExpiresAt($expiresAt);

    $this->userRepository->save($user);

    $resetLink = 'http://localhost:4200/reset-password?token=' . $token;

    $this->resetPasswordMailer->sendResetLink(
        $user->getEmail(),
        $resetLink
    );

    return new JsonResponse([
    'message' => 'Un email de réinitialisation a été envoyé'
], Response::HTTP_OK);
}

    #[Route('/api/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (
            !$data ||
            !isset($data['token']) ||
            !isset($data['newPassword']) ||
            empty($data['token']) ||
            empty($data['newPassword'])
        ) {
            return new JsonResponse([
                'message' => 'Token et nouveau mot de passe requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        $resetPasswordDTO = new ResetPasswordRequestDTO(
            $data['token'],
            $data['newPassword']
        );

        $user = $this->userRepository->findByResetToken($resetPasswordDTO->getToken());

        if (!$user) {
            return new JsonResponse([
                'message' => 'Token invalide'
            ], Response::HTTP_BAD_REQUEST);
        }

        if (
            !$user->getResetTokenExpiresAt() ||
            $user->getResetTokenExpiresAt() < new \DateTime()
        ) {
            return new JsonResponse([
                'message' => 'Token expiré'
            ], Response::HTTP_BAD_REQUEST);
        }

        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $resetPasswordDTO->getNewPassword()
        );

        $user->setPassword($hashedPassword);
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $user->setMustChangePassword(false);

        $this->userRepository->save($user);

        return new JsonResponse([
            'message' => 'Mot de passe réinitialisé avec succès'
        ], Response::HTTP_OK);
    }
}