import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollService } from '../../services/scroll.service';
import { CocktailService } from '../../services/cocktail.service';

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
  alcoholLevel: number; // Pourcentage d'alcool
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
    console.log(`Chargement des détails du cocktail avec ID: ${id}`);
    this.cocktailService.getCocktailById(id).subscribe({
      next: (recipe) => {
        // Afficher la réponse complète pour déboguer
        console.log('Réponse API brute:', recipe);
        console.log('Réponse API JSON stringify:', JSON.stringify(recipe));
        console.log('Structure de la réponse:', Object.keys(recipe));

        // Mappage des données de la BDD vers notre modèle Cocktail
        if (recipe) {
          // Afficher spécifiquement les ingrédients
          console.log('Ingrédients bruts:', recipe.ingredients);
          console.log('Type de recipe.ingredients:', typeof recipe.ingredients);
          console.log('Est-ce un tableau?', Array.isArray(recipe.ingredients));

          // Récupérer les ingrédients
          let mappedIngredients: Ingredient[] = [];

          // Assurer que c'est un tableau même si ça vient comme une chaîne JSON
          let ingredientsArray = recipe.ingredients;

          // Si c'est une chaîne JSON, on essaie de la parser
          if (typeof recipe.ingredients === 'string') {
            try {
              ingredientsArray = JSON.parse(recipe.ingredients);
              console.log('Ingrédients parsés depuis JSON:', ingredientsArray);
            } catch (e) {
              console.error('Erreur lors du parsing des ingrédients:', e);
            }
          }

          // Vérifier si les ingrédients existent et sont dans un format utilisable
          if (
            ingredientsArray &&
            Array.isArray(ingredientsArray) &&
            ingredientsArray.length > 0
          ) {
            console.log("Nombre d'ingrédients:", ingredientsArray.length);

            ingredientsArray.forEach((ingredient: any, index: number) => {
              console.log(`Ingrédient ${index}:`, ingredient);
              console.log(
                `Ingrédient ${index} JSON:`,
                JSON.stringify(ingredient)
              );
              console.log(`Ingrédient ${index} type:`, typeof ingredient);
              console.log(
                `Ingrédient ${index} propriétés:`,
                Object.keys(ingredient)
              );

              // Si c'est un objet et qu'il a ingredient_id et quantity
              if (ingredient && typeof ingredient === 'object') {
                // Accès direct au nom de l'ingrédient (votre structure spécifique)
                if (ingredient.ingredient_id !== undefined) {
                  let name = '';
                  if (typeof ingredient.ingredient_id === 'string') {
                    name = ingredient.ingredient_id;
                  } else if (
                    typeof ingredient.ingredient_id === 'object' &&
                    ingredient.ingredient_id.name
                  ) {
                    name = ingredient.ingredient_id.name;
                  } else {
                    name = JSON.stringify(ingredient.ingredient_id);
                  }

                  const amount = ingredient.quantity || 'Non spécifié';

                  console.log(`✅ Ajout ingrédient: ${name} - ${amount}`);

                  mappedIngredients.push({
                    name: name,
                    amount: amount,
                  });
                }
                // Format alternatif name/amount
                else if (ingredient.name && ingredient.amount) {
                  console.log(
                    `✅ Ajout ingrédient alternatif: ${ingredient.name} - ${ingredient.amount}`
                  );

                  mappedIngredients.push({
                    name: ingredient.name,
                    amount: ingredient.amount,
                  });
                }
                // Dernier recours: utiliser les deux premières propriétés comme nom et quantité
                else {
                  const keys = Object.keys(ingredient);
                  if (keys.length >= 2) {
                    console.log(
                      `⚠️ Format inconnu, utilisation des propriétés : ${
                        keys[0]
                      }=${ingredient[keys[0]]}, ${keys[1]}=${
                        ingredient[keys[1]]
                      }`
                    );

                    mappedIngredients.push({
                      name: String(ingredient[keys[0]]),
                      amount: String(ingredient[keys[1]]),
                    });
                  } else {
                    console.warn(
                      `❌ Format d'ingrédient non reconnu:`,
                      ingredient
                    );
                  }
                }
              } else {
                console.warn(
                  `❌ Ingrédient ${index} n'est pas un objet:`,
                  ingredient
                );
              }
            });
          } else {
            console.warn(
              '⚠️ Aucun ingrédient utilisable trouvé dans la réponse'
            );
          }

          console.log('Ingrédients mappés final:', mappedIngredients);
          console.log("Nombre d'ingrédients mappés:", mappedIngredients.length);

          // Si toujours pas d'ingrédients et qu'on a un alcool principal, on crée un ingrédient par défaut
          if (mappedIngredients.length === 0 && recipe.mainAlcohol) {
            console.log(
              "⚠️ Ajout d'un ingrédient par défaut basé sur l'alcool principal:",
              recipe.mainAlcohol
            );
            mappedIngredients.push({
              name: recipe.mainAlcohol,
              amount: 'Quantité à ajuster selon le goût',
            });
          }

          // Formatage des instructions en tableau
          let instructions: string[] = [];
          if (typeof recipe.instructions === 'string') {
            instructions = recipe.instructions
              .split('\n')
              .filter((line: string) => line.trim() !== '');
            // Si les instructions n'ont pas de retour à la ligne, créer un tableau avec une seule entrée
            if (instructions.length === 0) {
              instructions = [recipe.instructions];
            }
          } else if (Array.isArray(recipe.instructions)) {
            instructions = recipe.instructions;
          }

          // Extraction de l'ID au format MongoDB
          let id = '';
          if (recipe._id && recipe._id.$oid) {
            id = recipe._id.$oid;
          } else if (recipe._id) {
            id = recipe._id;
          } else {
            id = recipe.id || '';
          }

          // Gestion du temps de préparation avec singulier/pluriel
          let quantity = 5;
          if (recipe.quantity) {
            // Gérer les différentes façons dont quantity peut être représenté dans MongoDB
            if (
              typeof recipe.quantity === 'object' &&
              recipe.quantity.$numberInt
            ) {
              quantity = parseInt(recipe.quantity.$numberInt);
            } else {
              quantity = parseInt(recipe.quantity.toString());
            }
          }

          const preparationTime =
            recipe.preparationTime ||
            `${quantity} ${quantity > 1 ? 'minutes' : 'minute'}`;

          // Gestion du niveau d'alcool
          let alcoholLevel = 0;
          if (recipe.alcoholLevel) {
            alcoholLevel = recipe.alcoholLevel;
          } else if (recipe.mainAlcohol) {
            // Approximation par alcool principal
            if (recipe.mainAlcohol.toLowerCase().includes('rhum')) {
              alcoholLevel = 35;
            } else if (recipe.mainAlcohol.toLowerCase().includes('vodka')) {
              alcoholLevel = 40;
            } else if (recipe.mainAlcohol.toLowerCase().includes('whisky')) {
              alcoholLevel = 45;
            } else if (recipe.mainAlcohol.toLowerCase().includes('gin')) {
              alcoholLevel = 38;
            } else if (recipe.mainAlcohol.toLowerCase().includes('tequila')) {
              alcoholLevel = 40;
            } else {
              alcoholLevel = 35; // Valeur par défaut pour les alcools
            }
          }

          // Création de l'objet cocktail avec mapping des propriétés selon la structure Laravel/MongoDB
          this.cocktail = {
            id: id,
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
            instructions: instructions,
            glassType:
              recipe.glass?.name || recipe.glass_id || 'Verre classique',
            garnish:
              typeof recipe.garnish === 'string'
                ? recipe.garnish
                : recipe.garnish?.name || 'Garniture non trouvé',
            difficulty:
              recipe.difficulty || (recipe.mainAlcohol ? 'Moyen' : 'Facile'),
            preparationTime: preparationTime,
            alcoholLevel: alcoholLevel,
          };

          console.log(
            'Cocktail final avec ingrédients:',
            JSON.stringify(this.cocktail)
          );
          console.log(
            "Nombre d'ingrédients dans le cocktail final:",
            this.cocktail.ingredients.length
          );
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du cocktail:', err);
        // Redirige vers la page d'accueil en cas d'erreur
        this.router.navigate(['/']);
      },
    });
  }

  goBack() {
    window.history.back();
  }

  getAlcoholLevelColor(percentage: number): string {
    if (percentage < 10) {
      return 'text-green-500';
    } else if (percentage < 30) {
      return 'text-orange-500';
    } else {
      return 'text-red-500';
    }
  }
}
