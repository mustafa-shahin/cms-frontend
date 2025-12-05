import { Injectable } from '@angular/core';

export interface ColorPalette {
  lighter: string;
  light: string;
  base: string;
  dark: string;
  darker: string;
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
}
