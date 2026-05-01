<?php
namespace App\Entity\admin;

use Doctrine\ORM\Mapping as ORM;
use App\Entity\user\Utilisateur;
use App\Repository\admin\AdministrateurRepository;


#[ORM\Entity]
class Administrateur extends Utilisateur
{
    
}
