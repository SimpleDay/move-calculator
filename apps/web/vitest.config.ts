import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          include: ['src/**/*.node.test.ts'],
          environment: 'node',
          name: 'node',
          pool: 'threads',
          poolOptions: {
            threads: {
              singleThread: true,
            },
          },
          env: {
            PAYLOAD_SECRET: '286c603f1fefe29618142253',
            NEXT_PUBLIC_SERVER_URL: 'https://example.com',
          },
          globalSetup: ['src/lib/testing/setupPostgres.ts'],
          setupFiles: ['src/lib/testing/autoMocks.ts', 'src/lib/testing/truncateAllTables.ts'],
        },
      },
      {
        extends: true,
        test: {
          include: ['src/**/*.unit.test.ts'],
          environment: 'node',
          name: 'unit',
          setupFiles: ['src/lib/testing/autoMocks.ts'],
        },
      },
      {
        extends: true,
        test: {
          include: ['src/**/*.dom.test.ts'],
          environment: 'jsdom',
          name: 'jsdom',
        },
      },
    ],
  },
})
