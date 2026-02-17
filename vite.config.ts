import { URL, fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // 👇 ADD THIS 'server' BLOCK to allow ngrok to proxy requests
    server: {
      // It's best practice to add a specific host (your ngrok subdomain)
      // and 'localhost' for local access.
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        // ⚠️ Replace this with your specific ngrok hostname:
        'nonrustically-escapeless-emerson.ngrok-free.dev' 
      ],
      // If you are forwarding the Vite server, you should also set 'host: true'
      // to bind to all network interfaces, which ngrok requires.
      host: true 
    },
    // The plugins block remains the same
    plugins: [react()],
    // ... rest of your config
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      }
    },
    optimizeDeps: {
      include: ['framer-motion']
    }
  }
});