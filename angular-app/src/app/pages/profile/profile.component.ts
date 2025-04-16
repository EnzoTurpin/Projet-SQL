import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { Recette } from '../../interfaces/recette.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isEditing = false;
  userForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    updatePassword: false,
  };
  successMessage = '';
  errorMessage = '';
  loading = false;
  showPassword = false;
  showPasswordConfirmation = false;
  favoriteRecipes: Recette[] = [];
  loadingFavorites = false;

  // Helper methods for password validation
  hasLowerCase(password: string | undefined): boolean {
    return password ? /[a-z]/.test(password) : false;
  }

  hasUpperCase(password: string | undefined): boolean {
    return password ? /[A-Z]/.test(password) : false;
  }

  hasNumber(password: string | undefined): boolean {
    return password ? /[0-9]/.test(password) : false;
  }

  hasSpecialChar(password: string | undefined): boolean {
    return password ? /[\@$!%*#?&]/.test(password) : false;
  }

  passwordsMatch(): boolean {
    return !!(
      this.userForm.password &&
      this.userForm.password_confirmation &&
      this.userForm.password === this.userForm.password_confirmation
    );
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get user data
    this.user = this.authService.getStoredUser();

    // Initialize form with current values
    this.userForm.name = this.user.name;
    this.userForm.email = this.user.email;
    this.userForm.password = '';
    this.userForm.password_confirmation = '';
    this.userForm.updatePassword = false;

    // Chargement des recettes favorites
    this.loadFavoriteRecipes();
  }

  loadFavoriteRecipes(): void {
    this.loadingFavorites = true;
    this.favoriteService.getFavorites().subscribe(
      (favorites: any[]) => {
        this.loadingFavorites = false;
        // Les favoris sont maintenant directement un tableau
        this.favoriteRecipes = favorites.map((fav: any) => ({
          id: fav.recipe_id || fav._id,
          name: fav.recipe?.name || 'Sans nom',
          description: fav.recipe?.instructions
            ? fav.recipe.instructions.substring(0, 100) + '...'
            : 'Aucune description disponible',
          image: fav.recipe?.image || 'https://via.placeholder.com/150',
          difficulty: this.getDifficulty(fav.recipe) as
            | 'Facile'
            | 'Moyen'
            | 'Difficile',
          preparationTime: this.getPreparationTime(fav.recipe),
          isFavorite: true,
        }));
      },
      (error) => {
        this.loadingFavorites = false;
        console.error('Erreur lors du chargement des favoris:', error);
      }
    );
  }

  // Helpers pour déterminer la difficulté et le temps de préparation
  private getDifficulty(recipe: any): 'Facile' | 'Moyen' | 'Difficile' {
    if (!recipe) return 'Moyen';

    const ingredientCount = recipe.ingredients?.length || 0;
    if (ingredientCount <= 3) return 'Facile';
    if (ingredientCount <= 6) return 'Moyen';
    return 'Difficile';
  }

  private getPreparationTime(recipe: any): string {
    if (!recipe) return '?';

    const ingredientCount = recipe.ingredients?.length || 0;
    const instructionsLength = recipe.instructions?.length || 0;

    if (ingredientCount <= 3 && instructionsLength < 200) return '5 min';
    if (ingredientCount <= 6 && instructionsLength < 500) return '10 min';
    return '15+ min';
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    // Réinitialiser les champs de mot de passe si on annule l'édition
    if (!this.isEditing) {
      this.userForm.password = '';
      this.userForm.password_confirmation = '';
      this.userForm.updatePassword = false;
      this.showPassword = false;
      this.showPasswordConfirmation = false;
    }
  }

  togglePasswordUpdate(): void {
    this.userForm.updatePassword = !this.userForm.updatePassword;
    if (!this.userForm.updatePassword) {
      // Réinitialiser les champs si on désactive la mise à jour du mot de passe
      this.userForm.password = '';
      this.userForm.password_confirmation = '';
      this.showPassword = false;
      this.showPasswordConfirmation = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmationVisibility() {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  updateProfile(): void {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Validation du formulaire
    if (!this.userForm.name.trim()) {
      this.errorMessage = 'Le champ nom est obligatoire.';
      this.loading = false;
      return;
    }

    if (!this.userForm.email.trim()) {
      this.errorMessage = 'Le champ email est obligatoire.';
      this.loading = false;
      return;
    }

    // Validation de l'email avec expression régulière
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(this.userForm.email)) {
      this.errorMessage = "L'adresse email doit être valide.";
      this.loading = false;
      return;
    }

    // Préparation des données à envoyer
    const updateData: any = {
      name: this.userForm.name,
      email: this.userForm.email,
    };

    // Validation spécifique au mot de passe si la mise à jour est activée
    if (this.userForm.updatePassword) {
      // Vérifier si un mot de passe est fourni quand la mise à jour est activée
      if (!this.userForm.password) {
        this.errorMessage =
          'Le mot de passe est obligatoire lorsque vous choisissez de le modifier.';
        this.loading = false;
        return;
      }

      if (this.userForm.password.length < 6) {
        this.errorMessage =
          'Le mot de passe doit contenir au moins 6 caractères.';
        this.loading = false;
        return;
      }

      // Validation pour les minuscules
      if (!this.hasLowerCase(this.userForm.password)) {
        this.errorMessage =
          'Le mot de passe doit contenir au moins une lettre minuscule.';
        this.loading = false;
        return;
      }

      // Validation pour les majuscules
      if (!this.hasUpperCase(this.userForm.password)) {
        this.errorMessage =
          'Le mot de passe doit contenir au moins une lettre majuscule.';
        this.loading = false;
        return;
      }

      // Validation pour les chiffres
      if (!this.hasNumber(this.userForm.password)) {
        this.errorMessage =
          'Le mot de passe doit contenir au moins un chiffre.';
        this.loading = false;
        return;
      }

      // Validation pour les caractères spéciaux
      if (!this.hasSpecialChar(this.userForm.password)) {
        this.errorMessage =
          'Le mot de passe doit contenir au moins un caractère spécial (@$!%*#?&).';
        this.loading = false;
        return;
      }

      if (!this.passwordsMatch()) {
        this.errorMessage = 'Les mots de passe ne correspondent pas.';
        this.loading = false;
        return;
      }

      // Ajouter le mot de passe aux données à envoyer
      updateData.password = this.userForm.password;
      updateData.password_confirmation = this.userForm.password_confirmation;
    }

    // Mettre à jour l'utilisateur via le service d'authentification
    this.authService.updateUser(updateData).subscribe({
      next: (response: any) => {
        if (response && response.status === 'success') {
          this.successMessage = 'Profil mis à jour avec succès!';
          this.isEditing = false;
          // Mettre à jour les données locales
          this.user = this.authService.getStoredUser();

          // Réinitialiser les champs de mot de passe
          this.userForm.password = '';
          this.userForm.password_confirmation = '';
          this.userForm.updatePassword = false;
        } else if (response && response.status === 'error') {
          // Afficher l'erreur retournée par le serveur
          this.errorMessage =
            response.message ||
            'Une erreur est survenue lors de la mise à jour du profil.';

          // En cas d'erreur de validation de mot de passe, ne pas cacher le formulaire
          if (response.message && response.message.includes('mot de passe')) {
            // Garder le formulaire ouvert pour permettre de corriger
            this.loading = false;
            return;
          }
        } else {
          // Mise à jour réussie mais uniquement locale
          this.successMessage =
            'Profil mis à jour localement. La synchronisation avec le serveur pourrait être incomplète.';
          this.isEditing = false;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du traitement de la réponse:', error);
        this.errorMessage =
          'Une erreur inattendue est survenue lors de la mise à jour du profil.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Même en cas d'erreur, naviguer vers la page de login
        // car AuthService gère la déconnexion locale
        this.router.navigate(['/login']);
      },
    });
  }

  // Retirer de favoris
  removeFavorite(recipeId: string): void {
    this.favoriteService.toggleFavorite(recipeId).subscribe(
      (response) => {
        console.log('Réponse du serveur lors de la suppression:', response);
        // Supprimer des favoris dans l'interface, quelle que soit la réponse du serveur
        this.favoriteRecipes = this.favoriteRecipes.filter(
          (recipe) => recipe.id !== recipeId
        );
        this.successMessage = 'Recette retirée des favoris';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      (error) => {
        console.error('Erreur lors de la suppression des favoris:', error);
        this.errorMessage = 'Impossible de retirer la recette des favoris';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    );
  }

  // Navigation vers une recette
  navigateToRecipe(id: string): void {
    this.router.navigate(['/cocktail', id]);
  }
}
