import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Los avisos (Sileo y su librería de animación) llegan aparte, después de pintar la
// página: no pesan en la primera carga. Las páginas que avisan importan `sileo` y
// comparten el mismo módulo, así que el aviso aparece aunque se pida muy pronto.
const Toaster = lazy(() => import('sileo').then((m) => ({ default: m.Toaster })));

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
                <Suspense fallback={null}>
                    <Toaster position="top-center" theme="dark" options={{ fill: '#FFFFFF' }} />
                </Suspense>
            </>,
        );
    },
    progress: {
        color: '#1E3A7B',
    },
});
