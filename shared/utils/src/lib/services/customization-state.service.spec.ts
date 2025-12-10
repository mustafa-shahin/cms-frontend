import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CustomizationStateService } from './customization-state.service';
import { CustomizationApiService } from './customization-api.service';
import { ColorUtilsService } from './color-utils.service';
import {
  ThemeSettings,
  TypographySettings,
  LayoutSettings,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS
} from '@cms/shared/customization-models';

describe('CustomizationStateService', () => {
  let service: CustomizationStateService;
  let apiServiceSpy: jest.Mocked<CustomizationApiService>;


  const mockThemeSettings: ThemeSettings = {
    ...DEFAULT_THEME_SETTINGS,
    brandPalette: {
      primary: { base: '#0066cc', light: '#3399ff', dark: '#004d99', contrast: '#FFFFFF' },
      secondary: { base: '#6c757d', light: '#8c959d', dark: '#4c555d', contrast: '#FFFFFF' },
      accent: { base: '#28a745', light: '#48c765', dark: '#1e7e34', contrast: '#FFFFFF' }
    }
  };

  const mockTypographySettings: TypographySettings = {
    ...DEFAULT_TYPOGRAPHY_SETTINGS,
    primaryFontFamily: 'Inter'
  };

  const mockLayoutSettings: LayoutSettings = {
    ...DEFAULT_LAYOUT_SETTINGS
  };

  beforeEach(() => {
    const apiSpy = {
      getThemeSettings: jest.fn().mockReturnValue(of(mockThemeSettings)),
      getTypographySettings: jest.fn().mockReturnValue(of(mockTypographySettings)),
      getLayoutSettings: jest.fn().mockReturnValue(of(mockLayoutSettings)),
      updateThemeSettings: jest.fn().mockReturnValue(of(mockThemeSettings)),
      updateTypographySettings: jest.fn().mockReturnValue(of(mockTypographySettings)),
      updateLayoutSettings: jest.fn().mockReturnValue(of(mockLayoutSettings))
    };

    const colorSpy = {
      generateTailwindPalette: jest.fn().mockReturnValue({
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
        400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
        800: '#1e40af', 900: '#1e3a8a', 950: '#172554', DEFAULT: '#3b82f6'
      })
    };

    TestBed.configureTestingModule({
      providers: [
        CustomizationStateService,
        { provide: CustomizationApiService, useValue: apiSpy },
        { provide: ColorUtilsService, useValue: colorSpy }
      ]
    });

    service = TestBed.inject(CustomizationStateService);
    apiServiceSpy = TestBed.inject(CustomizationApiService) as jest.Mocked<CustomizationApiService>;
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have null initial state', () => {
      expect(service.theme()).toBeNull();
      expect(service.typography()).toBeNull();
      expect(service.layout()).toBeNull();
    });

    it('should have loading false initially', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('loadAllSettings', () => {
    it('should load all settings from API', async () => {
      await service.loadAllSettings();

      expect(apiServiceSpy.getThemeSettings).toHaveBeenCalled();
      expect(apiServiceSpy.getTypographySettings).toHaveBeenCalled();
      expect(apiServiceSpy.getLayoutSettings).toHaveBeenCalled();
    });

    it('should populate theme signal', async () => {
      await service.loadAllSettings();
      expect(service.theme()).toEqual(mockThemeSettings);
    });

    it('should populate typography signal', async () => {
      await service.loadAllSettings();
      expect(service.typography()).toEqual(mockTypographySettings);
    });

    it('should populate layout signal', async () => {
      await service.loadAllSettings();
      expect(service.layout()).toEqual(mockLayoutSettings);
    });

    it('should set loading to true during load', async () => {
      const loadPromise = service.loadAllSettings();
      // Loading should be true while in progress
      expect(service.loading()).toBe(true);
      await loadPromise;
      expect(service.loading()).toBe(false);
    });

    it('should use defaults when API returns null', async () => {
      apiServiceSpy.getThemeSettings.mockReturnValue(of(null as any));
      apiServiceSpy.getTypographySettings.mockReturnValue(of(null as any));
      apiServiceSpy.getLayoutSettings.mockReturnValue(of(null as any));

      await service.loadAllSettings();

      expect(service.theme()).toEqual(DEFAULT_THEME_SETTINGS);
      expect(service.typography()).toEqual(DEFAULT_TYPOGRAPHY_SETTINGS);
      expect(service.layout()).toEqual(DEFAULT_LAYOUT_SETTINGS);
    });

    it('should set error on API failure', async () => {
      apiServiceSpy.getThemeSettings.mockReturnValue(throwError(() => new Error('API Error')));

      await service.loadAllSettings();

      expect(service.error()).toBe('Failed to load customization settings');
    });

    it('should set loading to false after error', async () => {
      apiServiceSpy.getThemeSettings.mockReturnValue(throwError(() => new Error('API Error')));

      await service.loadAllSettings();

      expect(service.loading()).toBe(false);
    });
  });

  describe('updateTheme', () => {
    beforeEach(async () => {
      await service.loadAllSettings();
    });

    it('should call API with settings', async () => {
      await service.updateTheme(mockThemeSettings);
      expect(apiServiceSpy.updateThemeSettings).toHaveBeenCalledWith(mockThemeSettings);
    });

    it('should update theme signal with response', async () => {
      const updatedTheme = { ...mockThemeSettings, brandPalette: { ...mockThemeSettings.brandPalette, primary: { base: '#ff0000', light: '#ff3333', dark: '#cc0000', contrast: '#FFFFFF' } } };
      apiServiceSpy.updateThemeSettings.mockReturnValue(of(updatedTheme));

      await service.updateTheme(updatedTheme);

      expect(service.theme()).toEqual(updatedTheme);
    });

    it('should set loading during update', async () => {
      const updatePromise = service.updateTheme(mockThemeSettings);
      expect(service.loading()).toBe(true);
      await updatePromise;
      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', async () => {
      apiServiceSpy.updateThemeSettings.mockReturnValue(throwError(() => new Error('Update failed')));

      await expect(service.updateTheme(mockThemeSettings)).rejects.toBeDefined();

      expect(service.error()).toBe('Failed to update theme settings');
    });
  });

  describe('updateTypography', () => {
    beforeEach(async () => {
      await service.loadAllSettings();
    });

    it('should call API with settings', async () => {
      await service.updateTypography(mockTypographySettings);
      expect(apiServiceSpy.updateTypographySettings).toHaveBeenCalledWith(mockTypographySettings);
    });

    it('should update typography signal', async () => {
      await service.updateTypography(mockTypographySettings);
      expect(service.typography()).toBeDefined();
    });
  });

  describe('updateLayout', () => {
    beforeEach(async () => {
      await service.loadAllSettings();
    });

    it('should call API with settings', async () => {
      await service.updateLayout(mockLayoutSettings);
      expect(apiServiceSpy.updateLayoutSettings).toHaveBeenCalledWith(mockLayoutSettings);
    });

    it('should update layout signal', async () => {
      await service.updateLayout(mockLayoutSettings);
      expect(service.layout()).toBeDefined();
    });
  });

  describe('setThemeLocal', () => {
    it('should update theme signal without API call', () => {
      const newTheme = { ...mockThemeSettings };
      service.setThemeLocal(newTheme);

      expect(service.theme()).toEqual(newTheme);
      expect(apiServiceSpy.updateThemeSettings).not.toHaveBeenCalled();
    });
  });

  describe('setTypographyLocal', () => {
    it('should update typography signal without API call', () => {
      const newTypography = { ...mockTypographySettings };
      service.setTypographyLocal(newTypography);

      expect(service.typography()).toEqual(newTypography);
      expect(apiServiceSpy.updateTypographySettings).not.toHaveBeenCalled();
    });
  });

  describe('setLayoutLocal', () => {
    it('should update layout signal without API call', () => {
      const newLayout = { ...mockLayoutSettings };
      service.setLayoutLocal(newLayout);

      expect(service.layout()).toEqual(newLayout);
      expect(apiServiceSpy.updateLayoutSettings).not.toHaveBeenCalled();
    });
  });

  describe('resetToSaved', () => {
    it('should revert to original values after local changes', async () => {
      await service.loadAllSettings();
      const originalTheme = service.theme();

      // Make local change
      const modifiedTheme = {
        ...originalTheme!,
        brandPalette: {
          ...originalTheme!.brandPalette,
          primary: { base: '#ff0000', light: '#ff3333', dark: '#cc0000', contrast: '#FFFFFF' }
        }
      };
      service.setThemeLocal(modifiedTheme);

      // Verify change was made
      expect(service.theme()?.brandPalette.primary.base).toBe('#ff0000');

      // Reset
      service.resetToSaved();

      // Should be back to original
      expect(service.theme()?.brandPalette.primary.base).toBe('#0066cc');
    });
  });

  describe('hasUnsavedChanges', () => {
    it('should return false when no changes', async () => {
      await service.loadAllSettings();
      expect(service.hasUnsavedChanges()).toBe(false);
    });

    it('should return true after local theme change', async () => {
      await service.loadAllSettings();
      
      const modified = {
        ...service.theme()!,
        brandPalette: {
          ...service.theme()!.brandPalette,
          primary: { base: '#ff0000', light: '#ff3333', dark: '#cc0000', contrast: '#FFFFFF' }
        }
      };
      service.setThemeLocal(modified);

      expect(service.hasUnsavedChanges()).toBe(true);
    });

    it('should return true after local typography change', async () => {
      await service.loadAllSettings();
      
      const modified = {
        ...service.typography()!,
        primaryFontFamily: 'Roboto'
      };
      service.setTypographyLocal(modified);

      expect(service.hasUnsavedChanges()).toBe(true);
    });

    it('should return true after local layout change', async () => {
      await service.loadAllSettings();
      
      const modified = {
        ...service.layout()!,
        spacing: {
          ...service.layout()!.spacing,
          containerMaxWidth: 1600
        }
      };
      service.setLayoutLocal(modified);

      expect(service.hasUnsavedChanges()).toBe(true);
    });

    it('should return false after reset', async () => {
      await service.loadAllSettings();
      
      service.setThemeLocal({
        ...service.theme()!,
        brandPalette: {
          ...service.theme()!.brandPalette,
          primary: { base: '#ff0000', light: '#ff3333', dark: '#cc0000', contrast: '#FFFFFF' }
        }
      });
      expect(service.hasUnsavedChanges()).toBe(true);

      service.resetToSaved();
      expect(service.hasUnsavedChanges()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should clear error on successful load', async () => {
      // First fail
      apiServiceSpy.getThemeSettings.mockReturnValue(throwError(() => new Error()));
      await service.loadAllSettings();
      expect(service.error()).toBeTruthy();

      // Then succeed
      apiServiceSpy.getThemeSettings.mockReturnValue(of(mockThemeSettings));
      await service.loadAllSettings();
      expect(service.error()).toBeNull();
    });
  });
});
