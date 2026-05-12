import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
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
      provider: playwright(),
      instances: [
        {
          browser: 'chromium',
          launch: { args: ['--no-sandbox'] },
        },
      ],
    },
    reporters: ['default', ['junit', { outputFile: './test-results.xml' }]],
  },
});
