import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sileo';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                {/* En Sileo, `theme` es el tema de la PÁGINA, no del toast: "dark" pinta
                    texto oscuro para una píldora clara. Con "light" la descripción sale
                    blanca y, sobre el relleno blanco, no se ve. Colores y sombra: app.css. */}
                <Toaster position="top-center" theme="dark" options={{ fill: '#FFFFFF' }} />
            </>,
        );
    },
    progress: {
        color: '#1E3A7B',
    },
});

// This will set light / dark mode on load...
initializeTheme();
