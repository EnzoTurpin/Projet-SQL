import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse {
  // Définir la structure de la réponse API
  data: any[];
  // autres propriétés si nécessaire
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse> {
    // Retourner un Observable<ApiResponse>
    return this.http.get<ApiResponse>(`${this.apiUrl}/users`);
  }
}
