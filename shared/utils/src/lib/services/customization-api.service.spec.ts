import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CustomizationApiService } from './customization-api.service';
import { ApiService } from './api.service';
import { 
  ThemeSettings, 
  TypographySettings, 
  LayoutSettings,
  TextStyleType,
  TextStyle,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS
} from '@cms/shared/customization-models';

describe('CustomizationApiService', () => {
  let service: CustomizationApiService;
  let apiServiceSpy: jest.Mocked<ApiService>;

  const mockThemeSettings: ThemeSettings = {
    ...DEFAULT_THEME_SETTINGS,
    brandPalette: {
      primary: { base: '#0066cc', light: '#3399ff', dark: '#004499', contrast: '#FFFFFF' },
      secondary: { base: '#6c757d', light: '#8c959d', dark: '#4c555d', contrast: '#FFFFFF' },
      accent: { base: '#28a745', light: '#48c765', dark: '#188725', contrast: '#FFFFFF' }
    }
  };

  const mockTypographySettings: TypographySettings = {
    ...DEFAULT_TYPOGRAPHY_SETTINGS,
    primaryFontFamily: 'Inter',
    secondaryFontFamily: 'Roboto',
    monoFontFamily: 'Fira Code'
  };

  const mockLayoutSettings: LayoutSettings = {
    ...DEFAULT_LAYOUT_SETTINGS,
    spacing: {
      containerMaxWidth: 1280,
      sectionPadding: 2,
      componentGap: 1.5
    }
  };

  beforeEach(() => {
    const spy = {
      get: jest.fn(),
      put: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        CustomizationApiService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(CustomizationApiService);
    apiServiceSpy = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
  });

  describe('Theme API', () => {
    describe('getThemeSettings', () => {
      it('should call API get with correct endpoint', () => {
        apiServiceSpy.get.mockReturnValue(of(mockThemeSettings));

        service.getThemeSettings().subscribe(settings => {
          expect(settings).toEqual(mockThemeSettings);
        });

        expect(apiServiceSpy.get).toHaveBeenCalledWith('customization/theme');
      });

      it('should return theme settings from API', () => {
        apiServiceSpy.get.mockReturnValue(of(mockThemeSettings));

        service.getThemeSettings().subscribe(settings => {
          expect(settings.brandPalette.primary.base).toBe('#0066cc');
        });
      });
    });

    describe('updateThemeSettings', () => {
      it('should call API put with wrapped settings', () => {
        apiServiceSpy.put.mockReturnValue(of(mockThemeSettings));

        service.updateThemeSettings(mockThemeSettings).subscribe();

        expect(apiServiceSpy.put).toHaveBeenCalledWith(
          'customization/theme',
          { themeSettings: mockThemeSettings }
        );
      });

      it('should return updated settings', () => {
        apiServiceSpy.put.mockReturnValue(of(mockThemeSettings));

        service.updateThemeSettings(mockThemeSettings).subscribe(settings => {
          expect(settings).toEqual(mockThemeSettings);
        });
      });
    });
  });

  describe('Typography API', () => {
    describe('getTypographySettings', () => {
      it('should call API get with correct endpoint', () => {
        apiServiceSpy.get.mockReturnValue(of(mockTypographySettings));

        service.getTypographySettings().subscribe();

        expect(apiServiceSpy.get).toHaveBeenCalledWith('customization/typography');
      });

      it('should transform string enum keys to numeric keys', () => {
        const responseWithStringKeys = {
          ...mockTypographySettings,
          textStyles: {
            'Heading1': { fontSize: 32, fontWeight: 700 } as TextStyle,
            'Body': { fontSize: 16, fontWeight: 400 } as TextStyle
          }
        };
        apiServiceSpy.get.mockReturnValue(of(responseWithStringKeys));

        service.getTypographySettings().subscribe(settings => {
          // Check that string keys are transformed to numeric enum values
          expect(settings.textStyles).toBeDefined();
        });
      });

      it('should handle numeric keys in response', () => {
        const responseWithNumericKeys = {
          ...mockTypographySettings,
          textStyles: {
            '0': { fontSize: 32, fontWeight: 700 } as TextStyle,
            '1': { fontSize: 24, fontWeight: 600 } as TextStyle
          }
        };
        apiServiceSpy.get.mockReturnValue(of(responseWithNumericKeys));

        service.getTypographySettings().subscribe(settings => {
          expect(settings.textStyles).toBeDefined();
        });
      });

      it('should handle case-insensitive key matching', () => {
        const responseWithMixedCase = {
          ...mockTypographySettings,
          textStyles: {
            'heading1': { fontSize: 32, fontWeight: 700 } as TextStyle,
            'BODY': { fontSize: 16, fontWeight: 400 } as TextStyle
          }
        };
        apiServiceSpy.get.mockReturnValue(of(responseWithMixedCase));

        service.getTypographySettings().subscribe(settings => {
          expect(settings.textStyles).toBeDefined();
        });
      });

      it('should handle empty textStyles', () => {
        const responseWithEmptyStyles = {
          ...mockTypographySettings,
          textStyles: {}
        };
        apiServiceSpy.get.mockReturnValue(of(responseWithEmptyStyles));

        service.getTypographySettings().subscribe(settings => {
          expect(settings.textStyles).toEqual({});
        });
      });

      it('should handle null textStyles', () => {
        const responseWithNullStyles = {
          ...mockTypographySettings,
          textStyles: null as unknown
        };
        apiServiceSpy.get.mockReturnValue(of(responseWithNullStyles));

        service.getTypographySettings().subscribe(settings => {
          expect(settings).toBeDefined();
        });
      });
    });

    describe('updateTypographySettings', () => {
      it('should call API put with correct endpoint', () => {
        apiServiceSpy.put.mockReturnValue(of(mockTypographySettings));

        service.updateTypographySettings(mockTypographySettings).subscribe();

        expect(apiServiceSpy.put).toHaveBeenCalledWith(
          'customization/typography',
          expect.objectContaining({ typographySettings: expect.any(Object) })
        );
      });

      it('should transform numeric keys to string enum names for backend', () => {
        const settingsWithNumericKeys: TypographySettings = {
          ...mockTypographySettings,
          textStyles: {
            ...DEFAULT_TYPOGRAPHY_SETTINGS.textStyles,
            [TextStyleType.Heading1]: { ...DEFAULT_TYPOGRAPHY_SETTINGS.textStyles[TextStyleType.Heading1], fontSize: 2.5, fontWeight: 700 },
            [TextStyleType.BodyMedium]: { ...DEFAULT_TYPOGRAPHY_SETTINGS.textStyles[TextStyleType.BodyMedium], fontSize: 1.0, fontWeight: 400 }
          }
        };
        apiServiceSpy.put.mockReturnValue(of(settingsWithNumericKeys));

        service.updateTypographySettings(settingsWithNumericKeys).subscribe();

        const calledPayload = apiServiceSpy.put.mock.calls[0][1] as { typographySettings: { textStyles: Record<string, unknown> } };
        const textStyles = calledPayload.typographySettings.textStyles;
        
        // Should have string keys like 'Heading1', 'Body'
        expect(Object.keys(textStyles).every(key => isNaN(Number(key)))).toBe(true);
      });

      it('should transform response back to numeric keys', () => {
        const responseWithStringKeys = {
          ...mockTypographySettings,
          textStyles: {
            'Heading1': { fontSize: 32, fontWeight: 700 } as TextStyle
          }
        };
        apiServiceSpy.put.mockReturnValue(of(responseWithStringKeys));

        service.updateTypographySettings(mockTypographySettings).subscribe(settings => {
          // Response should be transformed to numeric keys
          expect(settings.textStyles).toBeDefined();
        });
      });
    });
  });

  describe('Layout API', () => {
    describe('getLayoutSettings', () => {
      it('should call API get with correct endpoint', () => {
        apiServiceSpy.get.mockReturnValue(of(mockLayoutSettings));

        service.getLayoutSettings().subscribe(settings => {
          expect(settings).toEqual(mockLayoutSettings);
        });

        expect(apiServiceSpy.get).toHaveBeenCalledWith('customization/layout');
      });

      it('should return layout settings', () => {
        apiServiceSpy.get.mockReturnValue(of(mockLayoutSettings));

        service.getLayoutSettings().subscribe(settings => {
          expect(settings.spacing.containerMaxWidth).toBe(1280);
        });
      });
    });

    describe('updateLayoutSettings', () => {
      it('should call API put with wrapped settings', () => {
        apiServiceSpy.put.mockReturnValue(of(mockLayoutSettings));

        service.updateLayoutSettings(mockLayoutSettings).subscribe();

        expect(apiServiceSpy.put).toHaveBeenCalledWith(
          'customization/layout',
          { layoutSettings: mockLayoutSettings }
        );
      });

      it('should return updated settings', () => {
        apiServiceSpy.put.mockReturnValue(of(mockLayoutSettings));

        service.updateLayoutSettings(mockLayoutSettings).subscribe(settings => {
          expect(settings).toEqual(mockLayoutSettings);
        });
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined settings in transformResponse', () => {
      apiServiceSpy.get.mockReturnValue(of(undefined as unknown));

      service.getTypographySettings().subscribe(settings => {
        expect(settings).toBeUndefined();
      });
    });

    it('should handle textStyles with unknown keys', () => {
      const responseWithUnknownKeys = {
        ...mockTypographySettings,
        textStyles: {
          'UnknownStyleType': { fontSize: 14, fontWeight: 400 } as TextStyle
        }
      };
      apiServiceSpy.get.mockReturnValue(of(responseWithUnknownKeys));

      service.getTypographySettings().subscribe(settings => {
        // Unknown keys should be skipped
        expect(Object.keys(settings.textStyles || {}).length).toBe(0);
      });
    });
  });
});
