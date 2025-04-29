import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Glass {
  _id?: string;
  id?: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GlassService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getAllGlasses(): Observable<Glass[]> {
    return this.http.get<Glass[]>(`${this.apiUrl}/glass`, {
      withCredentials: true,
    });
  }

  getGlass(id: string): Observable<Glass> {
    return this.http.get<Glass>(`${this.apiUrl}/glass/${id}`, {
      withCredentials: true,
    });
  }

  createGlass(glass: Glass): Observable<Glass> {
    return this.http.post<Glass>(`${this.apiUrl}/glass`, glass, {
      withCredentials: true,
    });
  }

  updateGlass(id: string, glass: Glass): Observable<any> {
    // Cette méthode n'est plus utilisée directement
    return this.http.post(
      `${this.apiUrl}/glass`,
      {
        ...glass,
        id: id,
      },
      {
        withCredentials: true,
      }
    );
  }

  deleteGlass(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/glass/${id}`, {
      withCredentials: true,
    });
  }
}
