import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollService } from '../../services/scroll.service';
import { CocktailService } from '../../services/cocktail.service';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';

interface Ingredient {
  name: string;
  amount: string;
  quantity: string;
  unit: string;
}

interface Cocktail {
  id: string;
  name: string;
  image: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  glassType: string;
  garnish: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  preparationTime: string;
  alcoholLevel: number;
  isMocktail?: boolean;
}

interface ApiIngredient {
  ingredient_id: string | { name: string };
  quantity?: string;
  name?: string;
  amount?: string;
  unit?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-cocktail-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocktail-details.component.html',
  styleUrls: ['./cocktail-details.component.css'],
})
export class CocktailDetailsComponent implements OnInit, AfterViewInit {
  cocktail: Cocktail | null = null;
  isLoading: boolean = true;
  defaultImage =
    'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scrollService: ScrollService,
    private cocktailService: CocktailService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isLoading = true;
        this.loadCocktailDetails(id);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollService.scrollToTopImmediate();
  }

  /**
   * Prépare une URL d'image complète à partir d'un chemin relatif ou d'une URL
   */
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return this.defaultImage;
    }

    // Si c'est déjà une URL complète, on la renvoie telle quelle
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Vérifier si le chemin commence déjà par /storage/ (envoyé par le backend Laravel)
    if (imagePath.includes('/storage/')) {
      return imagePath;
    }

    // Pour les chemins relatifs commençant par 'images/cocktails/', remplacez par '/storage/images/cocktails/'
    if (imagePath.startsWith('/images/cocktails/')) {
      return `${environment.apiUrl}/storage${imagePath}`;
    }

    // Fallback: retourner l'image par défaut
    console.warn("Format d'image non reconnu:", imagePath);
    return this.defaultImage;
  }

  loadCocktailDetails(id: string): void {
    this.cocktailService
      .getCocktailById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (recipe) => {
          if (!recipe) return;

          console.log('RECIPE DATA:', recipe);
          console.log('RECIPE INGREDIENTS:', recipe.ingredients);
          console.log(
            'IS MOCKTAIL:',
            recipe.isMocktail,
            typeof recipe.isMocktail
          );

          let mappedIngredients: Ingredient[] = [];

          if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            mappedIngredients = recipe.ingredients.map((ingredient: any) => {
              console.log('PROCESSING INGREDIENT:', ingredient);

              if (typeof ingredient === 'object' && ingredient.name) {
                return {
                  name: ingredient.name || 'Ingrédient inconnu',
                  amount: `${ingredient.quantity || ''} ${
                    ingredient.unit || ''
                  }`.trim(),
                  quantity: ingredient.quantity || '',
                  unit: ingredient.unit || '',
                };
              } else if (
                typeof ingredient === 'object' &&
                ingredient.ingredient_id
              ) {
                const name =
                  typeof ingredient.ingredient_id === 'string'
                    ? ingredient.ingredient_id
                    : ingredient.ingredient_id?.name || 'Ingrédient inconnu';

                return {
                  name: name,
                  amount: `${ingredient.quantity || ''} ${
                    ingredient.unit || ''
                  }`.trim(),
                  quantity: ingredient.quantity || '',
                  unit: ingredient.unit || '',
                };
              } else if (typeof ingredient === 'string') {
                return {
                  name: ingredient,
                  amount: 'Non spécifié',
                  quantity: '',
                  unit: '',
                };
              }
              return {
                name: 'Ingrédient inconnu',
                amount: 'Non spécifié',
                quantity: '',
                unit: '',
              };
            });
          }

          console.log('MAPPED INGREDIENTS:', mappedIngredients);

          if (mappedIngredients.length === 0 && recipe.mainAlcohol) {
            mappedIngredients.push({
              name: recipe.mainAlcohol,
              amount: 'Quantité à ajuster selon le goût',
              quantity: '',
              unit: '',
            });
          }

          const instructions =
            typeof recipe.instructions === 'string'
              ? recipe.instructions
                  .split('\n') // Divise en lignes
                  .filter((line: string) => line.trim()) // Filtre les lignes vides
              : Array.isArray(recipe.instructions)
              ? recipe.instructions
              : []; // Si instructions est un tableau, on le garde tel quel

          const id = recipe._id?.['$oid'] || recipe._id || recipe.id || '';

          let alcoholLevel = recipe.alcoholLevel || 0;
          if (!alcoholLevel && recipe.mainAlcohol) {
            const alcoholType = recipe.mainAlcohol.toLowerCase();
            if (alcoholType.includes('rhum')) alcoholLevel = 35;
            else if (alcoholType.includes('vodka')) alcoholLevel = 40;
            else if (alcoholType.includes('whisky')) alcoholLevel = 45;
            else if (alcoholType.includes('gin')) alcoholLevel = 38;
            else if (alcoholType.includes('tequila')) alcoholLevel = 40;
            else alcoholLevel = 35;
          }

          this.cocktail = {
            id,
            name: recipe.name,
            image: recipe.image || this.defaultImage,
            description:
              recipe.description ||
              `Délicieux cocktail à base de ${
                recipe.mainAlcohol || 'spiritueux'
              }`,
            ingredients: mappedIngredients,
            instructions,
            glassType:
              recipe.glassType || recipe.glass?.name || recipe.glass_id || '',
            garnish:
              typeof recipe.garnish === 'string' && recipe.garnish
                ? recipe.garnish
                : recipe.garnish?.name || '',
            difficulty:
              recipe.difficulty || (recipe.mainAlcohol ? 'Facile' : 'Moyen'),
            preparationTime:
              recipe.preparationTime ||
              this.formatPreparationTime(recipe.quantity),
            alcoholLevel,
            isMocktail: recipe.isMocktail,
          };
        },
        error: () => {
          this.router.navigate(['/']);
        },
      });
  }

  private formatPreparationTime(quantity: any): string {
    let numQuantity = 5;
    if (quantity) {
      if (typeof quantity === 'object' && quantity.$numberInt) {
        numQuantity = parseInt(quantity.$numberInt);
      } else {
        numQuantity = parseInt(String(quantity));
      }
    }
    return `${numQuantity} ${numQuantity > 1 ? 'minutes' : 'minute'}`;
  }

  goBack() {
    window.history.back();
  }

  getAlcoholLevelColor(percentage: number): string {
    if (percentage < 10) return 'text-green-500';
    if (percentage < 30) return 'text-orange-500';
    return 'text-red-500';
  }
}
