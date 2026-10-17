import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Raise warning threshold so only truly huge chunks warn
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Recharts (charts library) — separate chunk
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-')) {
              return 'charts';
            }
            // Framer Motion / Motion — separate chunk
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
              return 'motion';
            }
            // React core
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-core';
            }
            // Lucide icons — very large if not split
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide-icons';
            }
            // Google Genai SDK
            if (id.includes('node_modules/@google')) {
              return 'google-sdk';
            }
            // Redux
            if (id.includes('node_modules/redux') || id.includes('node_modules/react-redux')) {
              return 'redux';
            }
          },
        },
      },
    },
  };
});
