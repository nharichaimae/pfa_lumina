<?php
namespace App\Controller\admin;

use App\Entity\auth\PasswordSetupToken;
use App\Repository\client\Iclient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Mapper\client\ClientMapper;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class CrudUseController extends AbstractController
{
    #[Route('/clients', name: 'clients_list', methods: ['GET'])]
    public function getAllClients(Iclient $clientRepo): Response
    {
        $clientsArray = $clientRepo->getAllClients();
        return $this->json($clientsArray, Response::HTTP_OK);
    }

    #[Route('/client/ajouter', name: 'client_ajouter', methods: ['POST'])]
    public function ajouter(
        Request $request,
        Iclient $clientRepo,
        UserPasswordHasherInterface $passwordHasher,
        MailerInterface $mailer,
        EntityManagerInterface $em
    ): Response {
        try {
            $data = $request->request->all();
            $photo = $request->files->get('photoProfil');

            if ($photo) {
                $filename = uniqid() . '.' . $photo->guessExtension();
                $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';

                if (!is_writable($uploadDir)) {
                    throw new \Exception('Le dossier uploads n’est pas accessible en écriture');
                }

                $photo->move($uploadDir, $filename);
                $data['photoProfil'] = $filename;
            }

            $client = $clientRepo->ajouterClient($data, $passwordHasher);

            $tokenValue = bin2hex(random_bytes(32));

            $token = new PasswordSetupToken();
            $token->setUser($client);
            $token->setToken($tokenValue);
            $token->setExpiresAt(new \DateTimeImmutable('+1 day'));
            $token->setUsed(false);

            $em->persist($token);
            $em->flush();

            $activationLink = "http://localhost:4200/set-password?token=" . $tokenValue;

            $email = (new Email())
                ->from('no-reply@house.com')
                ->to($client->getEmail())
                ->subject('Activation de votre compte')
                ->text(
                    "Bonjour {$client->getPrenom()} {$client->getNom()},\n\n" .
                    "Votre compte a été créé avec succès.\n\n" .
                    "Cliquez sur ce lien pour définir votre mot de passe :\n" .
                    $activationLink . "\n\n" .
                    "Ce lien expire dans 24 heures."
                );

            $mailer->send($email);

            return $this->json([
                'message' => 'Client ajouté avec succès ✅',
                'id' => $client->getId(),
            ], Response::HTTP_CREATED);

        } catch (\Throwable $e) {
            return $this->json(
                ['error' => $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/client/{id}', name: 'client_detail', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function detail(int $id, Iclient $clientRepo): Response
    {
        $client = $clientRepo->getClientById($id);

        if (!$client) {
            return $this->json(
                ['message' => 'Client non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }

        return $this->json(
            ClientMapper::toArray($client),
            Response::HTTP_OK
        );
    }

    #[Route('/client/supprimer/{id}', name: 'client_supprimer', methods: ['POST', 'GET'], requirements: ['id' => '\d+'])]
    public function supprimer(int $id, Iclient $clientRepo): Response
    {
        $client = $clientRepo->getClientById($id);

        if (!$client) {
            return $this->json(
                ['message' => 'Client non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }

        $clientRepo->supprimerClient($client);

        return $this->json([
            'message' => 'Client supprimé avec succès ✅',
        ], Response::HTTP_OK);
    }
}