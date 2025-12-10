import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  CurrentUserDto,
  LogoutRequest,
} from '@cms/shared/api-interfaces';
import { ApiService } from './api.service';

const TOKEN_KEY = 'cms_access_token';
const REFRESH_TOKEN_KEY = 'cms_refresh_token';
const USER_KEY = 'cms_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  private currentUserSubject = new BehaviorSubject<CurrentUserDto | null>(
    this.getUserFromStorage()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signals for reactive state
  public isAuthenticated = signal(this.hasValidToken());
  public currentUser = signal<CurrentUserDto | null>(
    this.getUserFromStorage()
  );

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>('auth/login', credentials)
      .pipe(
        tap((response) => this.handleAuthSuccess(response)),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>('auth/register', request)
      .pipe(
        tap((response) => this.handleAuthSuccess(response)),
        catchError((error) => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<TokenRefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: TokenRefreshRequest = { refreshToken };
    return this.apiService
      .post<TokenRefreshResponse>('auth/refresh', request)
      .pipe(
        tap((response) => {
          this.setTokens(response.accessToken, response.refreshToken);
        }),
        catchError((error) => {
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(revokeAllTokens = false): Observable<void> {
    const refreshToken = this.getRefreshToken();
    const request: LogoutRequest = {
      refreshToken: refreshToken || undefined,
      revokeAllTokens,
    };

    return this.apiService.post<void>('auth/logout', request).pipe(
      tap(() => this.clearAuthData()),
      catchError((error) => {
        // Clear auth data even if logout request fails
        console.error('Logout error:', error);
        this.clearAuthData();
        return of(void 0);
      })
    );
  }

  /**
   * Get current user information
   */
  getCurrentUser(): Observable<CurrentUserDto> {
    return this.apiService.get<CurrentUserDto>('auth/me').pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      })
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: number | number[]): boolean {
    const user = this.currentUser();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(20); // Admin role = 20
  }

  /**
   * Check if user is developer or admin
   */
  isDeveloperOrAdmin(): boolean {
    return this.hasRole([10, 20]); // Developer = 10, Admin = 20
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user has valid token
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.parseJwt(token);
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate > new Date();
    } catch {
      return false;
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    this.setTokens(response.accessToken, response.refreshToken);
    this.currentUserSubject.next(response.user);
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
    this.saveUserToStorage(response.user);
  }

  /**
   * Set tokens in localStorage
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Save user to localStorage
   */
  private saveUserToStorage(user: CurrentUserDto): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): CurrentUserDto | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Parse JWT token
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error('Invalid token');
    }
  }
}
