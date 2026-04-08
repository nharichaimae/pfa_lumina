<?php

namespace App\Mapper\admin;

class DashboardMapper
{
    public function mapDashboard(
        array $totals,
        array $status,
        array $roles,
        array $clientsByMonth
    ): array {

        return array_merge(
            $totals,
            $status,
            [
                'rolesStats'     => $this->mapRoles($roles),
                'clientsByMonth' => $this->mapClientsByMonth($clientsByMonth),
            ]
        );
    }

    private function mapRoles(array $roles): array
    {
        return array_map(function ($row) {
            return [
                'role'  => $row['role'],
                'total' => (int) $row['total'],
            ];
        }, $roles);
    }

    private function mapClientsByMonth(array $clients): array
    {
        return array_map(function ($row) {
            return [
                'month' => $row['month'],
                'total' => (int) $row['total'],
            ];
        }, $clients);
    }
}
