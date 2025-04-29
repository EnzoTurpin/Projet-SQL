import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const bannedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Récupérer l'utilisateur stocké
  const user = authService.getStoredUser();

  // Si l'utilisateur est banni, rediriger vers la page de bannissement
  if (user && user.banned) {
    router.navigate(['/banned']);
    return false;
  }

  return true;
};
