import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading';

// function interceptor
export const loadingInterceptor: (req: HttpRequest<unknown>, next: HttpHandlerFn) => Observable<HttpEvent<unknown>> =
  (req, next) => {
    const loadingService = inject(LoadingService);
    loadingService.show();
    return next(req).pipe(
      finalize(() => loadingService.hide())
    );
  };