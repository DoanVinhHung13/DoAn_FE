import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    '.vite',
    'node_modules',
    'public/pdf.worker.min.js',
    'src/components/TinyEditor/tinymce/**',
  ]),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Import ordering - không auto-fix nhưng sẽ warning
      'sort-imports': ['warn', {
        ignoreCase: true,
        ignoreDeclarationSort: true, // Chỉ sort members trong cùng import
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      }],
      
      // Recommend practices
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // React best practices
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { 
        allowConstantExport: true 
      }],
    },
  },
])
