import { telefono } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp, LoaderCircle, type LucideIcon, Mail, MapPin, Phone, Smartphone, X } from 'lucide-react';
import { type ReactNode, type RefObject } from 'react';

/** Piezas de la ficha lateral que comparten Estudiantes e Inscritos. */

const alto = '[@media(min-height:860px)]';

export const Sep = () => (
    <span aria-hidden className="text-[#8C97B3]">
        ·
    </span>
);

/**
 * El panel: por debajo de 2xl flota sobre la lista, bajo la primera franja
 * (la búsqueda y los filtros siguen a mano); en 2xl se acopla como una columna
 * más al lado de la tabla. Sin contenido todavía, muestra que está cargando.
 * Entra frenando y sale acelerando. Ojo: en Tailwind 4 `translate-x-*` usa la
 * propiedad `translate`, no `transform`; por eso va en la lista de transición.
 */
export function PanelFicha({
    abierta,
    panel,
    etiqueta,
    children,
}: {
    abierta: boolean;
    panel: RefObject<HTMLElement | null>;
    etiqueta: string;
    children: ReactNode;
}) {
    return (
        <aside
            ref={panel}
            role="dialog"
            aria-modal={false}
            aria-label={etiqueta}
            tabIndex={-1}
            data-abierta={abierta}
            aria-hidden={!abierta}
            inert={!abierta}
            className={`fixed top-[65px] right-0 bottom-0 z-40 flex w-full translate-x-[110%] flex-col overflow-hidden bg-white opacity-0 shadow-[0_32px_64px_-24px_rgba(22,34,63,0.45),0_0_0_1px_rgba(22,34,63,0.05)] transition-[translate,width,margin,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] outline-none data-[abierta=false]:duration-200 data-[abierta=false]:ease-[cubic-bezier(0.4,0,1,1)] data-[abierta=true]:translate-x-0 data-[abierta=true]:opacity-100 sm:top-[125px] sm:right-3 sm:bottom-3 sm:w-[460px] sm:rounded-[24px] ${alto}:sm:top-[149px] 2xl:static 2xl:z-auto 2xl:w-0 2xl:translate-x-0 2xl:shadow-none 2xl:data-[abierta=true]:ml-3 2xl:data-[abierta=true]:w-[480px] 2xl:data-[abierta=true]:shadow-[0_1px_2px_rgba(22,34,63,0.04),0_12px_32px_-20px_rgba(22,34,63,0.18),0_0_0_1px_#E3E9F6] print:hidden`}
        >
            <div className="flex h-full w-full flex-col 2xl:w-[480px]">
                {children ?? (
                    <div className="flex flex-1 items-center justify-center">
                        <LoaderCircle className="size-6 animate-spin text-[#8C97B3]" aria-label="Cargando ficha" />
                    </div>
                )}
            </div>
        </aside>
    );
}

type Encabezado = {
    iniciales: string;
    titulo: string;
    /** Documento, edad… en una línea. */
    detalle: ReactNode;
    /** Grupo o grado y marcas de situación. */
    marcas?: ReactNode;
    accion: { href: string; texto: string; icono: LucideIcon };
    cargando: boolean;
    posicion: number;
    total: number;
    onCerrar: () => void;
    onMover: (paso: 1 | -1) => void;
    children: ReactNode;
};

/** Ficha completa: encabezado con degradado, acción principal, posición en la lista y el cuerpo desplazable. */
export function ContenidoFicha({ iniciales, titulo, detalle, marcas, accion, cargando, posicion, total, onCerrar, onMover, children }: Encabezado) {
    const { icono: Icono } = accion;

    return (
        // Cada ficha nueva aparece con un fundido (quien la usa le pone una key por persona).
        <div
            className={cn(
                'animate-in fade-in-0 flex min-h-0 flex-1 flex-col transition-opacity duration-200 motion-reduce:animate-none',
                cargando && 'opacity-60',
            )}
            aria-busy={cargando}
        >
            <EncabezadoFicha avatar={iniciales} titulo={titulo} detalle={detalle} marcas={marcas} cargando={cargando} onCerrar={onCerrar}>
                <div className="flex items-center gap-2">
                    <Link
                        href={accion.href}
                        className="group/btn flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-[13px] bg-[#1E3A7B] px-3 text-[14px] font-semibold whitespace-nowrap text-white shadow-[0_12px_24px_-12px_rgba(30,58,123,0.6)] transition hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.99]"
                    >
                        <Icono className="size-[18px] shrink-0 transition-transform group-hover/btn:-translate-y-px" />
                        <span className="truncate">{accion.texto}</span>
                    </Link>
                    <span className="shrink-0 px-1 text-[13px] whitespace-nowrap text-[#56627F] tabular-nums" title="Posición en la lista">
                        {posicion >= 0 ? `${posicion + 1} de ${total}` : '—'}
                    </span>
                    <BotonMover etiqueta="Anterior (↑)" desactivado={posicion <= 0} onClick={() => onMover(-1)}>
                        <ChevronUp className="size-5" />
                    </BotonMover>
                    <BotonMover etiqueta="Siguiente (↓)" desactivado={posicion < 0 || posicion >= total - 1} onClick={() => onMover(1)}>
                        <ChevronDown className="size-5" />
                    </BotonMover>
                </div>
            </EncabezadoFicha>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]">
                {children}
                <p className="px-5 pt-1 pb-5 text-[12px] text-[#6B7690]">
                    Con <Tecla>↑</Tecla> <Tecla>↓</Tecla> recorres la lista sin cerrar la ficha · <Tecla>Esc</Tecla> la cierra
                </p>
            </div>
        </div>
    );
}

