const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  // Dark mode for admin dashboard only
  darkMode: 'class',
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
      },
    },
  },
  plugins: [],
};