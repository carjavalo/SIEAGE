import { DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import * as Dialogo from '@radix-ui/react-dialog';
import { ArrowRight, X } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';

/**
 * La ayuda del login: un video de un minuto que les muestra a las familias cómo es la
 * inscripción. Envuelve al botón que la abre. El video solo se pide al abrir.
 */
export function AyudaInscripcion({ children }: { children: ReactNode }) {
    const video = useRef<HTMLVideoElement>(null);
    // La carátula solo hace falta si el video no arranca solo: si arranca, taparía un instante el primer cuadro.
    const [caratula, setCaratula] = useState(false);

    return (
        // Se pausa al cerrar sin esperar a que el diálogo se desmonte (en una pestaña en segundo plano tarda).
        <Dialogo.Root onOpenChange={(abierto) => !abierto && video.current?.pause()}>
            <Dialogo.Trigger asChild>{children}</Dialogo.Trigger>
            <DialogPortal>
                <DialogOverlay className="bg-[#0B1430]/70 backdrop-blur-sm" />
                <Dialogo.Content
                    onOpenAutoFocus={(e) => {
                        // El foco va al video (así la barra espaciadora lo pausa) y arranca solo: quien abrió
                        // la ayuda quiere verlo. Si el navegador no lo deja (iPhone), queda la carátula con su botón.
                        e.preventDefault();
                        video.current?.focus({ preventScroll: true });
                        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setCaratula(true);
                        else video.current?.play().catch(() => setCaratula(true));
                    }}
                    // El ancho también se ajusta al alto de la ventana: el video nunca obliga a desplazarse.
                    className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 @container fixed top-1/2 left-1/2 z-50 flex w-[min(960px,100vw_-_24px,(100dvh_-_190px)_*_16_/_9)] min-w-[280px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] bg-white text-[#16223F] shadow-[0_40px_80px_-24px_rgba(11,20,48,0.7)] duration-200"
                >
                    <div className="flex items-center gap-2.5 py-2.5 pr-2.5 pl-5">
                        <Dialogo.Title className="text-base font-semibold tracking-tight">Cómo inscribir a un estudiante</Dialogo.Title>
                        <span className="shrink-0 rounded-full bg-[#EEF2FB] px-2.5 py-1 text-xs font-medium text-[#3E4A68] @max-md:hidden">
                            1 min
                        </span>
                        <Dialogo.Close className="ml-auto flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#56627F] transition hover:bg-[#EEF2FB] hover:text-[#16223F] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none">
                            <X className="size-5" />
                            <span className="sr-only">Cerrar</span>
                        </Dialogo.Close>
                    </div>

                    <video
                        ref={video}
                        src={route('ayuda.inscripcion')}
                        poster={caratula ? '/ayuda/inscripcion.webp' : undefined}
                        controls
                        controlsList="nodownload"
                        playsInline
                        preload="metadata"
                        className="block aspect-video w-full bg-[#0F1D45] outline-none focus-visible:ring-4 focus-visible:ring-[#6E8BD6] focus-visible:ring-inset"
                    >
                        Tu navegador no puede reproducir este video.
                    </video>

                    <div className="flex flex-col gap-3.5 px-5 py-4 @xl:flex-row @xl:items-center @xl:gap-6">
                        <Dialogo.Description className="text-sm leading-snug text-pretty text-[#56627F]">
                            Son 5 pasos y toma unos 5 minutos. Ten a mano el documento del estudiante, el tuyo y los datos de EPS y tipo de sangre.
                        </Dialogo.Description>
                        <Link
                            href={route('inscripcion.create')}
                            className="group flex h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#1E3A7B] px-5 text-[15px] font-semibold whitespace-nowrap text-white transition-all duration-200 hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.98]"
                        >
                            Inscribir estudiante
                            <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </Dialogo.Content>
            </DialogPortal>
        </Dialogo.Root>
    );
}
