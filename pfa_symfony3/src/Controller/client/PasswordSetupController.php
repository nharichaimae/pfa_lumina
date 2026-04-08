<?php

namespace App\Controller\client;

use App\Entity\auth\PasswordSetupToken;
use App\Entity\client\Client;
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
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['token'], $data['password'])) {
            return new JsonResponse([
                'message' => 'Token et mot de passe requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        $tokenEntity = $em->getRepository(PasswordSetupToken::class)
            ->findOneBy(['token' => $data['token']]);

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

        if (strlen($data['password']) < 8) {
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

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);

$user->setPassword($hashedPassword);
$user->setMustChangePassword(false);

$em->remove($tokenEntity);

$em->flush();

        return new JsonResponse([
            'message' => 'Mot de passe défini avec succès'
        ], Response::HTTP_OK);
    }
}