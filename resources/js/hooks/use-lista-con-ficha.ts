import { router } from '@inertiajs/react';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

/** En 2xl la ficha es una columna más al lado de la tabla: no se cierra al pulsar fuera. */
const esAncha = () => window.matchMedia('(min-width: 1536px)').matches;

type Opciones = {
    /** Ids de las filas en el orden en que se ven. */
    visibles: number[];
    /** Id de la ficha que ya mandó el servidor (prop `detalle`). */
    detalleId: number | null;
    /** Abre con esta ficha (la URL traía ?ver=). */
    inicial: number | null;
    /** Datos para la recarga parcial de 'detalle', además de `ver`. */
    datosRecarga: Record<string, unknown>;
    campoFiltro: RefObject<HTMLInputElement | null>;
    filtro: string;
    limpiarFiltro: () => void;
    /** Adónde lleva la tecla "/". */
    campoAtajo: RefObject<HTMLInputElement | null>;
    /** Campo con sus propias teclas (la búsqueda global): la página no las atiende. */
    campoPropio?: RefObject<HTMLInputElement | null>;
};

/**
 * Lista con ficha lateral, como en Estudiantes e Inscritos: la fila elegida,
 * la ficha abierta (que se pide al servidor por recarga parcial) y el teclado
 * de la página: ↑ ↓ recorren la lista (también desde el filtro), Enter abre la
 * ficha, "/" lleva al buscador y Esc cierra por capas (ficha → filtro).
 */
export function useListaConFicha({
    visibles,
    detalleId,
    inicial,
    datosRecarga,
    campoFiltro,
    filtro,
    limpiarFiltro,
    campoAtajo,
    campoPropio,
}: Opciones) {
    const [seleccion, setSeleccion] = useState<number | null>(inicial);
    const [abierta, setAbierta] = useState(inicial !== null);
    const [cargando, setCargando] = useState(false);
    const lista = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLElement>(null);
    // Qué hacer con la fila elegida en el próximo pintado: llevarla a la vista y, si toca, darle el foco.
    const pedidoFila = useRef<{ centrar: boolean; enfocar: boolean } | null>(inicial !== null ? { centrar: true, enfocar: false } : null);

    // La ficha se pide un instante después de elegir: recorrer la lista con
    // ↑ ↓ no dispara una consulta por cada fila que pasa.
    useEffect(() => {
        if (!abierta || seleccion === null || seleccion === detalleId) return;
        const t = setTimeout(() => {
            router.reload({
                only: ['detalle'],
                data: { ...datosRecarga, ver: seleccion },
                onStart: () => setCargando(true),
                onFinish: () => setCargando(false),
            });
        }, 120);
        return () => clearTimeout(t);
    }, [abierta, seleccion]); // eslint-disable-line react-hooks/exhaustive-deps

    // Después de elegir, la fila queda a la vista (y con el foco si no se está escribiendo en el filtro).
    useEffect(() => {
        const pedido = pedidoFila.current;
        if (!pedido || seleccion === null) return;
        pedidoFila.current = null;
        const fila = lista.current?.querySelector<HTMLElement>(`[data-fila="${seleccion}"]`);
        const caja = lista.current?.getBoundingClientRect();
        if (!fila || !caja) return;
        // Solo se desplaza si no se ve entera (el encabezado fijo de la tabla tapa unos 36 px).
        const { top, bottom } = fila.getBoundingClientRect();
        if (top < caja.top + 36 || bottom > caja.bottom) fila.scrollIntoView({ block: pedido.centrar ? 'center' : 'nearest' });
        if (pedido.enfocar && document.activeElement !== campoFiltro.current) fila.focus({ preventScroll: true });
    });

    const elegir = useCallback((id: number, { abrir = false, centrar = false } = {}) => {
        setSeleccion(id);
        if (abrir) setAbierta(true);
        pedidoFila.current = { centrar, enfocar: true };
    }, []);
    const abrirFila = useCallback((id: number) => elegir(id, { abrir: true }), [elegir]);

    const mover = (paso: 1 | -1) => {
        if (!visibles.length) return;
        const i = seleccion === null ? -1 : visibles.indexOf(seleccion);
        elegir(visibles[i < 0 ? 0 : Math.min(Math.max(i + paso, 0), visibles.length - 1)]);
    };

    const cerrar = () => {
        setAbierta(false);
        pedidoFila.current = { centrar: false, enfocar: true };
    };

    useEffect(() => {
        const alTeclear = (ev: KeyboardEvent) => {
            const t = ev.target;
            if (!(t instanceof HTMLElement) || ev.ctrlKey || ev.metaKey || ev.altKey || t === campoPropio?.current) return;
            const enCampo = t.matches('input, select, textarea');
            const enFiltro = t === campoFiltro.current;

            if (ev.key === 'Escape') {
                if (abierta) {
                    ev.preventDefault();
                    cerrar();
                } else if (enFiltro && filtro) limpiarFiltro();
                else if (enCampo) t.blur();
            } else if (ev.key === '/' && !enCampo) {
                ev.preventDefault();
                campoAtajo.current?.focus();
            } else if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && (!enCampo || enFiltro)) {
                ev.preventDefault();
                mover(ev.key === 'ArrowDown' ? 1 : -1);
            } else if (ev.key === 'Enter' && seleccion !== null && !abierta) {
                if (enFiltro || (!enCampo && !panel.current?.contains(t) && !t.matches('button, a'))) {
                    ev.preventDefault();
                    setAbierta(true);
                }
            }
        };
        window.addEventListener('keydown', alTeclear);
        return () => window.removeEventListener('keydown', alTeclear);
    });

    // Flotante (menos de 2xl): pulsar fuera la cierra. Otra fila solo cambia de ficha.
    useEffect(() => {
        if (!abierta) return;
        const alPulsar = (ev: MouseEvent) => {
            const t = ev.target;
            if (!(t instanceof Element) || esAncha() || panel.current?.contains(t) || t.closest('[data-fila], header, [data-busqueda], [role=menu]'))
                return;
            setAbierta(false);
        };
        document.addEventListener('mousedown', alPulsar);
        // Acoplada, la lista se angosta: la fila elegida sigue a la vista.
        const t = esAncha()
            ? setTimeout(() => lista.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' }), 320)
            : undefined;
        return () => {
            document.removeEventListener('mousedown', alPulsar);
            clearTimeout(t);
        };
    }, [abierta]);

    return {
        lista,
        panel,
        seleccion,
        abierta,
        // Desde el clic hasta que llega la ficha nueva, la anterior se ve atenuada.
        cargando: cargando || (abierta && seleccion !== detalleId),
        posicion: seleccion === null ? -1 : visibles.indexOf(seleccion),
        elegir,
        abrirFila,
        mover,
        cerrar,
        alInicio: () => lista.current?.scrollTo({ top: 0 }),
    };
}
