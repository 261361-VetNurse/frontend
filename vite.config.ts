import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    // We explicitly define only the NEXT_PUBLIC_ variables used by the frontend
    // to avoid leaking any secret R2 server keys to the client bundle.
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },

        server: {
            port: 5173,
            strictPort: true,
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                },
            },
        },
    };
});
