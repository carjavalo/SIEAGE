import { cn } from '@/lib/utils';
import { Check, Copy, Eye, EyeOff, LoaderCircle, RefreshCw } from 'lucide-react';
import { type ButtonHTMLAttributes, Children, type ComponentProps, type ReactNode, cloneElement, isValidElement, useState } from 'react';

/** Piezas de formulario del panel (inscritos, usuarios, configuración). Nada de shadcn. */

export const claseCampo =
    'h-11 w-full rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-3.5 text-[15px] text-[#16223F] outline-none transition placeholder:text-[#6B7690] hover:border-[#B7C6EA] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] disabled:cursor-default disabled:border-[#E3E9F6] disabled:bg-[#F5F7FC] disabled:text-[#3E4A68] aria-invalid:border-[#E0897D]';

/** Tarjeta blanca de las páginas del panel. */
export const tarjeta = 'rounded-[24px] border border-[#E3E9F6] bg-white shadow-[0_1px_2px_rgba(22,34,63,0.04),0_12px_32px_-20px_rgba(22,34,63,0.18)]';

export const botonPrimario =
    'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#1E3A7B] px-5 text-[15px] font-semibold whitespace-nowrap text-white shadow-[0_12px_24px_-12px_rgba(30,58,123,0.6)] transition hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.99] disabled:cursor-default disabled:opacity-60 disabled:shadow-none';

export const botonSecundario =
    'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] px-4 text-[15px] font-medium whitespace-nowrap text-[#56627F] transition hover:bg-[#EEF2FB] hover:text-[#16223F] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none';

/** Etiqueta, control y, debajo, el error o una ayuda. */
/** El id del texto que describe el campo: el error si lo hay; si no, la ayuda. */
export function describir(id: string, error?: string, ayuda?: string) {
    if (error) return `${id}-error`;
    if (ayuda) return `${id}-ayuda`;
}

/**
 * Etiqueta, control y, debajo, el error o la ayuda. Al control que lleva el mismo
 * `id` le pone aria-describedby, para que el lector de pantalla lea el error al
 * llegar al campo; si el control va envuelto, quien lo arma se lo pone con describir().
 */
export function ConDescripcion({ id, descripcion, children }: { id: string; descripcion?: string; children: ReactNode }) {
    return Children.map(children, (hijo) =>
        descripcion && isValidElement<{ id?: string; 'aria-describedby'?: string }>(hijo) && hijo.props.id === id
            ? cloneElement(hijo, { 'aria-describedby': descripcion })
            : hijo,
    );
}

export function Campo({
    id,
    etiqueta,
    ayuda,
    error,
    opcional,
    children,
}: {
    id: string;
    etiqueta: string;
    ayuda?: string;
    error?: string;
    opcional?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={id} className="flex justify-between text-[13px] font-medium text-[#3E4A68]">
                {etiqueta}
                {opcional && <span className="font-normal text-[#6B7690]">Opcional</span>}
            </label>
            <ConDescripcion id={id} descripcion={describir(id, error, ayuda)}>
                {children}
            </ConDescripcion>
            {error ? (
                <span id={`${id}-error`} className="text-[13px] text-[#B42318]">
                    {error}
                </span>
            ) : (
                ayuda && (
                    <span id={`${id}-ayuda`} className="text-[13px] leading-snug text-[#56627F]">
                        {ayuda}
                    </span>
                )
            )}
        </div>
    );
}

