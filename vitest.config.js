// Copyright (c) 2026 Peter Lulham. Licensed under the MIT License.

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
      },
    },
  },
})
