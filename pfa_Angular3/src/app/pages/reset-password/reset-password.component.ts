import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;

  token: string = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = 'Token introuvable dans le lien.';
    }
  }

  newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.token) {
      this.errorMessage = 'Token invalide ou manquant.';
      return;
    }

    if (this.resetPasswordForm.invalid) {
      return;
    }

    const payload = {
      token: this.token,
      newPassword: this.newPassword()?.value
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Mot de passe réinitialisé avec succès';
        this.errorMessage = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la réinitialisation du mot de passe';
        this.successMessage = '';
      }
    });
  }
}