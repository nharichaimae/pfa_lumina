<?php

namespace App\Controller\admin;

use App\DTO\admin\AdminUpdateDto;
use App\DTO\user\UtilisateurUpdateDto;
use App\Repository\admin\Iadministrateur;
use App\Mapper\admin\AdminMapper;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin')]
final class AdminProfileController extends AbstractController
{
    public function __construct(
        private Iadministrateur $repo,
        private AdminMapper $mapper,
    ) {}

    #[Route('/profile/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $admin = $this->repo->getAdminProfile($id);

        if (!$admin) {
            return $this->json(
                ['message' => 'Admin not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        $dto = $this->mapper->toReadDto($admin);

        return $this->json([
            'id' => $dto->user->id,
            'email' => $dto->user->email,
            'nom' => $dto->user->nom,
            'prenom' => $dto->user->prenom,
            'role' => $dto->user->role,
        ], Response::HTTP_OK);
    }

    #[Route('/profile/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $admin = $this->repo->getAdminProfile($id);

        if (!$admin) {
            return $this->json(
                ['message' => 'Admin not found'],
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

        $userUpdate = new UtilisateurUpdateDto(
            email: $data['email'] ?? null,
            nom: $data['nom'] ?? null,
            prenom: $data['prenom'] ?? null,
        );

        $adminUpdate = new AdminUpdateDto($userUpdate);

        $this->mapper->applyUpdateDto($admin, $adminUpdate);
        $this->repo->save(); 

        $dto = $this->mapper->toReadDto($admin);

        return $this->json([
            'message' => 'Profil admin mis à jour',
            'admin' => [
                'id' => $dto->user->id,
                'email' => $dto->user->email,
                'nom' => $dto->user->nom,
                'prenom' => $dto->user->prenom,
                'role' => $dto->user->role,
            ]
        ], Response::HTTP_OK);
    }
}
