import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.checkSession().pipe(
    map(isAuth => isAuth ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }))
  );
};
