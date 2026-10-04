import { defineConfig } from 'vite-plus';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, strictPort: true },
  preview: { port: 4174, strictPort: true },
  test: { include: ['tests/**/*.test.mjs'] },
  fmt: { singleQuote: true },
});
