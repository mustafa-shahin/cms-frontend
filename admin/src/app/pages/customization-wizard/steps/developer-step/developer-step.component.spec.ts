import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeveloperStepComponent } from './developer-step.component';
import { CustomizationStateService, TranslationService } from '@cms/shared/utils';
import { signal, WritableSignal } from '@angular/core';
import { ThemeSettings, TypographySettings, LayoutSettings } from '@cms/shared/customization-models';

// Interface to expose protected members for testing
interface TestDeveloperStepComponent {
  loadNewestConfig(): Promise<void>;
  saveCurrentConfig(): Promise<void>;
  showResetConfirmation(): void;
  importConfig(event: Event): void;
  resetConfirmVisible: WritableSignal<boolean>;
  actionMessage: WritableSignal<{ type: 'success' | 'error' | 'info'; text: string } | null>;
}

describe('DeveloperStepComponent', () => {
  let component: TestDeveloperStepComponent;
  let fixture: ComponentFixture<DeveloperStepComponent>;
  let mockCustomizationStateService: Partial<CustomizationStateService>;
  let mockTranslationService: Partial<TranslationService>;

  beforeEach(async () => {
    mockCustomizationStateService = {
      loading: signal(false),
      error: signal(null),
      theme: signal({} as ThemeSettings),
      typography: signal({} as TypographySettings),
      layout: signal({} as LayoutSettings),
      hasUnsavedChanges: signal(false),
      loadAllSettings: jest.fn().mockResolvedValue(void 0),
      updateTheme: jest.fn().mockResolvedValue(void 0),
      updateTypography: jest.fn().mockResolvedValue(void 0),
      updateLayout: jest.fn().mockResolvedValue(void 0),
      resetToSaved: jest.fn()
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key)
    };

    await TestBed.configureTestingModule({
      imports: [DeveloperStepComponent],
      providers: [
        { provide: CustomizationStateService, useValue: mockCustomizationStateService },
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeveloperStepComponent);
    component = fixture.componentInstance as unknown as TestDeveloperStepComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load newest config', async () => {
    await component.loadNewestConfig();
    expect(mockCustomizationStateService.loadAllSettings).toHaveBeenCalled();
  });

  it('should save current config', async () => {
    await component.saveCurrentConfig();
    expect(mockCustomizationStateService.updateTheme).toHaveBeenCalled();
    expect(mockCustomizationStateService.updateTypography).toHaveBeenCalled();
    expect(mockCustomizationStateService.updateLayout).toHaveBeenCalled();
  });

  it('should handle reset confirmation', () => {
    component.showResetConfirmation();
    expect(component.resetConfirmVisible()).toBe(true);
  });

  it('should handle save error', async () => {
    // Asserting the mock type to access mock methods
    (mockCustomizationStateService.updateTheme as jest.Mock).mockRejectedValue(new Error('Save failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { /* no-op */ });

    await component.saveCurrentConfig();

    expect(component.actionMessage()?.type).toBe('error');
    
    consoleSpy.mockRestore();
  });

  it('should validate invalid import file type', () => {
    const file = new File(['{}'], 'config.txt', { type: 'text/plain' });
    
    // Create a mock FileList since DataTransfer is not available in jsdom
    const mockFileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null)
    } as unknown as FileList;
    
    // Create a mock input element with mocked properties for file testing
    let inputValue = 'C:\\fakepath\\config.txt';
    const inputElement = {
      type: 'file',
      files: mockFileList,
      get value() { return inputValue; },
      set value(v: string) { inputValue = v; }
    } as unknown as HTMLInputElement;

    const event = { target: inputElement } as unknown as Event;

    component.importConfig(event);

    expect(component.actionMessage()?.type).toBe('error');
    expect(component.actionMessage()?.text).toContain('Invalid file type');
    expect(inputValue).toBe('');
  });

  it('should validate invalid import file size', () => {
    // Create a file and mock its size to be 6MB
    const file = new File(['content'], 'config.json', { type: 'application/json' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });

    // Create a mock FileList since DataTransfer is not available in jsdom
    const mockFileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null)
    } as unknown as FileList;

    // Create a mock input element with mocked properties for file testing
    let inputValue = 'C:\\fakepath\\config.json';
    const inputElement = {
      type: 'file',
      files: mockFileList,
      get value() { return inputValue; },
      set value(v: string) { inputValue = v; }
    } as unknown as HTMLInputElement;
    
    const event = { target: inputElement } as unknown as Event;

    component.importConfig(event);

    expect(component.actionMessage()?.text).toContain('File is too large');
  });
});
