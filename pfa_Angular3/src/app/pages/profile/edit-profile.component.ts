import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ClientService } from '../../services/client';
import { AuthService } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-client-profile-edit-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-profile.component.html'
})
export class EditProfileComponent implements OnInit {
  loading$ = this.clientService.loading$;
  client$ = this.clientService.client$;
  error: string | null = null;

  private clientId!: number;

  form = this.fb.group({
    email: [{ value: '', disabled: true }],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    telephone: [''],
    cin: [''],
    password: ['']
  });

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupère l'ID depuis le JWT
    const id = this.authService.getUserId();
    if (!id) {
      console.error('ID utilisateur non trouvé dans le token');
      this.router.navigate(['/login']);
      return;
    }
    this.clientId = id;

    // Charge le client
    this.clientService.loadClient(this.clientId);

    // Remplit le formulaire quand le client est chargé
    this.client$.subscribe(client => {
      if (client) {
        this.form.patchValue({
          email: client.email,
          nom: client.nom,
          prenom: client.prenom,
          telephone: client.telephone,
          cin: client.cin
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    payload.password = payload.password?.trim() ?? '';

    console.log('Payload envoyé:', payload);

    this.clientService.updateClient(this.clientId, payload).subscribe({
      next: () => this.router.navigate(['/client-profile']),
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la mise à jour';
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/client-profile']);
  }
}
