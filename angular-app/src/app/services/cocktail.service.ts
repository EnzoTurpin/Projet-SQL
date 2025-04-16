import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError, tap, map } from 'rxjs';
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

// Base de données locale pour les cocktails quand les ingrédients sont manquants
const COCKTAILS_DB: LocalCocktailDB = {
  '67e41ba17768f1e6fe000232': {
    ingredients: [
      { ingredient_id: 'Rhum', quantity: '50 ml' },
      { ingredient_id: 'Menthe', quantity: '10 feuilles' },
      { ingredient_id: 'Sucre', quantity: '2 cuillères à café' },
    ],
  },
  // Ajoutez d'autres cocktails connus ici si nécessaire
};

@Injectable({
  providedIn: 'root',
})
export class CocktailService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Récupérer tous les cocktails
  getAllCocktails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recipes`).pipe(
      tap((data) => console.log('Données reçues des cocktails:', data)),
      catchError((error) => {
        console.error('Erreur lors de la récupération des cocktails:', error);
        return of([]);
      })
    );
  }

  // Récupérer un cocktail par son ID
  getCocktailById(id: string): Observable<any> {
    console.log(`Demande de cocktail avec ID: ${id}`);
    return this.http.get<any>(`${this.apiUrl}/recipes/${id}`).pipe(
      tap((response) => {
        console.log("Réponse de l'API pour le cocktail:", response);
      }),
      // Ajouter une étape pour compléter les ingrédients manquants
      map((recipe) => {
        if (
          recipe &&
          (!recipe.ingredients || recipe.ingredients.length === 0)
        ) {
          console.log(
            '⚠️ Ingrédients manquants dans la réponse API, utilisation des données locales'
          );

          // Vérifier si nous avons les ingrédients en local pour ce cocktail
          const recipeId = recipe.id as string;
          if (recipeId && COCKTAILS_DB[recipeId]) {
            console.log('✅ Ingrédients trouvés dans la base locale');
            recipe.ingredients = COCKTAILS_DB[recipeId].ingredients;
          }
        }
        return recipe;
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération du cocktail ${id}:`,
          error
        );
        return of(null);
      })
    );
  }

  // Créer un nouveau cocktail (nécessite authentification)
  createCocktail(cocktailData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recipes`, cocktailData);
  }

  // Mettre à jour un cocktail (nécessite authentification)
  updateCocktail(id: string, cocktailData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/recipes/${id}`, cocktailData);
  }

  // Supprimer un cocktail (nécessite authentification)
  deleteCocktail(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/recipes/${id}`);
  }
}
