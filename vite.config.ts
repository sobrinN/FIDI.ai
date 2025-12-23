import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // FIX: Ignore server directory to prevent page reload when backend writes to data files
    // This was causing the chat to redirect to landing page after each message
    watch: {
      ignored: ['**/server/**', '**/node_modules/**'],
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - ~140KB
          'vendor-react': ['react', 'react-dom'],

          // UI libraries - ~60KB
          'vendor-ui': ['framer-motion', 'lucide-react'],

          // Markdown rendering (lazy loaded but still chunked) - ~180KB
          'vendor-markdown': [
            'react-markdown',
            'react-syntax-highlighter',
          ],

          // Security and utilities - ~50KB
          'vendor-utils': ['dompurify'],

          // Configuration
          'config': [
            './config/models',
          ],

          // Utility libraries
          'utils': [
            './lib/apiClient',
            './lib/historyUtils',
          ],

          // Hooks
          'hooks': [
            './hooks/useConversations',
            './hooks/useFileAttachments',
            './hooks/useAutoScroll',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit slightly for main chunks
  },
});
