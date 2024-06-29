import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'YcConcurrency',
      fileName: 'yc-concurrency'
    }
  }
})
