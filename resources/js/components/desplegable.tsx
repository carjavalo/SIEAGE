import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { type KeyboardEvent, type RefObject, useEffect, useId, useRef, useState } from 'react';

/** Panel común de lo que se despliega (búsqueda, año, menú del usuario). */
export const panelDesplegable =
    'animate-in fade-in-0 slide-in-from-top-1 absolute top-[calc(100%+8px)] z-50 rounded-[18px] border border-[#E3E9F6] bg-white p-1.5 shadow-[0_24px_48px_-16px_rgba(22,34,63,0.28)] duration-150 motion-reduce:animate-none';

/** Cierra el desplegable al pulsar fuera de su contenedor. */
export function useAlPulsarFuera(contenedor: RefObject<HTMLElement | null>, abierto: boolean, cerrar: () => void) {
    useEffect(() => {
        if (!abierto) return;
        const alPulsar = (e: MouseEvent) => {
            if (!contenedor.current?.contains(e.target as Node)) cerrar();
        };
        document.addEventListener('mousedown', alPulsar);
        return () => document.removeEventListener('mousedown', alPulsar);
    }, [abierto, contenedor, cerrar]);
}

export type Opcion<T> = { valor: T; etiqueta: string; detalle?: string };

type Props<T> = {
    valor: T;
    opciones: Opcion<T>[];
    onCambio: (valor: T) => void;
    /** Nombre para lectores de pantalla (p. ej. "Año lectivo"). */
    etiqueta: string;
    claseBoton?: string;
    alinear?: 'izquierda' | 'derecha';
    /** Como campo de formulario: texto cuando no hay nada elegido, id para su <label>, desactivado y con error. */
    placeholder?: string;
    id?: string;
    desactivado?: boolean;
    invalido?: boolean;
};

/**
 * Lista desplegable propia en lugar del <select> del navegador. El foco se queda
 * en el botón y la opción activa se anuncia con aria-activedescendant.
 * Las teclas que maneja no siguen hacia la página (allí ↑ ↓ recorren la lista).
 */
export function Desplegable<T extends string | number>({
    valor,
    opciones,
    onCambio,
    etiqueta,
    claseBoton,
    alinear = 'izquierda',
    placeholder,
    id: idBoton,
    desactivado,
    invalido,
}: Props<T>) {
    const [abierto, setAbierto] = useState(false);
    const elegida = opciones.findIndex((o) => o.valor === valor);
    const [activa, setActiva] = useState(Math.max(elegida, 0));
    const contenedor = useRef<HTMLDivElement>(null);
    const lista = useRef<HTMLUListElement>(null);
    const id = useId();

    const cerrar = () => setAbierto(false);
    useAlPulsarFuera(contenedor, abierto, cerrar);

    useEffect(() => {
        if (abierto) lista.current?.querySelector(`[data-indice="${activa}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [abierto, activa]);

    const abrir = () => {
        if (desactivado) return;
        setActiva(Math.max(elegida, 0));
        setAbierto(true);
    };
    const elegir = (i: number) => {
        cerrar();
        if (opciones[i] && opciones[i].valor !== valor) onCambio(opciones[i].valor);
    };

    const alTeclear = (e: KeyboardEvent) => {
        const ultima = opciones.length - 1;
        const acciones: Record<string, () => void> = abierto
            ? {
                  ArrowDown: () => setActiva((i) => Math.min(i + 1, ultima)),
                  ArrowUp: () => setActiva((i) => Math.max(i - 1, 0)),
                  Home: () => setActiva(0),
                  End: () => setActiva(ultima),
                  Enter: () => elegir(activa),
                  ' ': () => elegir(activa),
                  Escape: cerrar,
              }
            : { ArrowDown: abrir, ArrowUp: abrir, Enter: abrir, ' ': abrir };
        if (e.key === 'Tab') return cerrar();
        const accion = acciones[e.key];
        if (!accion) return;
        e.preventDefault();
        e.stopPropagation();
        accion();
    };

    return (
        <div ref={contenedor} className="relative flex items-center">
            <button
                id={idBoton}
                type="button"
                role="combobox"
                disabled={desactivado}
                aria-invalid={invalido || undefined}
                aria-label={idBoton ? undefined : etiqueta}
                aria-haspopup="listbox"
                aria-expanded={abierto}
                aria-controls={`${id}-lista`}
                aria-activedescendant={abierto ? `${id}-${activa}` : undefined}
                onClick={() => (abierto ? cerrar() : abrir())}
                onKeyDown={alTeclear}
                className={cn('group flex cursor-pointer items-center gap-1 outline-none', claseBoton)}
            >
                {elegida >= 0 ? opciones[elegida].etiqueta : <span className="text-[#8C97B3]">{placeholder}</span>}
                <ChevronDown aria-hidden className={cn('size-4 shrink-0 transition-transform duration-200', abierto && 'rotate-180')} />
            </button>

            {abierto && (
                <ul
                    ref={lista}
                    id={`${id}-lista`}
                    role="listbox"
                    aria-label={etiqueta}
                    className={cn(
                        panelDesplegable,
                        'max-h-[min(360px,60vh)] min-w-[168px] overflow-y-auto overscroll-contain [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]',
                        alinear === 'derecha' ? 'right-0' : 'left-0',
                    )}
                >
                    {opciones.map((o, i) => (
                        <li
                            key={String(o.valor)}
                            id={`${id}-${i}`}
                            data-indice={i}
                            role="option"
                            aria-selected={i === elegida}
                            onMouseDown={(e) => e.preventDefault()} // el botón conserva el foco
                            onMouseMove={() => i !== activa && setActiva(i)}
                            onClick={() => elegir(i)}
                            className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2 text-[15px] whitespace-nowrap transition-colors',
                                i === activa ? 'bg-[#EEF2FB] text-[#1E3A7B]' : 'text-[#16223F]',
                            )}
                        >
                            <span className={cn('tabular-nums', i === elegida && 'font-semibold')}>{o.etiqueta}</span>
                            {o.detalle && <span className="text-[12px] font-medium text-[#5B7BD0]">{o.detalle}</span>}
                            <Check aria-hidden className={cn('ml-auto size-4 shrink-0 text-[#1E3A7B]', i !== elegida && 'invisible')} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
