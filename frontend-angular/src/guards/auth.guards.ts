import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protege la navegación; la seguridad real la aplica el backend en cada petición
export const adminGuard: CanActivateFn = () =>
  inject(AuthService).isAdmin || inject(Router).createUrlTree(['/login']);

export const guestGuard: CanActivateFn = () =>
  !inject(AuthService).isAdmin || inject(Router).createUrlTree(['/dashboard']);
