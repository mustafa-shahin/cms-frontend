import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { AuthResponse, CurrentUserDto, UserRole, TokenRefreshResponse } from '@cms/shared/api-interfaces';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceSpy: jest.Mocked<ApiService>;
  let routerSpy: jest.Mocked<Router>;

  const TOKEN_KEY = 'cms_access_token';
  const REFRESH_TOKEN_KEY = 'cms_refresh_token';
  const USER_KEY = 'cms_user';

  const mockUser: CurrentUserDto = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    role: UserRole.EndUser,
    isActive: true
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjo5OTk5OTk5OTk5fQ.sig',
    refreshToken: 'refresh-token-123',
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: mockUser
  };

  // JWT with exp in the past
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxMDAwMDAwMDAwfQ.sig';
  
  // JWT with exp in the future
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjo5OTk5OTk5OTk5fQ.sig';

  beforeEach(() => {
    localStorage.clear();

    const apiSpy = {
      get: jest.fn(),
      post: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiSpy },
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    apiServiceSpy = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
    routerSpy = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with stored user', () => {
      // Reset TestBed to create a fresh service with stored user
      TestBed.resetTestingModule();
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      localStorage.setItem(TOKEN_KEY, validToken);
      
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: ApiService, useValue: { get: jest.fn(), post: jest.fn() } },
          { provide: Router, useValue: { navigate: jest.fn() } }
        ]
      });
      
      const freshService = TestBed.inject(AuthService);
      expect(freshService.currentUser()).toEqual(mockUser);
      expect(freshService.isAuthenticated()).toBe(true);
    });

    it('should have isAuthenticated false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('should call API and set tokens on success', () => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      expect(apiServiceSpy.post).toHaveBeenCalledWith('auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(localStorage.getItem(TOKEN_KEY)).toBe(mockAuthResponse.accessToken);
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe(mockAuthResponse.refreshToken);
    });

    it('should update currentUser signal on success', () => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      expect(service.currentUser()).toEqual(mockUser);
    });

    it('should set isAuthenticated to true on success', () => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should save user to localStorage on success', () => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      expect(localStorage.getItem(USER_KEY)).toBe(JSON.stringify(mockUser));
    });

    it('should propagate error on failure', (done) => {
      const error = { status: 401, message: 'Invalid credentials' };
      apiServiceSpy.post.mockReturnValue(throwError(() => error));

      service.login({ email: 'test@example.com', password: 'wrong' }).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('register', () => {
    it('should call API with registration data', () => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));

      service.register({
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }).subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith('auth/register', {
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should set tokens and user on success', () => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));

      service.register({
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }).subscribe();

      expect(localStorage.getItem(TOKEN_KEY)).toBe(mockAuthResponse.accessToken);
      expect(service.currentUser()).toEqual(mockUser);
    });
  });

  describe('refreshToken', () => {
    it('should call API with refresh token', () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh-token');
      const refreshResponse: TokenRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer'
      };
      apiServiceSpy.post.mockReturnValue(of(refreshResponse));

      service.refreshToken().subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith('auth/refresh', {
        refreshToken: 'old-refresh-token'
      });
    });

    it('should update tokens on success', () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh-token');
      const refreshResponse: TokenRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer'
      };
      apiServiceSpy.post.mockReturnValue(of(refreshResponse));

      service.refreshToken().subscribe();

      expect(localStorage.getItem(TOKEN_KEY)).toBe('new-access-token');
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh-token');
    });

    it('should return error when no refresh token', (done) => {
      service.refreshToken().subscribe({
        error: (err) => {
          expect(err.message).toBe('No refresh token available');
          done();
        }
      });
    });

    it('should logout on refresh failure', () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh-token');
      localStorage.setItem(TOKEN_KEY, 'old-access-token');
      apiServiceSpy.post.mockReturnValue(throwError(() => ({ status: 401 })));

      service.refreshToken().subscribe({ error: () => { /* expected error */ } });

      // clearAuthData should have been called
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem(TOKEN_KEY, 'token');
      localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    });

    it('should call API with refresh token', () => {
      apiServiceSpy.post.mockReturnValue(of(void 0));

      service.logout().subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith('auth/logout', {
        refreshToken: 'refresh',
        revokeAllTokens: false
      });
    });

    it('should clear all auth data', () => {
      apiServiceSpy.post.mockReturnValue(of(void 0));

      service.logout().subscribe();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });

    it('should navigate to login', () => {
      apiServiceSpy.post.mockReturnValue(of(void 0));

      service.logout().subscribe();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should update isAuthenticated to false', () => {
      apiServiceSpy.post.mockReturnValue(of(void 0));

      service.logout().subscribe();

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should clear data even if API fails', () => {
      apiServiceSpy.post.mockReturnValue(throwError(() => ({ status: 500 })));

      service.logout().subscribe();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('should pass revokeAllTokens flag', () => {
      apiServiceSpy.post.mockReturnValue(of(void 0));

      service.logout(true).subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith('auth/logout', {
        refreshToken: 'refresh',
        revokeAllTokens: true
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should call API and update user state', () => {
      apiServiceSpy.get.mockReturnValue(of(mockUser));

      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      expect(apiServiceSpy.get).toHaveBeenCalledWith('auth/me');
      expect(service.currentUser()).toEqual(mockUser);
    });
  });

  describe('hasRole', () => {
    beforeEach(() => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));
      service.login({ email: 'test@example.com', password: 'password' }).subscribe();
    });

    it('should return true when user has exact role', () => {
      expect(service.hasRole(UserRole.EndUser)).toBe(true);
    });

    it('should return false when user does not have role', () => {
      expect(service.hasRole(UserRole.Admin)).toBe(false);
    });

    it('should return true when user role is in array', () => {
      expect(service.hasRole([UserRole.EndUser, UserRole.Developer])).toBe(true);
    });

    it('should return false when user role is not in array', () => {
      expect(service.hasRole([UserRole.Developer, UserRole.Admin])).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      // Call logout to clear service state (not just localStorage)
      apiServiceSpy.post.mockReturnValue(of(void 0));
      service.logout().subscribe();
      
      // Now currentUser should be null
      expect(service.hasRole(UserRole.EndUser)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const adminUser = { ...mockUser, role: UserRole.Admin };
      const adminResponse = { ...mockAuthResponse, user: adminUser };
      apiServiceSpy.post.mockReturnValue(of(adminResponse));
      service.login({ email: 'admin@example.com', password: 'password' }).subscribe();

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for non-admin user', () => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));
      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('isDeveloperOrAdmin', () => {
    it('should return true for developer', () => {
      const devUser = { ...mockUser, role: UserRole.Developer };
      const devResponse = { ...mockAuthResponse, user: devUser };
      apiServiceSpy.post.mockReturnValue(of(devResponse));
      service.login({ email: 'dev@example.com', password: 'password' }).subscribe();

      expect(service.isDeveloperOrAdmin()).toBe(true);
    });

    it('should return true for admin', () => {
      const adminUser = { ...mockUser, role: UserRole.Admin };
      const adminResponse = { ...mockAuthResponse, user: adminUser };
      apiServiceSpy.post.mockReturnValue(of(adminResponse));
      service.login({ email: 'admin@example.com', password: 'password' }).subscribe();

      expect(service.isDeveloperOrAdmin()).toBe(true);
    });

    it('should return false for end user', () => {
      apiServiceSpy.post.mockReturnValue(of(mockAuthResponse));
      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      expect(service.isDeveloperOrAdmin()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token when present', () => {
      localStorage.setItem(TOKEN_KEY, 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('should return null when no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token when present', () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, 'my-refresh-token');
      expect(service.getRefreshToken()).toBe('my-refresh-token');
    });

    it('should return null when no refresh token', () => {
      expect(service.getRefreshToken()).toBeNull();
    });
  });

  describe('hasValidToken', () => {
    it('should return false when no token', () => {
      expect(service.hasValidToken()).toBe(false);
    });

    it('should return false for expired token', () => {
      localStorage.setItem(TOKEN_KEY, expiredToken);
      expect(service.hasValidToken()).toBe(false);
    });

    it('should return true for valid token', () => {
      localStorage.setItem(TOKEN_KEY, validToken);
      expect(service.hasValidToken()).toBe(true);
    });

    it('should return false for invalid token format', () => {
      localStorage.setItem(TOKEN_KEY, 'invalid-token');
      expect(service.hasValidToken()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle corrupted user data in localStorage', () => {
      localStorage.setItem(USER_KEY, 'invalid-json');
      // Should not throw
      expect(() => TestBed.inject(AuthService)).not.toThrow();
    });

    it('should handle empty strings in localStorage', () => {
      localStorage.setItem(TOKEN_KEY, '');
      expect(service.hasValidToken()).toBe(false);
    });
  });
});
