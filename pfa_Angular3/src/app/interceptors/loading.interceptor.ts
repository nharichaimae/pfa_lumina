import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpContextToken
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);

  // ignorer explicitement le loader pour certaines requêtes
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};