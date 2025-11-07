import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  files: 'src/**/*.test.ts',
  concurrency: 10,
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
  ],
  testFramework: {
    config: {
      timeout: 5000,
    },
  },
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'auto',
    }),
  ],
  coverage: true,
  coverageConfig: {
    include: ['src/**/*.ts'],
    exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    threshold: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};
