import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomizationWizardComponent } from './customization-wizard.component';
import { CustomizationStateService, AuthService, ThemeService, ToasterService, TranslationService } from '@cms/shared/utils';
import { ThemeSettings, TypographySettings, LayoutSettings } from '@cms/shared/customization-models';
import { CurrentUserDto } from '@cms/shared/api-interfaces';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CustomizationWizardComponent', () => {
  let component: CustomizationWizardComponent;
  let fixture: ComponentFixture<CustomizationWizardComponent>;
  let mockCustomizationStateService: Partial<CustomizationStateService>;
  let mockAuthService: Partial<AuthService>;
  let mockThemeService: Partial<ThemeService>;
  let mockToasterService: Partial<ToasterService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockCustomizationStateService = {
      loadAllSettings: jest.fn().mockResolvedValue(void 0),
      hasUnsavedChanges: signal(false),
      loading: signal(false),
      error: signal(null),
      theme: signal({} as ThemeSettings),
      typography: signal({} as TypographySettings),
      layout: signal({} as LayoutSettings),
      updateTheme: jest.fn(),
      updateTypography: jest.fn(),
      updateLayout: jest.fn(),
      resetToSaved: jest.fn()
    };

    mockAuthService = {
      currentUser: signal({ fullName: 'Test', email: 'test@test.com' } as CurrentUserDto),
      logout: jest.fn().mockReturnValue(of(void 0))
    };

    mockThemeService = {
      currentTheme: signal('light'),
      toggleTheme: jest.fn()
    };

    mockToasterService = {
      success: jest.fn(),
      error: jest.fn()
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key),
      currentLanguage: signal('en')
    };

    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CustomizationWizardComponent, NoopAnimationsModule],
      providers: [
        { provide: CustomizationStateService, useValue: mockCustomizationStateService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ToasterService, useValue: mockToasterService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomizationWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load settings on init', () => {
    expect(mockCustomizationStateService.loadAllSettings).toHaveBeenCalled();
  });

  it('should default active step to theme', () => {
    expect(component.activeStep()).toBe('theme');
  });

  it('should change steps', () => {
    component.setActiveStep('layout');
    expect(component.activeStep()).toBe('layout');
  });

  it('should save all settings', async () => {
    await component.saveAndClose();
    expect(mockCustomizationStateService.updateTheme).toHaveBeenCalled();
    expect(mockCustomizationStateService.updateTypography).toHaveBeenCalled();
    expect(mockCustomizationStateService.updateLayout).toHaveBeenCalled();
    expect(mockToasterService.success).toHaveBeenCalled();
  });

  it('should handle save error', async () => {
    const error = new Error('Save failed');
    (mockCustomizationStateService.updateTheme as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await component.saveAndClose();

    expect(mockToasterService.error).toHaveBeenCalled();
    expect(component.saving()).toBe(false);
    
    consoleSpy.mockRestore();
  });

  it('should close without saving if no changes', async () => {
    (mockCustomizationStateService.hasUnsavedChanges as WritableSignal<boolean>).set(false);
    const confirmSpy = jest.spyOn(window, 'confirm');

    await component.closeWithoutSaving();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(mockCustomizationStateService.resetToSaved).toHaveBeenCalled();
  });

  it('should prompt before closing if changes exist', async () => {
    (mockCustomizationStateService.hasUnsavedChanges as WritableSignal<boolean>).set(true);
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    await component.closeWithoutSaving();

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockCustomizationStateService.resetToSaved).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });
});
