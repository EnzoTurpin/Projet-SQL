import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminCocktailComponent } from './admin-cocktail/admin-cocktail.component';
import { UnbanRequestService } from '../../services/unban-request.service';
import { UnbanRequest } from '../../models/unban-request.model';
import { AdminBarItemsComponent } from './admin-bar-items/admin-bar-items.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule, AdminCocktailComponent, AdminBarItemsComponent],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  unbanRequests: UnbanRequest[] = [];
  activeTab = 'users'; // Par défaut, affiche l'onglet des utilisateurs
  unbanRequestsTab = 'pending'; // Par défaut, affiche les demandes en attente
  errorMessage = ''; // Message d'erreur à afficher

  // Getter pour récupérer uniquement les demandes en attente (status="pending")
  get pendingUnbanRequests(): UnbanRequest[] {
    return this.unbanRequests.filter((request) => request.status === 'pending');
  }

  constructor(
    private userService: UserService,
    private unbanRequestService: UnbanRequestService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadUnbanRequests();
  }

  loadUsers(): void {
    // Vérification de l'authentification
    this.userService.getUsers().subscribe({
      next: (res) => {
        console.log('Réponse API utilisateurs :', res);
        const rawUsers = res.data?.users || [];
        // S'assurer que chaque utilisateur a la propriété banned définie (false si absente)
        this.users = rawUsers.map((u: any) => ({
          ...u,
          banned: !!u.banned, // convertit undefined/null -> false
        }));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
      },
    });
  }

  // Charger les demandes de débanissement
  loadUnbanRequests(): void {
    this.unbanRequestService.getRequests().subscribe({
      next: (res) => {
        console.log('Réponse API demandes de débanissement :', res);
        this.unbanRequests = res.data?.requests || [];
      },
      error: (err: HttpErrorResponse) => {
        console.error(
          'Erreur lors de la récupération des demandes de débanissement :',
          err
        );
      },
    });
  }

  banUser(userOrId: any): void {
    const user =
      typeof userOrId === 'string'
        ? this.users.find(
            (u) => u._id === userOrId || (u as any).id === userOrId
          )
        : userOrId;

    if (!user) {
      console.error('Utilisateur introuvable', userOrId);
      return;
    }

    // Bloquer l'action si l'utilisateur est un admin et afficher un message d'erreur
    if (user.user_type === 'admin') {
      this.errorMessage =
        "Impossible de modifier le statut d'un administrateur!";

      // Faire disparaître le message après 3 secondes
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);

      console.error('Impossible de bannir un administrateur');
      return;
    }

    const id = user._id || (user as any).id;
    if (!id) {
      console.error("Impossible de déterminer l'ID pour bannir", userOrId);
      return;
    }

    this.userService.banUser(id).subscribe({
      next: (res) => {
        console.log(`Utilisateur ${id} statut mis à jour`);
        // Au lieu de mettre à jour seulement un élément, on recharge tous les utilisateurs
        // Cela garantit que l'état de l'interface est correct
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du bannissement :', err);
      },
    });
  }

  deleteUser(userOrId: any): void {
    const user =
      typeof userOrId === 'string'
        ? this.users.find(
            (u) => u._id === userOrId || (u as any).id === userOrId
          )
        : userOrId;

    if (!user) {
      console.error('Utilisateur introuvable', userOrId);
      return;
    }

    // Bloquer l'action si l'utilisateur est un admin et afficher un message d'erreur
    if (user.user_type === 'admin') {
      this.errorMessage = 'Impossible de supprimer un compte administrateur!';

      // Faire disparaître le message après 3 secondes
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);

      console.error('Impossible de supprimer un administrateur');
      return;
    }

    const id = user._id || (user as any).id;
    if (!id) {
      console.error("Impossible de déterminer l'ID pour supprimer", userOrId);
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          console.log(`Utilisateur ${id} supprimé`);
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression :', err);
        },
      });
    }
  }

  // Approuver une demande de débanissement
  approveUnbanRequest(request: UnbanRequest): void {
    const reqId = request._id || request.id;

    if (!reqId) {
      console.error('ID de demande manquant');
      return;
    }

    this.unbanRequestService.approveRequest(reqId).subscribe({
      next: (res) => {
        console.log(`Demande ${reqId} approuvée`);
        // Rafraîchir les demandes et les utilisateurs
        this.loadUnbanRequests();
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erreur lors de l'approbation de la demande :", err);
      },
    });
  }

  // Rejeter une demande de débanissement
  rejectUnbanRequest(request: UnbanRequest): void {
    const reqId = request._id || request.id;

    if (!reqId) {
      console.error('ID de demande manquant');
      return;
    }

    this.unbanRequestService.rejectRequest(reqId).subscribe({
      next: (res) => {
        console.log(`Demande ${reqId} rejetée`);
        // Rafraîchir les demandes
        this.loadUnbanRequests();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du rejet de la demande :', err);
      },
    });
  }
}
