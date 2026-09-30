import { BotonGuardar, botonSecundario, claseCampo } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type UltimaEdicion, fecha } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import { type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { sileo } from 'sileo';

/**
 * El diálogo con formulario del panel: cabecera, cuerpo que se desplaza y pie
 * con «Cancelar» y «Guardar». Lo usan la edición de datos de la ficha y Sedes.
 */

const dialogo =
    'flex max-h-[calc(100dvh-24px)] max-w-[620px] flex-col gap-0 overflow-hidden rounded-[22px] border-[#E3E9F6] p-0 font-sans text-[#16223F] outline-none sm:rounded-[22px]';

/** El botón de un Desplegable con el aspecto de un campo. */
export const claseLista = cn(
    claseCampo,
    'justify-between gap-2 text-left aria-expanded:border-[#6E8BD6] aria-expanded:ring-4 aria-expanded:ring-[#DCE5F8]',
);

/** Lo que el diálogo necesita saber del formulario que lleva dentro, sin volver a pintarse. */
export type EstadoDialogo = { sucio: boolean; ocupado: boolean };

export function useAvisar(estado: RefObject<EstadoDialogo>, sucio: boolean, ocupado: boolean) {
    useEffect(() => {
        estado.current = { sucio, ocupado };
        return () => {
            estado.current = { sucio: false, ocupado: false };
        };
    }, [estado, sucio, ocupado]);
}

/**
 * El diálogo. El formulario va adentro como componente aparte: así nace limpio
 * cada vez que se abre. Con cambios sin guardar, pulsar fuera no lo cierra
 * (Esc y «Cancelar» sí); mientras guarda, no se cierra.
 *
 * Al abrir, el foco va al diálogo y no al primer campo: Radix lo enfocaría con
 * todo el texto seleccionado, y una tecla de más borraría el nombre. `enfocar`
 * señala el campo por el que sí conviene empezar (el documento, al agregar).
 */
export function Marco({
    abierto,
    onCambio,
    enfocar,
    className,
    children,
}: {
    abierto: boolean;
    onCambio: (v: boolean) => void;
    enfocar?: string;
    /** Para un ancho distinto del habitual (p. ej. max-w-[460px] en un formulario corto). */
    className?: string;
    children: (estado: RefObject<EstadoDialogo>) => ReactNode;
}) {
    const estado = useRef<EstadoDialogo>({ sucio: false, ocupado: false });

    return (
        <Dialog open={abierto} onOpenChange={(v) => (v || !estado.current.ocupado) && onCambio(v)}>
            <DialogContent
                className={cn(dialogo, className)}
                onInteractOutside={(e) => estado.current.sucio && e.preventDefault()}
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    const caja = e.currentTarget as HTMLElement;
                    ((enfocar && caja.querySelector<HTMLElement>(enfocar)) || caja).focus();
                }}
            >
                {children(estado)}
            </DialogContent>
        </Dialog>
    );
}

export function Cabeza({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <DialogHeader className="shrink-0 px-6 pt-6 pr-14 pb-4">
            <DialogTitle className="text-xl font-semibold">{titulo}</DialogTitle>
            <DialogDescription className="text-[14px] leading-snug text-[#56627F]">{children}</DialogDescription>
        </DialogHeader>
    );
}

export const Cuerpo = ({ children }: { children: ReactNode }) => (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-0.5 pb-5 [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]">
        {children}
    </div>
);

export function Pie({
    sucio,
    ultima,
    cargando,
    desactivado,
    guardar = 'Guardar',
    onCancelar,
}: {
    sucio: boolean;
    ultima?: UltimaEdicion;
    cargando: boolean;
    desactivado?: boolean;
    guardar?: string;
    onCancelar: () => void;
}) {
    return (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#EEF2F9] px-6 py-4">
            <p className="mr-auto hidden min-w-0 items-center gap-2 text-[14px] text-[#56627F] sm:flex">
                {sucio ? (
                    <>
                        <span aria-hidden className="size-2 shrink-0 rounded-full bg-[#D99A2B]" />
                        Tienes cambios sin guardar
                    </>
                ) : (
                    ultima && (
                        <span className="truncate">
                            Última edición: {ultima.usuario ?? 'un usuario'} · {fecha(ultima.fecha)}
                        </span>
                    )
                )}
            </p>
            <button type="button" onClick={onCancelar} disabled={cargando} className={botonSecundario}>
                Cancelar
            </button>
            <BotonGuardar cargando={cargando} disabled={desactivado}>
                {guardar}
            </BotonGuardar>
        </div>
    );
}

/** El lápiz redondo que abre cada diálogo. */
export function Lapiz({ etiqueta, onClick }: { etiqueta: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={etiqueta}
            title={etiqueta}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] hover:ring-[#6E8BD6] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none print:hidden"
        >
            <Pencil className="size-[15px]" />
        </button>
    );
}

export const exito = (titulo: string) => (pagina: { props: unknown }) =>
    sileo.success({ title: titulo, description: (pagina.props as { flash?: { success?: string | null } }).flash?.success ?? undefined });

export const revisar = () => sileo.warning({ title: 'Revisa los datos', description: 'Marcamos en rojo lo que falta o está mal.' });
