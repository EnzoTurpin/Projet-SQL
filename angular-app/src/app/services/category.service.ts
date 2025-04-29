import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  isMocktail?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, {
      withCredentials: true,
    });
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`, {
      withCredentials: true,
    });
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category, {
      withCredentials: true,
    });
  }

  updateCategory(id: string, category: Category): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, category, {
      withCredentials: true,
    });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, {
      withCredentials: true,
    });
  }
}
