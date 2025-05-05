import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Admin, AdminLoginRequest, AdminLoginResponse } from '../../models';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AdminMockService } from '../../mock/admin.service.mock';
import { removeFromLocalStorage, getFromLocalStorage, saveToLocalStorage } from '../../../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'leave_track_auth_token';
  private readonly ADMIN_KEY = 'leave_track_admin';

  private isAuthenticatedSig = signal<boolean>(this.hasStoredToken());
  private currentAdminSig = signal<Omit<Admin, 'password'> | null>(
    this.getStoredAdmin()
  );

  private router: Router = inject(Router);
  private adminMockService: AdminMockService = inject(AdminMockService);

  public isAuthenticated = this.isAuthenticatedSig.asReadonly();
  public currentAdmin = this.currentAdminSig.asReadonly();

  login(loginRequest: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.adminMockService.login(loginRequest).pipe(
      tap((response) => {
        this.setAuthData(response);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout(): void {
    removeFromLocalStorage(this.TOKEN_KEY);
    removeFromLocalStorage(this.ADMIN_KEY);

    this.isAuthenticatedSig.set(false);
    this.currentAdminSig.set(null);

    this.router.navigate(['/login']);
  }

  private setAuthData(response: AdminLoginResponse): void {
    saveToLocalStorage(this.TOKEN_KEY, response.token);
    saveToLocalStorage(this.ADMIN_KEY, JSON.stringify(response.admin));

    this.isAuthenticatedSig.set(true);
    this.currentAdminSig.set(response.admin);
  }

  private hasStoredToken(): boolean {
    return !!getFromLocalStorage(this.TOKEN_KEY);
  }

  private getStoredAdmin(): Omit<Admin, 'password'> | null {
    const adminJson = getFromLocalStorage(this.ADMIN_KEY);
    if (adminJson) {
      try {
        return JSON.parse(adminJson);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
