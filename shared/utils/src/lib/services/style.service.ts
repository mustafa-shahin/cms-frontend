import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppStyles {
  // Brand colors
  primaryColor: string;
  secondaryColor: string;

  // Layout backgrounds
  navbarBackground: string;
  footerBackground: string;

  // Text colors
  textColor: string;
  headingColor: string;

  // Link colors
  linkColor: string;
  linkHoverColor: string;
  linkVisitedColor: string;

  // State colors
  successColor: string;
  warningColor: string;
  errorColor: string;
}

const STYLE_KEY = 'cms_app_styles';

const DEFAULT_STYLES: AppStyles = {
  // Brand colors
  primaryColor: '#3b82f6',       // Blue - primary brand color
  secondaryColor: '#8b5cf6',     // Purple - secondary brand color

  // Layout backgrounds
  navbarBackground: '#1e40af',   // Darker blue (blue-800)
  footerBackground: '#6d28d9',   // Darker purple (purple-700)

  // Text colors
  textColor: '#1f2937',          // Gray-800 for body text
  headingColor: '#111827',       // Gray-900 for headings

  // Link colors
  linkColor: '#3b82f6',          // Blue-500 for links
  linkHoverColor: '#2563eb',     // Blue-600 for hover
  linkVisitedColor: '#7c3aed',   // Purple-600 for visited

  // State colors
  successColor: '#10b981',       // Green - success messages
  warningColor: '#f59e0b',       // Amber - warnings
  errorColor: '#ef4444',         // Red - errors
};

@Injectable({
  providedIn: 'root',
})
export class StyleService {
  private stylesSubject = new BehaviorSubject<AppStyles>(this.getStoredStyles());
  public styles$: Observable<AppStyles> = this.stylesSubject.asObservable();
  public styles = signal<AppStyles>(this.getStoredStyles());

  constructor() {
    this.applyStyles(this.getStoredStyles());
  }

  /**
   * Set primary color
   */
  setPrimaryColor(color: string): void {
    const currentStyles = this.styles();
    const newStyles: AppStyles = {
      ...currentStyles,
      primaryColor: color,
    };
    this.updateStyles(newStyles);
  }

  /**
   * Set secondary color
   */
  setSecondaryColor(color: string): void {
    const currentStyles = this.styles();
    const newStyles: AppStyles = {
      ...currentStyles,
      secondaryColor: color,
    };
    this.updateStyles(newStyles);
  }

  /**
   * Set navbar background color
   */
  setNavbarBackground(color: string): void {
    const currentStyles = this.styles();
    const newStyles: AppStyles = {
      ...currentStyles,
      navbarBackground: color,
    };
    this.updateStyles(newStyles);
  }

  /**
   * Set footer background color
   */
  setFooterBackground(color: string): void {
    const currentStyles = this.styles();
    const newStyles: AppStyles = {
      ...currentStyles,
      footerBackground: color,
    };
    this.updateStyles(newStyles);
  }

  /**
   * Set all styles at once
   */
  setStyles(styles: Partial<AppStyles>): void {
    const currentStyles = this.styles();
    const newStyles: AppStyles = {
      ...currentStyles,
      ...styles,
    };
    this.updateStyles(newStyles);
  }

  /**
   * Get current styles
   */
  getStyles(): AppStyles {
    return this.styles();
  }

  /**
   * Get primary color
   */
  getPrimaryColor(): string {
    
    return this.styles().primaryColor;
  }

  /**
   * Get secondary color
   */
  getSecondaryColor(): string {
    return this.styles().secondaryColor;
  }

  /**
   * Get success color
   */
  getSuccessColor(): string {
    return this.styles().successColor;
  }

  /**
   * Get warning color
   */
  getWarningColor(): string {
    return this.styles().warningColor;
  }

  /**
   * Get error color
   */
  getErrorColor(): string {
    return this.styles().errorColor;
  }

  /**
   * Get navbar background color
   */
  getNavbarBackground(): string {
    return this.styles().navbarBackground;
  }

  /**
   * Get footer background color
   */
  getFooterBackground(): string {
    return this.styles().footerBackground;
  }

  /**
   * Reset styles to defaults
   */
  resetStyles(): void {
    this.updateStyles(DEFAULT_STYLES);
  }

  /**
   * Update styles and persist them
   */
  private updateStyles(styles: AppStyles): void {
    this.stylesSubject.next(styles);
    this.styles.set(styles);
    this.applyStyles(styles);
    this.persistStyles(styles);
  }

  /**
   * Apply styles to document using CSS custom properties
   */
  private applyStyles(styles: AppStyles): void {
    const root = document.documentElement;

    // Brand colors
    root.style.setProperty('--color-primary', styles.primaryColor);
    root.style.setProperty('--color-secondary', styles.secondaryColor);

    // Layout backgrounds
    root.style.setProperty('--navbar-background', styles.navbarBackground);
    root.style.setProperty('--footer-background', styles.footerBackground);

    // Text colors
    root.style.setProperty('--text-color', styles.textColor);
    root.style.setProperty('--heading-color', styles.headingColor);

    // Link colors
    root.style.setProperty('--link-color', styles.linkColor);
    root.style.setProperty('--link-hover-color', styles.linkHoverColor);
    root.style.setProperty('--link-visited-color', styles.linkVisitedColor);

    // State colors
    root.style.setProperty('--color-success', styles.successColor);
    root.style.setProperty('--color-warning', styles.warningColor);
    root.style.setProperty('--color-error', styles.errorColor);
  }

  /**
   * Persist styles to localStorage
   */
  private persistStyles(styles: AppStyles): void {
    try {
      localStorage.setItem(STYLE_KEY, JSON.stringify(styles));
    } catch (error) {
      console.error('Failed to persist styles to localStorage:', error);
    }
  }

  /**
   * Get stored styles from localStorage
   */
  private getStoredStyles(): AppStyles {
    try {
      const stored = localStorage.getItem(STYLE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          primaryColor: parsed.primaryColor || DEFAULT_STYLES.primaryColor,
          secondaryColor: parsed.secondaryColor || DEFAULT_STYLES.secondaryColor,
          navbarBackground: parsed.navbarBackground || DEFAULT_STYLES.navbarBackground,
          footerBackground: parsed.footerBackground || DEFAULT_STYLES.footerBackground,
          textColor: parsed.textColor || DEFAULT_STYLES.textColor,
          headingColor: parsed.headingColor || DEFAULT_STYLES.headingColor,
          linkColor: parsed.linkColor || DEFAULT_STYLES.linkColor,
          linkHoverColor: parsed.linkHoverColor || DEFAULT_STYLES.linkHoverColor,
          linkVisitedColor: parsed.linkVisitedColor || DEFAULT_STYLES.linkVisitedColor,
          successColor: parsed.successColor || DEFAULT_STYLES.successColor,
          warningColor: parsed.warningColor || DEFAULT_STYLES.warningColor,
          errorColor: parsed.errorColor || DEFAULT_STYLES.errorColor,
        };
      }
    } catch (error) {
      console.error('Failed to parse stored styles:', error);
    }
    return DEFAULT_STYLES;
  }
}