/** Contraseña con el ojo para verla. */
export function CampoSecreto({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
    const [ver, setVer] = useState(false);

    return (
        <div className="relative">
            <input {...props} type={ver ? 'text' : 'password'} spellCheck={false} className={cn(claseCampo, 'pr-12', className)} />
            <button
                type="button"
                onClick={() => setVer((v) => !v)}
                aria-label={ver ? 'Ocultar la clave' : 'Mostrar la clave'}
                className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[10px] text-[#56627F] transition hover:bg-[#EEF2FB] hover:text-[#1E3A7B]"
            >
                {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
}

/** Sin letras que se confunden al dictarlas o copiarlas a mano (0/O, 1/l/I). */
export function claveAleatoria(largo = 10) {
    const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const azar = crypto.getRandomValues(new Uint32Array(largo));
    return Array.from(azar, (n) => letras[n % letras.length]).join('');
}

/** Clave que se le entrega a otra persona: se genera, se ve y se copia. */
export function CampoClaveNueva({
    id,
    valor,
    onCambio,
    error,
    ayuda,
}: {
    id: string;
    valor: string;
    onCambio: (v: string) => void;
    error?: string;
    ayuda: string;
}) {
    const [ver, setVer] = useState(true);
    const [copiada, setCopiada] = useState(false);
    const boton =
        'flex size-9 cursor-pointer items-center justify-center rounded-[10px] text-[#56627F] transition hover:bg-[#EEF2FB] hover:text-[#1E3A7B]';

    return (
        <Campo id={id} etiqueta="Clave" ayuda={ayuda} error={error}>
            <div className="relative flex items-center">
                <input
                    id={id}
                    type={ver ? 'text' : 'password'}
                    value={valor}
                    onChange={(e) => onCambio(e.target.value)}
                    autoComplete="new-password"
                    spellCheck={false}
                    aria-invalid={!!error}
                    aria-describedby={describir(id, error, ayuda)}
                    className={cn(claseCampo, 'pr-32 font-mono tracking-wide')}
                />
                <div className="absolute right-1 flex">
                    <button
                        type="button"
                        onClick={() => onCambio(claveAleatoria())}
                        className={boton}
                        aria-label="Generar otra clave"
                        title="Generar otra"
                    >
                        <RefreshCw className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setVer((v) => !v)}
                        className={boton}
                        aria-label={ver ? 'Ocultar la clave' : 'Mostrar la clave'}
                    >
                        {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard?.writeText(valor);
                            setCopiada(true);
                            setTimeout(() => setCopiada(false), 1500);
                        }}
                        className={boton}
                        aria-label="Copiar la clave"
                        title="Copiar"
                    >
                        {copiada ? <Check className="size-4 text-[#1C6B4A]" /> : <Copy className="size-4" />}
                    </button>
                </div>
            </div>
        </Campo>
    );
}

/** Interruptor de sí/no con su explicación. El input real queda oculto y sigue recibiendo el foco y el teclado. */
export function Interruptor({
    titulo,
    detalle,
    activo,
    onCambio,
    desactivado,
}: {
    titulo: string;
    detalle: string;
    activo: boolean;
    onCambio: (v: boolean) => void;
    desactivado?: boolean;
}) {
    return (
        <label
            className={cn(
                'flex items-center justify-between gap-4 rounded-[16px] border-[1.5px] px-4 py-3 transition',
                desactivado ? 'cursor-not-allowed border-[#E3E9F6] opacity-60' : 'cursor-pointer border-[#E3E9F6] hover:border-[#B9C8EC]',
            )}
        >
            <span>
                <span className="block text-[15px] font-medium text-[#16223F]">{titulo}</span>
                <span className="block text-[13px] leading-snug text-[#56627F]">{detalle}</span>
            </span>
            <input
                type="checkbox"
                role="switch"
                checked={activo}
                disabled={desactivado}
                onChange={(e) => onCambio(e.target.checked)}
                className="peer sr-only"
            />
            <span
                aria-hidden
                className="relative h-6 w-11 shrink-0 rounded-full bg-[#D3DDF3] transition peer-checked:bg-[#1E3A7B] peer-focus-visible:ring-4 peer-focus-visible:ring-[#DCE5F8] after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
            />
        </label>
    );
}

/** "Tienes cambios sin guardar" o "Todo guardado", con su punto de color. */
export function EstadoGuardado({ sucio }: { sucio: boolean }) {
    return (
        <span className="flex items-center gap-2 text-[14px] text-[#56627F]">
            <span aria-hidden className={cn('size-2 rounded-full', sucio ? 'bg-[#D99A2B]' : 'bg-[#3BA67A]')} />
            {sucio ? 'Tienes cambios sin guardar' : 'Todo guardado'}
        </span>
    );
}

/** Botón principal que muestra que está trabajando. */
export function BotonGuardar({ cargando, children, className, ...resto }: ButtonHTMLAttributes<HTMLButtonElement> & { cargando?: boolean }) {
    return (
        <button type="submit" {...resto} disabled={cargando || resto.disabled} className={cn(botonPrimario, className)}>
            {cargando && <LoaderCircle className="size-4 animate-spin" />}
            {children}
        </button>
    );
}
