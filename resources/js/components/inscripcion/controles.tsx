import { cn } from '@/lib/utils';
import { Check, ChevronDown, LoaderCircle } from 'lucide-react';
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, useEffect, useId, useMemo, useState } from 'react';

/**
 * Controles propios del formulario público. Siguen los tokens del login
 * (Outfit, verde #1E3A7B, bordes #D3DDF3) y no dependen de shadcn.
 */

const CAMPO =
    'h-[52px] w-full rounded-[14px] border-[1.5px] bg-white px-4 text-[15px] text-[#16223F] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#8C97B3] focus:ring-4';
const CAMPO_NORMAL = 'border-[#D3DDF3] hover:border-[#B9C8EC] focus:border-[#6E8BD6] focus:ring-[#DCE5F8]';
const CAMPO_ERROR = 'border-[#F0B4AB] focus:border-[#E0897D] focus:ring-[#FDECEA]';

export function claseCampo(error?: string) {
    return cn(CAMPO, error ? CAMPO_ERROR : CAMPO_NORMAL);
}

function describir(id: string, error?: string, ayuda?: string) {
    if (error) return `${id}-error`;
    if (ayuda) return `${id}-ayuda`;
}

// ------------------------------------------------------------------ piezas --

function Etiqueta({ htmlFor, id, children, opcional }: { htmlFor?: string; id?: string; children: ReactNode; opcional?: boolean }) {
    const clase = 'flex items-baseline justify-between gap-3 text-sm font-medium text-[#16223F]';
    const contenido = (
        <>
            {children}
            {opcional && <span className="text-[13px] font-normal text-[#8C97B3]">Opcional</span>}
        </>
    );
    // Un grupo de radios no tiene un único control al que apuntar: su título
    // es un párrafo referenciado por aria-labelledby, no un <label>.
    return htmlFor ? (
        <label htmlFor={htmlFor} id={id} className={clase}>
            {contenido}
        </label>
    ) : (
        <p id={id} className={clase}>
            {contenido}
        </p>
    );
}

function Nota({ id, error, ayuda }: { id: string; error?: string; ayuda?: string }) {
    if (error) {
        return (
            <p id={`${id}-error`} className="animate-in fade-in-0 slide-in-from-top-1 text-sm text-[#B42318] duration-200 motion-reduce:animate-none">
                {error}
            </p>
        );
    }
    if (ayuda) {
        return (
            <p id={`${id}-ayuda`} className="text-[13px] leading-snug text-[#56627F]">
                {ayuda}
            </p>
        );
    }
    return null;
}

type Ancho = 'medio' | 'completo';

// ----------------------------------------------------------------- bloques --

/** Un grupo de campos con su título, p. ej. "Documento de identidad". */
export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
    const id = useId();
    return (
        <section aria-labelledby={id} className="space-y-[18px]">
            <h3 id={id} className="flex items-center gap-3 text-[12px] font-semibold tracking-[0.1em] text-[#56627F] uppercase">
                {titulo}
                <span aria-hidden className="h-px flex-1 bg-[#E3E9F6]" />
            </h3>
            <div className="grid gap-[18px] sm:grid-cols-2">{children}</div>
        </section>
    );
}

