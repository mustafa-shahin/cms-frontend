import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@cms/shared/utils';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken()) {
    return true;
  }

  // Redirect to login with return url
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasValidToken()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  const requiredRoles = route.data['roles'] as number[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const hasRole = authService.hasRole(requiredRoles);
  if (!hasRole) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
