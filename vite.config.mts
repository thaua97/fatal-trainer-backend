import { defineConfig } from 'vitest/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [viteTsConfigPaths()],
  test: {
    dir: 'src',
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          dir: 'src',
          include: [
            'domain/**/*.spec.ts',
            'infra/storage/**/*.spec.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          dir: 'src/infra/http/controllers',
          environment: './prisma/vitest-environment-prisma/prisma-environment-test.ts',
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**/*.ts', 'src/core/**/*.ts'],
      exclude: [
        '**/*.spec.ts',
        '**/*.e2e.spec.ts',
        '**/repositories/*.ts',
        '**/entities/trainer-profile-payloads.ts',
        '**/entities/report.ts',
        '**/strategies/filter/trainer-filter-strategy.ts',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
