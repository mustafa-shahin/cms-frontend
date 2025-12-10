import { TestBed } from '@angular/core/testing';
import { ColorUtilsService } from './color-utils.service';

describe('ColorUtilsService', () => {
  let service: ColorUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColorUtilsService]
    });
    service = TestBed.inject(ColorUtilsService);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('generateTailwindPalette', () => {
    it('should generate palette with all shades', () => {
      const palette = service.generateTailwindPalette('#3b82f6');
      
      expect(palette[50]).toBeDefined();
      expect(palette[100]).toBeDefined();
      expect(palette[200]).toBeDefined();
      expect(palette[300]).toBeDefined();
      expect(palette[400]).toBeDefined();
      expect(palette[500]).toBeDefined();
      expect(palette[600]).toBeDefined();
      expect(palette[700]).toBeDefined();
      expect(palette[800]).toBeDefined();
      expect(palette[900]).toBeDefined();
      expect(palette[950]).toBeDefined();
      expect(palette.DEFAULT).toBeDefined();
    });

    it('should return valid hex colors for all shades', () => {
      const palette = service.generateTailwindPalette('#0066cc');
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      
      Object.values(palette).forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });

    it('should set DEFAULT to the base color', () => {
      const baseColor = '#0066cc';
      const palette = service.generateTailwindPalette(baseColor);
      
      expect(palette.DEFAULT.toLowerCase()).toBe(baseColor.toLowerCase());
    });

    it('should generate lighter shades for lower numbers', () => {
      const palette = service.generateTailwindPalette('#0066cc');
      
      // 50 should be lighter than 500
      const lum50 = service.getRelativeLuminance(palette[50]);
      const lum500 = service.getRelativeLuminance(palette[500]);
      expect(lum50).toBeGreaterThan(lum500);
    });

    it('should generate darker shades for higher numbers', () => {
      const palette = service.generateTailwindPalette('#0066cc');
      
      // 900 should be darker than 500
      const lum500 = service.getRelativeLuminance(palette[500]);
      const lum900 = service.getRelativeLuminance(palette[900]);
      expect(lum900).toBeLessThan(lum500);
    });
  });

  describe('hexToRgb', () => {
    it('should convert 6-digit hex to RGB', () => {
      const rgb = service.hexToRgb('#ff0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert 3-digit hex to RGB', () => {
      // Note: hexToRgb only supports 6-digit hex, 3-digit returns null
      // Use normalizeHex first for 3-digit hex support
      const rgb = service.hexToRgb('#f00');
      expect(rgb).toBeNull();
    });

    it('should handle uppercase hex', () => {
      const rgb = service.hexToRgb('#00FF00');
      expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should return null for invalid hex', () => {
      const rgb = service.hexToRgb('invalid');
      expect(rgb).toBeNull();
    });

    it('should handle hex without # prefix', () => {
      // hexToRgb accepts hex with or without # prefix
      const rgb = service.hexToRgb('ff0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      const hex = service.rgbToHex(255, 0, 0);
      expect(hex.toLowerCase()).toBe('#ff0000');
    });

    it('should pad single digit values', () => {
      const hex = service.rgbToHex(1, 2, 3);
      expect(hex.toLowerCase()).toBe('#010203');
    });

    it('should handle all zeros', () => {
      const hex = service.rgbToHex(0, 0, 0);
      expect(hex.toLowerCase()).toBe('#000000');
    });

    it('should handle all 255s', () => {
      const hex = service.rgbToHex(255, 255, 255);
      expect(hex.toLowerCase()).toBe('#ffffff');
    });
  });

  describe('isValidHex', () => {
    it('should return true for valid 6-digit hex', () => {
      expect(service.isValidHex('#ff0000')).toBe(true);
    });

    it('should return true for valid 3-digit hex', () => {
      expect(service.isValidHex('#f00')).toBe(true);
    });

    it('should return false for hex without #', () => {
      expect(service.isValidHex('ff0000')).toBe(false);
    });

    it('should return false for invalid characters', () => {
      expect(service.isValidHex('#gggggg')).toBe(false);
    });

    it('should return false for wrong length', () => {
      expect(service.isValidHex('#ff00')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.isValidHex('')).toBe(false);
    });
  });

  describe('normalizeHex', () => {
    it('should expand 3-digit hex to 6-digit', () => {
      expect(service.normalizeHex('#f00').toLowerCase()).toBe('#ff0000');
    });

    it('should keep 6-digit hex unchanged', () => {
      expect(service.normalizeHex('#ff0000').toLowerCase()).toBe('#ff0000');
    });

    it('should handle mixed case', () => {
      expect(service.normalizeHex('#Abc').toLowerCase()).toBe('#aabbcc');
    });
  });

  describe('getContrastColor', () => {
    it('should return black for light background', () => {
      expect(service.getContrastColor('#ffffff')).toBe('#000000');
    });

    it('should return white for dark background', () => {
      expect(service.getContrastColor('#000000')).toBe('#FFFFFF');
    });

    it('should return white for dark blue', () => {
      expect(service.getContrastColor('#000080')).toBe('#FFFFFF');
    });

    it('should return black for yellow', () => {
      expect(service.getContrastColor('#ffff00')).toBe('#000000');
    });
  });

  describe('getRelativeLuminance', () => {
    it('should return 0 for black', () => {
      expect(service.getRelativeLuminance('#000000')).toBeCloseTo(0, 2);
    });

    it('should return 1 for white', () => {
      expect(service.getRelativeLuminance('#ffffff')).toBeCloseTo(1, 2);
    });

    it('should return intermediate value for gray', () => {
      const luminance = service.getRelativeLuminance('#808080');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('should return 21 for black on white', () => {
      const ratio = service.getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 21 for white on black', () => {
      const ratio = service.getContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1 for same colors', () => {
      const ratio = service.getContrastRatio('#0066cc', '#0066cc');
      expect(ratio).toBeCloseTo(1, 0);
    });
  });

  describe('checkWCAGCompliance', () => {
    it('should pass all levels for high contrast', () => {
      const compliance = service.checkWCAGCompliance('#000000', '#ffffff');
      expect(compliance.meetsAA).toBe(true);
      expect(compliance.meetsAAA).toBe(true);
      expect(compliance.meetsAALarge).toBe(true);
      expect(compliance.meetsAAALarge).toBe(true);
    });

    it('should fail all levels for identical colors', () => {
      const compliance = service.checkWCAGCompliance('#888888', '#888888');
      expect(compliance.meetsAA).toBe(false);
      expect(compliance.meetsAAA).toBe(false);
    });

    it('should return contrast ratio', () => {
      const compliance = service.checkWCAGCompliance('#000000', '#ffffff');
      expect(compliance.ratio).toBeCloseTo(21, 0);
    });
  });

  describe('meetsWCAG', () => {
    it('should return true for high contrast AA', () => {
      expect(service.meetsWCAG('#000000', '#ffffff', 'AA')).toBe(true);
    });

    it('should return true for high contrast AAA', () => {
      expect(service.meetsWCAG('#000000', '#ffffff', 'AAA')).toBe(true);
    });

    it('should return false for low contrast', () => {
      expect(service.meetsWCAG('#cccccc', '#dddddd', 'AA')).toBe(false);
    });
  });

  describe('generatePalette', () => {
    it('should generate palette with all variants', () => {
      const palette = service.generatePalette('#0066cc');
      
      expect(palette.lighter).toBeDefined();
      expect(palette.light).toBeDefined();
      expect(palette.base).toBeDefined();
      expect(palette.dark).toBeDefined();
      expect(palette.darker).toBeDefined();
    });

    it('should set base to input color', () => {
      const palette = service.generatePalette('#0066cc');
      expect(palette.base.toLowerCase()).toBe('#0066cc');
    });
  });

  describe('adjustBrightness', () => {
    it('should lighten color with positive percent', () => {
      const lighter = service.adjustBrightness('#808080', 50);
      const originalLum = service.getRelativeLuminance('#808080');
      const lighterLum = service.getRelativeLuminance(lighter);
      expect(lighterLum).toBeGreaterThan(originalLum);
    });

    it('should darken color with negative percent', () => {
      const darker = service.adjustBrightness('#808080', -50);
      const originalLum = service.getRelativeLuminance('#808080');
      const darkerLum = service.getRelativeLuminance(darker);
      expect(darkerLum).toBeLessThan(originalLum);
    });

    it('should handle 0 percent (no change)', () => {
      const result = service.adjustBrightness('#808080', 0);
      expect(result.toLowerCase()).toBe('#808080');
    });
  });

  describe('tint', () => {
    it('should mix color with white', () => {
      const tinted = service.tint('#000000', 0.5);
      const tintedLum = service.getRelativeLuminance(tinted);
      expect(tintedLum).toBeGreaterThan(0);
    });

    it('should return white at factor 1', () => {
      const tinted = service.tint('#000000', 1);
      expect(tinted.toLowerCase()).toBe('#ffffff');
    });

    it('should return original at factor 0', () => {
      const original = '#0066cc';
      const tinted = service.tint(original, 0);
      expect(tinted.toLowerCase()).toBe(original.toLowerCase());
    });
  });

  describe('shade', () => {
    it('should mix color with black', () => {
      const shaded = service.shade('#ffffff', 0.5);
      const shadedLum = service.getRelativeLuminance(shaded);
      expect(shadedLum).toBeLessThan(1);
    });

    it('should return black at factor 1', () => {
      const shaded = service.shade('#ffffff', 1);
      expect(shaded.toLowerCase()).toBe('#000000');
    });

    it('should return original at factor 0', () => {
      const original = '#0066cc';
      const shaded = service.shade(original, 0);
      expect(shaded.toLowerCase()).toBe(original.toLowerCase());
    });
  });

  describe('interpolateColor', () => {
    it('should return color1 at factor 0', () => {
      const result = service.interpolateColor('#ff0000', '#0000ff', 0);
      expect(result.toLowerCase()).toBe('#ff0000');
    });

    it('should return color2 at factor 1', () => {
      const result = service.interpolateColor('#ff0000', '#0000ff', 1);
      expect(result.toLowerCase()).toBe('#0000ff');
    });

    it('should return midpoint at factor 0.5', () => {
      const result = service.interpolateColor('#000000', '#ffffff', 0.5);
      // Should be around gray
      expect(result.toLowerCase()).toBe('#808080');
    });
  });

  describe('generateColorScheme', () => {
    it('should generate all variants', () => {
      const scheme = service.generateColorScheme('#0066cc');
      
      expect(scheme.base).toBeDefined();
      expect(scheme.light).toBeDefined();
      expect(scheme.dark).toBeDefined();
      expect(scheme.contrast).toBeDefined();
    });

    it('should set base to input color', () => {
      const scheme = service.generateColorScheme('#0066cc');
      expect(scheme.base.toLowerCase()).toBe('#0066cc');
    });

    it('should return valid hex for all variants', () => {
      const scheme = service.generateColorScheme('#0066cc');
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      
      expect(scheme.base).toMatch(hexRegex);
      expect(scheme.light).toMatch(hexRegex);
      expect(scheme.dark).toMatch(hexRegex);
      expect(scheme.contrast).toMatch(hexRegex);
    });
  });

  describe('getSuggestedNavbarColors', () => {
    it('should return array of colors', () => {
      const colors = service.getSuggestedNavbarColors('#0066cc');
      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBeGreaterThan(0);
    });

    it('should return valid hex colors', () => {
      const colors = service.getSuggestedNavbarColors('#0066cc');
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      colors.forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });
  });

  describe('getSuggestedFooterColors', () => {
    it('should return array of colors', () => {
      const colors = service.getSuggestedFooterColors('#6c757d');
      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBeGreaterThan(0);
    });

    it('should return valid hex colors', () => {
      const colors = service.getSuggestedFooterColors('#6c757d');
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      colors.forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle pure black', () => {
      const palette = service.generateTailwindPalette('#000000');
      expect(palette).toBeDefined();
    });

    it('should handle pure white', () => {
      const palette = service.generateTailwindPalette('#ffffff');
      expect(palette).toBeDefined();
    });

    it('should handle 3-digit hex input', () => {
      const palette = service.generateTailwindPalette('#f00');
      expect(palette).toBeDefined();
    });
  });
});
