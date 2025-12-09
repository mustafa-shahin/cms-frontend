import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FontConfig,
  FontConfigStyle,
  FontConfigWeight,
  FontOption,
  GoogleFontInfo,
  GoogleFontVariant
} from '../models/font-config';

const DEFAULT_FONT_WEIGHTS: FontConfigWeight[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const DEFAULT_FONT_STYLES: FontConfigStyle[] = ['normal', 'italic'];

/**
 * Default system fonts that are available without needing to download.
 */
const SYSTEM_FONTS: Record<string, FontConfig[]> = {
  'Arial': [
    { weight: 400, style: 'normal' },
    { weight: 700, style: 'normal' },
    { weight: 400, style: 'italic' },
    { weight: 700, style: 'italic' },
  ],
  'Helvetica': [
    { weight: 400, style: 'normal' },
    { weight: 700, style: 'normal' },
  ],
  'Times New Roman': [
    { weight: 400, style: 'normal' },
    { weight: 700, style: 'normal' },
    { weight: 400, style: 'italic' },
    { weight: 700, style: 'italic' },
  ],
  'Georgia': [
    { weight: 400, style: 'normal' },
    { weight: 700, style: 'normal' },
    { weight: 400, style: 'italic' },
    { weight: 700, style: 'italic' },
  ],
  'Courier New': [
    { weight: 400, style: 'normal' },
    { weight: 700, style: 'normal' },
  ],
  'Verdana': [
    { weight: 400, style: 'normal' },
    { weight: 700, style: 'normal' },
  ],
};

@Injectable({
  providedIn: 'root'
})
export class FontsService {
  private readonly http = inject(HttpClient);

  // Signals for reactive state management
  private readonly googleFontsCache = signal<GoogleFontInfo[]>([]);
  private readonly loadedFonts = signal<Set<string>>(new Set());

  // All available fonts (system + Google Fonts)
  private fonts = signal<Record<string, FontConfig[]>>({ ...SYSTEM_FONTS });

  /**
   * Get all available font families.
   */
  get fontFamilies(): string[] {
    return Object.keys(this.fonts());
  }

  /**
   * Get all fonts with all attributes.
   */
  get allFonts(): Record<string, FontConfig[]> {
    return { ...this.fonts() };
  }

  /**
   * Load popular Google Fonts list.
   * In production, you should cache this and/or use a curated list.
   */
  async loadGoogleFonts(): Promise<void> {
    // For now, we'll add a curated list of popular Google Fonts
    // In production, you would fetch from Google Fonts API or your backend
    const popularGoogleFonts: Record<string, FontConfig[]> = {
      'Roboto': [
        { weight: 100, style: 'normal' },
        { weight: 300, style: 'normal' },
        { weight: 400, style: 'normal' },
        { weight: 500, style: 'normal' },
        { weight: 700, style: 'normal' },
        { weight: 900, style: 'normal' },
        { weight: 100, style: 'italic' },
        { weight: 300, style: 'italic' },
        { weight: 400, style: 'italic' },
        { weight: 500, style: 'italic' },
        { weight: 700, style: 'italic' },
        { weight: 900, style: 'italic' },
      ],
      'Open Sans': [
        { weight: 300, style: 'normal' },
        { weight: 400, style: 'normal' },
        { weight: 500, style: 'normal' },
        { weight: 600, style: 'normal' },
        { weight: 700, style: 'normal' },
        { weight: 800, style: 'normal' },
        { weight: 300, style: 'italic' },
        { weight: 400, style: 'italic' },
        { weight: 500, style: 'italic' },
        { weight: 600, style: 'italic' },
        { weight: 700, style: 'italic' },
        { weight: 800, style: 'italic' },
      ],
      'Lato': [
        { weight: 100, style: 'normal' },
        { weight: 300, style: 'normal' },
        { weight: 400, style: 'normal' },
        { weight: 700, style: 'normal' },
        { weight: 900, style: 'normal' },
        { weight: 100, style: 'italic' },
        { weight: 300, style: 'italic' },
        { weight: 400, style: 'italic' },
        { weight: 700, style: 'italic' },
        { weight: 900, style: 'italic' },
      ],
      'Montserrat': [
        { weight: 100, style: 'normal' },
        { weight: 200, style: 'normal' },
        { weight: 300, style: 'normal' },
        { weight: 400, style: 'normal' },
        { weight: 500, style: 'normal' },
        { weight: 600, style: 'normal' },
        { weight: 700, style: 'normal' },
        { weight: 800, style: 'normal' },
        { weight: 900, style: 'normal' },
        { weight: 100, style: 'italic' },
        { weight: 200, style: 'italic' },
        { weight: 300, style: 'italic' },
        { weight: 400, style: 'italic' },
        { weight: 500, style: 'italic' },
        { weight: 600, style: 'italic' },
        { weight: 700, style: 'italic' },
        { weight: 800, style: 'italic' },
        { weight: 900, style: 'italic' },
      ],
      'Poppins': [
        { weight: 100, style: 'normal' },
        { weight: 200, style: 'normal' },
        { weight: 300, style: 'normal' },
        { weight: 400, style: 'normal' },
        { weight: 500, style: 'normal' },
        { weight: 600, style: 'normal' },
        { weight: 700, style: 'normal' },
        { weight: 800, style: 'normal' },
        { weight: 900, style: 'normal' },
        { weight: 100, style: 'italic' },
        { weight: 200, style: 'italic' },
        { weight: 300, style: 'italic' },
        { weight: 400, style: 'italic' },
        { weight: 500, style: 'italic' },
        { weight: 600, style: 'italic' },
        { weight: 700, style: 'italic' },
        { weight: 800, style: 'italic' },
        { weight: 900, style: 'italic' },
      ],
      'Inter': [
        { weight: 100, style: 'normal' },
        { weight: 200, style: 'normal' },
        { weight: 300, style: 'normal' },
        { weight: 400, style: 'normal' },
        { weight: 500, style: 'normal' },
        { weight: 600, style: 'normal' },
        { weight: 700, style: 'normal' },
        { weight: 800, style: 'normal' },
        { weight: 900, style: 'normal' },
      ],
      'Playfair Display': [
        { weight: 400, style: 'normal' },
        { weight: 500, style: 'normal' },
        { weight: 600, style: 'normal' },
        { weight: 700, style: 'normal' },
        { weight: 800, style: 'normal' },
        { weight: 900, style: 'normal' },
        { weight: 400, style: 'italic' },
        { weight: 500, style: 'italic' },
        { weight: 600, style: 'italic' },
        { weight: 700, style: 'italic' },
        { weight: 800, style: 'italic' },
        { weight: 900, style: 'italic' },
      ],
      'Merriweather': [
        { weight: 300, style: 'normal' },
        { weight: 400, style: 'normal' },
        { weight: 700, style: 'normal' },
        { weight: 900, style: 'normal' },
        { weight: 300, style: 'italic' },
        { weight: 400, style: 'italic' },
        { weight: 700, style: 'italic' },
        { weight: 900, style: 'italic' },
      ],
    };

    this.fonts.update(current => ({ ...current, ...popularGoogleFonts }));
  }

  /**
   * Get all valid styles of the given font-family.
   * @param fontFamily The font-family to get the styles for
   * @param fontWeight The font-weight to filter by (optional)
   * @returns An array of valid styles for the given font-family
   */
  getStyles(fontFamily: string, fontWeight?: FontConfigWeight): FontConfigStyle[] {
    const fontConfigs = this.fonts()[fontFamily];
    if (!fontConfigs) return [];

    if (this.isVariableFont(fontFamily)) return DEFAULT_FONT_STYLES;

    let validStyles: Array<FontConfigStyle | undefined>;
    if (fontWeight) {
      validStyles = fontConfigs
        .filter((font) => font.weight === fontWeight)
        .map((font) => font.style);
    } else {
      validStyles = fontConfigs.map((font) => font.style);
    }

    return [...new Set(validStyles.filter((style) => style !== undefined))];
  }

  /**
   * Get all valid weights of the given font-family.
   * @param fontFamily The font-family to get the weights for
   * @param fontStyle The font-style to filter by (optional)
   * @returns An array of valid weights for the given font-family
   */
  getWeights(fontFamily: string, fontStyle?: FontConfigStyle): FontConfigWeight[] {
    const fontConfigs = this.fonts()[fontFamily];
    if (!fontConfigs) return [];

    if (this.isVariableFont(fontFamily)) return DEFAULT_FONT_WEIGHTS;

    let validWeights: Array<FontConfigWeight | undefined>;
    if (fontStyle) {
      validWeights = fontConfigs
        .filter((font) => font.style === fontStyle)
        .map((font) => font.weight);
    } else {
      validWeights = fontConfigs.map((font) => font.weight);
    }

    return [...new Set(validWeights.filter((weight) => weight !== undefined))].sort((a, b) => a - b);
  }

  /**
   * Check if the given font-family is a variable font.
   * @param fontFamily The font-family to check
   * @returns True if the font-family is a variable font
   */
  isVariableFont(fontFamily: string): boolean {
    const fontConfigs = this.fonts()[fontFamily];
    if (!fontConfigs) return false;

    return (
      fontConfigs.length === 1 &&
      !fontConfigs[0].weight &&
      !fontConfigs[0].style
    );
  }

  /**
   * Check if a font is a system font (doesn't need to be loaded).
   * @param fontFamily The font-family to check
   * @returns True if the font is a system font
   */
  isSystemFont(fontFamily: string): boolean {
    return fontFamily in SYSTEM_FONTS;
  }

  /**
   * Load a Google Font dynamically by adding a link tag to the document.
   * @param fontFamily The font-family to load
   * @param weights Optional specific weights to load
   * @param styles Optional specific styles to load
   */
  loadFont(
    fontFamily: string,
    weights?: FontConfigWeight[],
    styles?: FontConfigStyle[]
  ): void {
    // Don't load system fonts
    if (this.isSystemFont(fontFamily)) return;

    // Check if already loaded
    const fontKey = this.getFontKey(fontFamily, weights, styles);
    if (this.loadedFonts().has(fontKey)) return;

    // Build Google Fonts URL
    const weightsToLoad = weights || this.getWeights(fontFamily);
    const stylesToLoad = styles || this.getStyles(fontFamily);

    // Create variants string (e.g., "400;700;400italic;700italic")
    const variants: string[] = [];
    for (const style of stylesToLoad) {
      for (const weight of weightsToLoad) {
        if (this.fonts()[fontFamily]?.some(f => f.weight === weight && f.style === style)) {
          variants.push(style === 'italic' ? `${weight}i` : `${weight}`);
        }
      }
    }

    if (variants.length === 0) return;

    // Create Google Fonts URL
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      fontFamily
    )}:wght@${variants.join(';')}&display=swap`;

    // Add link tag to document head
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = fontUrl;
    document.head.appendChild(linkElement);

    // Mark as loaded
    this.loadedFonts.update(loaded => new Set([...loaded, fontKey]));
  }

  /**
   * Generate a unique key for a font configuration.
   */
  private getFontKey(
    fontFamily: string,
    weights?: FontConfigWeight[],
    styles?: FontConfigStyle[]
  ): string {
    const w = weights?.join(',') || 'all';
    const s = styles?.join(',') || 'all';
    return `${fontFamily}-${w}-${s}`;
  }

  /**
   * Get font options for UI selection.
   * @returns Array of font options with display names
   */
  getFontOptions(): FontOption[] {
    const options: FontOption[] = [];
    const allFonts = this.fonts();

    for (const [family, configs] of Object.entries(allFonts)) {
      const styles = this.getStyles(family);
      const isGoogle = !this.isSystemFont(family);

      for (const style of styles) {
        options.push({
          name: family,
          style,
          displayName: `${family}, ${style}`,
          isGoogleFont: isGoogle,
          weights: this.getWeights(family, style),
        });
      }
    }

    return options.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
}
