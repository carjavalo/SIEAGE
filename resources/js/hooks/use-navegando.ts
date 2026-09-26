import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Mientras se cargan otros datos de ESTA página (otro grado, otro año, otra
 * pestaña: una visita GET completa a la misma dirección):
 *
 * - `destino`: los parámetros de a dónde se va, desde el primer instante, para
 *   marcar ya el grado o la pestaña que se pulsó.
 * - `navegando`: se enciende solo si la espera pasa de `retraso` ms, para
 *   mostrar esqueletos; en una red rápida no aparecen por un instante (eso se
 *   ve peor que no mostrar nada).
 *
 * Las recargas parciales (ficha, búsqueda) tienen sus propios indicadores, y
 * el cambio a otra página ya tiene la barra de progreso y el fundido.
 */
export function useNavegando(retraso = 150) {
    const [destino, setDestino] = useState<URLSearchParams | null>(null);
    const [navegando, setNavegando] = useState(false);

    useEffect(() => {
        let espera: ReturnType<typeof setTimeout> | undefined;
        const quitarInicio = router.on('start', (evento) => {
            const { method, only, url } = evento.detail.visit;
            if (method !== 'get' || only.length > 0 || url.pathname !== window.location.pathname) return;
            setDestino(new URLSearchParams(url.search));
            clearTimeout(espera);
            espera = setTimeout(() => setNavegando(true), retraso);
        });
        const quitarFin = router.on('finish', (evento) => {
            if (evento.detail.visit.only.length > 0) return; // termina la ficha o la búsqueda, no la visita
            clearTimeout(espera);
            setDestino(null);
            setNavegando(false);
        });
        return () => {
            quitarInicio();
            quitarFin();
            clearTimeout(espera);
        };
    }, [retraso]);

    return { destino, navegando };
}
