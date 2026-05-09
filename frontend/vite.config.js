import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'mpa',
  server: { port: 3500 },
  plugins: [
    react(),
    {
      name: 'rewrite-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Fast-fail for assets and internal paths
          if (
            req.url === '/' ||
            req.url === '/index.html' ||
            req.url.includes('.') ||
            req.url.startsWith('/@') ||
            req.url.startsWith('/node_modules') ||
            req.url.startsWith('/api') ||
            req.url.startsWith('/src')
          ) {
            return next();
          }

          if (req.url === '/aboutUs') {
            req.url = '/about-us.html';
            return next();
          }

          console.log(`[Middleware] Rewriting ${req.url} to /app.html`);

          // Route ALL other paths to the React App for client-side routing (including 404s)
          req.url = '/app.html';
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app.html'),
        landing: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about-us.html')
      }
    }
  }
})
