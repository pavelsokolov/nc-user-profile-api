import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    exclude: ['src/__tests__/integration.test.ts', 'node_modules', 'dist'],
  },
})
