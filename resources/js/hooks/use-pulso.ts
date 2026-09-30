import { type Pulso, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/** Cada cuánto se pregunta si cambió algo. */
const CADA = 10_000;
/** Sin tocar el teclado ni el ratón en este rato, se deja de preguntar: así la sesión de un equipo abandonado vence sola. */
const INACTIVO = 30 * 60_000;

/**
 * Lo que se vuelve a traer en cada página cuando cambia cada firma. Siempre con
 * `only`: es una recarga parcial, que no mueve el desplazamiento, no borra lo
 * que se está escribiendo ni muestra esqueletos.
 */
const FRESCOS: Record<string, { inscritos?: string[]; datos?: string[] }> = {
    'inscritos/index': { inscritos: ['conteos', 'inscritos', 'detalle'] },
    'estudiantes/index': { datos: ['grados', 'totales', 'grupos', 'estudiantes', 'sedes', 'detalle'] },
    'estudiantes/ficha': { datos: ['estudiante', 'actual', 'novedades', 'promocion', 'historia', 'acudientes', 'boletines'] },
    'sedes/index': { datos: ['sedes'] },
};

/**
 * «Tiempo real» del panel: cada 10 s pregunta a GET /pulso si los datos siguen
 * como cuando se cargó la página. Si alguien se inscribió, o un compañero
 * matriculó, retiró o corrigió a un estudiante, trae lo nuevo sin recargar: el
 * número de «Inscritos» del menú y, en la página que lo muestre, la lista.
 *
 * No pregunta con la pestaña oculta (al volver, pregunta enseguida) ni mientras
 * hay otra carga en curso.
 */
export function usePulso() {
    const pagina = usePage<SharedData>();
    // Lo último que se sabe, siempre a mano para el temporizador sin reiniciarlo en cada pintado.
    const visto = useRef<{ pulso: Pulso | null; componente: string }>({ pulso: pagina.props.pulso, componente: pagina.component });
    useEffect(() => {
        visto.current = { pulso: pagina.props.pulso, componente: pagina.component };
    }, [pagina.props.pulso, pagina.component]);

    useEffect(() => {
        let actividad = Date.now();
        let sesionVencida = false;
        let preguntando = false;
        let visitas = 0;
        const tocar = () => {
            actividad = Date.now();
        };
        const quitarInicio = router.on('start', () => {
            visitas++;
        });
        const quitarFin = router.on('finish', () => {
            visitas = Math.max(0, visitas - 1);
        });

        const preguntar = async () => {
            if (sesionVencida || preguntando || visitas > 0 || document.hidden || Date.now() - actividad > INACTIVO) return;
            preguntando = true;
            try {
                const r = await fetch('/pulso', {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                if (r.status === 401 || r.status === 419) {
                    sesionVencida = true;
                    return;
                }
                if (!r.ok) return;
                const ahora = (await r.json()) as Pulso;
                const { pulso: antes, componente } = visto.current;
                if (!antes || visitas > 0) return;

                const cambio = { inscritos: ahora.inscritos !== antes.inscritos, datos: ahora.datos !== antes.datos };
                if (!cambio.inscritos && !cambio.datos) return;

                const frescos = FRESCOS[componente] ?? {};
                router.reload({
                    only: [
                        'pulso',
                        'inscritosPendientes',
                        ...(cambio.inscritos ? (frescos.inscritos ?? []) : []),
                        ...(cambio.datos ? (frescos.datos ?? []) : []),
                    ],
                });
                if (ahora.ultima_inscripcion > antes.ultima_inscripcion) {
                    const n = ahora.pendientes;
                    const descripcion = n === 1 ? 'Hay 1 pendiente por revisar.' : `Hay ${n} pendientes por revisar.`;
                    // Los avisos se cargan aparte (ver app.tsx): aquí también, para no sumarlos a cada página.
                    import('sileo').then(({ sileo }) => sileo.info({ title: 'Llegó una inscripción', description: descripcion }));
                }
            } catch {
                // Sin red un momento: se vuelve a intentar en la siguiente vuelta.
            } finally {
                preguntando = false;
            }
        };

        const reloj = setInterval(preguntar, CADA);
        const alVolver = () => {
            if (!document.hidden) preguntar();
        };
        document.addEventListener('visibilitychange', alVolver);
        window.addEventListener('focus', alVolver);
        window.addEventListener('pointerdown', tocar, { passive: true });
        window.addEventListener('keydown', tocar, { passive: true });

        return () => {
            clearInterval(reloj);
            quitarInicio();
            quitarFin();
            document.removeEventListener('visibilitychange', alVolver);
            window.removeEventListener('focus', alVolver);
            window.removeEventListener('pointerdown', tocar);
            window.removeEventListener('keydown', tocar);
        };
    }, []);
}
