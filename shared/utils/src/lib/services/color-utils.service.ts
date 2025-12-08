import { Injectable } from '@angular/core';

export interface ColorPalette {
  lighter: string;
  light: string;
  base: string;
  dark: string;
  darker: string;
}

export interface WCAGCompliance {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsAALarge: boolean;
  meetsAAALarge: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ColorUtilsService {
  /**
   * Generate a color palette (lighter, light, base, dark, darker) from a base hex color
   */
  generatePalette(baseColor: string): ColorPalette {
    const rgb = this.hexToRgb(baseColor);
    if (!rgb) {
      return {
        lighter: baseColor,
        light: baseColor,
        base: baseColor,
        dark: baseColor,
        darker: baseColor,
      };
    }

    return {
      lighter: this.adjustBrightness(baseColor, 40),   // +40% brightness
      light: this.adjustBrightness(baseColor, 20),     // +20% brightness
      base: baseColor,                                  // original color
      dark: this.adjustBrightness(baseColor, -20),     // -20% brightness
      darker: this.adjustBrightness(baseColor, -40),   // -40% brightness
    };
  }

  /**
   * Adjust brightness of a hex color by a percentage (-100 to 100)
   */
  adjustBrightness(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const adjust = (value: number) => {
      const adjusted = value + (value * percent) / 100;
      return Math.max(0, Math.min(255, Math.round(adjusted)));
    };

    const r = adjust(rgb.r);
    const g = adjust(rgb.g);
    const b = adjust(rgb.b);

    return this.rgbToHex(r, g, b);
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Convert RGB to hex color
   */
  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Get suggested colors for navbar based on primary color
   * Returns a palette of variations
   */
  getSuggestedNavbarColors(primaryColor: string): string[] {
    const palette = this.generatePalette(primaryColor);
    return [
      palette.base,
      palette.dark,
      palette.darker,
      palette.light,
      palette.lighter,
    ];
  }

  /**
   * Get suggested colors for footer based on secondary color
   * Returns a palette of variations
   */
  getSuggestedFooterColors(secondaryColor: string): string[] {
    const palette = this.generatePalette(secondaryColor);
    return [
      palette.base,
      palette.dark,
      palette.darker,
      palette.light,
      palette.lighter,
    ];
  }

  /**
   * Validate if a string is a valid hex color
   * Supports both #RRGGBB and #RGB formats
   */
  isValidHex(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Normalize a 3-digit hex color to 6-digit format
   * Example: #F00 -> #FF0000
   */
  normalizeHex(hex: string): string {
    if (!this.isValidHex(hex)) {
      return hex;
    }

    // If it's already 6 digits, return as-is
    if (hex.length === 7) {
      return hex.toUpperCase();
    }

    // Convert 3-digit to 6-digit
    if (hex.length === 4) {
      const r = hex[1];
      const g = hex[2];
      const b = hex[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    return hex;
  }

  /**
   * Interpolate between two colors by a factor (0-1)
   * factor 0 returns color1, factor 1 returns color2, factor 0.5 returns midpoint
   */
  interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    if (!c1 || !c2) {
      return color1; // Return first color if parsing fails
    }

    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));

    return this.rgbToHex(
      Math.max(0, Math.min(255, r)),
      Math.max(0, Math.min(255, g)),
      Math.max(0, Math.min(255, b))
    );
  }

  /**
   * Get contrast color (black or white) that works best on the given background
   * Uses WCAG luminance formula to determine readability
   */
  getContrastColor(backgroundColor: string): string {
    const luminance = this.getRelativeLuminance(backgroundColor);
    // Threshold of 0.5 works well for most cases
    // Higher luminance (lighter color) needs dark text, and vice versa
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Calculate relative luminance according to WCAG 2.0
   * Returns a value between 0 (darkest) and 1 (lightest)
   */
  getRelativeLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) {
      return 0;
    }

    // Convert to sRGB
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    // Apply gamma correction
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    // Calculate luminance using WCAG formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors according to WCAG 2.0
   * Returns a value between 1 (no contrast) and 21 (maximum contrast)
   */
  getContrastRatio(foreground: string, background: string): number {
    const l1 = this.getRelativeLuminance(foreground);
    const l2 = this.getRelativeLuminance(background);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if color combination meets WCAG compliance standards
   *
   * WCAG 2.0 Level AA Requirements:
   * - Normal text: 4.5:1
   * - Large text (18pt+/14pt+ bold): 3:1
   *
   * WCAG 2.0 Level AAA Requirements:
   * - Normal text: 7:1
   * - Large text: 4.5:1
   */
  checkWCAGCompliance(foreground: string, background: string): WCAGCompliance {
    const ratio = this.getContrastRatio(foreground, background);

    return {
      ratio: Math.round(ratio * 100) / 100,
      meetsAA: ratio >= 4.5,
      meetsAAA: ratio >= 7,
      meetsAALarge: ratio >= 3,
      meetsAAALarge: ratio >= 4.5
    };
  }

  /**
   * Check if a color combination meets WCAG standards for normal text
   * level: 'AA' requires 4.5:1, 'AAA' requires 7:1
   */
  meetsWCAG(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    const requiredRatio = level === 'AA' ? 4.5 : 7;
    return ratio >= requiredRatio;
  }

  /**
   * Generate light variant (interpolate 20% towards white)
   */
  generateLightVariant(baseColor: string): string {
    return this.interpolateColor(baseColor, '#FFFFFF', 0.3);
  }

  /**
   * Generate dark variant (interpolate 20% towards black)
   */
  generateDarkVariant(baseColor: string): string {
    return this.interpolateColor(baseColor, '#000000', 0.3);
  }

  /**
   * Auto-generate a complete color scheme (base, light, dark, contrast)
   * Returns an object with all variants
   */
  generateColorScheme(baseColor: string): { base: string; light: string; dark: string; contrast: string } {
    return {
      base: this.normalizeHex(baseColor),
      light: this.generateLightVariant(baseColor),
      dark: this.generateDarkVariant(baseColor),
      contrast: this.getContrastColor(baseColor)
    };
  }
}
