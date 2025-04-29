import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnbanRequest } from '../models/unban-request.model';

@Injectable({
  providedIn: 'root',
})
export class UnbanRequestService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Envoyer une demande de débanissement
  createRequest(requestData: Partial<UnbanRequest>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/unban-requests`, requestData, {
      withCredentials: true,
    });
  }

  // Récupérer toutes les demandes de débanissement (pour les administrateurs)
  getRequests(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unban-requests`, {
      withCredentials: true,
    });
  }

  // Approuver une demande de débanissement
  approveRequest(requestId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/unban-requests/${requestId}/approve`,
      {},
      { withCredentials: true }
    );
  }

  // Rejeter une demande de débanissement
  rejectRequest(requestId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/unban-requests/${requestId}/reject`,
      {},
      { withCredentials: true }
    );
  }
}
