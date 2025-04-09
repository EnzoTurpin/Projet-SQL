import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse> {
    // Retourner un Observable<ApiResponse>
    return this.http.get<ApiResponse>('http://localhost:8000/api/users');
  }
}
