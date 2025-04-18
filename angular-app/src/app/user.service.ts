import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { GetUsersResponse, User } from './models/user.model';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUsers(): Observable<GetUsersResponse> {
    return this.authService.refreshCsrfToken().pipe(
      switchMap(() => {
        return this.http.get<GetUsersResponse>(`${this.apiUrl}/users`, {
          withCredentials: true,
        });
      }),
      catchError((err) => {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        return throwError(() => err);
      })
    );
  }

  banUser(id: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/users/${id}/ban`,
      {},
      { withCredentials: true }
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, {
      withCredentials: true,
    });
  }
}
