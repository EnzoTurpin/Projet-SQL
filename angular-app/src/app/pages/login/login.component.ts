import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(this.credentials).subscribe({
      next: () => {},
      error: (error) => {
        this.errorMessage = 'Email ou mot de passe incorrect.';
      },
    });
  }
}
