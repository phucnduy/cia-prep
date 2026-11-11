import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on GitHub Pages under any repo name,
// on a custom domain, or on any static host.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
