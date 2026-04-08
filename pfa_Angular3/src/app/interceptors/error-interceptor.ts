import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(

      catchError((error: HttpErrorResponse) => {
        // console.log("Interceptor déclenché", error.status);


        switch (error.status) {

          case 400:
            alert("Requête invalide (400)");
            break;

          case 401:
            alert("Non autorisé (401) - Veuillez vous reconnecter");
            this.router.navigate(['/login']);
            break;

          case 403:
            alert("Accès interdit (403)");
            break;

          case 404:
            alert("Ressource non trouvée (404)");
            break;

          case 500:
            alert("Erreur serveur interne (500)");
            break;

          default:
            alert("Erreur inconnue");
        }

        return throwError(() => error);
      })
    );
  }
}
