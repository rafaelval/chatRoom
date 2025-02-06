import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    historyApiFallback: true,
    port: 3000,
  },
  css: {
    postcss: './postcss.config.js', // Asegúrate de que apunte al archivo PostCSS
  },
});