type CampoTextoProps = {
    id: string;
    etiqueta: string;
    valor: string;
    onCambio: (valor: string) => void;
    error?: string;
    ayuda?: string;
    opcional?: boolean;
    ancho?: Ancho;
    /** Descarta todo lo que no sea dígito mientras se escribe. */
    numerico?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange'>;

export function CampoTexto({ id, etiqueta, valor, onCambio, error, ayuda, opcional, ancho = 'medio', numerico, maxLength, ...resto }: CampoTextoProps) {
    return (
        <div className={cn('flex flex-col gap-2', ancho === 'completo' && 'sm:col-span-2')}>
            <Etiqueta htmlFor={id} opcional={opcional}>
                {etiqueta}
            </Etiqueta>
            <input
                {...resto}
                // En un campo numérico el límite nativo cortaría lo pegado ANTES
                // de quitar espacios: "318 718 4003" quedaba en "31871840", un
                // número válido pero equivocado. Se pega completo y, si sobran
                // dígitos, la validación lo dice.
                maxLength={numerico ? undefined : maxLength}
                id={id}
                name={id}
                value={valor}
                onChange={(e) => onCambio(numerico ? e.target.value.replace(/\D/g, '') : e.target.value)}
                inputMode={numerico ? 'numeric' : resto.inputMode}
                aria-invalid={!!error}
                aria-describedby={describir(id, error, ayuda)}
                className={cn(claseCampo(error), resto.type === 'date' && '[color-scheme:light]')}
            />
            <Nota id={id} error={error} ayuda={ayuda} />
        </div>
    );
}

type CampoAreaProps = Omit<CampoTextoProps, 'numerico'> & { filas?: number };

export function CampoArea({
    id,
    etiqueta,
    valor,
    onCambio,
    error,
    ayuda,
    opcional,
    ancho = 'completo',
    filas = 3,
    placeholder,
    maxLength,
}: CampoAreaProps) {
    return (
        <div className={cn('flex flex-col gap-2', ancho === 'completo' && 'sm:col-span-2')}>
            <Etiqueta htmlFor={id} opcional={opcional}>
                {etiqueta}
            </Etiqueta>
            <textarea
                id={id}
                name={id}
                rows={filas}
                value={valor}
                placeholder={placeholder}
                maxLength={maxLength}
                onChange={(e) => onCambio(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={describir(id, error, ayuda)}
                className={cn(claseCampo(error), 'h-auto resize-none py-3.5 leading-relaxed')}
            />
            <Nota id={id} error={error} ayuda={ayuda} />
        </div>
    );
}

// ---------------------------------------------------------------- opciones --

export type OpcionVisual = { valor: string; etiqueta: string; detalle?: string };

type OpcionesProps = {
    /** Se usa como `name` del grupo; el primer radio lleva este id para poder enfocarlo. */
    id: string;
    etiqueta: string;
    opciones: OpcionVisual[];
    valor: string;
    onCambio: (valor: string) => void;
    error?: string;
    ayuda?: string;
    ancho?: Ancho;
    columnas?: string;
};

/** Selección única en forma de píldoras. Son radios nativos: se navegan con las flechas. */
export function Opciones({ id, etiqueta, opciones, valor, onCambio, error, ayuda, ancho = 'completo', columnas = 'grid-cols-2' }: OpcionesProps) {
    const idEtiqueta = `${id}-etiqueta`;
    return (
        <div className={cn('flex flex-col gap-2', ancho === 'completo' && 'sm:col-span-2')}>
            <Etiqueta id={idEtiqueta}>{etiqueta}</Etiqueta>
            <div
                role="radiogroup"
                aria-labelledby={idEtiqueta}
                aria-describedby={describir(id, error, ayuda)}
                aria-invalid={!!error}
                className={cn('grid gap-2.5', columnas)}
            >
                {opciones.map((opcion, i) => {
                    const elegida = opcion.valor === valor;
                    return (
                        <label
                            key={opcion.valor}
                            className={cn(
                                'relative flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] bg-white px-4 py-3 text-[15px] leading-snug transition-all duration-200 select-none active:scale-[0.98] motion-reduce:transition-none',
                                'has-[:focus-visible]:border-[#6E8BD6] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#DCE5F8]',
                                elegida
                                    ? 'border-[#1E3A7B] bg-[#EEF2FB] font-medium text-[#172E63]'
                                    : error
                                      ? 'border-[#F0B4AB] text-[#16223F] hover:border-[#E0897D]'
                                      : 'border-[#D3DDF3] text-[#16223F] hover:border-[#6E8BD6] hover:bg-[#F9FAFD]',
                            )}
                        >
                            <input
                                type="radio"
                                id={i === 0 ? id : `${id}-${i}`}
                                name={id}
                                value={opcion.valor}
                                checked={elegida}
                                onChange={() => onCambio(opcion.valor)}
                                className="sr-only"
                            />
                            <span
                                aria-hidden
                                className={cn(
                                    'flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200',
                                    elegida ? 'border-[#1E3A7B] bg-[#1E3A7B]' : 'border-[#B9C8EC] bg-white',
                                )}
                            >
                                <Check
                                    strokeWidth={3.5}
                                    className={cn('size-2.5 text-white transition-transform duration-200', elegida ? 'scale-100' : 'scale-0')}
                                />
                            </span>
                            <span className="min-w-0">{opcion.etiqueta}</span>
                            {opcion.detalle && <span className="ml-auto pl-2 text-[13px] font-normal text-[#8C97B3]">{opcion.detalle}</span>}
                        </label>
                    );
                })}
            </div>
            <Nota id={id} error={error} ayuda={ayuda} />
        </div>
    );
}

// ---------------------------------------------------------------- buscador --

const sinTildes = (s: string) =>
    s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();

type BuscadorProps = {
    id: string;
    etiqueta: string;
    valor: string;
    onCambio: (valor: string) => void;
    sugerencias: string[];
    placeholder?: string;
    error?: string;
    ayuda?: string;
    ancho?: Ancho;
};

/**
 * Campo de texto con sugerencias (patrón combobox de WAI-ARIA). El valor es
 * siempre lo escrito: las sugerencias ayudan a no escribir el mismo barrio de
 * diez formas, pero se puede dejar uno que no esté en la lista.
 */
export function Buscador({ id, etiqueta, valor, onCambio, sugerencias, placeholder, error, ayuda, ancho = 'medio' }: BuscadorProps) {
    const [abierto, setAbierto] = useState(false);
    const [activo, setActivo] = useState(-1);
    const idLista = `${id}-lista`;

    const filtradas = useMemo(() => {
        const q = sinTildes(valor);
        if (!q) return sugerencias.slice(0, 50);
        const empiezan: string[] = [];
        const contienen: string[] = [];
        for (const s of sugerencias) {
            const n = sinTildes(s);
            if (n.startsWith(q)) empiezan.push(s);
            else if (n.includes(q)) contienen.push(s);
        }
        return [...empiezan, ...contienen].slice(0, 50);
    }, [valor, sugerencias]);

    useEffect(() => {
        if (activo >= 0) document.getElementById(`${idLista}-${activo}`)?.scrollIntoView({ block: 'nearest' });
    }, [activo, idLista]);

    const elegir = (s: string) => {
        onCambio(s);
        setAbierto(false);
        setActivo(-1);
    };

    const mostrarLista = abierto && (filtradas.length > 0 || valor.trim() !== '');

    return (
        <div className={cn('flex flex-col gap-2', ancho === 'completo' && 'sm:col-span-2')}>
            <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={mostrarLista}
                    aria-controls={idLista}
                    aria-activedescendant={activo >= 0 ? `${idLista}-${activo}` : undefined}
                    aria-invalid={!!error}
                    aria-describedby={describir(id, error, ayuda)}
                    autoComplete="off"
                    value={valor}
                    placeholder={placeholder}
                    onChange={(e) => {
                        onCambio(e.target.value);
                        setAbierto(true);
                        setActivo(-1);
                    }}
                    onFocus={() => setAbierto(true)}
                    onBlur={() => setAbierto(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setAbierto(true);
                            setActivo((i) => Math.min(i + 1, filtradas.length - 1));
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setActivo((i) => Math.max(i - 1, 0));
                        } else if (e.key === 'Enter' && mostrarLista && activo >= 0 && filtradas[activo]) {
                            e.preventDefault(); // elige la sugerencia en vez de enviar el paso
                            elegir(filtradas[activo]);
                        } else if (e.key === 'Escape' && mostrarLista) {
                            e.preventDefault();
                            setAbierto(false);
                        }
                    }}
                    className={cn(claseCampo(error), 'pr-12')}
                />
                <ChevronDown
                    aria-hidden
                    className={cn(
                        'pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-[#8C97B3] transition-transform duration-200',
                        mostrarLista && 'rotate-180',
                    )}
                />

                {mostrarLista && (
                    <div className="animate-in fade-in-0 slide-in-from-top-1 absolute z-20 mt-2 w-full overflow-hidden rounded-[16px] border-[1.5px] border-[#D3DDF3] bg-white shadow-[0_18px_40px_-18px_rgba(22,34,63,0.35)] duration-150 motion-reduce:animate-none">
                        {filtradas.length > 0 ? (
                            <ul id={idLista} role="listbox" aria-label={etiqueta} className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
                                {filtradas.map((s, i) => {
                                    const actual = sinTildes(s) === sinTildes(valor);
                                    return (
                                        <li
                                            key={s}
                                            id={`${idLista}-${i}`}
                                            role="option"
                                            aria-selected={i === activo}
                                            onMouseDown={(e) => e.preventDefault()} // que el input no pierda el foco antes del clic
                                            onMouseEnter={() => setActivo(i)}
                                            onClick={() => elegir(s)}
                                            className={cn(
                                                'flex cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-[15px] transition-colors',
                                                i === activo ? 'bg-[#EEF2FB] text-[#172E63]' : 'text-[#16223F]',
                                            )}
                                        >
                                            {s}
                                            {actual && <Check aria-hidden className="size-4 shrink-0 text-[#1E3A7B]" />}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p id={idLista} className="px-4 py-3.5 text-sm text-[#56627F]">
                                No está en la lista. Puedes dejarlo escrito así.
                            </p>
                        )}
                    </div>
                )}
            </div>
            <Nota id={id} error={error} ayuda={ayuda} />
        </div>
    );
}

// ----------------------------------------------------------------- botones --

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & { cargando?: boolean };

export function BotonPrincipal({ cargando, children, className, disabled, ...resto }: BotonProps) {
    return (
        <button
            disabled={disabled || cargando}
            className={cn(
                'flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[#1E3A7B] px-7 text-base font-semibold text-white transition-all duration-200 hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#6E8BD6] focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70',
                className,
            )}
            {...resto}
        >
            {cargando && <LoaderCircle className="size-4 animate-spin" />}
            {children}
        </button>
    );
}

export function BotonSecundario({ children, className, ...resto }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                'flex h-14 items-center justify-center gap-2 rounded-[18px] px-5 text-base font-medium text-[#3E4A68] transition-colors duration-200 hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none disabled:opacity-50',
                className,
            )}
            {...resto}
        >
            {children}
        </button>
    );
}
