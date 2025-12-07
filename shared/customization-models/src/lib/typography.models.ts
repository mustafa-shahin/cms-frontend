/**
 * Typography customization models
 */

export enum TextStyleType {
  Heading1 = 0,
  Heading2 = 1,
  Heading3 = 2,
  Heading4 = 3,
  Heading5 = 4,
  Heading6 = 5,
  BodyLarge = 10,
  BodyMedium = 11,
  BodySmall = 12,
  Caption = 20,
  Overline = 21,
  ButtonText = 22,
  LinkText = 23
}

export enum TextTransformType {
  None = 0,
  Uppercase = 1,
  Lowercase = 2,
  Capitalize = 3
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;              // In rem
  fontWeight: number;            // 100-900
  lineHeight: number;            // Unitless multiplier
  letterSpacing?: number | null; // In em
  textTransform: TextTransformType;
}

export interface TypographySettings {
  primaryFontFamily: string;
  secondaryFontFamily: string;
  monoFontFamily: string;
  textStyles: Record<TextStyleType, TextStyle>;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

/**
 * Default typography settings
 */
export const DEFAULT_TYPOGRAPHY_SETTINGS: TypographySettings = {
  primaryFontFamily: 'Inter',
  secondaryFontFamily: 'Inter',
  monoFontFamily: 'JetBrains Mono',
  textStyles: {
    [TextStyleType.Heading1]: { fontFamily: 'Inter', fontSize: 2.5, fontWeight: 700, lineHeight: 1.2, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.Heading2]: { fontFamily: 'Inter', fontSize: 2.0, fontWeight: 700, lineHeight: 1.3, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.Heading3]: { fontFamily: 'Inter', fontSize: 1.75, fontWeight: 600, lineHeight: 1.3, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.Heading4]: { fontFamily: 'Inter', fontSize: 1.5, fontWeight: 600, lineHeight: 1.4, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.Heading5]: { fontFamily: 'Inter', fontSize: 1.25, fontWeight: 600, lineHeight: 1.4, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.Heading6]: { fontFamily: 'Inter', fontSize: 1.0, fontWeight: 600, lineHeight: 1.5, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.BodyLarge]: { fontFamily: 'Inter', fontSize: 1.125, fontWeight: 400, lineHeight: 1.6, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.BodyMedium]: { fontFamily: 'Inter', fontSize: 1.0, fontWeight: 400, lineHeight: 1.6, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.BodySmall]: { fontFamily: 'Inter', fontSize: 0.875, fontWeight: 400, lineHeight: 1.5, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.Caption]: { fontFamily: 'Inter', fontSize: 0.75, fontWeight: 400, lineHeight: 1.4, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.Overline]: { fontFamily: 'Inter', fontSize: 0.75, fontWeight: 500, lineHeight: 1.2, letterSpacing: 0.1, textTransform: TextTransformType.Uppercase },
    [TextStyleType.ButtonText]: { fontFamily: 'Inter', fontSize: 1.0, fontWeight: 500, lineHeight: 1.5, letterSpacing: null, textTransform: TextTransformType.None },
    [TextStyleType.LinkText]: { fontFamily: 'Inter', fontSize: 1.0, fontWeight: 400, lineHeight: 1.5, letterSpacing: null, textTransform: TextTransformType.None }
  }
};
