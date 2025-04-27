import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollService } from '../../services/scroll.service';
import { CocktailService } from '../../services/cocktail.service';
import { finalize } from 'rxjs';

interface Ingredient {
  name: string;
  amount: string;
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
}

interface ApiIngredient {
  ingredient_id: string | { name: string };
  quantity?: string;
  name?: string;
  amount?: string;
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

  loadCocktailDetails(id: string): void {
    this.cocktailService
      .getCocktailById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (recipe) => {
          if (!recipe) return;

          let mappedIngredients: Ingredient[] = [];

          if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            mappedIngredients = recipe.ingredients
              .map((ingredient: ApiIngredient) => {
                if (ingredient.ingredient_id) {
                  const name =
                    typeof ingredient.ingredient_id === 'string'
                      ? ingredient.ingredient_id
                      : ingredient.ingredient_id?.name || 'Ingrédient inconnu';
                  return {
                    name,
                    amount: ingredient.quantity || 'Non spécifié',
                  };
                } else if (ingredient.name && ingredient.amount) {
                  return ingredient;
                }
                return null;
              })
              .filter(Boolean) as Ingredient[];
          }

          if (mappedIngredients.length === 0 && recipe.mainAlcohol) {
            mappedIngredients.push({
              name: recipe.mainAlcohol,
              amount: 'Quantité à ajuster selon le goût',
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
            image:
              recipe.image ||
              'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
            description:
              recipe.description ||
              `Délicieux cocktail à base de ${
                recipe.mainAlcohol || 'spiritueux'
              }`,
            ingredients: mappedIngredients,
            instructions,
            glassType:
              recipe.glass?.name || recipe.glass_id || 'Verre classique',
            garnish:
              typeof recipe.garnish === 'string'
                ? recipe.garnish
                : recipe.garnish?.name || 'Garniture non trouvé',
            difficulty:
              recipe.difficulty || (recipe.mainAlcohol ? 'Facile' : 'Moyen'),
            preparationTime:
              recipe.preparationTime ||
              this.formatPreparationTime(recipe.quantity),
            alcoholLevel,
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
