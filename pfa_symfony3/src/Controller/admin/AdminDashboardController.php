<?php

namespace App\Controller\admin;
use App\Mapper\admin\DashboardMapper;

use App\Repository\admin\Idashboard;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class AdminDashboardController extends AbstractController
{
    public function __construct(
        private Idashboard $dashboardRepository,
           private DashboardMapper $dashboardMapper
    ) {}

    #[Route('/api/dashboard', name: 'api_dashboard', methods: ['GET'])]
    public function apiDashboard(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $totals = $this->dashboardRepository->getTotals();
        $status = $this->dashboardRepository->getClientsStatus();
        $roles  = $this->dashboardRepository->getRolesStats();
        $clients = $this->dashboardRepository->getClientsByMonth();

        $data = $this->dashboardMapper->mapDashboard(
            $totals,
            $status,
            $roles,
            $clients
        );

        return $this->json($data);
    }
}
