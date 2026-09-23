// Sileo no inyecta su CSS: va antes de app.css para que la marca pueda sobrescribirlo.
import 'sileo/styles.css';
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
                <Toaster position="top-center" theme="light" options={{ fill: '#FFFFFF' }} />
            </>,
        );
    },
    progress: {
        color: '#1E3A7B',
    },
});

// This will set light / dark mode on load...
initializeTheme();
