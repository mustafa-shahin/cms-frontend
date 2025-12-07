import { Injectable, inject, signal, computed } from '@angular/core';
import { CustomizationApiService } from './customization-api.service';
import {
  ThemeSettings,
  TypographySettings,
  LayoutSettings,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS
} from '@cms/shared/customization-models';

/**
 * State management service for customization settings using Angular signals.
 * Provides reactive state and methods for managing theme, typography, and layout.
 */
@Injectable({
  providedIn: 'root'
})
export class CustomizationStateService {
  private readonly api = inject(CustomizationApiService);

  // Signals for reactive state
  private readonly themeSignal = signal<ThemeSettings | null>(null);
  private readonly typographySignal = signal<TypographySettings | null>(null);
  private readonly layoutSignal = signal<LayoutSettings | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Original values for change detection
  private originalTheme: ThemeSettings | null = null;
  private originalTypography: TypographySettings | null = null;
  private originalLayout: LayoutSettings | null = null;

  // Public readonly signals
  readonly theme = this.themeSignal.asReadonly();
  readonly typography = this.typographySignal.asReadonly();
  readonly layout = this.layoutSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals
  readonly hasUnsavedChanges = computed(() => {
    const currentTheme = this.themeSignal();
    const currentTypography = this.typographySignal();
    const currentLayout = this.layoutSignal();

    return (
      JSON.stringify(currentTheme) !== JSON.stringify(this.originalTheme) ||
      JSON.stringify(currentTypography) !== JSON.stringify(this.originalTypography) ||
      JSON.stringify(currentLayout) !== JSON.stringify(this.originalLayout)
    );
  });

  /**
   * Load all customization settings from the server
   */
  async loadAllSettings(): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const [theme, typography, layout] = await Promise.all([
        this.api.getThemeSettings().toPromise(),
        this.api.getTypographySettings().toPromise(),
        this.api.getLayoutSettings().toPromise()
      ]);

      this.themeSignal.set(theme || DEFAULT_THEME_SETTINGS);
      this.typographySignal.set(typography || DEFAULT_TYPOGRAPHY_SETTINGS);
      this.layoutSignal.set(layout || DEFAULT_LAYOUT_SETTINGS);

      // Store original values
      this.originalTheme = JSON.parse(JSON.stringify(theme));
      this.originalTypography = JSON.parse(JSON.stringify(typography));
      this.originalLayout = JSON.parse(JSON.stringify(layout));

      this.applySettingsToDom();
    } catch (error) {
      this.errorSignal.set('Failed to load customization settings');
      console.error('Error loading customization settings:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update theme settings
   */
  async updateTheme(settings: ThemeSettings): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const updated = await this.api.updateThemeSettings(settings).toPromise();
      this.themeSignal.set(updated!);
      this.originalTheme = JSON.parse(JSON.stringify(updated));

      this.applyThemeToDom(updated!);
    } catch (error) {
      this.errorSignal.set('Failed to update theme settings');
      console.error('Error updating theme:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update typography settings
   */
  async updateTypography(settings: TypographySettings): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const updated = await this.api.updateTypographySettings(settings).toPromise();
      this.typographySignal.set(updated!);
      this.originalTypography = JSON.parse(JSON.stringify(updated));

      this.applyTypographyToDom(updated!);
    } catch (error) {
      this.errorSignal.set('Failed to update typography settings');
      console.error('Error updating typography:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update layout settings
   */
  async updateLayout(settings: LayoutSettings): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const updated = await this.api.updateLayoutSettings(settings).toPromise();
      this.layoutSignal.set(updated!);
      this.originalLayout = JSON.parse(JSON.stringify(updated));

      this.applyLayoutToDom(updated!);
    } catch (error) {
      this.errorSignal.set('Failed to update layout settings');
      console.error('Error updating layout:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update theme locally (without saving to server) for real-time preview
   */
  setThemeLocal(settings: ThemeSettings): void {
    this.themeSignal.set(settings);
    this.applyThemeToDom(settings);
  }

  /**
   * Update typography locally (without saving to server) for real-time preview
   */
  setTypographyLocal(settings: TypographySettings): void {
    this.typographySignal.set(settings);
    this.applyTypographyToDom(settings);
  }

  /**
   * Update layout locally (without saving to server) for real-time preview
   */
  setLayoutLocal(settings: LayoutSettings): void {
    this.layoutSignal.set(settings);
    this.applyLayoutToDom(settings);
  }

  /**
   * Reset all settings to their last saved state
   */
  resetToSaved(): void {
    if (this.originalTheme) this.themeSignal.set(JSON.parse(JSON.stringify(this.originalTheme)));
    if (this.originalTypography) this.typographySignal.set(JSON.parse(JSON.stringify(this.originalTypography)));
    if (this.originalLayout) this.layoutSignal.set(JSON.parse(JSON.stringify(this.originalLayout)));
    this.applySettingsToDom();
  }

  /**
   * Apply all settings to the DOM as CSS variables
   */
  private applySettingsToDom(): void {
    const theme = this.themeSignal();
    const typography = this.typographySignal();
    const layout = this.layoutSignal();

    if (theme) this.applyThemeToDom(theme);
    if (typography) this.applyTypographyToDom(typography);
    if (layout) this.applyLayoutToDom(layout);
  }

  /**
   * Apply theme settings to DOM
   */
  private applyThemeToDom(theme: ThemeSettings): void {
    const root = document.documentElement;

    // Brand colors
    this.applyColorScheme(root, 'brand-primary', theme.brandPalette.primary);
    this.applyColorScheme(root, 'brand-secondary', theme.brandPalette.secondary);
    this.applyColorScheme(root, 'brand-accent', theme.brandPalette.accent);

    // Neutral colors
    this.applyColorScheme(root, 'neutral-light', theme.neutralPalette.primary);
    this.applyColorScheme(root, 'neutral-medium', theme.neutralPalette.secondary);
    this.applyColorScheme(root, 'neutral-dark', theme.neutralPalette.accent);

    // Semantic colors
    this.applyColorScheme(root, 'semantic-success', theme.semanticPalette.primary);
    this.applyColorScheme(root, 'semantic-warning', theme.semanticPalette.secondary);
    this.applyColorScheme(root, 'semantic-error', theme.semanticPalette.accent);
  }

  private applyColorScheme(element: HTMLElement, prefix: string, scheme: any): void {
    element.style.setProperty(`--${prefix}-base`, scheme.base);
    element.style.setProperty(`--${prefix}-light`, scheme.light);
    element.style.setProperty(`--${prefix}-dark`, scheme.dark);
    element.style.setProperty(`--${prefix}-contrast`, scheme.contrast);
  }

  /**
   * Apply typography settings to DOM
   */
  private applyTypographyToDom(typography: TypographySettings): void {
    const root = document.documentElement;
    root.style.setProperty('--font-primary', typography.primaryFontFamily);
    root.style.setProperty('--font-secondary', typography.secondaryFontFamily);
    root.style.setProperty('--font-mono', typography.monoFontFamily);
  }

  /**
   * Apply layout settings to DOM
   */
  private applyLayoutToDom(layout: LayoutSettings): void {
    const root = document.documentElement;
    root.style.setProperty('--container-max-width', `${layout.spacing.containerMaxWidth}px`);
    root.style.setProperty('--section-padding', `${layout.spacing.sectionPadding}rem`);
    root.style.setProperty('--component-gap', `${layout.spacing.componentGap}rem`);
  }
}
