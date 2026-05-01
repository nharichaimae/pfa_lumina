import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;

  submitted = false;
  forgotSubmitted = false;

  errorMessage = '';
  forgotErrorMessage = '';
  forgotSuccessMessage = '';

  showPassword = false;
  showForgotPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  email() {
    return this.loginForm.get('email');
  }

  password() {
    return this.loginForm.get('password');
  }

  forgotEmail() {
    return this.forgotPasswordForm.get('email');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  openForgotPassword() {
    this.showForgotPassword = true;
    this.forgotSubmitted = false;
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';

    const currentEmail = this.loginForm.get('email')?.value;
    if (currentEmail) {
      this.forgotPasswordForm.patchValue({ email: currentEmail });
    }
  }

  closeForgotPassword() {
    this.showForgotPassword = false;
    this.forgotSubmitted = false;
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
    this.forgotPasswordForm.reset();
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.auth.login({ email, password })
      .subscribe({
        next: (res) => {
          const role = res.role;

          this.auth.setAuth(
            res.token,
            role,
            res.id,
            res.nom,
            res.prenom
          );

          if (role.toLowerCase() === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/client-profile']);
          }
        },
        error: (err) => {
  console.log('LOGIN ERROR:', err);
  alert(JSON.stringify(err));

  this.errorMessage =
    err.error?.message ||
    err.message ||
    'Erreur de connexion';
}
      });
  }

  onForgotPassword() {
    this.forgotSubmitted = true;
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';

    if (this.forgotPasswordForm.invalid) return;

    const { email } = this.forgotPasswordForm.value;

   this.auth.forgotPassword({ email })
      .subscribe({
        next: (res) => {
          this.forgotSuccessMessage = res.message || 'Un email de réinitialisation a été envoyé';
          this.forgotErrorMessage = '';
        },
        error: (err) => {
          this.forgotErrorMessage = err.error.message || 'Erreur lors de l’envoi de l’email';
          this.forgotSuccessMessage = '';
        }
      });
  }
}