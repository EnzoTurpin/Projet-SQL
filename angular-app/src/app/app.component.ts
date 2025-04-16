// src/app/app.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'CocktailRecipes';

  constructor(private router: Router) {}

  ngOnInit() {
    // Force la réapplication des classes responsives après le chargement complet
    this.applyResponsiveClasses();

    // Pour s'assurer que tout est correctement initialisé
    setTimeout(() => {
      this.applyResponsiveClasses();
    }, 100);

    // Remonter en haut de la page à chaque changement de route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
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
