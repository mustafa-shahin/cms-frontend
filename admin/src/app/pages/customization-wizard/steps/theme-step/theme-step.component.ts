import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomizationStateService } from '@cms/shared/customization-services';
import { ThemeSettings } from '@cms/shared/customization-models';
import { IconComponent } from '@cms/shared/ui';

type PaletteType = 'brandPalette' | 'neutralPalette' | 'semanticPalette';
type ColorType = 'primary' | 'secondary' | 'accent';
type ColorVariant = 'base' | 'light' | 'dark' | 'contrast';

@Component({
  selector: 'cms-theme-step',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './theme-step.component.html',
  styleUrls: ['./theme-step.component.scss']
})
export class ThemeStepComponent {
  private readonly customizationState = inject(CustomizationStateService);

  readonly theme = this.customizationState.theme;

  readonly colorVariants: ColorVariant[] = ['base', 'light', 'dark', 'contrast'];

  readonly palettes: Array<{ key: PaletteType; title: string; description: string; icon: string }> = [
    {
      key: 'brandPalette',
      title: 'Brand Colors',
      description: 'Primary branding and identity colors',
      icon: 'star'
    },
    {
      key: 'neutralPalette',
      title: 'Neutral Colors',
      description: 'UI backgrounds, borders, and surfaces',
      icon: 'adjust'
    },
    {
      key: 'semanticPalette',
      title: 'Semantic Colors',
      description: 'Success, warning, and error feedback',
      icon: 'bell'
    }
  ];

  readonly colorTypes: Array<{ key: ColorType; label: string }> = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' }
  ];

  updateColor(paletteKey: PaletteType, colorKey: ColorType, variant: ColorVariant, value: string) {
    const currentTheme = this.theme();
    if (!currentTheme) return;

    const updatedTheme: ThemeSettings = {
      ...currentTheme,
      [paletteKey]: {
        ...currentTheme[paletteKey],
        [colorKey]: {
          ...currentTheme[paletteKey][colorKey],
          [variant]: value
        }
      }
    };

    // Update locally for real-time preview (won't save to server yet)
    this.customizationState.setThemeLocal(updatedTheme);
  }

  getColor(paletteKey: PaletteType, colorKey: ColorType, variant: ColorVariant): string {
    const currentTheme = this.theme();
    if (!currentTheme) return '#000000';

    return currentTheme[paletteKey][colorKey][variant];
  }

  autoGenerateVariants(paletteKey: PaletteType, colorKey: ColorType) {
    const currentTheme = this.theme();
    if (!currentTheme) return;

    const baseColor = currentTheme[paletteKey][colorKey].base;

    // Generate light variant (20% lighter)
    const lightColor = this.interpolateColor(baseColor, '#FFFFFF', 0.2);

    // Generate dark variant (20% darker)
    const darkColor = this.interpolateColor(baseColor, '#000000', 0.2);

    // Generate contrast color (black or white based on luminance)
    const contrastColor = this.getContrastColor(baseColor);

    const updatedTheme: ThemeSettings = {
      ...currentTheme,
      [paletteKey]: {
        ...currentTheme[paletteKey],
        [colorKey]: {
          base: baseColor,
          light: lightColor,
          dark: darkColor,
          contrast: contrastColor
        }
      }
    };

    this.customizationState.setThemeLocal(updatedTheme);
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));

    return this.rgbToHex(r, g, b);
  }

  private getContrastColor(hex: string): string {
    const rgb = this.hexToRgb(hex);
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 0, g: 0, b: 0 };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  openColorPicker(id: string) {
    document.getElementById(id)?.click();
  }

  getContrastClass(color: string): string {
    const rgb = this.hexToRgb(color);
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    return luminance > 0.5 ? 'text-black' : 'text-white';
  }
}
