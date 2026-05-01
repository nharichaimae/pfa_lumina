<?php

namespace App\Controller\client;

use App\Repository\client\Iclient;
use App\Mapper\client\ClientProfileMapper;
use App\DTO\client\ClientUpdateDto;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/client', name: 'client_')]
class ClientProfileController extends AbstractController
{
    public function __construct(
        private Iclient $clientRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private ClientProfileMapper $profileMapper
    ) {}

    #[Route('/profil/{id}', name: 'profil', methods: ['GET'])]
    public function getProfil(int $id): JsonResponse
    {
        $client = $this->clientRepository->getClientProfile($id);

        if (!$client) {
            return $this->json(
                ['message' => 'Client non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }

        $dto = $this->profileMapper->toReadDto($client);

        return $this->json([
            'id' => $dto->id,
            'nom' => $dto->nom,
            'prenom' => $dto->prenom,
            'email' => $dto->email,
            'telephone' => $dto->telephone,
            'cin' => $dto->cin,
            'photoProfil' => $dto->photoProfil
        ], Response::HTTP_OK);
    }

    #[Route('/profil/{id}', name: 'update_profil', methods: ['PUT'])]
    public function updateProfil(Request $request, int $id): JsonResponse
    {
        $client = $this->clientRepository->getClientProfile($id);

        if (!$client) {
            return $this->json(
                ['message' => 'Client non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(
                ['message' => 'JSON invalide'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $updateDto = new ClientUpdateDto(
            nom: $data['nom'] ?? null,
            prenom: $data['prenom'] ?? null,
            telephone: $data['telephone'] ?? null,
            cin: $data['cin'] ?? null,
            photoProfil: $data['photoProfil'] ?? null,
            password: $data['password'] ?? null
        );

        $success = $this->clientRepository->updateClientProfile(
            $id,
            $updateDto,
            $this->passwordHasher
        );

        if (!$success) {
            return $this->json(
                ['message' => 'Erreur lors de la mise à jour'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $updatedClient = $this->clientRepository->getClientProfile($id);
        $dto = $this->profileMapper->toReadDto($updatedClient);

        return $this->json([
            'message' => 'Profil mis à jour avec succès',
            'client' => [
                'id' => $dto->id,
                'nom' => $dto->nom,
                'prenom' => $dto->prenom,
                'email' => $dto->email,
                'telephone' => $dto->telephone,
                'cin' => $dto->cin,
                'photoProfil' => $dto->photoProfil
            ]
        ], Response::HTTP_OK);
    }
}
