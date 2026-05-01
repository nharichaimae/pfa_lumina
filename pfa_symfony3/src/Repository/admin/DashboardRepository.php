<?php

namespace App\Repository\admin;

use Doctrine\ORM\EntityManagerInterface;

class DashboardRepository implements Idashboard
{
    private $conn;

    public function __construct(EntityManagerInterface $em)
    {
        $this->conn = $em->getConnection();
    }

    public function getTotals(): array
    {
        return [
            'totalClients' => (int) $this->conn->fetchOne(
                'SELECT COUNT(*) FROM client'
            ),
            'totalUsers' => (int) $this->conn->fetchOne(
                'SELECT COUNT(*) FROM utilisateur'
            ),
        ];
    }

    public function getClientsStatus(): array
    {
        return [
            'activeClients' => (int) $this->conn->fetchOne(
                "SELECT COUNT(*) FROM client WHERE status = 'ACTIVE'"
            ),
            'inactiveClients' => (int) $this->conn->fetchOne(
                "SELECT COUNT(*) FROM client WHERE status = 'INACTIVE'"
            ),
        ];
    }

    public function getRolesStats(): array
    {
        return $this->conn->fetchAllAssociative("
            SELECT role, COUNT(*) AS total
            FROM utilisateur
            GROUP BY role
        ");
    }

    public function getClientsByMonth(): array
    {
        return $this->conn->fetchAllAssociative("
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                   COUNT(*) AS total
            FROM client
            GROUP BY month
            ORDER BY month
        ");
    }

    public function getDashboardData(): array
    {
        return array_merge(
            $this->getTotals(),
            $this->getClientsStatus(),
            [
                'rolesStats'     => $this->getRolesStats(),
                'clientsByMonth' => $this->getClientsByMonth(),
            ]
        );
    }
}
