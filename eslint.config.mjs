import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importX from 'eslint-plugin-import-x'

export default tseslint.config(
  { ignores: ['build/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'prisma/**/*.ts'],
    plugins: { 'import-x': importX },
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import-x/no-restricted-paths': ['error', {
        zones: [
          { target: './src/domain', from: './src/infra' },
          { target: './src/domain', from: './src/utils/tests' },
          { target: './src/infra', from: './src/utils/tests' },
        ],
      }],
      'max-lines': ['warn', { max: 300 }],
      complexity: ['warn', 15],
    },
  },
)
