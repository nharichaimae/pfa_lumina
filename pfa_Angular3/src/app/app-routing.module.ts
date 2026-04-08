import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Layouts
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

// Guard
import { AuthGuard } from '../app/guards/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard (admin only)
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./demo/dashboard/dashboard.component')
            .then(c => c.DashboardComponent),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },

      // Profils
      {
        path: 'client-profile',
        loadComponent: () => import('./pages/profile/profile.component').then(c => c.ProfileComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },
      {
        path: 'client-profile/edit',
        loadComponent: () => import('./pages/profile/edit-profile.component').then(c => c.EditProfileComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },
      {
        path: 'admin-profile',
        loadComponent: () => import('./pages/admin-profile/admin-profile.page').then(m => m.AdminProfilePage),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin-profile-edit',
        loadComponent: () => import('./pages/admin-profile-edit/admin-profile-edit.page').then(m => m.AdminProfileEditPage),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },

      // Clients CRUD (admin only)
      {
        path: 'clients',
        loadComponent: () => import('./client/show-client/client').then(m => m.ClientComponent),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'clients/add',
        loadComponent: () => import('./client/add-client/add-client').then(m => m.AddClientComponent),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./client/client-detaille/detail').then(m => m.ClientDetail),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'historique-paiement',
        loadComponent: () => 
          import('./historique-paiement/historique-paiement')
            .then(m => m.HistoriqueComponent),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },

      // ← AJOUTÉ depuis le projet de ta copine
      // Pieces (client only)
      {
        path: 'pieces',
        loadComponent: () => import('./pieces/pieces').then(c => c.PiecesComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },

 
      // Client Dashboard
      {
        path: 'client-dash',
        loadComponent: () => import('./client-dashb/client-dashb').then(c => c.ClientDashb),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },

 
      // Equipement
      {
        path: 'equipement/:id',
        loadComponent: () => import('./equipement/equipement').then(c => c.AddEquipementComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },

      // ← AJOUTÉ : tes pages Condition et Règle
      {
        path: 'condition',
        loadComponent: () => import('./pages/condition/condition-form.component').then(c => c.ConditionFormComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },
      {
        path: 'regle',
        loadComponent: () => import('./pages/regle/regle-form.component').then(c => c.RegleFormComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },
            //historique
      {
        path: 'client-historique',
        loadComponent: () =>
          import('./historique/historique').then(c => c.HistoriqueComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },

      // Autres pages
      {
        path: 'basic',
        loadChildren: () =>
          import('./demo/ui-elements/ui-basic/ui-basic.module').then(m => m.UiBasicModule)
      },
      {
        path: 'forms',
        loadComponent: () => import('./demo/pages/form-element/form-element').then(c => c.FormElement)
      },
      {
        path: 'tables',
        loadComponent: () => import('./demo/pages/tables/tbl-bootstrap/tbl-bootstrap.component').then(c => c.TblBootstrapComponent)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/pages/core-chart/apex-chart/apex-chart.component').then(c => c.ApexChartComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component').then(c => c.SamplePageComponent)
      },

        // paiement
      {
        path: 'abonnement',
        loadComponent: () => import('./components/paiement/abonnement/abonnement').then(c => c.AbonnementComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      },
          // paiement
      {
        path: 'paiement',
        loadComponent: () => import('./components/paiement/paiement').then(c => c.PaiementComponent),
        canActivate: [AuthGuard],
        data: { roles: ['CLIENT'] }
      }
    ]
  },

  // Auth
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
      },
      {
      path: 'set-password',
      loadComponent: () =>
        import('./pages/set-password/set-password')
          .then(c => c.SetPasswordComponent)
    },
     
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password/reset-password.component')
            .then(c => c.ResetPasswordComponent)
      }
    ]
  }


];




@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}