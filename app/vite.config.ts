import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  {
    name: "health-route",
    configureServer(server) {
      server.middlewares.use("/health", (_req, res) => {
        res.setHeader("Content-type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify({ status: "ok" }));
      });
    },
  }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
