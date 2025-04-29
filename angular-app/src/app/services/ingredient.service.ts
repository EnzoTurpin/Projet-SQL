import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Ingredient {
  _id?: string;
  id?: string;
  name: string;
  quantity?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getAllIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.apiUrl}/ingredients`, {
      withCredentials: true,
    });
  }

  getIngredient(id: string): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.apiUrl}/ingredients/${id}`, {
      withCredentials: true,
    });
  }

  createIngredient(ingredient: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(
      `${this.apiUrl}/ingredients`,
      ingredient,
      {
        withCredentials: true,
      }
    );
  }

  updateIngredient(id: string, ingredient: Ingredient): Observable<any> {
    // Cette méthode n'est plus utilisée directement
    // Nous utilisons maintenant createIngredient pour les mises à jour
    // en gérant les anciens éléments dans le composant
    return this.http.post(
      `${this.apiUrl}/ingredients`,
      {
        ...ingredient,
        id: id,
      },
      {
        withCredentials: true,
      }
    );
  }

  deleteIngredient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ingredients/${id}`, {
      withCredentials: true,
    });
  }
}
