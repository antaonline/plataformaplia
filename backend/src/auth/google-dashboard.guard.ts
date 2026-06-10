import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de Google OAuth para el flujo del dashboard (website_build).
 * Pasa state='dashboard' para que el callback sepa el origen y cree el
 * proyecto freemium + redirija al dashboard (no a iachat).
 */
@Injectable()
export class GoogleDashboardGuard extends AuthGuard('google') {
  getAuthenticateOptions() {
    return { state: 'dashboard' } as any;
  }
}
