import { Component, inject } from '@angular/core';
import { TranslationService } from '@cms/shared/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomizationStateService } from '@cms/shared/customization-services';
import {
  TypographySettings,
  TextStyle,
  TextStyleType,
  TextTransformType
} from '@cms/shared/customization-models';
import { IconComponent } from '@cms/shared/ui';

interface FontFamily {
  name: string;
  category: 'serif' | 'sans-serif' | 'monospace';
  weights: number[];
}

@Component({
  selector: 'cms-typography-step',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
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

  getTextStyle(styleType: TextStyleType): TextStyle {
    const currentTypography = this.typography();
    if (!currentTypography) {
      return {
        fontFamily: 'Inter',
        fontSize: 1,
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: null,
        textTransform: TextTransformType.None
      };
    }

    return currentTypography.textStyles[styleType];
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
