import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse {
  data?: {
    users?: any[];
    [key: string]: any;
  };
  status?: string;
  message?: string;
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

  banUser(id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.apiUrl}/users/${id}/ban`, {});
  }

  deleteUser(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/users/${id}`);
  }
}
