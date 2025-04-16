import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollService } from '../../services/scroll.service';

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
    private scrollService: ScrollService
  ) {}

  ngOnInit() {
    // Forcer le scroll immédiatement (sans animation)
    this.scrollService.scrollToTopImmediate();

    // Récupérer l'ID du cocktail depuis l'URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Simuler la récupération des données du cocktail
      this.cocktail = this.getCocktailDetails(id);
    }
  }

  ngAfterViewInit() {
    // S'assurer que le scroll est bien au top après le rendu de la vue
    setTimeout(() => {
      this.scrollService.scrollToTopForce();
    }, 100);
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

  private getCocktailDetails(id: string): Cocktail | null {
    // Simuler une base de données de cocktails
    const cocktails: { [key: string]: Cocktail } = {
      mojito: {
        id: 'mojito',
        name: 'Mojito',
        image:
          'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
        description:
          "Le Mojito est un cocktail rafraîchissant d'origine cubaine, parfait pour les soirées d'été. Il combine le rhum blanc avec la menthe fraîche, le citron vert et le sucre pour créer une boisson équilibrée et désaltérante.",
        ingredients: [
          { name: 'Rhum blanc', amount: '6 cl' },
          { name: 'Jus de citron vert', amount: '3 cl' },
          { name: 'Sirop de sucre', amount: '2 cl' },
          { name: 'Feuilles de menthe fraîche', amount: '6-8 feuilles' },
          { name: 'Soda water', amount: 'Pour compléter' },
          { name: 'Glaçons', amount: 'Pour servir' },
        ],
        instructions: [
          'Dans un verre, déposer les feuilles de menthe et le sucre',
          'Écraser légèrement la menthe avec un pilon pour libérer les arômes',
          'Ajouter le jus de citron vert et mélanger',
          'Remplir le verre de glaçons',
          'Verser le rhum blanc',
          'Compléter avec du soda water',
          'Garnir avec une branche de menthe et une rondelle de citron',
        ],
        glassType: 'Verre Collins',
        garnish: 'Branche de menthe et rondelle de citron',
        difficulty: 'Facile',
        preparationTime: '5 minutes',
        alcoholLevel: 15,
      },
      'pina-colada': {
        id: 'pina-colada',
        name: 'Piña Colada',
        image:
          'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
        description:
          "La Piña Colada est un cocktail tropical crémeux originaire de Porto Rico. Ce mélange de rhum blanc, de lait de coco et de jus d'ananas crée une boisson exotique et onctueuse.",
        ingredients: [
          { name: 'Rhum blanc', amount: '6 cl' },
          { name: 'Lait de coco', amount: '3 cl' },
          { name: "Jus d'ananas", amount: '9 cl' },
          { name: 'Glaçons', amount: 'Pour le mixage' },
        ],
        instructions: [
          'Verser tous les ingrédients dans un blender',
          'Ajouter des glaçons',
          "Mixer jusqu'à obtenir une texture crémeuse",
          'Verser dans un verre hurricane',
          "Garnir avec une tranche d'ananas et une cerise",
        ],
        glassType: 'Verre Hurricane',
        garnish: "Tranche d'ananas et cerise",
        difficulty: 'Facile',
        preparationTime: '5 minutes',
        alcoholLevel: 18,
      },
      margarita: {
        id: 'margarita',
        name: 'Margarita',
        image:
          'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
        description:
          'La Margarita est un cocktail mexicain classique qui combine tequila, triple sec et jus de citron. Sa saveur acidulée et rafraîchissante en fait un choix populaire.',
        ingredients: [
          { name: 'Tequila', amount: '5 cl' },
          { name: 'Triple sec', amount: '2 cl' },
          { name: 'Jus de citron vert', amount: '2 cl' },
          { name: 'Sel', amount: 'Pour le bord du verre' },
          { name: 'Glaçons', amount: 'Pour le mixage' },
        ],
        instructions: [
          'Frotter le bord du verre avec un quartier de citron',
          'Tremper le bord dans du sel',
          'Verser tous les ingrédients dans un shaker avec des glaçons',
          'Shaker vigoureusement pendant 10 secondes',
          'Verser dans le verre préparé',
          'Garnir avec une rondelle de citron',
        ],
        glassType: 'Verre à Margarita',
        garnish: 'Rondelle de citron et sel sur le bord',
        difficulty: 'Moyen',
        preparationTime: '5 minutes',
        alcoholLevel: 25,
      },
      'old-fashioned': {
        id: 'old-fashioned',
        name: 'Old Fashioned',
        image:
          'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
        description:
          "L'Old Fashioned est un cocktail sophistiqué qui met en valeur les saveurs du whisky. C'est l'un des plus anciens cocktails connus, créé au XIXe siècle.",
        ingredients: [
          { name: 'Whisky', amount: '6 cl' },
          { name: 'Angostura bitters', amount: '2-3 gouttes' },
          { name: 'Sucre', amount: '1 cuillère à café' },
          { name: 'Eau gazeuse', amount: 'Quelques gouttes' },
          { name: 'Glaçons', amount: 'Pour servir' },
        ],
        instructions: [
          "Dans un verre, mélanger le sucre et les bitters avec quelques gouttes d'eau",
          'Ajouter les glaçons',
          'Verser le whisky',
          'Mélanger doucement',
          "Garnir avec une écorce d'orange et une cerise",
        ],
        glassType: 'Verre Old Fashioned',
        garnish: "Écorce d'orange et cerise",
        difficulty: 'Difficile',
        preparationTime: '5 minutes',
        alcoholLevel: 40,
      },
      daiquiri: {
        id: 'daiquiri',
        name: 'Daiquiri',
        image:
          'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
        description:
          'Le Daiquiri est un cocktail cubain classique qui combine rhum blanc, jus de citron vert et sucre. Sa simplicité et son équilibre en font un cocktail intemporel.',
        ingredients: [
          { name: 'Rhum blanc', amount: '6 cl' },
          { name: 'Jus de citron vert', amount: '2 cl' },
          { name: 'Sirop de sucre', amount: '1 cl' },
          { name: 'Glaçons', amount: 'Pour le mixage' },
        ],
        instructions: [
          'Verser tous les ingrédients dans un shaker avec des glaçons',
          'Shaker vigoureusement pendant 10 secondes',
          'Filtrer dans un verre à cocktail refroidi',
          'Garnir avec une rondelle de citron',
        ],
        glassType: 'Verre à cocktail',
        garnish: 'Rondelle de citron',
        difficulty: 'Facile',
        preparationTime: '5 minutes',
        alcoholLevel: 20,
      },
      cosmopolitan: {
        id: 'cosmopolitan',
        name: 'Cosmopolitan',
        image:
          'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
        description:
          'Le Cosmopolitan est un cocktail élégant et raffiné qui combine vodka, triple sec et jus de canneberge. Sa couleur rose vif et son goût équilibré en font un choix populaire.',
        ingredients: [
          { name: 'Vodka', amount: '4 cl' },
          { name: 'Triple sec', amount: '1.5 cl' },
          { name: 'Jus de citron vert', amount: '1.5 cl' },
          { name: 'Jus de canneberge', amount: '3 cl' },
          { name: 'Glaçons', amount: 'Pour le mixage' },
        ],
        instructions: [
          'Verser tous les ingrédients dans un shaker avec des glaçons',
          'Shaker vigoureusement pendant 10 secondes',
          'Filtrer dans un verre à cocktail refroidi',
          "Garnir avec une écorce d'orange",
        ],
        glassType: 'Verre à cocktail',
        garnish: "Écorce d'orange",
        difficulty: 'Moyen',
        preparationTime: '5 minutes',
        alcoholLevel: 23,
      },
    };

    return cocktails[id] || null;
  }
}
