import { Marca } from '@/components/estudiantes/etiquetas';
import { edad } from '@/lib/estudiantes';
import { type FichaInscrito, enlaceEstudiante, hace, inicialesInscrito, nombreInscrito } from '@/lib/inscritos';
import { Link } from '@inertiajs/react';

/** Encabezado de las páginas del inscrito: como el de la ficha, sin caja, sobre el degradado. */
export function EncabezadoInscrito({ solicitud: s, matricula }: Pick<FichaInscrito, 'solicitud' | 'matricula'>) {
    const anios = edad(s.fecha_nacimiento);

    return (
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-[20px] bg-[#1E3A7B] text-[20px] font-semibold text-white shadow-[0_14px_28px_-14px_rgba(30,58,123,0.7)]">
                {inicialesInscrito(s)}
            </span>
            <div className="min-w-0">
                <h1 className="text-[28px] leading-8 font-semibold tracking-[-0.025em] text-balance">{nombreInscrito(s)}</h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[#3E4A68]">
                    <span className="tabular-nums">
                        {s.tipo_documento === 'Otro' ? s.tipo_documento_otro : s.tipo_documento} {s.numero_documento}
                        {anios !== null && ` · ${anios} años`}
                    </span>
                    {matricula ? (
                        <Link href={enlaceEstudiante(matricula)} className="font-semibold text-[#1E3A7B] underline-offset-4 hover:underline">
                            {s.sexo === 'F' ? 'Matriculada' : 'Matriculado'} en {matricula.grupo ?? s.grado} · {matricula.anio}
                        </Link>
                    ) : (
                        <span className="font-semibold text-[#1E3A7B]">Ingresa a {s.grado}</span>
                    )}
                    <Marca valor={s.estado} />
                    <span className="text-[#56627F]">Enviada {hace(s.enviada).toLowerCase()}</span>
                </p>
            </div>
        </div>
    );
}
