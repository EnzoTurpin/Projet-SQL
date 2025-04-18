import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Récupérer le CSRF token du cookie
    const csrfToken = this.getCsrfTokenFromCookie();

    // Cloner la requête pour ajouter les en-têtes
    const authReq = req.clone({
      withCredentials: true,
      headers: req.headers
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Accept', 'application/json')
        .set('X-XSRF-TOKEN', csrfToken || ''),
    });

    return next.handle(authReq);
  }

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
}
