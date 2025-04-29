import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';
import { Recette } from '../interfaces/recette.interface';
import { map, switchMap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RecetteService {
  private apiUrl = '/api';

  // Options HTTP par défaut pour toutes les requêtes
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }),
    withCredentials: true, // Important pour les cookies de session
  };

  constructor(private http: HttpClient) {}

  /**
   * Obtient un nouveau CSRF token avant de faire une requête
   */
  private getCSRFToken() {
    return this.http
      .get('/sanctum/csrf-cookie', {
        withCredentials: true,
      })
      .pipe(
        tap(() => console.log('CSRF token obtenu')),
        catchError((error) => {
          console.error("Erreur lors de l'obtention du CSRF token:", error);
          return of(null);
        })
      );
  }

  /**
   * Récupère la liste des recettes depuis l'API
   */
  getRecettes(): Observable<Recette[]> {
    console.log("Récupération des recettes depuis l'API");

    return this.getCSRFToken().pipe(
      switchMap(() => {
        return this.http
          .get<any>(`${this.apiUrl}/recipes`, this.httpOptions)
          .pipe(
            tap((response) => {
              console.log(
                "Réponse brute de l'API pour les recettes:",
                response
              );
            }),
            catchError((error) => {
              console.error(
                'Erreur lors de la récupération des recettes:',
                error
              );
              return of([]);
            }),
            map((response) => {
              return this.mapRecipesToRecettes(response || []);
            })
          );
      })
    );
  }

  /**
   * Récupère une recette spécifique par son ID
   */
  getRecetteById(id: string): Observable<any> {
    return this.getCSRFToken().pipe(
      switchMap(() => {
        return this.http
          .get<any>(`${this.apiUrl}/recipes/${id}`, this.httpOptions)
          .pipe(
            catchError((error) => {
              console.error(
                `Erreur lors de la récupération de la recette ${id}:`,
                error
              );
              return of(null);
            })
          );
      })
    );
  }

  filterRecipes(filters: {
    category_id?: string;
    glass_id?: string;
    ingredient_ids?: string[];
  }) {
    let params = new HttpParams();
    if (filters.category_id)
      params = params.set('category_id', filters.category_id);
    if (filters.glass_id) params = params.set('glass_id', filters.glass_id);
    if (filters.ingredient_ids && filters.ingredient_ids.length > 0) {
      params = params.set('ingredient_ids', filters.ingredient_ids.join(','));
    }

    return this.http.get(`${this.apiUrl}/recipes/filter`, { params });
  }

  /**get pour le filtre */
  getCategories() {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  getGlasses() {
    return this.http.get<any[]>(`${this.apiUrl}/glasses`);
  }

  getIngredients() {
    return this.http.get<any[]>(`${this.apiUrl}/ingredients`);
  }

  /**
   * Détermine la difficulté d'une recette basée sur le nombre d'ingrédients
   */
  private determineDifficulty(recipe: any): 'Facile' | 'Moyen' | 'Difficile' {
    const ingredientCount = recipe.ingredients ? recipe.ingredients.length : 0;

    if (ingredientCount <= 3) return 'Facile';
    if (ingredientCount <= 6) return 'Moyen';
    return 'Difficile';
  }

  /**
   * Estime le temps de préparation basé sur la complexité de la recette
   */
  private determinePreparationTime(recipe: any): string {
    const ingredientCount = recipe.ingredients ? recipe.ingredients.length : 0;
    const instructionsLength = recipe.instructions
      ? recipe.instructions.length
      : 0;

    // Estimation simple: plus d'ingrédients et d'instructions = plus de temps
    if (ingredientCount <= 3 && instructionsLength < 200) return '5 min';
    if (ingredientCount <= 6 && instructionsLength < 500) return '10 min';
    return '15+ min';
  }

  // Méthode pour mapper les recettes depuis MongoDB vers l'interface Recette
  private mapRecipesToRecettes(recipes: any[]): Recette[] {
    return recipes.map((recipe) => {
      // Extraction de l'ID
      let id = '';
      if (recipe._id && recipe._id.$oid) {
        id = recipe._id.$oid;
      } else if (recipe._id) {
        id = recipe._id;
      } else {
        id = recipe.id || `recette-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Utiliser la description existante si disponible, sinon créer à partir des instructions
      const description = recipe.description
        ? recipe.description
        : Array.isArray(recipe.instructions)
        ? recipe.instructions.join(' ').substring(0, 100) + '...' // Si instructions est un tableau, on les joint en une seule chaîne
        : typeof recipe.instructions === 'string' && recipe.instructions // Si c'est déjà une chaîne, utilise-la
        ? recipe.instructions.substring(0, 100) + '...' // Applique substring sur la chaîne
        : 'Pas de description disponible'; // Si instructions n'est ni un tableau ni une chaîne, message par défaut

      // Détermination de la difficulté
      const ingredientCount = recipe.ingredients
        ? recipe.ingredients.length
        : 0;
      let difficulty: 'Facile' | 'Moyen' | 'Difficile' = 'Moyen';
      if (ingredientCount <= 3) difficulty = 'Facile';
      else if (ingredientCount > 5) difficulty = 'Difficile';

      // Estimation du temps de préparation
      let preparationTime = '1 min';
      if (ingredientCount > 3) preparationTime = '10 min';
      if (ingredientCount > 5) preparationTime = '15 min';

      return {
        id: id,
        name: recipe.name || 'Sans nom',
        description: description,
        image:
          recipe.image ||
          'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
        difficulty: difficulty,
        preparationTime: preparationTime,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        glassType: recipe.glassType || '',
        alcoholLevel: recipe.alcoholLevel || '',
        garnish: recipe.garnish || '',
        isMocktail: recipe.isMocktail === true,
      };
    });
  }
}
