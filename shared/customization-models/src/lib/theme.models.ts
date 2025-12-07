/**
 * Theme customization models matching the backend DTOs
 */

export interface ColorScheme {
  base: string;      // Hex color (#RRGGBB)
  light: string;     // 20% lighter variant
  dark: string;      // 20% darker variant
  contrast: string;  // Black or white for accessibility
}

export interface ColorPalette {
  primary: ColorScheme;
  secondary: ColorScheme;
  accent: ColorScheme;
}

export interface ThemeSettings {
  brandPalette: ColorPalette;      // Primary branding colors
  neutralPalette: ColorPalette;    // UI backgrounds/borders
  semanticPalette: ColorPalette;   // Success/warning/error
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

/**
 * Default theme settings
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  brandPalette: {
    primary: { base: '#3B82F6', light: '#64A7CF', dark: '#2563EB', contrast: '#FFFFFF' },
    secondary: { base: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED', contrast: '#FFFFFF' },
    accent: { base: '#EC4899', light: '#F472B6', dark: '#DB2777', contrast: '#FFFFFF' }
  },
  neutralPalette: {
    primary: { base: '#F3F4F6', light: '#FFFFFF', dark: '#E5E7EB', contrast: '#000000' },
    secondary: { base: '#9CA3AF', light: '#D1D5DB', dark: '#6B7280', contrast: '#FFFFFF' },
    accent: { base: '#1F2937', light: '#374151', dark: '#111827', contrast: '#FFFFFF' }
  },
  semanticPalette: {
    primary: { base: '#10B981', light: '#34D399', dark: '#059669', contrast: '#FFFFFF' },
    secondary: { base: '#F59E0B', light: '#FBBF24', dark: '#D97706', contrast: '#000000' },
    accent: { base: '#EF4444', light: '#F87171', dark: '#DC2626', contrast: '#FFFFFF' }
  }
};
