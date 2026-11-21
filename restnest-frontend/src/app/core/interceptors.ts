import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const isApi = req.url.startsWith(API_URL);

  const out = token && isApi ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;

  return next(out).pipe(
    catchError(err => {
      // Token expire aana (protected API la 401) -> logout + login page
      if (err.status === 401 && isApi && !req.url.includes('/api/auth/') && token) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    })
  );
};
