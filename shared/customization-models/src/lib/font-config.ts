/**
 * Font weight values supported by Google Fonts and web fonts.
 */
export type FontConfigWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/**
 * Font style values.
 */
export type FontConfigStyle = 'normal' | 'italic';

/**
 * Configuration for a single font variant (weight + style combination).
 */
export interface FontConfig {
  /** Font weight (100-900) */
  weight?: FontConfigWeight;
  /** Font style (normal or italic) */
  style?: FontConfigStyle;
  /** File path to the font file (optional for system fonts) */
  file?: string;
}

/**
 * Font file types supported for web fonts.
 */
export type FontFileType = 'woff' | 'woff2' | 'ttf' | 'otf' | 'eot';

/**
 * Font formats for @font-face declarations.
 */
export type FontFormatType = 'woff' | 'woff2' | 'truetype' | 'opentype' | 'embedded-opentype';

/**
 * Google Fonts variant string format (e.g., "400", "700italic").
 */
export type GoogleFontVariant = string;

/**
 * Information about a Google Font family.
 */
export interface GoogleFontInfo {
  /** Font family name */
  family: string;
  /** Available variants (weights and styles) */
  variants: GoogleFontVariant[];
  /** Available character subsets */
  subsets: string[];
  /** Font category (serif, sans-serif, display, etc.) */
  category: string;
  /** Font version */
  version: string;
  /** Last modified date */
  lastModified: string;
  /** URL to font files */
  files: Record<string, string>;
}

/**
 * Font selection for UI.
 */
export interface FontOption {
  /** Font family name */
  name: string;
  /** Font style */
  style: FontConfigStyle;
  /** Display name for UI */
  displayName: string;
  /** Whether this is a Google Font */
  isGoogleFont?: boolean;
  /** Available weights for this font family and style */
  weights?: FontConfigWeight[];
}
