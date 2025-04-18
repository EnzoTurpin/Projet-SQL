import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Vérification de l'authentification
    this.userService.getUsers().subscribe({
      next: (res) => {
        console.log('Réponse API utilisateurs :', res);
        this.users = res.data?.users || [];
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
      },
    });
  }

  banUser(id: string): void {
    this.userService.banUser(id).subscribe({
      next: () => {
        console.log(`Utilisateur ${id} banni`);
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du bannissement :', err);
      },
    });
  }

  deleteUser(id: string): void {
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
