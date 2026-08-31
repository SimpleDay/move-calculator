import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', '!./*.config.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
})
