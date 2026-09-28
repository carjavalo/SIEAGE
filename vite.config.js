import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import {
    defineConfig
} from 'vite';
import tailwindcss from "@tailwindcss/vite";

// Dirección con la que el navegador busca este servidor de desarrollo. Por defecto
// localhost: sirve en cualquier equipo. Quien quiera abrir la app desde otro equipo
// de la red define VITE_DEV_HOST con su IP (p. ej. VITE_DEV_HOST=192.168.2.200).
// Una IP fija aquí dejaba la página en blanco en los demás equipos.
const devHost = process.env.VITE_DEV_HOST || 'localhost';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        host: '0.0.0.0',
        cors: true,
        hmr: {
            host: devHost,
        },
    },
});