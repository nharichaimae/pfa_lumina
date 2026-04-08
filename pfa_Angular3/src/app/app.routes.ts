import { Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { PaiementComponent } from './components/paiement/paiement';
import { AbonnementComponent } from './components/paiement/abonnement/abonnement';

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [

      // ===== PROFIL CLIENT =====
      {
        path: 'client-profile',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/profile/profile.component')
                .then(c => c.ProfileComponent)
          },
          {
            path: 'edit',
            loadComponent: () =>
              import('./pages/profile/edit-profile.component')
                .then(c => c.EditProfileComponent)
          }
        ]
      },

      // ===== DASHBOARD ADMIN =====
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./demo/dashboard/dashboard.component')
            .then(c => c.DashboardComponent)
      },

      // ===== PAGES COMMUNES =====
      {
        path: 'pieces',
        loadComponent: () =>
          import('./pieces/pieces')
            .then(c => c.PiecesComponent)
      },
      {
        path: 'client-dash',
        loadComponent: () =>
          import('./client-dashb/client-dashb')
            .then(c => c.ClientDashb)
      },
      {
        path: 'equipement/:id',
        loadComponent: () =>
          import('./equipement/equipement')
            .then(c => c.AddEquipementComponent)
      },

      // ===== TES PAGES =====
      {
        path: 'condition',
        loadComponent: () =>
          import('./pages/condition/condition-form.component')
            .then(c => c.ConditionFormComponent)
      },
      {
        path: 'regle',
        loadComponent: () =>
          import('./pages/regle/regle-form.component')
            .then(c => c.RegleFormComponent)
      },

      // ===== REDIRECT PAR DÉFAUT =====
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ===== AUTH =====
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-signin/auth-signin.component')
            .then(c => c.AuthSigninComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-signup/auth-signup.component')
            .then(c => c.AuthSignupComponent)
      }
    ]
  },

 //=======  Paiement =================
 { path: 'paiement', component: PaiementComponent },
 { path: '', redirectTo: 'paiement', pathMatch: 'full' } ,
 // ====== abonnoment =================
  { path: 'abonnement', component: AbonnementComponent },
 { path: '', redirectTo: 'abonnement', pathMatch: 'full' }
];