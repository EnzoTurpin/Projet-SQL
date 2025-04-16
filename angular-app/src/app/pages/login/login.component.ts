import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };
  error: string = '';
  emailError: string = '';
  passwordError: string = '';
  loading: boolean = false;
  showPassword = false;
  formSubmitted = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  validateEmail(): boolean {
    if (!this.credentials.email.trim()) {
      this.emailError = 'Veuillez entrer votre adresse email';
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(this.credentials.email);

    if (!isValid) {
      this.emailError = 'Veuillez entrer une adresse email valide';
      return false;
    }

    this.emailError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.credentials.password) {
      this.passwordError = 'Veuillez entrer votre mot de passe';
      return false;
    }

    this.passwordError = '';
    return true;
  }

  onEmailChange() {
    if (this.formSubmitted) {
      this.validateEmail();
    }
  }

  onPasswordChange() {
    if (this.formSubmitted) {
      this.validatePassword();
    }
  }

  validateForm(): boolean {
    this.formSubmitted = true;
    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();

    return emailValid && passwordValid;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.errorMessage = '';

    this.authService
      .login(this.credentials.email, this.credentials.password)
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.log('Login error:', err);
          if (err.status === 401) {
            this.error = 'Email ou mot de passe incorrect';
            this.errorMessage = 'Email ou mot de passe incorrect';
          } else {
            this.error =
              err && err.error && err.error.message
                ? err.error.message
                : 'Une erreur est survenue lors de la connexion';
            this.errorMessage = this.error;
          }
          this.loading = false;
        },
      });
  }
}
