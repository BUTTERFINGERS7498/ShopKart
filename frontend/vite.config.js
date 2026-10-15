import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxy = {
  target: 'http://localhost:5000',
  bypass(req) {
    if (req.headers.accept?.includes('text/html')) {
      return '/index.html';
    }
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/customers': apiProxy,
      '/products': apiProxy,
      '/wishlist': apiProxy,
      '/cart': apiProxy,
      '/orders': apiProxy,
    },
  },
});
