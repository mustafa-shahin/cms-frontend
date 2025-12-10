import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypographyStepComponent } from './typography-step.component';
import { CustomizationStateService, TranslationService } from '@cms/shared/utils';
import { signal } from '@angular/core';
import { TextStyleType, DEFAULT_TYPOGRAPHY_SETTINGS, TypographySettings } from '@cms/shared/customization-models';

describe('TypographyStepComponent', () => {
  let component: TypographyStepComponent;
  let fixture: ComponentFixture<TypographyStepComponent>;
  let mockCustomizationStateService: {
    typography: ReturnType<typeof signal<TypographySettings | null>>;
    setTypographyLocal: jest.Mock;
  };
  let mockTranslationService: {
    instant: jest.Mock;
    currentLanguage: ReturnType<typeof signal<string>>;
  };

  beforeEach(async () => {
    mockCustomizationStateService = {
      typography: signal({
        ...DEFAULT_TYPOGRAPHY_SETTINGS
      }),
      setTypographyLocal: jest.fn()
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key),
      currentLanguage: signal('en')
    };

    await TestBed.configureTestingModule({
      imports: [TypographyStepComponent],
      providers: [
        { provide: CustomizationStateService, useValue: mockCustomizationStateService },
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TypographyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update font family', () => {
    component.updateFontFamily('primaryFontFamily', 'Roboto');
    expect(mockCustomizationStateService.setTypographyLocal).toHaveBeenCalledWith(
      expect.objectContaining({ primaryFontFamily: 'Roboto' })
    );
  });

  it('should update text style', () => {
    component.updateTextStyle(TextStyleType.BodyMedium, { fontSize: 2 });
    expect(mockCustomizationStateService.setTypographyLocal).toHaveBeenCalled();
    const callArg = mockCustomizationStateService.setTypographyLocal.mock.calls[0][0];
    expect(callArg.textStyles[TextStyleType.BodyMedium].fontSize).toBe(2);
  });

  it('should handle missing typography state regarding fontFamily update', () => {
    mockCustomizationStateService.typography.set(null);
    component.updateFontFamily('primaryFontFamily', 'Roboto');
    expect(mockCustomizationStateService.setTypographyLocal).not.toHaveBeenCalled();
  });

  it('should handle missing typography state regarding textStyle update', () => {
      mockCustomizationStateService.typography.set(null);
      component.updateTextStyle(TextStyleType.BodyMedium, { fontSize: 2 });
      expect(mockCustomizationStateService.setTypographyLocal).not.toHaveBeenCalled();
  });
});
