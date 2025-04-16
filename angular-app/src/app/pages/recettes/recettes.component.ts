import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ScrollService } from '../../services/scroll.service';
import { AuthService } from '../../services/auth.service';
import { Recette } from '../../interfaces/recette.interface';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { RecetteService } from '../../services/recette.service';

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

  constructor(
    private router: Router,
    private scrollService: ScrollService,
    private authService: AuthService,
    private http: HttpClient,
    private recetteService: RecetteService
  ) {}

  ngOnInit() {
    window.addEventListener('scroll', this.onScroll.bind(this));

    // Vérifier l'authentification locale sans tenter de logout
    this.isAuthenticatedLocally = this.authService.isAuthenticated();

    // Activer le mode debug pour voir les données reçues de l'API
    this.recetteService.getRecettes().subscribe((data: Recette[]) => {
      console.log("Données reçues de l'API:", data);

      // Condition pour vérifier si les données sont valides
      if (data && Array.isArray(data) && data.length > 0) {
        console.log("Mise à jour des recettes avec les données de l'API");
        this.recettes = data;
      } else {
        // Si aucune donnée n'est reçue de l'API, initialiser un tableau vide
        console.log("Aucune donnée reçue de l'API");
        this.recettes = [];
      }

      // Vérifier silencieusement l'authentification côté serveur
      if (this.isAuthenticatedLocally) {
        this.checkingAuth = true;
        this.authService
          .getUserSilent()
          .pipe(
            // Ne jamais laisser cette requête échouer et bloquer la suite
            catchError((error) => {
              console.log(
                "Erreur lors de la vérification silencieuse, on considère l'utilisateur non authentifié côté serveur"
              );
              return of(null);
            })
          )
          .subscribe((user) => {
            this.checkingAuth = false;
            this.isAuthenticatedOnServer = !!user;

            console.log(
              "État d'authentification serveur:",
              this.isAuthenticatedOnServer ? 'Authentifié' : 'Non authentifié'
            );
          });
      }
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
    // Ici, vous pouvez ajouter la logique de navigation vers la page de résultats
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
