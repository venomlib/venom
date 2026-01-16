import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/api/helpers/**', 'src/utils/**'],
      reporter: ['text', 'html']
    },
    testTimeout: 10000,
    mockReset: true
  }
});