/** Encabezado de un panel lateral: degradado de marca, avatar, título y, debajo, las acciones. */
export function EncabezadoFicha({
    avatar,
    titulo,
    detalle,
    marcas,
    cargando,
    onCerrar,
    children,
}: {
    avatar: ReactNode;
    titulo: string;
    detalle?: ReactNode;
    marcas?: ReactNode;
    cargando?: boolean;
    onCerrar: () => void;
    children?: ReactNode;
}) {
    return (
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#EEF2FB] to-[#DCE5F8] px-5 pt-3.5 pb-3.5">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-white/70 blur-3xl" />
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                {cargando && <LoaderCircle className="size-4 animate-spin text-[#5B7BD0]" aria-label="Cargando" />}
                <button
                    type="button"
                    onClick={onCerrar}
                    aria-label="Cerrar (Esc)"
                    title="Cerrar (Esc)"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/70 text-[#3E4A68] transition hover:bg-white hover:text-[#16223F]"
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="relative flex items-start gap-3.5 pr-8">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-[#1E3A7B] text-[16px] font-semibold text-white shadow-[0_10px_20px_-10px_rgba(30,58,123,0.7)]">
                    {avatar}
                </span>
                <div className="min-w-0">
                    <h2 className="text-[19px] leading-[1.2] font-semibold tracking-[-0.02em] text-balance">{titulo}</h2>
                    {detalle && <p className="mt-0.5 text-[14px] text-[#3E4A68] tabular-nums">{detalle}</p>}
                    {marcas && <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">{marcas}</p>}
                </div>
            </div>

            {children && <div className="relative mt-3">{children}</div>}
        </div>
    );
}

/** Una sección del cuerpo de la ficha. Van dentro de un mismo contenedor para que la primera no lleve línea. */
export function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <section className={`border-t border-[#EEF2F9] px-5 py-3.5 first:border-t-0 ${alto}:py-4`}>
            <h3 className="mb-2.5 text-[12px] font-semibold tracking-[0.08em] text-[#6B7690] uppercase">{titulo}</h3>
            {children}
        </section>
    );
}

type Contacto = {
    nombre: string;
    detalle: string;
    insignia?: string;
    celular?: string | null;
    fijo?: string | null;
    correo?: string | null;
    direccion?: string | null;
};

/** Tarjeta de una persona de contacto (acudiente, madre, padre) con botones para llamar y escribir. */
export function TarjetaContacto({ nombre, detalle, insignia, celular, fijo, correo, direccion }: Contacto) {
    const telefonos = [
        { numero: celular, Icono: Smartphone, titulo: 'Celular' },
        // El formulario pide dos teléfonos; si son el mismo, se muestra una vez.
        { numero: fijo !== celular ? fijo : null, Icono: Phone, titulo: 'Otro teléfono' },
    ].filter((t): t is { numero: string; Icono: LucideIcon; titulo: string } => !!t.numero);

    return (
        <div className="rounded-[16px] bg-[#F5F7FC] px-3.5 py-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[15px] leading-snug font-semibold text-[#16223F]">{nombre}</p>
                    <p className="text-[13px] text-[#56627F]">{detalle}</p>
                </div>
                {insignia && (
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[12px] font-medium text-[#1E3A7B] ring-1 ring-[#D3DDF3]">
                        {insignia}
                    </span>
                )}
            </div>
            {telefonos.length || correo ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {telefonos.map(({ numero, Icono, titulo }) => (
                        <a
                            key={titulo}
                            href={`tel:${numero}`}
                            title={titulo}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[14px] font-semibold text-[#1E3A7B] tabular-nums ring-1 ring-[#DCE5F8] transition hover:ring-[#1E3A7B]"
                        >
                            <Icono className="size-3.5" />
                            {telefono(numero)}
                        </a>
                    ))}
                    {correo && (
                        <a
                            href={`mailto:${correo}`}
                            className="inline-flex h-8 max-w-full min-w-0 items-center gap-1.5 rounded-full bg-white px-3 text-[13px] font-medium text-[#1E3A7B] ring-1 ring-[#DCE5F8] transition hover:ring-[#1E3A7B]"
                        >
                            <Mail className="size-3.5 shrink-0" />
                            <span className="truncate">{correo}</span>
                        </a>
                    )}
                </div>
            ) : (
                <p className="mt-1.5 text-[13px] text-[#56627F]">Sin teléfono ni correo</p>
            )}
            {direccion && (
                <p className="mt-2 flex items-start gap-1.5 text-[13px] text-[#56627F]">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    {direccion}
                </p>
            )}
        </div>
    );
}

function BotonMover({
    etiqueta,
    desactivado,
    onClick,
    children,
}: {
    etiqueta: string;
    desactivado: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={desactivado}
            aria-label={etiqueta}
            title={etiqueta}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[13px] bg-white/85 text-[#1E3A7B] shadow-[0_1px_2px_rgba(22,34,63,0.06)] transition hover:bg-white disabled:cursor-default disabled:opacity-40"
        >
            {children}
        </button>
    );
}

const Tecla = ({ children }: { children: ReactNode }) => (
    <kbd className="rounded border border-[#E3E9F6] bg-[#F5F7FC] px-1 font-sans">{children}</kbd>
);

/** Velo apenas visible mientras la ficha flota sobre la lista (en 2xl va acoplada y no hace falta). */
export function VeloFicha({ abierta }: { abierta: boolean }) {
    return (
        <div
            aria-hidden
            className={cn(
                'pointer-events-none fixed inset-x-0 top-[65px] bottom-0 z-30 bg-[#16223F]/[0.07] transition-opacity duration-300 2xl:hidden print:hidden',
                abierta ? 'opacity-100' : 'opacity-0',
            )}
        />
    );
}
