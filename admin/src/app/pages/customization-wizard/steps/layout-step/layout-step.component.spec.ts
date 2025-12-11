import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutStepComponent } from './layout-step.component';
import { CustomizationStateService, TranslationService } from '@cms/shared/utils';
import { Signal, signal, WritableSignal } from '@angular/core';
import { HeaderTemplate, FooterTemplate, Placement, LayoutSettings } from '@cms/shared/customization-models';

interface MockCustomizationStateService {
  layout: WritableSignal<LayoutSettings | null>;
  setLayoutLocal: jest.Mock;
}

interface MockTranslationService {
  instant: jest.Mock;
  currentLanguage: Signal<string>;
}

describe('LayoutStepComponent', () => {
  let component: LayoutStepComponent;
  let fixture: ComponentFixture<LayoutStepComponent>;
  let mockCustomizationStateService: MockCustomizationStateService;
  let mockTranslationService: MockTranslationService;

  beforeEach(async () => {
    mockCustomizationStateService = {
      layout: signal({
        headerConfiguration: {
          template: HeaderTemplate.Standard,
          logoPlacement: Placement.Left,
          stickyHeader: true,
          showSearch: true
        },
        footerConfiguration: {
          template: FooterTemplate.Standard,
          columnCount: 4,
          showSocialLinks: true,
          showNewsletter: true
        },
        spacing: {
          containerMaxWidth: 1200,
          sectionPadding: 4,
          componentGap: 2
        }
      }),
      setLayoutLocal: jest.fn()
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key),
      currentLanguage: signal('en')
    };

    await TestBed.configureTestingModule({
      imports: [LayoutStepComponent],
      providers: [
        { provide: CustomizationStateService, useValue: mockCustomizationStateService },
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update header config', () => {
    component.updateHeader('stickyHeader', false);
    expect(mockCustomizationStateService.setLayoutLocal).toHaveBeenCalled();
  });

  it('should update footer config', () => {
    component.updateFooter('columnCount', 3);
    expect(mockCustomizationStateService.setLayoutLocal).toHaveBeenCalled();
  });

  it('should update spacing config', () => {
    component.updateSpacing('containerMaxWidth', 1400);
    expect(mockCustomizationStateService.setLayoutLocal).toHaveBeenCalled();
  });

  it('should handle missing layout state', () => {
    mockCustomizationStateService.layout.set(null);
    component.updateHeader('stickyHeader', false);
    expect(mockCustomizationStateService.setLayoutLocal).not.toHaveBeenCalled();
    
    component.updateFooter('columnCount', 3);
    expect(mockCustomizationStateService.setLayoutLocal).not.toHaveBeenCalled();

    component.updateSpacing('containerMaxWidth', 1400);
    expect(mockCustomizationStateService.setLayoutLocal).not.toHaveBeenCalled();
  });

  it('should correctly remove px from string values', () => {
    expect(component.removePx('100px')).toBe(100);
    expect(component.removePx(200)).toBe(200);
    expect(component.removePx('')).toBe(0);
    // @ts-expect-error - Testing runtime null handling which is not allowed by types
    expect(component.removePx(null)).toBe(0);
  });
});
