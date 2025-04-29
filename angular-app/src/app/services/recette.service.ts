import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, tap, forkJoin, switchMap } from 'rxjs';
import { Recette } from '../interfaces/recette.interface';
import { map } from 'rxjs/operators';
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

    // Version simplifiée sans CSRF pour diagnostiquer le problème
    return this.http
      .get<any>(`${this.apiUrl}/recipes`, {
        ...this.httpOptions,
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          console.log(`Status HTTP: ${response.status}`);
          console.log('Headers HTTP:', response.headers.keys());
          console.log(
            "Réponse brute de l'API pour les recettes:",
            response.body
          );
        }),
        map((response) => response.body),
        catchError((error) => {
          console.error(
            'Erreur HTTP lors de la récupération des recettes:',
            error
          );
          console.error('Statut:', error.status, error.statusText);

          if (error.error) {
            console.error("Détails de l'erreur:", error.error);
          }

          // Réessayer avec une URL alternative en cas d'échec
          console.log('Tentative de récupération via une URL alternative...');
          return this.http.get<any>(`${this.apiUrl}/test-recipes`).pipe(
            tap((data) =>
              console.log("Données récupérées via l'URL alternative:", data)
            ),
            catchError((fallbackError) => {
              console.error(
                'Échec de la récupération alternative:',
                fallbackError
              );
              return of([]);
            })
          );
        }),
        map((response) => {
          if (!response) {
            console.error("Réponse de l'API nulle");
            return [];
          }

          if (!Array.isArray(response)) {
            console.error(
              "Réponse invalide de l'API (pas un tableau):",
              response
            );

            // Tenter d'extraire un tableau si la réponse est un objet avec un champ data
            if (
              response &&
              typeof response === 'object' &&
              Array.isArray(response.data)
            ) {
              console.log('Extraction du champ data de la réponse');
              response = response.data;
            } else {
              return [];
            }
          }

          console.log('Données brutes reçues:', response);
          console.log('Nombre de recettes reçues:', response.length);

          const mappedRecettes = this.mapRecipesToRecettes(response);
          console.log(
            'Nombre de recettes après mapping:',
            mappedRecettes.length
          );
          return mappedRecettes;
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

  // Méthode pour créer une nouvelle catégorie
  createCategory(categoryName: string) {
    return this.http.post<any>(`${this.apiUrl}/categories`, {
      name: categoryName,
    });
  }

  // Méthode pour s'assurer que les catégories de base existent
  ensureBasicCategories() {
    return this.getCategories().pipe(
      switchMap((categories) => {
        const categoryNames = categories.map((c) => c.name.toLowerCase());
        const missingCategories = [];

        // Vérifier si "Cocktail" existe
        if (!categoryNames.includes('cocktail')) {
          missingCategories.push('Cocktail');
        }

        // Vérifier si "Mocktail" existe
        if (!categoryNames.includes('mocktail')) {
          missingCategories.push('Mocktail');
        }

        // Si toutes les catégories existent déjà, retourner les catégories existantes
        if (missingCategories.length === 0) {
          console.log('Toutes les catégories de base existent déjà');
          return of(categories);
        }

        // Sinon, créer les catégories manquantes
        console.log('Création des catégories manquantes:', missingCategories);
        const createRequests = missingCategories.map((name) =>
          this.createCategory(name).pipe(
            catchError((error) => {
              console.error(
                `Erreur lors de la création de la catégorie ${name}:`,
                error
              );
              return of(null);
            })
          )
        );

        // Exécuter toutes les requêtes de création, puis récupérer la liste mise à jour
        return forkJoin(createRequests).pipe(
          switchMap(() => this.getCategories())
        );
      })
    );
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
    console.log(
      "Mapping des recettes brutes vers l'interface Recette",
      recipes
    );

    return recipes.map((recipe, index) => {
      // Extraction de l'ID
      let id = '';

      if (recipe.id) {
        id = recipe.id;
      } else if (recipe._id) {
        id = recipe._id;
      } else {
        id = `recette-${index}-${Math.random().toString(36).substr(2, 9)}`;
        console.warn(`Recette sans ID trouvée, ID généré: ${id}`, recipe);
      }

      console.log(`Recette ${index} - ID: ${id}, Name: ${recipe.name}`);

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
      let preparationTime = recipe.preparationTime || '1 min';
      if (!recipe.preparationTime) {
        if (ingredientCount > 3) preparationTime = '10 min';
        if (ingredientCount > 5) preparationTime = '15 min';
      }

      // Extraction de la catégorie (nom ou ID)
      let category = '';
      let category_id = '';
      let isMocktail = false;

      // Si nous avons un objet catégorie complet de la relation belongsTo
      if (recipe.category && typeof recipe.category === 'object') {
        category = recipe.category.name || '';
        category_id = recipe.category._id || recipe.category.id || '';
        // Détermine si c'est un mocktail basé sur la catégorie
        isMocktail =
          category.toLowerCase().includes('mocktail') ||
          category.toLowerCase().includes('sans alcool');
      }
      // Si nous avons seulement l'ID de la catégorie
      else if (recipe.category_id) {
        category_id = recipe.category_id;
        // Si category_id est une chaîne qui contient le nom et non l'ID
        if (
          typeof recipe.category_id === 'string' &&
          (recipe.category_id.toLowerCase().includes('mocktail') ||
            recipe.category_id.toLowerCase().includes('sans alcool'))
        ) {
          category = recipe.category_id;
          isMocktail = true;
        }
      }
      // Si isMocktail est défini explicitement mais pas la catégorie
      else if (recipe.isMocktail !== undefined) {
        isMocktail = recipe.isMocktail === true;
        category = isMocktail ? 'Mocktail' : 'Cocktail';
      }

      const mappedRecipe: Recette = {
        id: id,
        name: recipe.name || 'Sans nom',
        description: description,
        image:
          recipe.image ||
          'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
        difficulty: recipe.difficulty || difficulty,
        preparationTime: preparationTime,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        glassType: recipe.glassType || '',
        alcoholLevel: recipe.alcoholLevel || '',
        mainAlcohol: recipe.mainAlcohol || '',
        garnish: recipe.garnish || '',
        isMocktail: isMocktail,
        category_id: category_id,
        category: category,
        glass: recipe.glass?.name || recipe.glass_id || '',
      };

      return mappedRecipe;
    });
  }

  // Méthode pour mettre à jour la catégorie d'une recette
  updateRecipeCategory(recipeId: string, isMocktail: boolean) {
    // Récupérer d'abord les catégories pour obtenir les IDs
    return this.getCategories().pipe(
      switchMap((categories) => {
        // Trouver les IDs des catégories "Cocktail" et "Mocktail"
        const mocktailCategory = categories.find(
          (c) => c.name.toLowerCase() === 'mocktail'
        );
        const cocktailCategory = categories.find(
          (c) => c.name.toLowerCase() === 'cocktail'
        );

        if (!mocktailCategory && isMocktail) {
          console.error('Catégorie Mocktail non trouvée');
          return of(null);
        }

        if (!cocktailCategory && !isMocktail) {
          console.error('Catégorie Cocktail non trouvée');
          return of(null);
        }

        // Sélectionner la catégorie appropriée
        const categoryId = isMocktail
          ? mocktailCategory._id
          : cocktailCategory._id;

        // Mettre à jour la recette avec la bonne catégorie
        return this.http
          .patch<any>(`${this.apiUrl}/recipes/${recipeId}`, {
            category_id: categoryId,
          })
          .pipe(
            tap(() =>
              console.log(
                `Catégorie mise à jour pour la recette ${recipeId}: ${
                  isMocktail ? 'Mocktail' : 'Cocktail'
                }`
              )
            ),
            catchError((error) => {
              console.error(
                `Erreur lors de la mise à jour de la catégorie de la recette ${recipeId}:`,
                error
              );
              return of(null);
            })
          );
      })
    );
  }

  // Méthode pour mettre à jour toutes les recettes sans catégorie
  updateAllRecipesCategories() {
    return this.getRecettes().pipe(
      switchMap((recettes) => {
        const updateRequests = recettes
          .filter(
            (recette) =>
              !recette.category_id && recette.isMocktail !== undefined
          )
          .map((recette) =>
            this.updateRecipeCategory(recette.id, recette.isMocktail === true)
          );

        if (updateRequests.length === 0) {
          console.log('Aucune recette à mettre à jour');
          return of([]);
        }

        console.log(`Mise à jour de ${updateRequests.length} recettes`);
        return forkJoin(updateRequests);
      })
    );
  }
}
