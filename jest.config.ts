// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js'; // Ensure .js extension for ESM compatibility

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Make sure this path is correct

  moduleNameMapper: {
    // Handle module aliases (this needs to match your tsconfig paths)
    '^@/(.*)$': '<rootDir>/$1', // Adjust <rootDir>/ if your src folder is elsewhere

    // You might need mappings for CSS/SASS modules if next/jest doesn't handle them automatically,
    // but usually, it does. Example:
    // '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // --- Consolidated transformIgnorePatterns ---
  // This tells Jest *not* to ignore transforming these ESM packages.
  transformIgnorePatterns: [
    // This single pattern handles ignoring node_modules EXCEPT for the listed ESM packages.
    // Start with the core react-markdown ecosystem and add others if specific errors occur.
    '/node_modules/(?!(react-markdown' +
      '|remark-gfm' + // Common plugin
      '|remark-.+' + // Other remark plugins
      '|rehype-.+' + // Rehype plugins (if used, e.g., rehype-raw)
      '|unified' +
      '|unist-.+' + // Includes unist-util-visit, etc.
      '|vfile' +
      '|vfile-message' +
      '|bail' + // unified dependencies
      '|trough' + // unified dependencies
      '|micromark-.+' + // Micromark dependencies
      '|parse-entities' + // Micromark dependencies
      '|character-entities' + // Micromark dependencies
      '|ccount' + // Micromark dependencies
      '|decode-named-character-reference' + // Micromark dependencies
      '|github-slugger' + // remark-gfm dependency
      // Add other specific ESM packages here if errors point to them, e.g.:
      // '|string-width' +
      // '|strip-ansi' +
      // '|ansi-regex' +
      ')/)',

    // Keep ignoring CSS Modules transformation (standard Next.js behavior)
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // Optional: If you still face issues, explicitly defining the transform might help,
  // but next/jest SHOULD handle this. Use this as a last resort.
  // transform: {
  //   // Use Babel or SWC for transpiling JS/TS files. next/jest usually sets this up.
  //   '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  // },

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);