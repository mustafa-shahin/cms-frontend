import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  const THEME_KEY = 'cms_theme';

  beforeEach(() => {
    // Clear localStorage and reset document state
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should default to light theme when no stored theme or system preference', () => {
      expect(service.getTheme()).toBe('light');
    });

    it('should use stored dark theme', () => {
      localStorage.setItem(THEME_KEY, 'dark');
      const freshService = new ThemeService();
      expect(freshService.getTheme()).toBe('dark');
    });

    it('should use stored light theme', () => {
      localStorage.setItem(THEME_KEY, 'light');
      const freshService = new ThemeService();
      expect(freshService.getTheme()).toBe('light');
    });

    it('should fallback to system preference for dark mode', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
      }));
      
      const freshService = new ThemeService();
      expect(freshService.getTheme()).toBe('dark');
    });

    it('should apply theme to document on initialization', () => {
      localStorage.setItem(THEME_KEY, 'dark');
      const freshService = new ThemeService();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      service.setTheme('dark');
      expect(service.getTheme()).toBe('dark');
    });

    it('should set theme to light', () => {
      service.setTheme('dark');
      service.setTheme('light');
      expect(service.getTheme()).toBe('light');
    });

    it('should update localStorage', () => {
      service.setTheme('dark');
      expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    });

    it('should add dark class to document when setting dark theme', () => {
      service.setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from document when setting light theme', () => {
      service.setTheme('dark');
      service.setTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should update currentTheme signal', () => {
      service.setTheme('dark');
      expect(service.currentTheme()).toBe('dark');
    });

    it('should emit on currentTheme$ observable', (done) => {
      service.currentTheme$.subscribe(theme => {
        if (theme === 'dark') {
          done();
        }
      });
      service.setTheme('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      service.setTheme('light');
      service.toggleTheme();
      expect(service.getTheme()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      service.setTheme('dark');
      service.toggleTheme();
      expect(service.getTheme()).toBe('light');
    });

    it('should update localStorage on toggle', () => {
      service.setTheme('light');
      service.toggleTheme();
      expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    });

    it('should update DOM on toggle', () => {
      service.setTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      
      service.toggleTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('getTheme', () => {
    it('should return current theme', () => {
      service.setTheme('dark');
      expect(service.getTheme()).toBe('dark');
    });
  });

  describe('isDarkMode', () => {
    it('should return true when dark mode is active', () => {
      service.setTheme('dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should return false when light mode is active', () => {
      service.setTheme('light');
      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('meta theme-color', () => {
    let metaTag: HTMLMetaElement;

    beforeEach(() => {
      metaTag = document.createElement('meta');
      metaTag.name = 'theme-color';
      metaTag.content = '#ffffff';
      document.head.appendChild(metaTag);
    });

    afterEach(() => {
      metaTag.remove();
    });

    it('should update meta theme-color for dark theme', () => {
      service.setTheme('dark');
      expect(metaTag.content).toBe('#1f2937');
    });

    it('should update meta theme-color for light theme', () => {
      service.setTheme('dark');
      service.setTheme('light');
      expect(metaTag.content).toBe('#ffffff');
    });
  });

  describe('edge cases', () => {
    it('should handle invalid stored theme gracefully', () => {
      localStorage.setItem(THEME_KEY, 'invalid-theme');
      const freshService = new ThemeService();
      // Should fallback to default behavior
      expect(['light', 'dark']).toContain(freshService.getTheme());
    });

    it('should handle missing matchMedia', () => {
      // @ts-expect-error - matchMedia may not be deletable in strict types
      delete window.matchMedia;
      localStorage.clear();
      
      // Should not throw and default to light
      expect(() => new ThemeService()).not.toThrow();
    });
  });
});
