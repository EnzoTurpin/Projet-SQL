import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

// Type pour les ingrédients
interface CocktailIngredient {
  ingredient_id: string;
  quantity: string;
}

// Type pour la base de données locale
interface LocalCocktailDB {
  [id: string]: {
    ingredients: CocktailIngredient[];
  };
}

// Base de données locale minimale et optimisée - uniquement pour les cas critiques
const COCKTAILS_DB: LocalCocktailDB = {
  '67e41ba17768f1e6fe000232': {
    ingredients: [
      { ingredient_id: 'Rhum', quantity: '50 ml' },
      { ingredient_id: 'Menthe', quantity: '10 feuilles' },
      { ingredient_id: 'Sucre', quantity: '2 cuillères à café' },
    ],
  },
  // Ajoutez d'autres cocktails connus ici si nécessaire, mais gardez au minimum
};

@Injectable({
  providedIn: 'root',
})
export class CocktailService {
  private apiUrl = environment.apiUrl;
  private cache: { [key: string]: Observable<any> } = {}; // Cache local des requêtes

  constructor(private http: HttpClient) {}

  // Récupérer tous les cocktails avec mise en cache
  getAllCocktails(): Observable<any[]> {
    if (this.cache['all_cocktails']) {
      return this.cache['all_cocktails']; // Retourner depuis le cache si disponible
    }

    // Stocker la requête dans le cache
    this.cache['all_cocktails'] = this.http
      .get<any[]>(`${this.apiUrl}/recipes`)
      .pipe(
        shareReplay(1), // Partager le résultat entre tous les subscribers
        catchError(() => of([]))
      );

    return this.cache['all_cocktails'];
  }

  // Récupérer un cocktail par son ID avec mise en cache
  getCocktailById(id: string): Observable<any> {
    // Utiliser le cache si disponible
    if (this.cache[`cocktail_${id}`]) {
      return this.cache[`cocktail_${id}`];
    }

    // Stocker la requête dans le cache
    this.cache[`cocktail_${id}`] = this.http
      .get<any>(`${this.apiUrl}/recipes/${id}`)
      .pipe(
        shareReplay(1), // Partager le résultat entre tous les subscribers
        map((recipe) => {
          // Enrichissement minimal des données - seulement si nécessaire
          if (
            recipe &&
            (!recipe.ingredients || recipe.ingredients.length === 0)
          ) {
            const cocktailData = COCKTAILS_DB[id];
            if (cocktailData) {
              recipe.ingredients = [...cocktailData.ingredients];
            }
          }
          return recipe;
        }),
        catchError(() => of(null))
      );

    return this.cache[`cocktail_${id}`];
  }

  // Vider le cache pour un ID ou tous les cocktails
  clearCache(id?: string): void {
    if (id) {
      delete this.cache[`cocktail_${id}`];
    } else {
      this.cache = {}; // Réinitialiser tout le cache
    }
  }

  // Créer un nouveau cocktail (nécessite authentification)
  createCocktail(cocktailData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recipes`, cocktailData).pipe(
      tap(() => this.clearCache()) // Vider le cache après création
    );
  }

  // Mettre à jour un cocktail (nécessite authentification)
  updateCocktail(id: string, cocktailData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/recipes/${id}`, cocktailData)
      .pipe(
        tap(() => {
          this.clearCache(id); // Vider le cache pour ce cocktail
          this.clearCache(); // Vider le cache global
        })
      );
  }

  // Supprimer un cocktail (nécessite authentification)
  deleteCocktail(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/recipes/${id}`).pipe(
      tap(() => this.clearCache()) // Vider le cache après suppression
    );
  }
}
