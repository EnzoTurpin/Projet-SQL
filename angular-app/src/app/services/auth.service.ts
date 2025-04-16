import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  tap,
  catchError,
  switchMap,
  map,
  delay,
  retry,
  retryWhen,
  take,
  concatMap,
} from 'rxjs/operators';
import { BehaviorSubject, Observable, of, timer, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api';
  private csrfUrl = '/sanctum/csrf-cookie';
  public currentUser: any = null;

  // Créer un BehaviorSubject pour partager l'état de l'utilisateur
  private userSubject = new BehaviorSubject<any>(null);
  public user$: Observable<any> = this.userSubject.asObservable();

  // Options HTTP par défaut pour toutes les requêtes
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }),
    withCredentials: true, // Important pour les cookies de session
  };

  constructor(private http: HttpClient, private router: Router) {
    // Initialiser les données utilisateur au démarrage
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUser = storedUser;
      this.userSubject.next(storedUser);

      // Vérifier si l'utilisateur est toujours authentifié côté serveur
      this.checkServerAuth();
    }
  }

  // Vérifier l'authentification côté serveur de manière silencieuse (sans déconnecter en cas d'erreur)
  checkServerAuth() {
    // Tenter de récupérer les informations utilisateur directement sans CSRF
    return this.http
      .get<any>(`${this.apiUrl}/auth/check`, {
        ...this.httpOptions,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error("Erreur d'authentification serveur:", error);
          // Ne pas déconnecter automatiquement
          if (error.status === 401) {
            console.log(
              "Session non valide côté serveur, mais on garde l'état local"
            );
          }
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (
          response &&
          response.status === 'success' &&
          response.data &&
          response.data.user
        ) {
          console.log(
            'Utilisateur authentifié côté serveur:',
            response.data.user
          );
          // Si on reçoit une réponse valide, mettre à jour l'utilisateur
          this.currentUser = response.data.user;
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.userSubject.next(response.data.user);
        } else {
          console.log('Authentification côté serveur échouée:', response);
        }
        // Si pas de réponse valide, ne rien faire (garder la session locale)
      });
  }

  // Obtenir un cookie CSRF frais (avec gestion d'erreur)
  refreshCsrfToken(): Observable<any> {
    console.log('Tentative de récupération du CSRF token...');

    // Utiliser XMLHttpRequest pour forcer le navigateur à accepter/stocker les cookies
    return new Observable((observer) => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open('GET', this.csrfUrl);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');

      xhr.onload = () => {
        // Check status code to ensure we got a proper response
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('CSRF token obtenu avec succès');
          console.log('Response headers:', xhr.getAllResponseHeaders());

          // Introduce a delay to ensure cookies are properly set
          setTimeout(() => {
            // Verify if the XSRF-TOKEN cookie was actually set
            const csrfCookie = this.getCsrfTokenFromCookie();
            console.log(
              'XSRF-TOKEN cookie present:',
              csrfCookie ? 'Yes' : 'No'
            );

            if (csrfCookie) {
              console.log(
                'CSRF token value (truncated):',
                csrfCookie.substring(0, 10) + '...'
              );
            }

            // Log all cookies to debug
            const cookies = document.cookie ? document.cookie.split('; ') : [];
            console.log('All cookies after CSRF request:', cookies);

            observer.next();
            observer.complete();
          }, 300); // Increased delay to ensure cookie processing
        } else {
          console.error(`CSRF request failed with status: ${xhr.status}`);
          observer.error(`Failed to get CSRF token: ${xhr.statusText}`);
          observer.complete();
        }
      };

      xhr.onerror = () => {
        console.error(
          "Erreur lors de l'obtention du CSRF token:",
          xhr.statusText
        );
        observer.error(`Failed to get CSRF token: Network error`);
        observer.complete();
      };

      xhr.send();
    });
  }

  // Helper method to get CSRF token from cookie
  private getCsrfTokenFromCookie(): string | null {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  // Méthode d'inscription
  register(data: any) {
    // Tentons d'abord avec CSRF
    return this.refreshCsrfToken().pipe(
      switchMap(() => {
        return this.http
          .post(`${this.apiUrl}/register`, data, this.httpOptions)
          .pipe(
            tap((response: any) => {
              if (response.status === 'success') {
                this.router.navigate(['/login']);
              }
            })
          );
      })
    );
  }

  // Login de l'utilisateur
  login(email: string, password: string): Observable<any> {
    // Réinitialiser complètement l'état avant de tenter un login
    this.currentUser = null;
    this.userSubject.next(null);
    localStorage.removeItem('user');

    // Essayer de récupérer un token CSRF, mais continuer même si ça échoue
    return this.refreshCsrfToken().pipe(
      switchMap(() => {
        console.log('Tentative de connexion pour:', email);

        // Log the CSRF token we're going to use for login
        const csrfToken = this.getCsrfTokenFromCookie();
        console.log(
          'Using CSRF token for login:',
          csrfToken ? csrfToken.substring(0, 10) + '...' : 'None'
        );

        // Prepare headers with CSRF token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        });

        // Add CSRF token if available
        const headersWithToken = csrfToken
          ? headers.set('X-XSRF-TOKEN', csrfToken)
          : headers;

        return this.http
          .post<any>(
            `${this.apiUrl}/login`,
            { email, password },
            {
              headers: headersWithToken,
              withCredentials: true,
            }
          )
          .pipe(
            tap((response) => {
              if (response && response.status === 'success') {
                console.log('Connexion réussie:', response.data.user);
                this.currentUser = response.data.user;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                this.userSubject.next(this.currentUser);

                // Vérifier si le cookie de session est bien présent
                this.checkCookies();

                // Rediriger vers la page d'accueil après connexion réussie
                setTimeout(() => {
                  this.router.navigate(['/home']);
                }, 500);
              }
            }),
            // Après connexion réussie, vérifier immédiatement que l'utilisateur est bien authentifié
            switchMap((response) => {
              if (response && response.status === 'success') {
                // Délai plus long (1200ms) pour s'assurer que les cookies sont bien établis par le navigateur
                return timer(1200).pipe(
                  switchMap(() => {
                    // Rafraîchir le cookie CSRF avant d'accéder aux endpoints protégés
                    return this.refreshCsrfToken().pipe(
                      switchMap(() => {
                        // Log cookies after refreshing CSRF
                        this.checkCookies();

                        // Try to get user info directly
                        return this.getUserWithRetry().pipe(
                          catchError((error) => {
                            console.error(
                              'Erreur lors de la vérification post-login:',
                              error
                            );
                            // Retourner la réponse originale même en cas d'erreur
                            return of(response);
                          })
                        );
                      })
                    );
                  })
                );
              }
              return of(response);
            }),
            catchError((error) => {
              console.error('Erreur de connexion:', error);
              return throwError(
                () => new Error(error?.error?.message || 'Échec de connexion')
              );
            })
          );
      })
    );
  }

  // Vérification des cookies après login
  private checkCookies(): void {
    const cookieStr = document.cookie;
    const cookies = cookieStr ? cookieStr.split('; ') : [];
    const cookieNames = cookies.map((cookie) => cookie.split('=')[0]);
    console.log('Cookies disponibles après login:', cookies);

    const hasXsrfToken = cookieNames.includes('XSRF-TOKEN');
    const hasLaravelSession = cookieNames.includes('laravel_session');

    console.log('XSRF-TOKEN présent:', hasXsrfToken);
    console.log('laravel_session présent:', hasLaravelSession);
    console.log('Document.cookie string:', cookieStr);

    // Test de stockage du cookie dans le localStorage pour vérifier
    if (hasXsrfToken) {
      const xsrfToken = this.getCsrfTokenFromCookie();
      localStorage.setItem('debug_xsrf_token', xsrfToken || '');
    }

    if (!hasXsrfToken || !hasLaravelSession) {
      console.warn(
        "Attention: Cookies de session incomplets, risque de problèmes d'authentification"
      );

      // Les cookies ne sont pas correctement stockés - effectuons un diagnostic
      console.warn(
        'Problème de stockage de cookies - informations de diagnostic:'
      );
      console.warn('- Origin:', window.location.origin);
      console.warn('- API URL:', this.apiUrl);
      console.warn('- Browser:', navigator.userAgent);
      console.warn(
        '- Third-party cookies enabled:',
        document.cookie ? 'Possibly yes' : 'Possibly no'
      );
      console.warn('- Cookie string length:', cookieStr ? cookieStr.length : 0);
    }
  }

  // Nouvelle méthode avec retry pour récupérer l'utilisateur de manière plus fiable
  getUserWithRetry(): Observable<any> {
    return this.refreshCsrfToken().pipe(
      switchMap(() => {
        // Log the CSRF token we're going to use
        const csrfToken = this.getCsrfTokenFromCookie();
        console.log(
          'Using CSRF token for /me request:',
          csrfToken ? csrfToken.substring(0, 10) + '...' : 'None'
        );

        // Ensure we have headers with CSRF token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        });

        // Add CSRF token if available
        const headersWithToken = csrfToken
          ? headers.set('X-XSRF-TOKEN', csrfToken)
          : headers;

        console.log('Headers for /me request:', headersWithToken.keys());
        console.log('All cookies before /me request:', document.cookie);

        // Try with direct endpoint first
        return this.http
          .get<any>(`${this.apiUrl}/me`, {
            headers: headersWithToken,
            withCredentials: true,
          })
          .pipe(
            // Attendre de plus en plus longtemps entre les tentatives
            retryWhen((errors) =>
              errors.pipe(
                // Limiter à 3 tentatives
                take(3),
                // Augmenter progressivement le délai (500ms, 1000ms, 1500ms)
                concatMap((error, i) => {
                  console.log(
                    `Error on /me request (attempt ${i + 1}):`,
                    error
                  );

                  if (error.status === 401 || error.status === 419) {
                    console.log(
                      `Tentative ${
                        i + 1
                      } de récupération utilisateur après délai...`
                    );

                    // Try to refresh the CSRF token before next attempt
                    if (i === 1) {
                      return this.refreshCsrfToken().pipe(
                        switchMap(() => timer(500 * (i + 1)))
                      );
                    }

                    return timer(500 * (i + 1));
                  }
                  return throwError(() => error);
                })
              )
            ),
            tap((response) => {
              if (response && response.data && response.data.user) {
                console.log(
                  'Utilisateur récupéré avec succès:',
                  response.data.user
                );
                this.currentUser = response.data.user;
                localStorage.setItem(
                  'user',
                  JSON.stringify(response.data.user)
                );
                this.userSubject.next(response.data.user);
              } else {
                console.log('Réponse /me sans utilisateur:', response);
              }
            }),
            catchError((error) => {
              console.error(
                "Erreur finale lors de la récupération de l'utilisateur:",
                error
              );

              // If /me endpoint fails, try alternative /auth/check endpoint
              return this.http
                .get<any>(`${this.apiUrl}/auth/check`, {
                  headers: headersWithToken,
                  withCredentials: true,
                })
                .pipe(
                  tap((response) => {
                    if (
                      response &&
                      response.status === 'success' &&
                      response.data &&
                      response.data.user
                    ) {
                      console.log(
                        'Utilisateur récupéré via /auth/check:',
                        response.data.user
                      );
                      this.currentUser = response.data.user;
                      localStorage.setItem(
                        'user',
                        JSON.stringify(response.data.user)
                      );
                      this.userSubject.next(response.data.user);
                    }
                  }),
                  catchError((authCheckError) => {
                    console.error(
                      'Erreur lors de la vérification avec /auth/check:',
                      authCheckError
                    );
                    return throwError(() => error);
                  })
                );
            })
          );
      })
    );
  }

  // Méthode de déconnexion
  logout() {
    // First try to refresh the CSRF token for the logout request
    return this.refreshCsrfToken().pipe(
      switchMap(() => {
        return this.http
          .post(
            `${this.apiUrl}/logout`,
            {},
            {
              ...this.httpOptions,
              withCredentials: true,
            }
          )
          .pipe(
            tap({
              next: () => this.logoutLocally(),
              error: (error) => {
                console.error('Erreur lors de la déconnexion:', error);
                this.logoutLocally(); // Déconnexion locale même en cas d'erreur API
              },
            })
          );
      })
    );
  }

  // Méthode pour déconnecter localement
  private logoutLocally() {
    this.currentUser = null;
    localStorage.removeItem('user');
    this.userSubject.next(null);

    // Clear cookies manually as well
    this.clearCookies();

    this.router.navigate(['/login']);
  }

  // Méthode pour effacer les cookies manuellement
  private clearCookies() {
    document.cookie =
      'XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie =
      'laravel_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    console.log('Cookies effacés manuellement');
  }

  // Méthode pour mettre à jour les données utilisateur
  updateUser(userData: any) {
    // On synchronise d'abord localement pour une meilleure UX
    const updatedUser = { ...this.currentUser, ...userData };

    // Dans le cas d'une mise à jour de mot de passe, on ne synchronise pas localement
    if (!userData.password) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.currentUser = updatedUser;
      this.userSubject.next(updatedUser);
    }

    // Détection de l'ID (certaines API utilisent '_id', d'autres 'id')
    const userId = this.currentUser._id || this.currentUser.id;

    // Debug pour voir l'ID récupéré
    console.log('ID utilisateur pour mise à jour:', userId);

    // Vérifier si l'ID est défini
    if (!userId) {
      console.error(
        'ID utilisateur non défini, impossible de mettre à jour le profil'
      );
      return of({
        status: 'error',
        message: 'ID utilisateur non défini',
        data: updatedUser,
      });
    }

    return this.http
      .put(`${this.apiUrl}/users/update/${userId}`, userData, {
        ...this.httpOptions,
        withCredentials: true,
      })
      .pipe(
        tap((response: any) => {
          console.log('Profil mis à jour avec succès:', response);

          // Si la mise à jour incluait un mot de passe, on synchronise localement seulement après confirmation
          if (userData.password && response.status === 'success') {
            delete updatedUser.password; // Ne pas stocker le mot de passe
            delete updatedUser.password_confirmation;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;
            this.userSubject.next(updatedUser);
          }
        }),
        catchError((error) => {
          console.error('Erreur lors de la mise à jour du profil:', error);

          // Extraire le message d'erreur détaillé
          let errorMessage = 'Erreur lors de la mise à jour du profil';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 422) {
            // Tenter d'extraire les erreurs spécifiques de validation
            if (error.error && error.error.errors) {
              // Pour les erreurs Laravel qui retournent un objet d'erreurs
              const errorKeys = Object.keys(error.error.errors);
              if (
                errorKeys.length > 0 &&
                error.error.errors[errorKeys[0]].length > 0
              ) {
                errorMessage = error.error.errors[errorKeys[0]][0];
              } else {
                errorMessage =
                  'Les données soumises ne sont pas valides. Vérifiez les exigences de mot de passe.';
              }
            } else {
              errorMessage =
                'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*#?&).';
            }
          } else if (error.status === 500) {
            errorMessage =
              'Erreur interne du serveur. Veuillez réessayer plus tard.';
          }

          console.log("Message d'erreur formaté:", errorMessage);

          // En cas d'erreur, on retourne un objet avec un statut d'erreur
          return of({
            status: 'error',
            message: errorMessage,
            data: this.currentUser, // Retourner l'utilisateur original en cas d'erreur
          });
        })
      );
  }

  // Vérifie l'authentification et renvoie un booléen
  checkAuthStatus(): Observable<boolean> {
    return this.http
      .get(`${this.apiUrl}/auth/check`, {
        ...this.httpOptions,
        withCredentials: true,
      })
      .pipe(
        map((response: any) => {
          if (response && response.user) {
            return true;
          }
          return false;
        }),
        catchError((error) => {
          console.error(
            "Erreur lors de la vérification d'authentification:",
            error
          );
          // En cas d'erreur, on suppose que l'utilisateur n'est pas authentifié
          return of(false);
        })
      );
  }

  // Récupération de l'utilisateur avec nouvelle tentative d'authentification
  getUserSilent(): Observable<any> {
    // Si pas d'utilisateur stocké localement, on renvoie null directement sans requêtes inutiles
    if (!this.getStoredUser()) {
      return of(null);
    }

    // Tenter de récupérer l'utilisateur directement
    console.log("Tentative de récupération de l'utilisateur authentifié...");

    return this.http
      .get(`${this.apiUrl}/me`, {
        ...this.httpOptions,
        withCredentials: true,
        headers: this.httpOptions.headers
          .set('Cache-Control', 'no-cache')
          .set('Pragma', 'no-cache'),
      })
      .pipe(
        tap((user) => {
          if (user) {
            console.log(
              'Authentification serveur confirmée, utilisateur valide:',
              user
            );
            // Mettre à jour l'utilisateur localement
            this.currentUser = user;
            localStorage.setItem('user', JSON.stringify(user));
            this.userSubject.next(user);
          }
        }),
        catchError((error) => {
          console.error("Erreur d'authentification serveur:", error);

          // En cas d'erreur 401, l'utilisateur n'est pas authentifié côté serveur
          if (error.status === 401) {
            console.log(
              'Session côté serveur expirée ou invalide - tentative de reconnexion'
            );

            // Pour les autres erreurs, on utilise l'utilisateur local
            const localUser = this.getStoredUser();
            console.log(
              "Utilisation de l'état local de l'utilisateur:",
              localUser
            );
            return of(localUser);
          }

          // Pour les autres erreurs, on utilise l'utilisateur local
          const localUser = this.getStoredUser();
          console.log(
            "Utilisation de l'état local de l'utilisateur:",
            localUser
          );
          return of(localUser);
        })
      );
  }

  getUser() {
    return this.refreshCsrfToken().pipe(
      switchMap(() => {
        return this.http.get<any>(`${this.apiUrl}/me`, {
          ...this.httpOptions,
          withCredentials: true,
          headers: this.httpOptions.headers
            .set('Cache-Control', 'no-cache')
            .set('Pragma', 'no-cache'),
        });
      }),
      tap((user) => {
        console.log('Utilisateur récupéré:', user);
      }),
      retry(1),
      catchError((error) => {
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          error
        );

        // Tenter une solution alternative avec le diagnostic
        if (error.status === 401) {
          return this.http
            .get(`${this.apiUrl}/auth-diagnostic`, {
              ...this.httpOptions,
              withCredentials: true,
            })
            .pipe(
              tap((diagnosticData) => {
                console.log('Authentication diagnostic:', diagnosticData);
              }),
              catchError(() => throwError(() => error))
            );
        }

        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  getStoredUser() {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  getCSRFToken(): Observable<any> {
    return this.http
      .get('/sanctum/csrf-cookie', {
        ...this.httpOptions,
        withCredentials: true,
      })
      .pipe(
        tap(() => console.log('CSRF token récupéré avec succès')),
        catchError((error) => {
          console.error('Erreur lors de la récupération du token CSRF:', error);
          return throwError(() => error);
        })
      );
  }
}
