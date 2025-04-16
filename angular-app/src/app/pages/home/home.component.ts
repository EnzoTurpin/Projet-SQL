import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ScrollService } from '../../services/scroll.service';
import { CocktailService } from '../../services/cocktail.service';

interface Cocktail {
  id: string;
  name: string;
  image: string;
}

interface Tip {
  title: string;
  points: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Propriété pour gérer l'état du menu mobile
  isMobileMenuOpen = false;

  featuredCocktails: Cocktail[] = [];

  tips: Tip[] = [
    {
      title: 'Comment battre avec un fouet',
      points: [
        'Tenez le fouet fermement mais sans crisper votre main',
        'Utilisez votre poignet pour des mouvements circulaires rapides',
        'Pour les liquides légers, fouettez en surface',
        'Pour les mélanges épais, plongez profondément le fouet',
      ],
    },
    {
      title: 'Cocktails végétariens',
      points: [
        'Utilisez du vin et des spiritueux filtrés sans produits animaux',
        "Remplacez le blanc d'œuf par de l'aquafaba (eau de pois chiches)",
        'Vérifiez que vos sirops ne contiennent pas de miel',
        'Privilégiez les garnitures de fruits frais et herbes aromatiques',
      ],
    },
  ];

  constructor(
    private scrollService: ScrollService,
    private router: Router,
    private cocktailService: CocktailService
  ) {}

  ngOnInit(): void {
    // S'assure que la page commence en haut lors du chargement
    this.scrollService.scrollToTopImmediate();

    // Charger les cocktails depuis l'API
    this.loadCocktails();
  }

  // Méthode pour charger les cocktails
  loadCocktails(): void {
    this.cocktailService.getAllCocktails().subscribe({
      next: (recipes) => {
        // Limiter aux 3 premiers cocktails pour l'affichage en vedette
        this.featuredCocktails = recipes.slice(0, 3).map((recipe) => ({
          id: recipe._id || recipe.id,
          name: recipe.name,
          image:
            recipe.image ||
            'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=60', // Image par défaut si absente
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des cocktails:', err);
        // Fallback aux données en dur en cas d'erreur
        this.setDefaultCocktails();
      },
    });
  }

  // Méthode de secours avec les données en dur
  setDefaultCocktails(): void {
    this.featuredCocktails = [
      {
        id: 'margarita',
        name: 'Margarita',
        image:
          'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=800&auto=format&fit=crop&q=60',
      },
      {
        id: 'old-fashioned',
        name: 'Old Fashioned',
        image:
          'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&auto=format&fit=crop&q=60',
      },
      {
        id: 'mojito',
        name: 'Mojito',
        image:
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=60',
      },
    ];
  }

  // Méthode pour basculer l'état du menu hamburger
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Fermer le menu mobile lors de la navigation
  navigateToPage(path: string): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }

    // Solution la plus simple et directe : utiliser window.location pour forcer une nouvelle navigation complète
    // Cela garantit que la page s'affichera en haut car c'est un chargement de page complet
    window.location.href = path;
  }

  // Fermer le menu mobile lors du clic ailleurs sur la page
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Vérifier si le clic est en dehors du menu hamburger et du bouton de menu
    if (this.isMobileMenuOpen && !target.closest('nav')) {
      this.isMobileMenuOpen = false;
    }
  }
}
