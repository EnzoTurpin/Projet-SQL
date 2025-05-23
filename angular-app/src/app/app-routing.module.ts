import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { bannedGuard } from './guards/banned.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [bannedGuard] },
  {
    path: 'recettes',
    loadComponent: () =>
      import('./pages/recettes/recettes.component').then(
        (m) => m.RecettesComponent
      ),
    canActivate: [bannedGuard],
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
    path: 'banned',
    loadComponent: () =>
      import('./pages/banned/banned.component').then((m) => m.BannedComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard, bannedGuard],
  },
  {
    path: 'conditions-utilisation',
    loadComponent: () =>
      import(
        './pages/conditions-utilisation/conditions-utilisation.component'
      ).then((m) => m.ConditionsUtilisationComponent),
  },
  {
    path: 'mentions-legales',
    loadComponent: () =>
      import('./pages/mentions-legales/mentions-legales.component').then(
        (m) => m.MentionsLegalesComponent
      ),
  },
  {
    path: 'cocktail/:id',
    loadComponent: () =>
      import('./pages/cocktail-details/cocktail-details.component').then(
        (m) => m.CocktailDetailsComponent
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [AdminGuard, bannedGuard],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
