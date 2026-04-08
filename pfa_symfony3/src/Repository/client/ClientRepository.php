<?php
namespace App\Repository\client;
use App\DTO\client\ClientReadDto;
use App\DTO\client\ClientUpdateDto;
use App\Mapper\client\ClientProfileMapper;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Dto\client\ClientCreateDTO;
use App\Dto\client\ClientSearchDTO;
use App\Entity\client\Client;
use App\Mapper\client\ClientMapper;
use Doctrine\ORM\EntityManagerInterface;


class ClientRepository implements Iclient
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function getAllClients(): array
    {
        return $this->em->getRepository(Client::class)->findAll();
    }

     public function ajouterClient(
        array $data,
        UserPasswordHasherInterface $hasher
    ): Client {
        $dto = ClientMapper::arrayToCreateDTO($data);
        $client = ClientMapper::fromCreateDTO($dto);

        $internalPassword = bin2hex(random_bytes(16));
        $hashedPassword = $hasher->hashPassword($client, $internalPassword);

        $client->setPassword($hashedPassword);
        $client->setMustChangePassword(true);
        $client->setRole('CLIENT');

        $this->em->persist($client);
        $this->em->flush();

        return $client;
    }

    public function getClientById(int $id): ?Client
    {
        return $this->em->getRepository(Client::class)->find($id);
    }

    public function supprimerClient(Client $client): void
    {
        $this->em->remove($client);
        $this->em->flush();
    }

    // public function rechercheClient(ClientSearchDTO $dto): array
    // {
    //     return $this->em->getRepository(Client::class)
    //         ->createQueryBuilder('c')
    //         ->where('c.nom LIKE :mot')
    //         ->orWhere('c.prenom LIKE :mot')
    //         ->orWhere('c.email LIKE :mot')
    //         ->orWhere('c.cin LIKE :mot')
    //         ->setParameter('mot', '%' . $dto->motCle . '%')
    //         ->getQuery()
    //         ->getResult();
    // }

    public function getClientProfile(int $id): ?Client
    {
        return $this->em->getRepository(Client::class)->find($id);
    }

    public function updateClientProfile(
        int $id,
        ClientUpdateDto $dto,
        UserPasswordHasherInterface $hasher
    ): bool {

        $client = $this->em->getRepository(Client::class)->find($id);

        if (!$client) {
            return false;
        }

        if ($dto->nom !== null) {
            $client->setNom($dto->nom);
        }

        if ($dto->prenom !== null) {
            $client->setPrenom($dto->prenom);
        }

        if ($dto->telephone !== null) {
            $client->setTelephone($dto->telephone);
        }

        if ($dto->cin !== null) {
            $client->setCin($dto->cin);
        }

        if ($dto->photoProfil !== null) {
            $client->setPhotoProfil($dto->photoProfil);
        }

        if ($dto->password !== null) {
            $hashedPassword = $hasher->hashPassword($client, $dto->password);
            $client->setPassword($hashedPassword);
             $client->setMustChangePassword(false);
        }

        $this->em->flush();

        return true;
    }
}
