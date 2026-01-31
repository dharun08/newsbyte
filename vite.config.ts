import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Server-side env var (not exposed to browser)
      'process.env.NEWS_API_KEY': JSON.stringify(env.NEWS_API_KEY)
    },
    define: {
  'process.env.NEXT_PUBLIC_GNEWS_API_KEY': JSON.stringify(env.NEXT_PUBLIC_GNEWS_API_KEY)
},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
