import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService, TranslationService, ThemeService } from '@cms/shared/utils';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CurrentUserDto } from '@cms/shared/api-interfaces';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

// Test interface to access protected members
interface DashboardComponentTest {
  onLogout: () => void;
  toggleTheme: () => void;
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockThemeService: Partial<ThemeService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockAuthService = {
      currentUser: signal({ fullName: 'Test User', email: 'test@example.com' } as CurrentUserDto),
      logout: jest.fn().mockReturnValue(of(void 0))
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key),
      currentLanguage: signal('en'),
      setLanguage: jest.fn()
    };

    mockThemeService = {
      currentTheme: signal('light'),
      toggleTheme: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(DashboardComponent, {
      set: {
        imports: [], // Remove child components for isolated testing
        schemas: [NO_ERRORS_SCHEMA]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle theme', () => {
    // Access the protected method via any to test it, or trigger it from template
    (component as unknown as DashboardComponentTest).toggleTheme();
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });

  it('should logout and navigate to login', () => {
    (component as unknown as DashboardComponentTest).onLogout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle logout error gracefully', () => {
    (mockAuthService.logout as jest.Mock).mockReturnValue(throwError(() => new Error('Logout failed')));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    
    (component as unknown as DashboardComponentTest).onLogout();
    
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
