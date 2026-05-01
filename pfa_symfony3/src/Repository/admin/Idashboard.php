<?php

namespace App\Repository\admin;

interface Idashboard
{
  
    public function getTotals(): array;
    public function getClientsStatus(): array;
    public function getRolesStats(): array;
    public function getClientsByMonth(): array;
    public function getDashboardData(): array;
}
