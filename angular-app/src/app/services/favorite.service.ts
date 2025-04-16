import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = '/api';

  // Options HTTP par défaut pour toutes les requêtes authentifiées
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }),
    withCredentials: true, // Important pour les cookies de session
  };

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Obtient un nouveau CSRF token avant de faire une requête
   */
  private getCSRFToken() {
    return this.http
      .get('/sanctum/csrf-cookie', {
        withCredentials: true,
        headers: new HttpHeaders({
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'X-Requested-With': 'XMLHttpRequest',
        }),
      })
      .pipe(
        tap(() => console.log('CSRF token obtenu (favorites)')),
        catchError((error) => {
          console.error(
            "Erreur lors de l'obtention du CSRF token (favorites):",
            error
          );
          return of(null);
        })
      );
  }

  /**
   * Récupère toutes les recettes favorites de l'utilisateur
   */
  getFavorites(): Observable<any[]> {
    console.log('Demande des recettes favorites');
    return this.getCSRFToken().pipe(
      switchMap(() => {
        console.log('CSRF token actualisé, demande des favoris');
        return this.http
          .get<any>(`${this.apiUrl}/favorites`, this.httpOptions)
          .pipe(
            tap((response) => {
              console.log('Réponse brute des favoris:', response);
            }),
            map((response) => {
              if (response.status === 'success') {
                console.log('Favoris récupérés avec succès:', response.data);
                return response.data || [];
              } else {
                console.error('Erreur status dans la réponse:', response);
                throw new Error(
                  response.message ||
                    'Erreur lors de la récupération des favoris'
                );
              }
            }),
            catchError((error) => {
              console.error(
                'Erreur lors de la récupération des favoris:',
                error
              );
              console.error('Status:', error.status);
              console.error('Message:', error.message);
              return throwError(() => error);
            })
          );
      })
    );
  }

  /**
   * Ajoute/supprime une recette des favoris
   */
  toggleFavorite(recipeId: string): Observable<any> {
    return this.getCSRFToken().pipe(
      switchMap(() => {
        return this.http
          .post<any>(
            `${this.apiUrl}/favorites/${recipeId}`,
            {},
            this.httpOptions
          )
          .pipe(
            map((response) => {
              if (response.status === 'success') {
                return response.data;
              } else {
                throw new Error(
                  response.message || 'Erreur lors de la modification du favori'
                );
              }
            }),
            catchError((error) => {
              console.error('Erreur lors de la modification du favori:', error);

              // Si erreur 401 (non authentifié), tenter de rafraîchir la session
              if (error.status === 401) {
                console.log('Tentative de rafraîchir la session...');

                // Appeler le endpoint de diagnostic pour rafraîchir la session
                return this.http
                  .get(`${this.apiUrl}/auth-diagnostic`, this.httpOptions)
                  .pipe(
                    switchMap(() => {
                      console.log(
                        'Session rafraîchie, nouvelle tentative de toggle favori'
                      );
                      // Réessayer après rafraîchissement de la session
                      return this.http
                        .post<any>(
                          `${this.apiUrl}/favorites/${recipeId}`,
                          {},
                          this.httpOptions
                        )
                        .pipe(
                          map((response) => {
                            if (response.status === 'success') {
                              console.log(
                                'Toggle favori réussi après rafraîchissement'
                              );
                              return response.data;
                            } else {
                              throw new Error(
                                response.message ||
                                  'Erreur après rafraîchissement'
                              );
                            }
                          }),
                          catchError((finalError) => {
                            console.error(
                              'Échec définitif du toggle favori:',
                              finalError
                            );
                            return throwError(() => finalError);
                          })
                        );
                    }),
                    catchError((refreshError) => {
                      console.error(
                        'Échec du rafraîchissement de session:',
                        refreshError
                      );
                      return throwError(() => error); // Retourne l'erreur originale
                    })
                  );
              }

              // Pour les autres types d'erreurs
              return throwError(() => error);
            })
          );
      })
    );
  }

  /**
   * Vérifie si une recette est dans les favoris
   */
  checkFavorite(recipeId: string): Observable<boolean> {
    return this.getCSRFToken().pipe(
      switchMap(() => {
        return this.http
          .get<any>(
            `${this.apiUrl}/favorites/${recipeId}/check`,
            this.httpOptions
          )
          .pipe(
            map((response) => {
              if (response.status === 'success') {
                return response.data?.isFavorite || false;
              } else {
                throw new Error(
                  response.message || 'Erreur lors de la vérification du favori'
                );
              }
            }),
            catchError((error) => {
              console.error(
                `Erreur lors de la vérification du favori pour ${recipeId}:`,
                error
              );
              return of(false); // En cas d'erreur, considérer que ce n'est pas un favori
            })
          );
      })
    );
  }
}
