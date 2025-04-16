import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'recettes',
    loadComponent: () =>
      import('./pages/recettes/recettes.component').then(
        (m) => m.RecettesComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'conditions-utilisation',
    loadComponent: () =>
      import(
        './pages/conditions-utilisation/conditions-utilisation.component'
      ).then((m) => m.ConditionsUtilisationComponent),
  },
  {
    path: 'cocktail/:id',
    loadComponent: () =>
      import('./pages/cocktail-details/cocktail-details.component').then(
        (m) => m.CocktailDetailsComponent
      ),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
