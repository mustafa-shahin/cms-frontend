/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // Colors - using CSS variables for dynamic theming from Visual Settings
      colors: {
        // Primary colors
        primary: {
          50: 'var(--color-primary-50, #eff6ff)',
          100: 'var(--color-primary-100, #dbeafe)',
          200: 'var(--color-primary-200, #bfdbfe)',
          300: 'var(--color-primary-300, #93c5fd)',
          400: 'var(--color-primary-400, #60a5fa)',
          500: 'var(--color-primary-500, #3b82f6)',
          600: 'var(--color-primary-600, #2563eb)',
          700: 'var(--color-primary-700, #1d4ed8)',
          800: 'var(--color-primary-800, #1e40af)',
          900: 'var(--color-primary-900, #1e3a8a)',
          950: 'var(--color-primary-950, #172554)',
          DEFAULT: 'var(--color-primary, #3b82f6)',
        },
        // Secondary colors
        secondary: {
          50: 'var(--color-secondary-50, #f8fafc)',
          100: 'var(--color-secondary-100, #f1f5f9)',
          200: 'var(--color-secondary-200, #e2e8f0)',
          300: 'var(--color-secondary-300, #cbd5e1)',
          400: 'var(--color-secondary-400, #94a3b8)',
          500: 'var(--color-secondary-500, #64748b)',
          600: 'var(--color-secondary-600, #475569)',
          700: 'var(--color-secondary-700, #334155)',
          800: 'var(--color-secondary-800, #1e293b)',
          900: 'var(--color-secondary-900, #0f172a)',
          950: 'var(--color-secondary-950, #020617)',
          DEFAULT: 'var(--color-secondary, #64748b)',
        },
        // Success, warning, error colors
        success: {
          light: 'var(--color-success-light, #86efac)',
          DEFAULT: 'var(--color-success, #22c55e)',
          dark: 'var(--color-success-dark, #15803d)',
        },
        warning: {
          light: 'var(--color-warning-light, #fde047)',
          DEFAULT: 'var(--color-warning, #eab308)',
          dark: 'var(--color-warning-dark, #a16207)',
        },
        error: {
          light: 'var(--color-error-light, #fca5a5)',
          DEFAULT: 'var(--color-error, #ef4444)',
          dark: 'var(--color-error-dark, #b91c1c)',
        },
        // Surface colors for backgrounds
        surface: {
          DEFAULT: 'var(--color-surface, #ffffff)',
          secondary: 'var(--color-surface-secondary, #f8fafc)',
          tertiary: 'var(--color-surface-tertiary, #f1f5f9)',
        },
        // Text colors
        text: {
          DEFAULT: 'var(--color-text, #0f172a)',
          secondary: 'var(--color-text-secondary, #475569)',
          tertiary: 'var(--color-text-tertiary, #94a3b8)',
          inverse: 'var(--color-text-inverse, #ffffff)',
        },
        // Border colors
        border: {
          DEFAULT: 'var(--color-border, #e2e8f0)',
          secondary: 'var(--color-border-secondary, #cbd5e1)',
        },
      },
      // Font family - using CSS variables for dynamic fonts from Visual Settings
      fontFamily: {
        sans: ['var(--font-family-sans, Inter, system-ui, sans-serif)'],
        heading: ['var(--font-family-heading, Inter, system-ui, sans-serif)'],
        mono: ['var(--font-family-mono, ui-monospace, SFMono-Regular, monospace)'],
      },
      // Font sizes
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      // Spacing
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      // Border radius
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      // Box shadows
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px -4px rgba(0, 0, 0, 0.1), 0 8px 24px -4px rgba(0, 0, 0, 0.06)',
        'strong': '0 8px 32px -8px rgba(0, 0, 0, 0.15), 0 16px 48px -8px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      // Transitions
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '150ms',
        slow: '300ms',
      },
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
