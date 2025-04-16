import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  error: string = '';
  nameError: string = '';
  passwordErrors: string[] = [];
  emailError: string = '';
  confirmPasswordError: string = '';
  loading: boolean = false;
  showPassword = false;
  showConfirmPassword = false;
  termsAccepted = false;
  termsError = false;
  formSubmitted = false;

  constructor(private authService: AuthService, private router: Router) {}

  validateName(): boolean {
    if (!this.user.name.trim()) {
      this.nameError = 'Veuillez entrer votre nom complet';
      return false;
    }

    if (this.user.name.trim().length < 3) {
      this.nameError = 'Le nom doit contenir au moins 3 caractères';
      return false;
    }

    this.nameError = '';
    return true;
  }

  validateEmail(email: string): boolean {
    if (!email.trim()) {
      this.emailError = 'Veuillez entrer une adresse email';
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    this.emailError = isValid ? '' : 'Veuillez entrer une adresse email valide';
    return isValid;
  }

  validatePassword(password: string): boolean {
    this.passwordErrors = [];

    if (!password) {
      this.passwordErrors.push('Veuillez entrer un mot de passe');
      return false;
    }

    if (password.length < 8) {
      this.passwordErrors.push(
        'Le mot de passe doit contenir au moins 8 caractères'
      );
    }

    if (!/[a-z]/.test(password)) {
      this.passwordErrors.push(
        'Le mot de passe doit contenir au moins une lettre minuscule'
      );
    }

    if (!/[A-Z]/.test(password)) {
      this.passwordErrors.push(
        'Le mot de passe doit contenir au moins une lettre majuscule'
      );
    }

    if (!/[0-9]/.test(password)) {
      this.passwordErrors.push(
        'Le mot de passe doit contenir au moins un chiffre'
      );
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      this.passwordErrors.push(
        'Le mot de passe doit contenir au moins un caractère spécial'
      );
    }

    return this.passwordErrors.length === 0;
  }

  validateConfirmPassword(): boolean {
    if (!this.user.confirmPassword) {
      this.confirmPasswordError = 'Veuillez confirmer votre mot de passe';
      return false;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.confirmPasswordError = 'Les mots de passe ne correspondent pas';
      return false;
    }

    this.confirmPasswordError = '';
    return true;
  }

  onNameChange() {
    if (this.formSubmitted) {
      this.validateName();
    }
  }

  onEmailChange() {
    if (this.user.email || this.formSubmitted) {
      this.validateEmail(this.user.email);
    }
  }

  onPasswordChange() {
    if (this.user.password || this.formSubmitted) {
      this.validatePassword(this.user.password);
    }

    if (this.user.confirmPassword || this.formSubmitted) {
      this.validateConfirmPassword();
    }
  }

  onConfirmPasswordChange() {
    if (this.user.confirmPassword || this.formSubmitted) {
      this.validateConfirmPassword();
    }
  }

  validateForm(): boolean {
    this.formSubmitted = true;

    const nameValid = this.validateName();
    const emailValid = this.validateEmail(this.user.email);
    const passwordValid = this.validatePassword(this.user.password);
    const confirmPasswordValid = this.validateConfirmPassword();

    if (!this.termsAccepted) {
      this.termsError = true;
    } else {
      this.termsError = false;
    }

    return (
      nameValid &&
      emailValid &&
      passwordValid &&
      confirmPasswordValid &&
      this.termsAccepted
    );
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService
      .register({
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        password_confirmation: this.user.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.error =
            err.error.message ||
            "Une erreur est survenue lors de l'inscription";
          this.loading = false;
        },
      });
  }
}
