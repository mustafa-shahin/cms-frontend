import { Component, inject } from '@angular/core';
import { TranslationService, CustomizationStateService } from '@cms/shared/utils';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@cms/shared/ui';
import {
  TypographySettings,
  TextStyle,
  TextStyleType,
  TextTransformType
} from '@cms/shared/customization-models';

interface FontFamily {
  name: string;
  category: 'serif' | 'sans-serif' | 'monospace';
  weights: number[];
}

@Component({
  selector: 'cms-typography-step',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './typography-step.component.html',
  styleUrls: ['./typography-step.component.scss']
})
export class TypographyStepComponent {
  private readonly customizationState = inject(CustomizationStateService);
  protected readonly translate = inject(TranslationService);

  readonly typography = this.customizationState.typography;

  // Popular Google Fonts
  readonly availableFonts: FontFamily[] = [
    { name: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
    { name: 'Roboto', category: 'sans-serif', weights: [300, 400, 500, 700, 900] },
    { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 600, 700, 800] },
    { name: 'Lato', category: 'sans-serif', weights: [300, 400, 700, 900] },
    { name: 'Montserrat', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
    { name: 'Poppins', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
    { name: 'Raleway', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
    { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900] },
    { name: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900] },
    { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
    { name: 'PT Serif', category: 'serif', weights: [400, 700] },
    { name: 'Source Code Pro', category: 'monospace', weights: [300, 400, 500, 600, 700] },
    { name: 'Roboto Mono', category: 'monospace', weights: [300, 400, 500, 700] },
    { name: 'JetBrains Mono', category: 'monospace', weights: [300, 400, 500, 600, 700, 800] },
    { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700] }
  ];

  readonly textStyleGroups = [
    {
      title: 'Headings',
      description: 'Page titles and section headers',
      icon: 'heading',
      styles: [
        { key: TextStyleType.Heading1, label: 'Heading 1', description: 'Main page title' },
        { key: TextStyleType.Heading2, label: 'Heading 2', description: 'Section titles' },
        { key: TextStyleType.Heading3, label: 'Heading 3', description: 'Subsections' },
        { key: TextStyleType.Heading4, label: 'Heading 4', description: 'Card headers' },
        { key: TextStyleType.Heading5, label: 'Heading 5', description: 'Small headers' },
        { key: TextStyleType.Heading6, label: 'Heading 6', description: 'Smallest headers' }
      ]
    },
    {
      title: 'Body Text',
      description: 'Content and paragraphs',
      icon: 'align-left',
      styles: [
        { key: TextStyleType.BodyLarge, label: 'Body Large', description: 'Intro paragraphs' },
        { key: TextStyleType.BodyMedium, label: 'Body Medium', description: 'Standard text' },
        { key: TextStyleType.BodySmall, label: 'Body Small', description: 'Compact text' }
      ]
    },
    {
      title: 'Special Styles',
      description: 'UI elements and labels',
      icon: 'star',
      styles: [
        { key: TextStyleType.Caption, label: 'Caption', description: 'Image captions' },
        { key: TextStyleType.Overline, label: 'Overline', description: 'Category labels' },
        { key: TextStyleType.ButtonText, label: 'Button Text', description: 'Button text' },
        { key: TextStyleType.LinkText, label: 'Link Text', description: 'Hyperlink text' }
      ]
    }
  ];

  readonly textTransformOptions: Array<{ value: TextTransformType; label: string }> = [
    { value: TextTransformType.None, label: 'None' },
    { value: TextTransformType.Uppercase, label: 'UPPERCASE' },
    { value: TextTransformType.Lowercase, label: 'lowercase' },
    { value: TextTransformType.Capitalize, label: 'Capitalize' }
  ];

  readonly fontWeightOptions = [
    { value: 300, label: 'Light' },
    { value: 400, label: 'Regular' },
    { value: 500, label: 'Medium' },
    { value: 600, label: 'Semi Bold' },
    { value: 700, label: 'Bold' },
    { value: 800, label: 'Extra Bold' },
    { value: 900, label: 'Black' }
  ];

  parseFloat(value: string): number {
    return parseFloat(value);
  }

  updateFontFamily(familyKey: 'primaryFontFamily' | 'secondaryFontFamily' | 'monoFontFamily', value: string) {
    const currentTypography = this.typography();
    if (!currentTypography) return;

    const updatedTypography: TypographySettings = {
      ...currentTypography,
      [familyKey]: value
    };

    this.customizationState.setTypographyLocal(updatedTypography);
  }

  updateTextStyle(styleType: TextStyleType, updates: Partial<TextStyle>) {
    const currentTypography = this.typography();
    if (!currentTypography) return;

    const currentStyle = currentTypography.textStyles[styleType];

    const updatedTypography: TypographySettings = {
      ...currentTypography,
      textStyles: {
        ...currentTypography.textStyles,
        [styleType]: {
          ...currentStyle,
          ...updates
        }
      }
    };

    this.customizationState.setTypographyLocal(updatedTypography);
  }

  // Standard Tailwind font sizes
  readonly fontSizes = [
    { label: 'xs', value: 0.75, class: 'text-xs' },
    { label: 'sm', value: 0.875, class: 'text-sm' },
    { label: 'base', value: 1, class: 'text-base' },
    { label: 'lg', value: 1.125, class: 'text-lg' },
    { label: 'xl', value: 1.25, class: 'text-xl' },
    { label: '2xl', value: 1.5, class: 'text-2xl' },
    { label: '3xl', value: 1.875, class: 'text-3xl' },
    { label: '4xl', value: 2.25, class: 'text-4xl' },
    { label: '5xl', value: 3, class: 'text-5xl' },
    { label: '6xl', value: 3.75, class: 'text-6xl' },
    { label: '7xl', value: 4.5, class: 'text-7xl' },
    { label: '8xl', value: 6, class: 'text-8xl' },
    { label: '9xl', value: 8, class: 'text-9xl' },
  ];

  /* ... */

  // Tailwind Font Weights
  readonly fontWeights = [
    { label: 'Thin', value: 100, class: 'font-thin' },
    { label: 'Extra Light', value: 200, class: 'font-extralight' },
    { label: 'Light', value: 300, class: 'font-light' },
    { label: 'Regular', value: 400, class: 'font-normal' },
    { label: 'Medium', value: 500, class: 'font-medium' },
    { label: 'Semi Bold', value: 600, class: 'font-semibold' },
    { label: 'Bold', value: 700, class: 'font-bold' },
    { label: 'Extra Bold', value: 800, class: 'font-extrabold' },
    { label: 'Black', value: 900, class: 'font-black' },
  ];

  // Tailwind Line Heights
  readonly lineHeights = [
    { label: 'None', value: 1, class: 'leading-none' },
    { label: 'Tight', value: 1.25, class: 'leading-tight' },
    { label: 'Snug', value: 1.375, class: 'leading-snug' },
    { label: 'Normal', value: 1.5, class: 'leading-normal' },
    { label: 'Relaxed', value: 1.625, class: 'leading-relaxed' },
    { label: 'Loose', value: 2, class: 'leading-loose' },
  ];

  // Tailwind Letter Spacing (Tracking)
  readonly letterSpacings = [
    { label: 'Tighter', value: -0.05, class: 'tracking-tighter' },
    { label: 'Tight', value: -0.025, class: 'tracking-tight' },
    { label: 'Normal', value: 0, class: 'tracking-normal' },
    { label: 'Wide', value: 0.025, class: 'tracking-wide' },
    { label: 'Wider', value: 0.05, class: 'tracking-wider' },
    { label: 'Widest', value: 0.1, class: 'tracking-widest' },
  ];

  // Reactive translation helper
  t(key: string): string {
    this.translate.currentLanguage(); // Register signal dependency
    return this.translate.instant(key);
  }

  getTextStyle(styleType: TextStyleType): TextStyle {
    const defaultStyle: TextStyle = {
      fontFamily: 'Inter',
      fontSize: 1,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      textTransform: TextTransformType.None
    };

    const currentTypography = this.typography();
    if (!currentTypography || !currentTypography.textStyles) {
      return defaultStyle;
    }

    return currentTypography.textStyles[styleType] || defaultStyle;
  }

  // --- Font Size Helpers ---
  getFontSizeIndex(remValue: number): number {
    return this.findClosestIndex(this.fontSizes, remValue);
  }

  updateFontSizeFromIndex(styleType: TextStyleType, index: number) {
    const item = this.fontSizes[index];
    if (item) this.updateTextStyle(styleType, { fontSize: item.value });
  }

  getTailwindFontSizeClass(remValue: number): string {
    const index = this.getFontSizeIndex(remValue);
    return this.fontSizes[index]?.class || 'text-base';
  }

  getFontSizeLabel(remValue: number): string {
    const item = this.fontSizes[this.getFontSizeIndex(remValue)];
    return item ? `${item.label} (${item.value}rem)` : `${remValue}rem`;
  }

  // --- Font Weight Helpers ---
  getFontWeightIndex(value: number): number {
    return this.findClosestIndex(this.fontWeights, value);
  }

  updateFontWeightFromIndex(styleType: TextStyleType, index: number) {
    const item = this.fontWeights[index];
    if (item) this.updateTextStyle(styleType, { fontWeight: item.value });
  }

  getTailwindFontWeightClass(value: number): string {
    const index = this.getFontWeightIndex(value);
    return this.fontWeights[index]?.class || 'font-normal';
  }
  
  getFontWeightLabel(value: number): string {
    const item = this.fontWeights[this.getFontWeightIndex(value)];
    return item ? `${item.label} (${item.value})` : `${value}`;
  }


  // --- Line Height Helpers ---
  getLineHeightIndex(value: number): number {
    return this.findClosestIndex(this.lineHeights, value);
  }

  updateLineHeightFromIndex(styleType: TextStyleType, index: number) {
    const item = this.lineHeights[index];
    if (item) this.updateTextStyle(styleType, { lineHeight: item.value });
  }

  getTailwindLineHeightClass(value: number): string {
    const index = this.getLineHeightIndex(value);
    return this.lineHeights[index]?.class || 'leading-normal';
  }

   getLineHeightLabel(value: number): string {
    const item = this.lineHeights[this.getLineHeightIndex(value)];
    return item ? `${item.label} (${item.value})` : `${value}`;
  }


  // --- Letter Spacing Helpers ---
  getLetterSpacingIndex(value: number | null | undefined): number {
    return this.findClosestIndex(this.letterSpacings, value || 0);
  }

  updateLetterSpacingFromIndex(styleType: TextStyleType, index: number) {
    const item = this.letterSpacings[index];
    if (item) this.updateTextStyle(styleType, { letterSpacing: item.value });
  }

  getTailwindLetterSpacingClass(value: number | null | undefined): string {
    const index = this.getLetterSpacingIndex(value);
    return this.letterSpacings[index]?.class || 'tracking-normal';
  }
   getLetterSpacingLabel(value: number | null | undefined): string {
    const item = this.letterSpacings[this.getLetterSpacingIndex(value)];
    return item ? `${item.label} (${item.value}em)` : `${value || 0}em`;
  }

  // --- Utility ---
  private findClosestIndex(collection: any[], targetValue: number): number {
    const index = collection.findIndex(item => Math.abs(item.value - targetValue) < 0.01);
    if (index !== -1) return index;

    let closestIndex = 0;
    let minDiff = Number.MAX_VALUE;
    collection.forEach((item, i) => {
      const diff = Math.abs(item.value - targetValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });
    return closestIndex;
  }

  getTailwindTextTransformClass(value: TextTransformType): string {
      switch (value) {
          case TextTransformType.Uppercase: return 'uppercase';
          case TextTransformType.Lowercase: return 'lowercase';
          case TextTransformType.Capitalize: return 'capitalize';
          default: return 'normal-case';
      }
  }

  getFontsForCategory(category: 'sans-serif' | 'serif' | 'monospace'): FontFamily[] {
    return this.availableFonts.filter(f => f.category === category);
  }

  getPreviewText(styleType: TextStyleType): string {
    const previews: Record<TextStyleType, string> = {
      [TextStyleType.Heading1]: 'The quick brown fox jumps',
      [TextStyleType.Heading2]: 'The quick brown fox',
      [TextStyleType.Heading3]: 'Quick brown fox',
      [TextStyleType.Heading4]: 'Brown fox jumps',
      [TextStyleType.Heading5]: 'Fox jumps over',
      [TextStyleType.Heading6]: 'Jumps over lazy',
      [TextStyleType.BodyLarge]: 'The quick brown fox jumps over the lazy dog. This is a sample of body text.',
      [TextStyleType.BodyMedium]: 'The quick brown fox jumps over the lazy dog.',
      [TextStyleType.BodySmall]: 'The quick brown fox jumps.',
      [TextStyleType.Caption]: 'Photo by John Doe',
      [TextStyleType.Overline]: 'CATEGORY LABEL',
      [TextStyleType.ButtonText]: 'Click Me',
      [TextStyleType.LinkText]: 'This is a hyperlink'
    };

    return previews[styleType];
  }

  loadGoogleFont(fontFamily: string) {
    // Check if font is already loaded
    if (document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`)) {
      return;
    }

    // Create link element to load Google Font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }
}
