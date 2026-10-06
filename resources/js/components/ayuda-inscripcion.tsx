import { BOTON_AYUDA, VideoAyuda } from '@/components/video-ayuda';
import { Link } from '@inertiajs/react';
import * as Dialogo from '@radix-ui/react-dialog';
import { ArrowRight } from 'lucide-react';
import { type ReactNode } from 'react';

const FLECHA = 'size-[18px] transition-transform duration-200 group-hover:translate-x-0.5';

/**
 * La ayuda del login y del formulario de inscripción: un video de un minuto que les muestra a
 * las familias cómo es la inscripción. Envuelve al botón que la abre.
 *
 * Al pie, el paso siguiente: desde el login lleva al formulario; dentro del formulario
 * (`alComenzar`) cierra la ayuda y arranca el primer paso.
 */
export function AyudaInscripcion({ children, alComenzar }: { children: ReactNode; alComenzar?: () => void }) {
    return (
        <VideoAyuda
            titulo="Cómo inscribir a un estudiante"
            duracion="1 min"
            src={route('ayuda.inscripcion')}
            caratula="/ayuda/inscripcion.webp"
            descripcion="Son 6 pasos y toma unos 5 minutos. Ten a mano el documento del estudiante, el tuyo, los datos de la madre y el padre, y los de EPS y tipo de sangre."
            accion={
                alComenzar ? (
                    <Dialogo.Close type="button" onClick={alComenzar} className={BOTON_AYUDA}>
                        Comenzar
                        <ArrowRight className={FLECHA} />
                    </Dialogo.Close>
                ) : (
                    <Link href={route('inscripcion.create')} className={BOTON_AYUDA}>
                        Inscribir estudiante
                        <ArrowRight className={FLECHA} />
                    </Link>
                )
            }
        >
            {children}
        </VideoAyuda>
    );
}
