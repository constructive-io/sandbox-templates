// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    pool: 'threads',
    globals: true,
    // default env for generic tests (most will be handled by projects below)
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
      '@sdk/': new URL('./src/graphql/schema-builder-sdk/', import.meta.url).pathname,
    },
    exclude: [
      '**/integration.test.ts',
      '**/performance-edge-cases.test.ts',
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    // Ensure we only include our own test files
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'test/**/*.{test,spec}.{ts,tsx}',
    ],

    // NEW: multi-project setup replaces defineWorkspace
    projects: [
      {
        test: {
          name: 'node',
          include: ['src/**/*.node.test.{ts,tsx}', 'test/**/*.node.test.{ts,tsx}'],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
          ],
          environment: 'node',
          globals: true,
          setupFiles: ['./test/global-mocks.ts'],
        },
      },
      {
        test: {
          name: 'jsdom',
          include: ['src/**/*.{test,spec}.{ts,tsx}', 'test/**/*.{test,spec}.{ts,tsx}'],
          exclude: [
            'src/**/*.node.test.{ts,tsx}',
            'test/**/*.node.test.{ts,tsx}',
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
          ],
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./test/setup.ts', './test/dom-mocks.ts', './test/global-mocks.ts'],
          alias: {
            '@/': new URL('./src/', import.meta.url).pathname,
            '@sdk/': new URL('./src/graphql/schema-builder-sdk/', import.meta.url).pathname,
          },
        },
      },
    ],
  },
})
