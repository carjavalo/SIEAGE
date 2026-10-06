import { BOTON_AYUDA, VideoAyuda } from '@/components/video-ayuda';
import * as Dialogo from '@radix-ui/react-dialog';
import { CircleHelp } from 'lucide-react';

/** El «?» del encabezado del panel: abre el video tutorial para administración y secretaría. */
export function AyudaOperador() {
    return (
        <VideoAyuda
            titulo="Cómo continuar una inscripción"
            duracion="5 min"
            src={route('ayuda.operador')}
            caratula="/ayuda/operador.webp"
            descripcion="De la lista de inscritos a la constancia impresa, paso a paso: madre y padre, documentos, grupo y matrícula. Puedes pausarlo o adelantarlo cuando quieras."
            accion={
                <Dialogo.Close type="button" className={BOTON_AYUDA}>
                    Entendido
                </Dialogo.Close>
            }
        >
            <button
                type="button"
                title="Ayuda · video tutorial"
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#56627F] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] hover:text-[#1E3A7B] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
            >
                <CircleHelp className="size-5" />
                <span className="sr-only">Ayuda: video tutorial del panel</span>
            </button>
        </VideoAyuda>
    );
}
