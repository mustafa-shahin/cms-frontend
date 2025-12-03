const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const sharedConfig = require('../tailwind.preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  // Dark mode for admin dashboard only
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
