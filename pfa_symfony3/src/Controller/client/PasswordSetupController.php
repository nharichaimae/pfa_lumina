<?php

namespace App\Controller\client;

use App\auth\Mapper\SetPasswordMapper;
use App\Entity\client\Client;
use App\Repository\auth\IPasswordSetupTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PasswordSetupController extends AbstractController
{
    #[Route('/api/set-password', name: 'api_set_password', methods: ['POST'])]
    public function setPassword(
        Request $request,
        IPasswordSetupTokenRepository $tokenRepository,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $setPasswordDTO = SetPasswordMapper::toRequestDTO($data ?? []);

        if (!$setPasswordDTO->getToken() || !$setPasswordDTO->getPassword()) {
            return new JsonResponse([
                'message' => 'Token et mot de passe requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        $tokenEntity = $tokenRepository->findByToken($setPasswordDTO->getToken());

        if (!$tokenEntity) {
            return new JsonResponse([
                'message' => 'Lien invalide'
            ], Response::HTTP_BAD_REQUEST);
        }

        if ($tokenEntity->isUsed()) {
            return new JsonResponse([
                'message' => 'Ce lien a déjà été utilisé'
            ], Response::HTTP_BAD_REQUEST);
        }

        if ($tokenEntity->isExpired()) {
            return new JsonResponse([
                'message' => 'Lien expiré'
            ], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($setPasswordDTO->getPassword()) < 8) {
            return new JsonResponse([
                'message' => 'Le mot de passe doit contenir au moins 8 caractères'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user = $tokenEntity->getUser();

        if (!$user instanceof Client) {
            return new JsonResponse([
                'message' => 'Cette opération concerne uniquement les clients'
            ], Response::HTTP_FORBIDDEN);
        }

        $hashedPassword = $passwordHasher->hashPassword(
            $user,
            $setPasswordDTO->getPassword()
        );

        $user->setPassword($hashedPassword);
        $user->setMustChangePassword(false);

        $em->remove($tokenEntity);
        $em->flush();

        $responseDTO = SetPasswordMapper::toResponseDTO(
            'Mot de passe défini avec succès'
        );

        return new JsonResponse(
            SetPasswordMapper::toArray($responseDTO),
            Response::HTTP_OK
        );
    }
}