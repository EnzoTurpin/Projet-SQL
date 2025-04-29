import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Vérifie si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifie si l'utilisateur est un admin
    const user = this.authService.getStoredUser();
    if (user && user.user_type === 'admin') {
      return true;
    } else {
      this.router.navigate(['/']); // Redirection vers la page d'accueil
      return false;
    }
  }
}
