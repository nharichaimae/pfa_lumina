<?php

namespace App\Controller\auth;

use App\Repository\auth\IUser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\DTO\auth\LoginRequestDTO;
use App\auth\Mapper\UserMapper;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class AuthController extends AbstractController
{
    private IUser $userRepository;
    private JWTTokenManagerInterface $jwtManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        IUser $userRepository,
        JWTTokenManagerInterface $jwtManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->userRepository = $userRepository;
        $this->jwtManager = $jwtManager;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'])) {
            return new JsonResponse(
                ['message' => 'Email et mot de passe requis'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $loginRequest = new LoginRequestDTO(
                $data['email'],
                $data['password']
            );

        $user = $this->userRepository->login(
            $loginRequest,
            $this->passwordHasher
        );

        if (!$user) {
            return new JsonResponse([
                'authenticated' => false,
                'message' => 'Identifiants invalides'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = $this->jwtManager->create($user);
        $loginDTO = UserMapper::toLoginResponse($user, $token);

        return new JsonResponse([
            'authenticated' => $loginDTO->authenticated,
            'token' => $loginDTO->token,
            'id' => $loginDTO->id,
            'email' => $loginDTO->email,
            'role' => $loginDTO->role,
            'nom'=> $loginDTO->nom,
            'prenom'=> $loginDTO->prenom,
            'mustChangePassword' => $loginDTO->mustChangePassword,
        ], Response::HTTP_OK);
    }
#[Route('/api/users/{id}', methods: ['GET'])]
public function getUserById(int $id): JsonResponse
{
    $user = $this->userRepository->find($id);

    if (!$user) {
        return $this->json([
            'message' => 'User not found'
        ], 404);
    }

    return $this->json([
        'id' => $user->getId(),
        'nom' => $user->getNom(),
        'prenom' => $user->getPrenom()
    ]);
}
}
