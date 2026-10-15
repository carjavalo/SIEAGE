import { BOTON_AYUDA, VideoAyuda, type VideoDeAyuda } from '@/components/video-ayuda';
import * as Dialogo from '@radix-ui/react-dialog';
import { CircleHelp } from 'lucide-react';

/**
 * Versión de la clase: el video y la carátula quedan un día en la caché del navegador. Al
 * cambiar el video se cambia esto, y así todos ven el nuevo de una vez.
 */
const VERSION = '2026-10-15';

/** La clase de Boletines: también sale en el «?» del encabezado (ver AyudaOperador). */
export const VIDEO_BOLETINES = (): VideoDeAyuda => ({
    titulo: 'Boletines de transición',
    corto: 'Boletines',
    duracion: '4 min',
    src: `${route('ayuda.boletines')}?v=${VERSION}`,
    caratula: `/ayuda/boletines.webp?v=${VERSION}`,
    descripcion:
        'Escribir el texto de cada niño, copiarlo a varios, poner las firmas e imprimir uno o todos en PDF. Puedes pausarlo o adelantarlo cuando quieras.',
});

/** El «?» de Boletines: abre la clase de cómo escribir los boletines de transición y exportarlos en PDF. */
export function AyudaBoletines() {
    return (
        <VideoAyuda
            {...VIDEO_BOLETINES()}
            accion={
                <Dialogo.Close type="button" className={BOTON_AYUDA}>
                    Entendido
                </Dialogo.Close>
            }
        >
            <button
                type="button"
                title="Ayuda · cómo hacer los boletines"
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#56627F] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] hover:text-[#1E3A7B] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
            >
                <CircleHelp className="size-5" />
                <span className="sr-only">Ayuda: video de cómo hacer los boletines</span>
            </button>
        </VideoAyuda>
    );
}
