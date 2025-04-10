import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  public currentUser: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Méthode d'inscription
  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.router.navigate(['/login']);
        }
      })
    );
  }

  // Méthode de connexion
  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.status === 'success') {
          this.currentUser = response.data.user;
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          this.router.navigate(['/']);
        }
      })
    );
  }

  // Méthode de déconnexion
  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser = null;
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      })
    );
  }

  getUser() {
    return this.http.get(`${this.apiUrl}/me`);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  getStoredUser() {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
}
