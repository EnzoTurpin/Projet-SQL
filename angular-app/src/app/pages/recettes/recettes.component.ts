import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ScrollService } from '../../services/scroll.service';

interface Recette {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  preparationTime: string;
}

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

  recettes: Recette[] = [
    {
      id: 'mojito',
      name: 'Mojito',
      description:
        'Un cocktail rafraîchissant à base de rhum blanc, menthe fraîche et citron vert.',
      image:
        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
      difficulty: 'Facile',
      preparationTime: '5 min',
    },
    {
      id: 'pina-colada',
      name: 'Piña Colada',
      description:
        "Un cocktail tropical crémeux à base de rhum blanc, lait de coco et jus d'ananas.",
      image:
        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
      difficulty: 'Facile',
      preparationTime: '5 min',
    },
    {
      id: 'margarita',
      name: 'Margarita',
      description:
        'Un cocktail mexicain classique à base de tequila, triple sec et jus de citron.',
      image:
        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
      difficulty: 'Moyen',
      preparationTime: '5 min',
    },
    {
      id: 'old-fashioned',
      name: 'Old Fashioned',
      description:
        'Un cocktail sophistiqué à base de whisky, bitters et sucre.',
      image:
        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
      difficulty: 'Difficile',
      preparationTime: '5 min',
    },
    {
      id: 'daiquiri',
      name: 'Daiquiri',
      description:
        'Un cocktail cubain classique à base de rhum blanc, jus de citron vert et sucre.',
      image:
        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
      difficulty: 'Facile',
      preparationTime: '5 min',
    },
    {
      id: 'cosmopolitan',
      name: 'Cosmopolitan',
      description:
        'Un cocktail élégant à base de vodka, triple sec et jus de canneberge.',
      image:
        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
      difficulty: 'Moyen',
      preparationTime: '5 min',
    },
  ];

  constructor(private router: Router, private scrollService: ScrollService) {}

  ngOnInit() {
    window.addEventListener('scroll', this.onScroll.bind(this));
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
    // Ici, vous pouvez ajouter la logique de navigation vers la page de résultats
    // this.router.navigate(['/resultats'], { queryParams: { q: this.searchTerm } });
  }

  navigateToCocktail(id: string) {
    this.scrollService.scrollToTop();
    this.router.navigate(['/cocktail', id]);
  }

  get filteredRecettes(): Recette[] {
    if (!this.searchTerm) return this.recettes;
    return this.recettes.filter(
      (recette) =>
        recette.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        recette.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
    );
  }
}
