import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        plugins: [react()],

        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },

        server: {
            host: true,
            port: 5173,
            strictPort: true,
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                },
            },
        },

        build: {
            // No source maps in production — avoids leaking source code
            sourcemap: isDev,

            rollupOptions: {
                // AWS SDK is only used in server.ts (Bun BFF) — never in browser code.
                // Externalize it so it cannot accidentally land in the client bundle.
                external: (id) =>
                    id.startsWith('@aws-sdk/') || id.startsWith('@smithy/'),

                output: {
                    // Split heavy vendor libraries into separate cacheable chunks.
                    // Each chunk name maps to a stable filename that changes only
                    // when the corresponding library version changes.
                    manualChunks: {
                        // React runtime + router
                        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                        // MUI + Emotion (large, separate from react)
                        'vendor-mui': [
                            '@mui/material',
                            '@mui/icons-material',
                            '@emotion/react',
                            '@emotion/styled',
                        ],
                        // Date / calendar utilities
                        'vendor-datepicker': [
                            '@mui/x-date-pickers',
                            'react-day-picker',
                            'dayjs',
                        ],
                        // Radix UI primitives
                        'vendor-radix': [
                            '@radix-ui/react-dialog',
                            '@radix-ui/react-label',
                            '@radix-ui/react-popover',
                            '@radix-ui/react-scroll-area',
                            '@radix-ui/react-select',
                            '@radix-ui/react-slot',
                        ],
                    },
                },
            },
        },
    };
});
