import { Injectable } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'] || [];

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRoles.length > 0 && !expectedRoles.some(r => this.authService.hasRole(r))) {
      alert('Accès refusé: vous n’avez pas le rôle nécessaire');
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
