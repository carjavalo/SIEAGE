import { DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import * as Dialogo from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

/** Un video de ayuda. `corto`: el nombre en la pestaña cuando no cabe el título (pantallas angostas). */
export type VideoDeAyuda = {
    titulo: string;
    corto?: string;
    /** "1 min", "5 min": junto al título. */
    duracion: string;
    src: string;
    /** Carátula, solo si el video no arranca solo (iPhone, movimiento reducido). */
    caratula: string;
    descripcion: ReactNode;
};

type Props = {
    /** El botón que abre la ayuda. */
    children: ReactNode;
    /** Lo que va a la derecha de la descripción: el paso siguiente. */
    accion?: ReactNode;
} & (
    | (VideoDeAyuda & { videos?: never; inicial?: never })
    /** Varios videos: arriba van en pestañas; `inicial` es el que se ve al abrir. */
    | { videos: VideoDeAyuda[]; inicial?: number }
);

/**
 * Un video de ayuda en un modal: la del login para las familias, la del panel para el
 * personal (con varias clases en pestañas) y la de Boletines. Envuelve al botón que la abre.
 * El video solo se pide al abrir.
 */
export function VideoAyuda(props: Props) {
    const { children, accion } = props;
    const videos = props.videos ?? [props as VideoDeAyuda];
    const inicial = Math.min(props.inicial ?? 0, videos.length - 1);
    const video = useRef<HTMLVideoElement>(null);
    // La carátula solo hace falta si el video no arranca solo: si arranca, taparía un instante el primer cuadro.
    const [conCaratula, setConCaratula] = useState(false);
    const [elegido, setElegido] = useState(inicial);
    const actual = videos[elegido] ?? videos[0];
    // Al cambiar de video, el nuevo arranca solo (ya se pidió ver ayuda).
    const cambio = useRef(false);
    // Por dónde iba cada video mientras el modal está abierto: al volver a uno, sigue donde quedó.
    const tiempos = useRef<Record<string, number>>({});

    const arrancar = () => {
        video.current?.focus({ preventScroll: true });
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setConCaratula(true);
        else video.current?.play().catch(() => setConCaratula(true));
    };
    useEffect(() => {
        if (!cambio.current) return;
        cambio.current = false;
        arrancar();
    }, [elegido]);

    const cambiar = (i: number) => {
        if (i === elegido) return;
        if (video.current) tiempos.current[actual.src] = video.current.currentTime;
        video.current?.pause();
        setConCaratula(false);
        cambio.current = true;
        setElegido(i);
    };

    return (
        // Se pausa al cerrar sin esperar a que el diálogo se desmonte (en una pestaña en segundo plano tarda).
        // Cada vez que se abre, empieza en el video de la pantalla en que se está.
        <Dialogo.Root
            onOpenChange={(abierto) => {
                if (abierto) {
                    setElegido(inicial);
                    setConCaratula(false);
                    tiempos.current = {};
                } else video.current?.pause();
            }}
        >
            <Dialogo.Trigger asChild>{children}</Dialogo.Trigger>
            <DialogPortal>
                <DialogOverlay className="bg-[#0B1430]/70 backdrop-blur-sm" />
                <Dialogo.Content
                    onOpenAutoFocus={(e) => {
                        // El foco va al video (así la barra espaciadora lo pausa) y arranca solo: quien abrió
                        // la ayuda quiere verlo. Si el navegador no lo deja (iPhone), queda la carátula con su botón.
                        e.preventDefault();
                        arrancar();
                    }}
                    // El ancho también se ajusta al alto de la ventana: el video nunca obliga a desplazarse.
                    className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 @container fixed top-1/2 left-1/2 z-50 flex w-[min(960px,100vw_-_24px,(100dvh_-_190px)_*_16_/_9)] min-w-[280px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] bg-white text-[#16223F] shadow-[0_40px_80px_-24px_rgba(11,20,48,0.7)] duration-200"
                >
                    <div className="flex items-center gap-2.5 py-2.5 pr-2.5 pl-5">
                        {videos.length > 1 ? (
                            <>
                                <Dialogo.Title className="sr-only">{actual.titulo}</Dialogo.Title>
                                <div
                                    role="group"
                                    aria-label="Videos de ayuda"
                                    className="-ml-2.5 flex min-w-0 gap-1 overflow-x-auto rounded-full bg-[#EEF2FB] p-1 [scrollbar-width:none]"
                                >
                                    {videos.map((v, i) => (
                                        <button
                                            key={v.src}
                                            type="button"
                                            aria-pressed={i === elegido}
                                            onClick={() => cambiar(i)}
                                            className={cn(
                                                'flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none',
                                                i === elegido
                                                    ? 'bg-white text-[#1E3A7B] shadow-[0_1px_3px_rgba(22,34,63,0.14)]'
                                                    : 'text-[#56627F] hover:text-[#16223F]',
                                            )}
                                        >
                                            <span className="@max-xl:hidden">{v.titulo}</span>
                                            <span className="@xl:hidden">{v.corto ?? v.titulo}</span>
                                            <span className="text-xs font-medium text-[#56627F] @max-md:hidden">{v.duracion}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <Dialogo.Title className="text-base font-semibold tracking-tight">{actual.titulo}</Dialogo.Title>
                                <span className="shrink-0 rounded-full bg-[#EEF2FB] px-2.5 py-1 text-xs font-medium text-[#3E4A68] @max-md:hidden">
                                    {actual.duracion}
                                </span>
                            </>
                        )}
                        <Dialogo.Close className="ml-auto flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#56627F] transition hover:bg-[#EEF2FB] hover:text-[#16223F] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none">
                            <X className="size-5" />
                            <span className="sr-only">Cerrar</span>
                        </Dialogo.Close>
                    </div>

                    <video
                        key={actual.src}
                        ref={video}
                        src={actual.src}
                        aria-label={actual.titulo}
                        onLoadedMetadata={(e) => {
                            const t = tiempos.current[actual.src];
                            if (t) e.currentTarget.currentTime = t;
                        }}
                        poster={conCaratula ? actual.caratula : undefined}
                        controls
                        controlsList="nodownload"
                        playsInline
                        preload="metadata"
                        className="block aspect-video w-full bg-[#0F1D45] outline-none focus-visible:ring-4 focus-visible:ring-[#6E8BD6] focus-visible:ring-inset"
                    >
                        Tu navegador no puede reproducir este video.
                    </video>

                    <div className="flex flex-col gap-3.5 px-5 py-4 @xl:flex-row @xl:items-center @xl:gap-6">
                        <Dialogo.Description className="text-sm leading-snug text-pretty text-[#56627F]">{actual.descripcion}</Dialogo.Description>
                        {accion}
                    </div>
                </Dialogo.Content>
            </DialogPortal>
        </Dialogo.Root>
    );
}

export const BOTON_AYUDA =
    'group flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-[#1E3A7B] px-5 text-[15px] font-semibold whitespace-nowrap text-white transition-all duration-200 hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.98]';
