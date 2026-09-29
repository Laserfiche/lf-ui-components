import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@laserfiche/lf-ui-components/shared': fileURLToPath(
        new URL('./projects/ui-components/shared/lf-shared-public-api.ts', import.meta.url)
      ),
      '@laserfiche/lf-ui-components/internal-shared': fileURLToPath(
        new URL('./projects/ui-components/internal-shared/lf-internal-shared-public-api.ts', import.meta.url)
      ),
      '@laserfiche/lf-ui-components/lf-selection-list': fileURLToPath(
        new URL('./projects/ui-components/lf-selection-list/lf-selection-list-public-api.ts', import.meta.url)
      ),
      projects: fileURLToPath(new URL('./projects', import.meta.url)),
    },
  },
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    browser: {
      enabled: true,
      api: {
        host: '127.0.0.1',
        port: 39015,
        strictPort: true,
      },
      provider: playwright(),
      instances: [
        {
          browser: 'chromium',
          launch: { args: ['--no-sandbox'] },
        },
      ],
    },
    reporters: ['default', ['junit', { outputFile: './test-results.xml' }]],
    // Collected only when run with --coverage (npm run test:coverage).
    coverage: {
      provider: 'v8',
      include: ['projects/ui-components/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*public-api.ts', 'projects/ui-components/entry.ts'],
      // json-summary and json feed the coverage report in the CI workflow; html is uploaded as an artifact.
      reporter: ['text-summary', 'html', 'json-summary', 'json'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
    },
  },
});
