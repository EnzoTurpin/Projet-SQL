import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UnbanRequestService } from '../../services/unban-request.service';

@Component({
  selector: 'app-banned',
  templateUrl: './banned.component.html',
  styleUrls: ['./banned.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class BannedComponent implements OnInit {
  // États du formulaire
  showForm = false;
  formSubmitted = false;
  formError = '';
  formSuccess = '';
  isSubmitting = false;

  // Données utilisateur
  currentUser: any;

  // Données du formulaire
  unbanRequest = {
    reason: '',
  };

  constructor(
    private authService: AuthService,
    private unbanRequestService: UnbanRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer les informations de l'utilisateur connecté depuis le localStorage ou l'API
    this.currentUser = this.authService.getStoredUser();

    // Si aucun utilisateur stocké localement, tenter de le récupérer silencieusement
    if (!this.currentUser) {
      this.authService.getUserSilent().subscribe((user) => {
        this.currentUser = user;
      });
    }
  }

  // Afficher le formulaire
  toggleForm(): void {
    this.showForm = !this.showForm;
    // Réinitialiser les états si on ferme le formulaire
    if (!this.showForm) {
      this.resetForm();
    }
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.unbanRequest.reason = '';
    this.formSubmitted = false;
    this.formError = '';
    this.formSuccess = '';
  }

  // Soumettre la demande de débanissement
  submitUnbanRequest(): void {
    // Vérifier que la raison n'est pas vide
    if (!this.unbanRequest.reason.trim()) {
      this.formError = 'Veuillez expliquer la raison de votre demande.';
      return;
    }

    // Vérifier que la raison a au moins 10 caractères
    if (this.unbanRequest.reason.trim().length < 10) {
      this.formError =
        'Votre explication doit contenir au moins 10 caractères.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    // Vérifier que l'utilisateur est bien chargé (_id pour Mongo, id pour API Laravel)
    const userId = this.currentUser?._id ?? this.currentUser?.id;

    if (!this.currentUser || !userId) {
      this.formError =
        'Impossible de récupérer vos informations. Veuillez rafraîchir la page.';
      this.isSubmitting = false;
      return;
    }

    console.log('Utilisateur actuel:', this.currentUser);

    // Créer l'objet de demande
    const requestData = {
      user_id: userId,
      user_email: this.currentUser.email,
      user_name: this.currentUser.name,
      reason: this.unbanRequest.reason,
      status: 'pending' as 'pending',
    };

    console.log('Données à envoyer:', requestData);

    // Envoyer la demande
    this.unbanRequestService.createRequest(requestData).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        this.isSubmitting = false;
        this.formSubmitted = true;
        this.formSuccess =
          'Votre demande a été envoyée avec succès. Vous serez notifié par email de la décision.';
      },
      error: (error) => {
        console.error("Erreur lors de l'envoi de la demande:", error);
        this.isSubmitting = false;
        this.formError =
          error?.error?.message ||
          'Une erreur est survenue. Veuillez réessayer.';

        if (error?.error?.errors) {
          const errorDetails = Object.values(error.error.errors).flat();
          if (errorDetails.length > 0) {
            this.formError += ' ' + errorDetails.join(' ');
          }
        }
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
