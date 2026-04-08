import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminProfileFacade } from '../../facades/admin-profile.facade';
import { AuthService } from '../../services/auth';
import { take } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-admin-profile-edit-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-profile-edit.page.html'
})
export class AdminProfileEditPage implements OnInit {
  loading$ = this.facade.loading$;
  error$ = this.facade.error$;
  profile$ = this.facade.profile$;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]]
  });

  private adminId!: number; // sera défini dynamiquement

  constructor(
    private fb: FormBuilder,
    private facade: AdminProfileFacade,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // récupérer ID de l'admin connecté
    const id = this.authService.getUserId();
    if (!id) {
      // si non authentifié → redirection login
      this.router.navigate(['/login']);
      return;
    }
    this.adminId = id;

    // charger le profil
    this.facade.loadProfile(this.adminId);

    // remplir le formulaire dès que les données sont disponibles
    this.profile$.pipe(take(1)).subscribe((p) => {
      if (!p) return;
      this.form.patchValue({
        email: p.email,
        nom: p.nom,
        prenom: p.prenom
      });
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.facade.updateProfile(this.adminId, this.form.value, () => {
      this.router.navigate(['/admin-profile']);
    });
  }

  cancel(): void {
    this.router.navigate(['/admin-profile']);
  }
}
