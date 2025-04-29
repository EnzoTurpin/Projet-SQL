// src/app/app.component.ts
import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'CocktailRecipes';
  hideFooter = false;
  isLoginOrRegisterPage = false;
  mainContainer: HTMLElement | null = null;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtenir la référence à l'élément HTML du conteneur principal
    this.mainContainer = document.getElementById('main-container');

    // Surveillance de la route pour adaptations
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Déterminer s'il s'agit d'une page spéciale (login/register)
        const currentUrl = event.urlAfterRedirects;
        this.isLoginOrRegisterPage =
          currentUrl.includes('/login') || currentUrl.includes('/register');

        // Sur les pages login/register: bloquer le défilement
        if (this.isLoginOrRegisterPage) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }

        // Vérifier si l'utilisateur est banni
        const currentUser = this.authService.getStoredUser();
        if (
          currentUser &&
          currentUser.banned &&
          !currentUrl.includes('/banned')
        ) {
          console.log(
            'Utilisateur banni détecté, redirection vers la page de bannissement'
          );
          this.router.navigate(['/banned']);
        }
      }
    });

    // Force la réapplication des classes responsives après le chargement complet
    this.applyResponsiveClasses();

    // Pour s'assurer que tout est correctement initialisé
    setTimeout(() => {
      this.applyResponsiveClasses();
    }, 100);

    // Remonter en haut de la page à chaque changement de route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        window.scrollTo(0, 0);

        // Vérifier si on est sur la page login ou register
        const currentUrl = event.urlAfterRedirects;
        this.hideFooter =
          currentUrl.includes('/login') || currentUrl.includes('/register');

        // Empêcher ou permettre le défilement selon la page
        if (this.hideFooter) {
          // Sur les pages login/register: bloquer le défilement
          this.renderer.setStyle(document.body, 'overflow', 'hidden');
        } else {
          // Sur les autres pages: permettre le défilement
          this.renderer.removeStyle(document.body, 'overflow');
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // Force la réapplication des classes responsives lors du redimensionnement
    this.applyResponsiveClasses();
  }

  // Méthode qui force l'application des classes responsives
  private applyResponsiveClasses() {
    const isMobile = window.innerWidth < 768;

    // Sélectionne tous les éléments avec des classes Tailwind responsive md:
    const mdBlockElements = document.querySelectorAll('.md\\:block');
    const mdFlexElements = document.querySelectorAll('.md\\:flex');
    const mdHiddenElements = document.querySelectorAll('.md\\:hidden');

    if (isMobile) {
      // Sur mobile, les éléments md:block et md:flex devraient être cachés
      mdBlockElements.forEach(
        (el) => ((el as HTMLElement).style.display = 'none')
      );
      mdFlexElements.forEach(
        (el) => ((el as HTMLElement).style.display = 'none')
      );
      // Sur mobile, les éléments md:hidden devraient être visibles
      mdHiddenElements.forEach(
        (el) => ((el as HTMLElement).style.display = 'block')
      );
    } else {
      // Sur desktop, les éléments md:block devraient être visibles
      mdBlockElements.forEach(
        (el) => ((el as HTMLElement).style.display = 'block')
      );
      // Sur desktop, les éléments md:flex devraient être en flex
      mdFlexElements.forEach(
        (el) => ((el as HTMLElement).style.display = 'flex')
      );
      // Sur desktop, les éléments md:hidden devraient être cachés
      mdHiddenElements.forEach(
        (el) => ((el as HTMLElement).style.display = 'none')
      );
    }

    // Applique spécifiquement pour les éléments menu de la navbar
    const menuDesktop = document.querySelector('.menu-desktop');
    const menuHamburger = document.querySelector('.menu-hamburger');

    if (menuDesktop && menuHamburger) {
      if (isMobile) {
        (menuDesktop as HTMLElement).style.display = 'none';
        (menuHamburger as HTMLElement).style.display = 'block';
      } else {
        (menuDesktop as HTMLElement).style.display = 'flex';
        (menuHamburger as HTMLElement).style.display = 'none';
      }
    }
  }
}
