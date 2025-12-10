import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeStepComponent } from './theme-step.component';
import { CustomizationStateService, ColorUtilsService, TranslationService } from '@cms/shared/utils';
import { ThemeSettings, ColorScheme } from '@cms/shared/customization-models';
import { signal, WritableSignal } from '@angular/core';

describe('ThemeStepComponent', () => {
  let component: ThemeStepComponent;
  let fixture: ComponentFixture<ThemeStepComponent>;
  let mockCustomizationStateService: { theme: WritableSignal<ThemeSettings | null>; setThemeLocal: jest.Mock };
  let mockColorUtilsService: Partial<ColorUtilsService>;
  let mockTranslationService: Partial<TranslationService>;

  const mockThemeSettings: ThemeSettings = {
    brandPalette: {
      primary: { base: '#000000', light: '#333333', dark: '#000000', contrast: '#ffffff' },
      secondary: { base: '#ffffff', light: '#ffffff', dark: '#eeeeee', contrast: '#000000' },
      accent: { base: '#ff0000', light: '#ff3333', dark: '#cc0000', contrast: '#ffffff' }
    },
    neutralPalette: {
      primary: { base: '#808080', light: '#a0a0a0', dark: '#606060', contrast: '#ffffff' },
        secondary: { base: '#808080', light: '#a0a0a0', dark: '#606060', contrast: '#ffffff' },
        accent: { base: '#808080', light: '#a0a0a0', dark: '#606060', contrast: '#ffffff' }
    },
    semanticPalette: {
      primary: { base: '#00ff00', light: '#33ff33', dark: '#00cc00', contrast: '#000000' },
        secondary: { base: '#00ff00', light: '#33ff33', dark: '#00cc00', contrast: '#000000' },
        accent: { base: '#00ff00', light: '#33ff33', dark: '#00cc00', contrast: '#000000' }
    },
    lastModifiedBy: 'test-user',
    lastModifiedAt: new Date().toISOString()
  };

  beforeEach(async () => {
    mockCustomizationStateService = {
      theme: signal<ThemeSettings | null>(mockThemeSettings),
      setThemeLocal: jest.fn()
    };

    mockColorUtilsService = {
      generateColorScheme: jest.fn().mockReturnValue({
        base: '#111111',
        light: '#222222',
        dark: '#000000',
        contrast: '#ffffff'
      } as ColorScheme),
      getRelativeLuminance: jest.fn().mockReturnValue(0.6) // Light color
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key)
    };

    await TestBed.configureTestingModule({
      imports: [ThemeStepComponent],
      providers: [
        { provide: CustomizationStateService, useValue: mockCustomizationStateService },
        { provide: ColorUtilsService, useValue: mockColorUtilsService },
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with correct palettes and color variants', () => {
      expect(component.palettes.length).toBe(3);
      expect(component.colorTypes.length).toBe(3);
      expect(component.colorVariants).toEqual(['base', 'light', 'dark', 'contrast']);
    });
  });

  describe('getColor', () => {
    it('should return correct color value', () => {
      const color = component.getColor('brandPalette', 'primary', 'base');
      expect(color).toBe('#000000');
    });

    it('should return black if theme is null', () => {
      mockCustomizationStateService.theme.set(null);
      const color = component.getColor('brandPalette', 'primary', 'base');
      expect(color).toBe('#000000');
    });
  });

  describe('updateColor', () => {
    it('should update color and call setThemeLocal', () => {
      const newColor = '#123456';
      component.updateColor('brandPalette', 'primary', 'base', newColor);

      expect(mockCustomizationStateService.setThemeLocal).toHaveBeenCalled();
      
      const lastCallArg = mockCustomizationStateService.setThemeLocal.mock.calls[0][0] as ThemeSettings;
      expect(lastCallArg.brandPalette.primary.base).toBe(newColor);
      // Ensure other properties remain unchanged
      expect(lastCallArg.brandPalette.secondary.base).toBe(mockThemeSettings.brandPalette.secondary.base);
    });

    it('should not do anything if theme is null', () => {
      mockCustomizationStateService.theme.set(null);
      component.updateColor('brandPalette', 'primary', 'base', '#ffffff');
      expect(mockCustomizationStateService.setThemeLocal).not.toHaveBeenCalled();
    });
  });

  describe('autoGenerateVariants', () => {
    it('should generate variants and update theme', () => {
      component.autoGenerateVariants('brandPalette', 'primary');

      expect(mockColorUtilsService.generateColorScheme).toHaveBeenCalledWith(mockThemeSettings.brandPalette.primary.base);
      expect(mockCustomizationStateService.setThemeLocal).toHaveBeenCalled();

      const lastCallArg = mockCustomizationStateService.setThemeLocal.mock.calls[0][0] as ThemeSettings;
      expect(lastCallArg.brandPalette.primary.light).toBe('#222222'); // Checked against mock return
    });

    it('should not do anything if theme is null', () => {
      mockCustomizationStateService.theme.set(null);
      component.autoGenerateVariants('brandPalette', 'primary');
      expect(mockColorUtilsService.generateColorScheme).not.toHaveBeenCalled();
      expect(mockCustomizationStateService.setThemeLocal).not.toHaveBeenCalled();
    });
  });

  describe('View Helpers', () => {
    it('should return correct contrast class based on luminance', () => {
      // Mock returns 0.6 (> 0.5), so should be black text
      const result = component.getContrastClass('#ffffff');
      expect(result).toBe('text-black');

      (mockColorUtilsService.getRelativeLuminance as jest.Mock).mockReturnValue(0.1);
      const resultDark = component.getContrastClass('#000000');
      expect(resultDark).toBe('text-white');
    });

    it('should trigger click on element for openColorPicker', () => {
      const mockElement = { click: jest.fn() };
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as unknown as HTMLElement);

      component.openColorPicker('test-id');
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should translate palette title', () => {
        component.getPaletteTitle('brandPalette');
        expect(mockTranslationService.instant).toHaveBeenCalledWith('customization.theme.brandColors');
    });

    it('should translate palette description', () => {
        component.getPaletteDescription('brandPalette');
        expect(mockTranslationService.instant).toHaveBeenCalledWith('customization.theme.brandDescription');
    });

    it('should translate color type label', () => {
        component.getColorTypeLabel('primary');
        expect(mockTranslationService.instant).toHaveBeenCalledWith('customization.theme.primary');
    });

    it('should translate variant label', () => {
        component.getVariantLabel('base');
        expect(mockTranslationService.instant).toHaveBeenCalledWith('customization.theme.base');
    });
  });
});
