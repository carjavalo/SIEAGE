import { VIDEO_BOLETINES } from '@/components/ayuda-boletines';
import { BOTON_AYUDA, VideoAyuda, type VideoDeAyuda } from '@/components/video-ayuda';
import { puede } from '@/lib/permisos';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import * as Dialogo from '@radix-ui/react-dialog';
import { CircleHelp } from 'lucide-react';

/**
 * El «?» del encabezado del panel: las clases en video para el personal, en pestañas. La de
 * Boletines solo para quien escribe boletines; en esa pantalla, abre directo en ella.
 */
export function AyudaOperador() {
    const { props, component } = usePage<SharedData>();
    const videos: VideoDeAyuda[] = [
        {
            titulo: 'Cómo continuar una inscripción',
            corto: 'Inscripciones',
            duracion: '5 min',
            src: route('ayuda.operador'),
            caratula: '/ayuda/operador.webp',
            descripcion:
                'De la lista de inscritos a la constancia impresa, paso a paso: madre y padre, documentos, grupo y matrícula. Puedes pausarlo o adelantarlo cuando quieras.',
        },
        ...(puede(props.auth, 'escribir-boletines') ? [VIDEO_BOLETINES()] : []),
    ];
    const inicial = component.startsWith('boletines/') ? videos.length - 1 : 0;

    return (
        <VideoAyuda
            videos={videos}
            inicial={inicial}
            accion={
                <Dialogo.Close type="button" className={BOTON_AYUDA}>
                    Entendido
                </Dialogo.Close>
            }
        >
            <button
                type="button"
                title="Ayuda · videos tutoriales"
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#56627F] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] hover:text-[#1E3A7B] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
            >
                <CircleHelp className="size-5" />
                <span className="sr-only">Ayuda: videos tutoriales del panel</span>
            </button>
        </VideoAyuda>
    );
}
