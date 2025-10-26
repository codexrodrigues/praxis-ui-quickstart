import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Se já autenticado em memória, evita round-trip desnecessário
  return auth.isAuthenticated$.pipe(
    take(1),
    switchMap(isAuth => isAuth ? of(true) : auth.checkSession()),
    map(isAuth => isAuth ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }))
  );
};
