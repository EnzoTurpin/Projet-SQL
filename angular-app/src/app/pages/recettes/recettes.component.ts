import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ScrollService } from '../../services/scroll.service';
import { AuthService } from '../../services/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { Recette } from '../../interfaces/recette.interface';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { RecetteService } from '../../services/recette.service';
import { CocktailService } from '../../services/cocktail.service';
import {
  Category,
  Glass,
  Ingredient,
} from '../../interfaces/filters.interface';

@Component({
  selector: 'app-recettes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recettes.component.html',
  styleUrls: ['./recettes.component.css'],
})
export class RecettesComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  showSuggestions: boolean = false;
  suggestions: Recette[] = [];
  parallaxOffset: number = 0;
  isAuthenticatedLocally: boolean = false;
  isAuthenticatedOnServer: boolean = false;
  checkingAuth: boolean = false;
  errorMessage: string = '';
  showErrorModal: boolean = false;
  sessionExpiredError: boolean = false;

  recettes: Recette[] = [];
  favoriteIds: Set<string> = new Set<string>();
  defaultImage = 'https://dummyimage.com/400x300/eeeeee/aaa?text=Cocktail';
  categories: Category[] = [];
  glasses: Glass[] = [];
  ingredients: Ingredient[] = [];

  selectedCategory: string = '';
  selectedGlass: string = '';
  selectedIngredients: string[] = [];

  constructor(
    private readonly router: Router,
    private readonly scrollService: ScrollService,
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly recetteService: RecetteService,
    private readonly cocktailService: CocktailService,
    private readonly favoriteService: FavoriteService
  ) {}

  ngOnInit() {
    window.addEventListener('scroll', this.onScroll.bind(this));

    // Vérifier l'authentification locale sans tenter de logout
    this.isAuthenticatedLocally = this.authService.isAuthenticated();

    // S'assurer que les catégories de base existent dans la BDD
    this.recetteService.ensureBasicCategories().subscribe((categories) => {
      console.log('Catégories après vérification:', categories);

      // Chargement des filtres dynamiques
      this.cocktailService.getFilters().subscribe((filters) => {
        this.categories = filters.categories;
        this.glasses = filters.glasses;
        this.ingredients = filters.ingredients;

        // Debug pour les verres
        console.log('Verres disponibles:', this.glasses);
        console.log('Catégories disponibles:', this.categories);

        // Mettre à jour toutes les recettes sans catégorie
        this.recetteService.updateAllRecipesCategories().subscribe(
          () => {
            // Charger les recettes après avoir mis à jour les catégories
            this.loadRecettes();
          },
          (error) => {
            console.error(
              'Erreur lors de la mise à jour des catégories:',
              error
            );
            // Charger les recettes même en cas d'erreur
            this.loadRecettes();
          }
        );
      });
    });
  }

  loadRecettes() {
    console.log('Démarrage du chargement des recettes');

    this.recetteService.getRecettes().subscribe({
      next: (data: Recette[]) => {
        console.log('Recettes chargées avec succès:', data);
        console.log('Nombre de recettes reçues:', data.length);

        if (data && Array.isArray(data)) {
          // Normaliser les données des recettes
          this.recettes = data.map((recette) =>
            this.normalizeRecetteData(recette)
          );

          console.log(
            'Recettes stockées dans le composant:',
            this.recettes.length
          );

          // Vérifier si chaque recette a un ID
          this.recettes.forEach((recette, index) => {
            console.log(`Recette ${index}:`, recette.id, recette.name);
          });
        } else {
          console.error('Les données reçues ne sont pas un tableau:', data);
          this.recettes = [];
        }

        // Gérer les favoris si l'utilisateur est authentifié
        if (this.isAuthenticatedLocally) {
          this.checkingAuth = true;
          this.authService
            .getUserSilent()
            .pipe(
              catchError((error) => {
                console.error(
                  "Erreur lors de la vérification de l'authentification:",
                  error
                );
                return of(null);
              })
            )
            .subscribe((user) => {
              this.checkingAuth = false;
              this.isAuthenticatedOnServer = !!user;

              if (this.isAuthenticatedOnServer) {
                this.favoriteService.getFavorites().subscribe((favList) => {
                  this.favoriteIds = new Set(
                    favList.map((fav: any) => fav._id || fav.id)
                  );
                });
              }
            });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des recettes:', error);
        this.recettes = [];
      },
    });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  private onScroll() {
    this.parallaxOffset = window.scrollY * 0.5;
  }

  onSearchInput() {
    if (this.searchTerm.length > 0) {
      this.suggestions = this.recettes.filter(
        (recette) =>
          recette.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          recette.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
      this.showSuggestions = true;
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  onSearchSubmit() {
    this.showSuggestions = false;
    // this.router.navigate(['/resultats'], { queryParams: { q: this.searchTerm } });
  }

  navigateToCocktail(id: string) {
    this.scrollService.scrollToTop();
    this.router.navigate(['/cocktail', id]);
  }

  // Rediriger vers la page de connexion
  redirectToLogin() {
    this.showErrorModal = false;
    this.router.navigate(['/login']);
  }

  get filteredRecettes(): Recette[] {
    // Debug pour le filtrage
    console.log('Filtrage des recettes:');
    console.log('- Nombre total de recettes:', this.recettes.length);
    console.log('- Terme de recherche:', this.searchTerm);
    console.log('- Catégorie sélectionnée:', this.selectedCategory);
    console.log('- Verre sélectionné:', this.selectedGlass);
    console.log('- Ingrédients sélectionnés:', this.selectedIngredients);

    // Si un verre est sélectionné, afficher les informations de débogage
    if (this.selectedGlass) {
      this.debugGlassFilter();
    }

    // Si une catégorie est sélectionnée, afficher les informations de débogage
    if (this.selectedCategory) {
      this.debugCategoryFilter();
    }

    // Vérifier si les ingrédients sont au bon format
    this.recettes.forEach((recette, index) => {
      if (index < 3) {
        // Limiter le logging aux 3 premières recettes pour éviter de surcharger la console
        console.log(`Recette ${index} - Ingrédients:`, recette.ingredients);
        // Ajout du logging pour les verres et catégories
        console.log(
          `Recette ${index} - Verre:`,
          recette.glass,
          'Type de verre:',
          recette.glassType
        );
        console.log(
          `Recette ${index} - Catégorie:`,
          recette.category,
          'ID Catégorie:',
          recette.category_id,
          'isMocktail:',
          recette.isMocktail
        );
      }
    });

    const filtered = this.recettes.filter((recette) => {
      // Vérifier le format des ingrédients pour le filtrage
      let recetteIngredients: string[] = [];

      // Extraire les noms d'ingrédients selon le format
      if (recette.ingredients && Array.isArray(recette.ingredients)) {
        recetteIngredients = recette.ingredients
          .map((ing) => {
            // Si l'ingrédient est un objet avec une propriété 'name'
            if (ing && typeof ing === 'object' && 'name' in ing) {
              return ing.name;
            }
            // Si l'ingrédient est un objet avec ingredient_id
            else if (ing && typeof ing === 'object' && 'ingredient_id' in ing) {
              return ing.ingredient_id;
            }
            // Si l'ingrédient est une chaîne de caractères
            else if (typeof ing === 'string') {
              return ing;
            }
            // Dernière chance: essayons de récupérer une propriété qui pourrait contenir le nom
            else if (ing && typeof ing === 'object') {
              const potentialNameProps = Object.keys(ing).filter((key) =>
                [
                  'name',
                  'nom',
                  'libelle',
                  'title',
                  'ingredient',
                  'label',
                ].includes(key.toLowerCase())
              );
              if (potentialNameProps.length > 0) {
                return ing[potentialNameProps[0]];
              }
            }
            return '';
          })
          .filter((name) => name !== ''); // Filtrer les noms vides
      }

      const matchesSearch =
        !this.searchTerm ||
        recette.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (recette.description &&
          recette.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()));

      // Utiliser la méthode matchCategory pour vérifier la correspondance de catégorie
      const matchesCategory = this.matchCategory(recette);

      // Amélioration du filtre par verre pour prendre en compte différentes propriétés possibles
      const matchesGlass = this.matchGlass(recette);

      // Pas besoin de filtrer si aucun ingrédient sélectionné
      if (this.selectedIngredients.length === 0) {
        return matchesSearch && matchesCategory && matchesGlass;
      }

      // Vérifier que nous avons des ingrédients à comparer
      if (recetteIngredients.length === 0) {
        return false; // Ne correspond pas aux critères d'ingrédient si aucun ingrédient dans la recette
      }

      // Vérifier si tous les ingrédients sélectionnés sont présents
      const matchesIngredients = this.selectedIngredients.every((selectedIng) =>
        recetteIngredients.some((recetteIng) => {
          if (!recetteIng) return false;
          return recetteIng.toLowerCase().includes(selectedIng.toLowerCase());
        })
      );

      return (
        matchesSearch && matchesCategory && matchesGlass && matchesIngredients
      );
    });

    console.log('Nombre de recettes après filtrage:', filtered.length);
    return filtered;
  }

  // Méthode pour vérifier si une recette correspond au filtre de verre sélectionné
  private matchGlass(recette: Recette): boolean {
    if (!this.selectedGlass) return true;

    // Vérifier les différentes propriétés possibles
    if (recette.glass === this.selectedGlass) return true;
    if (recette.glassType === this.selectedGlass) return true;

    // Comparaison insensible à la casse
    if (
      recette.glass &&
      recette.glass.toLowerCase() === this.selectedGlass.toLowerCase()
    )
      return true;
    if (
      recette.glassType &&
      recette.glassType.toLowerCase() === this.selectedGlass.toLowerCase()
    )
      return true;

    // Recherche par sous-chaîne
    if (
      recette.glass &&
      recette.glass.toLowerCase().includes(this.selectedGlass.toLowerCase())
    )
      return true;
    if (
      recette.glassType &&
      recette.glassType.toLowerCase().includes(this.selectedGlass.toLowerCase())
    )
      return true;

    return false;
  }

  // Méthode pour vérifier si une recette correspond au filtre de catégorie sélectionné
  private matchCategory(recette: Recette): boolean {
    if (!this.selectedCategory) return true;

    // Vérifier les différentes propriétés possibles
    if (recette.category === this.selectedCategory) return true;

    // Vérification spécifique pour Mocktail/Cocktail si basé sur isMocktail
    if (
      this.selectedCategory.toLowerCase() === 'mocktail' &&
      recette.isMocktail
    )
      return true;
    if (
      this.selectedCategory.toLowerCase() === 'cocktail' &&
      recette.isMocktail === false
    )
      return true;

    // Comparaison insensible à la casse
    if (
      recette.category &&
      recette.category.toLowerCase() === this.selectedCategory.toLowerCase()
    )
      return true;

    // Recherche par sous-chaîne
    if (
      recette.category &&
      recette.category
        .toLowerCase()
        .includes(this.selectedCategory.toLowerCase())
    )
      return true;

    return false;
  }

  // Méthode de débogage pour le filtre de verres
  private debugGlassFilter(): void {
    console.log('Débogage du filtre de verres:');
    console.log('Verre sélectionné:', this.selectedGlass);

    // Compter le nombre de recettes qui correspondent à chaque propriété
    let matchExact = 0,
      matchGlassType = 0,
      matchLowerCase = 0,
      matchPartial = 0;

    this.recettes.forEach((recette) => {
      if (recette.glass === this.selectedGlass) matchExact++;
      if (recette.glassType === this.selectedGlass) matchGlassType++;
      if (
        recette.glass &&
        recette.glass.toLowerCase() === this.selectedGlass.toLowerCase()
      )
        matchLowerCase++;
      if (
        recette.glass &&
        recette.glass.toLowerCase().includes(this.selectedGlass.toLowerCase())
      )
        matchPartial++;
    });

    console.log('Nombre de correspondances exactes:', matchExact);
    console.log('Nombre de correspondances avec glassType:', matchGlassType);
    console.log(
      'Nombre de correspondances insensibles à la casse:',
      matchLowerCase
    );
    console.log('Nombre de correspondances partielles:', matchPartial);

    // Afficher les premières recettes qui ont des verres pour le débogage
    const samplesWithGlass = this.recettes
      .filter((r) => r.glass || r.glassType)
      .slice(0, 5);

    console.log('Échantillon de 5 recettes avec des verres:');
    samplesWithGlass.forEach((r, i) => {
      console.log(
        `Recette ${i}: ${r.name} - Verre: "${r.glass}" - Type de verre: "${r.glassType}"`
      );
      console.log(`   Correspondance: ${this.matchGlass(r)}`);
    });
  }

  // Méthode de débogage pour le filtre de catégories
  private debugCategoryFilter(): void {
    console.log('Débogage du filtre de catégories:');
    console.log('Catégorie sélectionnée:', this.selectedCategory);

    // Compter le nombre de recettes qui correspondent à chaque propriété
    let matchExact = 0,
      matchLowerCase = 0,
      matchMocktail = 0,
      matchCocktail = 0,
      matchPartial = 0;

    this.recettes.forEach((recette) => {
      if (recette.category === this.selectedCategory) matchExact++;
      if (
        recette.category &&
        recette.category.toLowerCase() === this.selectedCategory.toLowerCase()
      )
        matchLowerCase++;
      if (
        this.selectedCategory.toLowerCase() === 'mocktail' &&
        recette.isMocktail
      )
        matchMocktail++;
      if (
        this.selectedCategory.toLowerCase() === 'cocktail' &&
        recette.isMocktail === false
      )
        matchCocktail++;
      if (
        recette.category &&
        recette.category
          .toLowerCase()
          .includes(this.selectedCategory.toLowerCase())
      )
        matchPartial++;
    });

    console.log('Nombre de correspondances exactes:', matchExact);
    console.log(
      'Nombre de correspondances insensibles à la casse:',
      matchLowerCase
    );
    console.log(
      'Nombre de correspondances par isMocktail (pour Mocktail):',
      matchMocktail
    );
    console.log(
      'Nombre de correspondances par isMocktail (pour Cocktail):',
      matchCocktail
    );
    console.log('Nombre de correspondances partielles:', matchPartial);

    // Afficher les premières recettes qui ont des catégories pour le débogage
    const samplesWithCategory = this.recettes
      .filter((r) => r.category || r.isMocktail !== undefined)
      .slice(0, 5);

    console.log('Échantillon de 5 recettes avec des catégories:');
    samplesWithCategory.forEach((r, i) => {
      console.log(
        `Recette ${i}: ${r.name} - Catégorie: "${r.category}" - isMocktail: ${r.isMocktail}`
      );
      console.log(`   Correspondance: ${this.matchCategory(r)}`);
    });
  }

  // Ajouter cette méthode pour gérer l'ajout d'un ingrédient
  addIngredient(event: any): void {
    const ingredient = event.target.value;
    if (ingredient && !this.selectedIngredients.includes(ingredient)) {
      this.selectedIngredients.push(ingredient);
    }
    // Réinitialiser le sélecteur
    event.target.value = '';
  }

  // Ajouter cette méthode pour supprimer un ingrédient
  removeIngredient(ingredient: string): void {
    this.selectedIngredients = this.selectedIngredients.filter(
      (ing) => ing !== ingredient
    );
  }

  /* =========  Gestion des favoris  ========== */
  isFavorite(recette: Recette): boolean {
    return this.favoriteIds.has((recette as any)._id || recette.id);
  }

  toggleFavorite(recette: Recette): void {
    const id = (recette as any)._id || recette.id;
    this.favoriteService.toggleFavorite(id).subscribe({
      next: () => {
        if (this.favoriteIds.has(id)) {
          this.favoriteIds.delete(id);
        } else {
          this.favoriteIds.add(id);
        }
      },
      error: (err) => console.error('Erreur toggle fav', err),
    });
  }

  // Retourne une description non vide ou un fallback
  getRecetteDescription(recette: Recette): string {
    if (recette.description && recette.description.trim()) {
      return recette.description;
    }

    // Ne plus utiliser les instructions comme fallback
    return `Délicieux cocktail à base de ${
      recette.mainAlcohol || 'spiritueux'
    }`;
  }

  // Méthode pour gérer les erreurs de chargement d'image
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.src) {
      imgElement.src = this.defaultImage;
    }
  }

  // Méthode pour normaliser les données des recettes
  private normalizeRecetteData(recette: Recette): Recette {
    // S'assurer que les propriétés nécessaires existent
    if (!recette.glass && recette.glassType) {
      recette.glass = recette.glassType;
    }

    // Si la recette a un verre spécifié mais ne correspond à aucun verre dans la liste des verres disponibles,
    // essayer de trouver une correspondance approximative
    if (recette.glass && this.glasses && this.glasses.length > 0) {
      const exactMatch = this.glasses.find((g) => g.name === recette.glass);
      if (!exactMatch) {
        // Essayer de trouver une correspondance insensible à la casse
        const similarMatch = this.glasses.find(
          (g) => g.name.toLowerCase() === recette.glass?.toLowerCase()
        );
        if (similarMatch) {
          console.log(
            `Correspondance approximative trouvée pour le verre: ${recette.glass} -> ${similarMatch.name}`
          );
          recette.glass = similarMatch.name;
        }
      }
    }

    // Traiter les catégories
    // Si la catégorie n'est pas définie mais isMocktail est défini, utiliser cette information
    if (!recette.category && recette.isMocktail !== undefined) {
      recette.category = recette.isMocktail ? 'Mocktail' : 'Cocktail';
    }

    // Si la recette a une catégorie spécifiée mais ne correspond à aucune catégorie dans la liste des catégories disponibles,
    // essayer de trouver une correspondance approximative
    if (recette.category && this.categories && this.categories.length > 0) {
      const exactMatch = this.categories.find(
        (c) => c.name === recette.category
      );
      if (!exactMatch) {
        // Essayer de trouver une correspondance insensible à la casse
        const similarMatch = this.categories.find(
          (c) => c.name.toLowerCase() === recette.category?.toLowerCase()
        );
        if (similarMatch) {
          console.log(
            `Correspondance approximative trouvée pour la catégorie: ${recette.category} -> ${similarMatch.name}`
          );
          recette.category = similarMatch.name;
        }
      }
    }

    // S'assurer que isMocktail est cohérent avec la catégorie
    if (recette.category) {
      const isMocktailCategory =
        recette.category.toLowerCase().includes('mocktail') ||
        recette.category.toLowerCase().includes('sans alcool');

      // Si la catégorie indique que c'est un mocktail mais isMocktail est false ou non défini
      if (isMocktailCategory && !recette.isMocktail) {
        recette.isMocktail = true;
      }
      // Si la catégorie indique que c'est un cocktail mais isMocktail est true
      else if (
        recette.category.toLowerCase().includes('cocktail') &&
        !isMocktailCategory &&
        recette.isMocktail
      ) {
        // Laisser isMocktail à true car les données explicites ont priorité
        console.log(
          `Avertissement: La recette ${recette.name} est marquée comme Mocktail mais sa catégorie est ${recette.category}`
        );
      }
    }

    return recette;
  }
}
