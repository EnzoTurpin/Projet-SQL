import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  credentials = { name: '', email: '', password: '', confirmedPassword: '' };
  errorMessage = '';

  constructor(private authService: AuthService) {}

  register() {
    if (this.credentials.password !== this.credentials.confirmedPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.authService.register(this.credentials).subscribe({
      next: () => {},
      error: (error) => {
        this.errorMessage = 'Email invalide.';
      },
    });
  }
}
