import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Get base URL from environment variables
  // Priority: VITE_BASE_URL > VERCEL_URL > NETLIFY > empty
  const baseUrl =
    process.env.VITE_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    process.env.DEPLOY_PRIME_URL ||
    '';

  return {
    server: {
      host: '::',
      port: 5173,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      createHtmlPlugin({
        inject: {
          data: {
            baseUrl: baseUrl || '',
          },
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
