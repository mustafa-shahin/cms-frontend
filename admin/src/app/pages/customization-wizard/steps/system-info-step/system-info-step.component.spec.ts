import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemInfoStepComponent, SystemInfo } from './system-info-step.component';
import { CustomizationStateService, TranslationService, AuthService } from '@cms/shared/utils';
import { 
  DEFAULT_THEME_SETTINGS, 
  DEFAULT_TYPOGRAPHY_SETTINGS, 
  DEFAULT_LAYOUT_SETTINGS 
} from '@cms/shared/customization-models';
import { CurrentUserDto } from '@cms/shared/api-interfaces';
import { signal, WritableSignal } from '@angular/core';

// Test interface to access protected members
interface SystemInfoStepComponentTest {
  systemInfo: WritableSignal<SystemInfo[]>;
  refresh: () => void;
  copyToClipboard: () => Promise<void>;
}

describe('SystemInfoStepComponent', () => {
  let component: SystemInfoStepComponent;
  let fixture: ComponentFixture<SystemInfoStepComponent>;
  let mockCustomizationStateService: Partial<CustomizationStateService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    // Mock performance API
    Object.defineProperty(global, 'performance', {
      writable: true,
      value: {
        getEntriesByType: jest.fn().mockReturnValue([{
          loadEventEnd: 100,
          startTime: 0,
          domContentLoadedEventEnd: 50
        } as unknown as PerformanceNavigationTiming])
      }
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0
    };
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

    mockCustomizationStateService = {
      theme: signal({ ...DEFAULT_THEME_SETTINGS }),
      typography: signal({ ...DEFAULT_TYPOGRAPHY_SETTINGS }),
      layout: signal({ ...DEFAULT_LAYOUT_SETTINGS }),
      hasUnsavedChanges: signal(false)
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key)
    };

    mockAuthService = {
      currentUser: signal({ fullName: 'Test', email: 'test@test.com' } as CurrentUserDto)
    };

    await TestBed.configureTestingModule({
      imports: [SystemInfoStepComponent],
      providers: [
        { provide: CustomizationStateService, useValue: mockCustomizationStateService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemInfoStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load system info on init', () => {
    // ngOnInit is called automatically by fixture.detectChanges() in beforeEach
    expect((component as unknown as SystemInfoStepComponentTest).systemInfo().length).toBeGreaterThan(0);
  });

  it('should refresh info', () => {
     (component as unknown as SystemInfoStepComponentTest).refresh();
     expect((component as unknown as SystemInfoStepComponentTest).systemInfo().length).toBeGreaterThan(0);
  });

  it('should handle clipboard copy error', async () => {
    // Mock navigator.clipboard.writeText to reject
    const writeTextMock = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    Object.assign(navigator, {
        clipboard: {
            writeText: writeTextMock
        }
    });
    
    // We expect the global window.alert to be called, so spy on it
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await (component as unknown as SystemInfoStepComponentTest).copyToClipboard();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error));
    expect(alertSpy).toHaveBeenCalledWith('Failed to copy to clipboard');

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
