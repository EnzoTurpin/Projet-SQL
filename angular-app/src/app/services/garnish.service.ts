import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Garnish {
  _id?: string;
  id?: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GarnishService {
  private apiUrl = '/api';
  constructor(private http: HttpClient) {}

  getAllGarnishes(): Observable<Garnish[]> {
    return this.http.get<Garnish[]>(`${this.apiUrl}/garnishes`, {
      withCredentials: true,
    });
  }

  createGarnish(garnish: Garnish): Observable<Garnish> {
    return this.http.post<Garnish>(`${this.apiUrl}/garnishes`, garnish, {
      withCredentials: true,
    });
  }

  updateGarnish(id: string, garnish: Garnish): Observable<any> {
    // Cette méthode n'est plus utilisée directement
    return this.http.post(
      `${this.apiUrl}/garnishes`,
      {
        ...garnish,
        id: id,
      },
      {
        withCredentials: true,
      }
    );
  }

  deleteGarnish(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/garnishes/${id}`, {
      withCredentials: true,
    });
  }
}
