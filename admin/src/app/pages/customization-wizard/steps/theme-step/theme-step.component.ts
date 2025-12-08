import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomizationStateService } from '@cms/shared/customization-services';
import { ThemeSettings } from '@cms/shared/customization-models';
import { IconComponent } from '@cms/shared/ui';
import { ColorUtilsService } from '@cms/shared/utils';
import { TranslationService } from '@cms/shared/utils';

type PaletteType = 'brandPalette' | 'neutralPalette' | 'semanticPalette';
type ColorType = 'primary' | 'secondary' | 'accent';
type ColorVariant = 'base' | 'light' | 'dark' | 'contrast';

@Component({
  selector: 'cms-theme-step',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './theme-step.component.html',
})
export class ThemeStepComponent {
  private readonly customizationState = inject(CustomizationStateService);
  private readonly colorUtils = inject(ColorUtilsService);
  protected readonly translate = inject(TranslationService);

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

    // Use shared color utilities service for color generation
    const colorScheme = this.colorUtils.generateColorScheme(baseColor);

    const updatedTheme: ThemeSettings = {
      ...currentTheme,
      [paletteKey]: {
        ...currentTheme[paletteKey],
        [colorKey]: {
          base: colorScheme.base,
          light: colorScheme.light,
          dark: colorScheme.dark,
          contrast: colorScheme.contrast
        }
      }
    };

    this.customizationState.setThemeLocal(updatedTheme);
  }

  openColorPicker(id: string) {
    document.getElementById(id)?.click();
  }

  getContrastClass(color: string): string {
    // Use shared color utilities for contrast calculation
    const luminance = this.colorUtils.getRelativeLuminance(color);
    return luminance > 0.5 ? 'text-black' : 'text-white';
  }

  getPaletteTitle(paletteKey: string): string {
    const keyMap: Record<string, string> = {
      'brandPalette': 'customization.theme.brandColors',
      'neutralPalette': 'customization.theme.neutralColors',
      'semanticPalette': 'customization.theme.semanticColors'
    };
    return this.translate.instant(keyMap[paletteKey] || paletteKey);
  }

  getPaletteDescription(paletteKey: string): string {
    const keyMap: Record<string, string> = {
      'brandPalette': 'customization.theme.brandDescription',
      'neutralPalette': 'customization.theme.neutralDescription',
      'semanticPalette': 'customization.theme.semanticDescription'
    };
    return this.translate.instant(keyMap[paletteKey] || paletteKey);
  }

  getColorTypeLabel(colorKey: string): string {
    return this.translate.instant(`customization.theme.${colorKey}`);
  }

  getVariantLabel(variant: string): string {
    return this.translate.instant(`customization.theme.${variant}`);
  }
}
