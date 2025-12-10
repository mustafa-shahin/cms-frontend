import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemInfoStepComponent, SystemInfo } from './system-info-step.component';
import { CustomizationStateService, TranslationService, AuthService } from '@cms/shared/utils';
import { ThemeSettings, TypographySettings, LayoutSettings } from '@cms/shared/customization-models';
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
    mockCustomizationStateService = {
      theme: signal({} as ThemeSettings),
      typography: signal({} as TypographySettings),
      layout: signal({} as LayoutSettings),
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
