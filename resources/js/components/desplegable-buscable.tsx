import { type Opcion, panelDesplegable, useAlPulsarFuera } from '@/components/desplegable';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Search } from 'lucide-react';
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';

/** Para buscar sin importar mayúsculas ni tildes: «nuñez» encuentra «Núñez». */
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Como Desplegable, pero con un campo para escribir y filtrar la lista: para listas
 * largas (los graduandos de una modalidad). Cerrado muestra lo elegido; al abrirlo,
 * el foco va al campo y ↑ ↓ Enter eligen entre lo que coincide.
 */
export function DesplegableBuscable<T extends string | number>({
    valor,
    opciones,
    onCambio,
    etiqueta,
    placeholder = 'Escribe para buscar…',
    claseBoton,
    alinear = 'izquierda',
}: {
    valor: T;
    opciones: Opcion<T>[];
    onCambio: (valor: T) => void;
    /** Nombre para lectores de pantalla (p. ej. "Graduando"). */
    etiqueta: string;
    placeholder?: string;
    claseBoton?: string;
    alinear?: 'izquierda' | 'derecha';
}) {
    const [abierto, setAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [activa, setActiva] = useState(0);
    const contenedor = useRef<HTMLDivElement>(null);
    const campo = useRef<HTMLInputElement>(null);
    const lista = useRef<HTMLUListElement>(null);
    const id = useId();

    const elegida = opciones.find((o) => o.valor === valor);
    const visibles = useMemo(() => {
        const q = normalizar(busqueda.trim());
        return q ? opciones.filter((o) => normalizar(`${o.etiqueta} ${o.detalle ?? ''}`).includes(q)) : opciones;
    }, [opciones, busqueda]);

    const cerrar = () => setAbierto(false);
    useAlPulsarFuera(contenedor, abierto, cerrar);

    useEffect(() => {
        if (abierto) lista.current?.querySelector(`[data-indice="${activa}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [abierto, activa]);

    const abrir = () => {
        setBusqueda('');
        setActiva(
            Math.max(
                opciones.findIndex((o) => o.valor === valor),
                0,
            ),
        );
        setAbierto(true);
        requestAnimationFrame(() => campo.current?.focus());
    };
    const elegir = (o: Opcion<T> | undefined) => {
        cerrar();
        if (o && o.valor !== valor) onCambio(o.valor);
    };

    const alTeclear = (e: KeyboardEvent) => {
        const ultima = visibles.length - 1;
        const acciones: Record<string, () => void> = {
            ArrowDown: () => setActiva((i) => Math.min(i + 1, ultima)),
            ArrowUp: () => setActiva((i) => Math.max(i - 1, 0)),
            Enter: () => elegir(visibles[activa]),
            Escape: cerrar,
        };
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
                type="button"
                aria-label={etiqueta}
                aria-haspopup="listbox"
                aria-expanded={abierto}
                onClick={() => (abierto ? cerrar() : abrir())}
                onKeyDown={(e) => {
                    if (!abierto && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                        e.preventDefault();
                        abrir();
                    }
                }}
                className={cn('group flex cursor-pointer items-center gap-1 outline-none', claseBoton)}
            >
                <span className="min-w-0 flex-1 truncate text-left">{elegida?.etiqueta}</span>
                <ChevronDown aria-hidden className={cn('size-4 shrink-0 transition-transform duration-200', abierto && 'rotate-180')} />
            </button>

            {abierto && (
                <div className={cn(panelDesplegable, 'w-[min(360px,calc(100vw-32px))]', alinear === 'derecha' ? 'right-0' : 'left-0')}>
                    <div className="relative mb-1.5">
                        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6B7690]" />
                        <input
                            ref={campo}
                            role="combobox"
                            aria-label={`Buscar ${etiqueta.toLowerCase()}`}
                            aria-expanded
                            aria-controls={`${id}-lista`}
                            aria-activedescendant={visibles[activa] ? `${id}-${activa}` : undefined}
                            aria-autocomplete="list"
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setActiva(0);
                            }}
                            onKeyDown={alTeclear}
                            placeholder={placeholder}
                            autoComplete="off"
                            className="h-10 w-full rounded-[12px] border border-[#E3E9F6] bg-[#F7F9FD] pr-3 pl-9 text-[14px] text-[#16223F] outline-none placeholder:text-[#8A93A8] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8]"
                        />
                    </div>
                    <ul
                        ref={lista}
                        id={`${id}-lista`}
                        role="listbox"
                        aria-label={etiqueta}
                        className="max-h-[min(340px,55vh)] overflow-y-auto overscroll-contain [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]"
                    >
                        {visibles.length === 0 ? (
                            <li className="px-3 py-3 text-[14px] text-[#56627F]">Nadie coincide con «{busqueda.trim()}».</li>
                        ) : (
                            visibles.map((o, i) => (
                                <li
                                    key={String(o.valor)}
                                    id={`${id}-${i}`}
                                    data-indice={i}
                                    role="option"
                                    aria-selected={o.valor === valor}
                                    onMouseDown={(e) => e.preventDefault()} // el campo conserva el foco
                                    onMouseMove={() => i !== activa && setActiva(i)}
                                    onClick={() => elegir(o)}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2 text-[14px] transition-colors',
                                        i === activa ? 'bg-[#EEF2FB] text-[#1E3A7B]' : 'text-[#16223F]',
                                    )}
                                >
                                    <span className={cn('min-w-0 flex-1 truncate', o.valor === valor && 'font-semibold')}>{o.etiqueta}</span>
                                    {o.detalle && <span className="shrink-0 text-[12px] font-medium text-[#4863B8]">{o.detalle}</span>}
                                    <Check aria-hidden className={cn('size-4 shrink-0 text-[#1E3A7B]', o.valor !== valor && 'invisible')} />
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
