import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, tap, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, Glass, Ingredient } from '../interfaces/filters.interface';

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

  // Récupérer uniquement les catégories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des catégories:', error);
        return of([]);
      })
    );
  }

  // filters
  getFilters() {
    return this.http.get<{
      categories: Category[];
      glasses: Glass[];
      ingredients: Ingredient[];
    }>(`${this.apiUrl}/filters`);
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
    // Ne pas définir de Content-Type pour FormData, laissez le navigateur le faire
    return this.http.post<any>(`${this.apiUrl}/recipes`, cocktailData).pipe(
      tap(() => this.clearCache()) // Vider le cache après création
    );
  }

  // Mettre à jour un cocktail (nécessite authentification)
  updateCocktail(id: string, cocktailData: any): Observable<any> {
    console.log(`Mise à jour cocktail (ID: ${id}):`, cocktailData);

    let finalData = cocktailData;

    // Si c'est un FormData, ajouter l'ID pour le backend
    if (cocktailData instanceof FormData) {
      console.log('Données au format FormData, ajout de _id');
      cocktailData.append('_id', id);

      // Vérifier tous les champs requis
      const requiredFields = [
        'name',
        'description',
        'difficulty',
        'preparationTime',
        'ingredients',
        'instructions',
        'category_id',
      ];

      let hasMissingFields = false;

      requiredFields.forEach((field) => {
        const value = cocktailData.get(field);
        if (!value || value === 'undefined' || value === 'null') {
          console.error(`Champ requis manquant: ${field}`);
          hasMissingFields = true;

          // Pour les champs simples, on peut mettre une valeur par défaut
          if (field === 'name') cocktailData.set(field, 'Cocktail sans nom');
          if (field === 'description')
            cocktailData.set(field, 'Aucune description disponible');
          if (field === 'difficulty') cocktailData.set(field, 'Facile');
          if (field === 'preparationTime') cocktailData.set(field, '5');

          // Pour les tableaux (ingredients et instructions), on ajoute un élément par défaut
          if (field === 'ingredients' && !value) {
            const defaultIngredients = JSON.stringify([
              {
                name: 'Ingrédient par défaut',
                quantity: '1',
                unit: '',
              },
            ]);
            cocktailData.set(field, defaultIngredients);
          }

          if (field === 'instructions' && !value) {
            const defaultInstructions = JSON.stringify([
              'Aucune instruction disponible',
            ]);
            cocktailData.set(field, defaultInstructions);
          }
        }
      });

      if (hasMissingFields) {
        console.warn(
          'Des champs requis étaient manquants et ont été initialisés avec des valeurs par défaut'
        );
      }
    }
    // Si c'est un objet JSON, s'assurer que l'ID est présent
    else if (typeof cocktailData === 'object' && cocktailData !== null) {
      console.log('Données au format JSON');
      // S'assurer que l'ID est présent
      if (!cocktailData._id) {
        cocktailData._id = id;
      }

      // Vérification supplémentaire pour s'assurer que les tableaux sont correctement formatés
      if (cocktailData.ingredients && Array.isArray(cocktailData.ingredients)) {
        console.log(
          'Vérification du format des ingrédients:',
          cocktailData.ingredients
        );
      }

      if (
        cocktailData.instructions &&
        Array.isArray(cocktailData.instructions)
      ) {
        console.log(
          'Vérification du format des instructions:',
          cocktailData.instructions
        );
      }

      // Convertir en FormData pour assurer la cohérence avec le backend
      const formData = new FormData();

      // Ajouter tous les champs de l'objet au FormData
      Object.keys(cocktailData).forEach((key) => {
        if (key === 'ingredients') {
          // S'assurer que chaque ingrédient a les bonnes propriétés selon la validation Laravel
          // Laravel attend: ingredients.*.name, ingredients.*.quantity, ingredients.*.unit
          const ingredients = cocktailData[key].map((ingredient: any) => {
            // Vérifier et formater chaque ingrédient
            return {
              name:
                ingredient.name ||
                ingredient.ingredient_id ||
                'Ingrédient sans nom',
              quantity: ingredient.quantity || '1',
              unit: ingredient.unit || '',
            };
          });

          // Ajouter le tableau d'ingrédients en tant que JSON string
          formData.append(key, JSON.stringify(ingredients));

          // Logs supplémentaires pour aider au déboggage
          console.log('Ingrédients formatés:', ingredients);
        } else if (key === 'instructions') {
          // Convertir les instructions en tableau simple si ce n'est pas déjà fait
          let instructions = cocktailData[key];
          if (
            instructions.length > 0 &&
            typeof instructions[0] === 'object' &&
            instructions[0].step
          ) {
            instructions = instructions.map((i: any) => i.step);
          }

          // S'assurer qu'il y a au moins une instruction
          if (!instructions || instructions.length === 0) {
            instructions = ['Aucune instruction disponible'];
          }

          // Ajouter le tableau d'instructions en tant que JSON string
          formData.append(key, JSON.stringify(instructions));

          // Logs supplémentaires pour aider au déboggage
          console.log('Instructions formatées:', instructions);
        } else {
          // Pour les autres champs, s'assurer qu'ils ne sont pas undefined ou null
          const value =
            cocktailData[key] === undefined || cocktailData[key] === null
              ? ''
              : cocktailData[key];
          formData.append(key, value);
        }
      });

      finalData = formData;
    }

    // Afficher les données finales qui seront envoyées
    if (finalData instanceof FormData) {
      console.log('Contenu final du FormData:');
      // Log détaillé pour aider au débogage
      console.log('--- DÉTAIL COMPLET DU FORMDATA ---');
      finalData.forEach((value, key) => {
        if (key === 'ingredients' || key === 'instructions') {
          try {
            const parsed = JSON.parse(value as string);
            console.log(`${key} (parsed):`, parsed);

            // Vérifier la structure des ingrédients
            if (key === 'ingredients' && Array.isArray(parsed)) {
              console.log(`Nombre d'ingrédients: ${parsed.length}`);
              if (parsed.length > 0) {
                console.log('Premier ingrédient:', parsed[0]);
              }
            }

            // Vérifier la structure des instructions
            if (key === 'instructions' && Array.isArray(parsed)) {
              console.log(`Nombre d'instructions: ${parsed.length}`);
              if (parsed.length > 0) {
                console.log('Première instruction:', parsed[0]);
              }
            }
          } catch (e) {
            console.log(`${key} (raw):`, value);
          }
        } else {
          console.log(`${key}: ${value}`);
        }
      });

      // Vérifier les champs critiques
      console.log('Vérification des champs critiques:');
      const criticalFields = [
        'name',
        'description',
        'difficulty',
        'preparationTime',
        'ingredients',
        'instructions',
        'category_id',
      ];
      criticalFields.forEach((field) => {
        const value = finalData.get(field);
        console.log(`${field} présent: ${value !== null}, valeur: ${value}`);
      });
    } else {
      console.log('Contenu final JSON:', finalData);
    }

    return this.http.put<any>(`${this.apiUrl}/recipes/${id}`, finalData).pipe(
      tap((response) => {
        console.log(`Réponse mise à jour cocktail:`, response);
        this.clearCache(id); // Vider le cache pour ce cocktail
        this.clearCache(); // Vider le cache global
      }),
      catchError((error) => {
        console.error(`Erreur de mise à jour cocktail:`, error);
        // Ajouter des logs plus détaillés en cas d'erreur 422
        if (error.status === 422) {
          console.error('Erreur de validation (422):', error.error);
          // Afficher le détail complet pour le déboggage
          if (error.error && error.error.data) {
            console.error(
              'Détails des erreurs de validation:',
              JSON.stringify(error.error.data, null, 2)
            );
          }
        }
        throw error;
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
