import { type AlertaEdad } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { CircleAlert, Info, TriangleAlert } from 'lucide-react';

/**
 * La alerta de edad según la tabla del colegio: extraedad (pasa la edad máxima
 * aceptable del grado) o edad aceptable (por encima de la adecuada, todavía dentro).
 */
export function AlertaEdadGrado({ alerta: a, grado, className }: { alerta: AlertaEdad; grado: string; className?: string }) {
    const extra = a.estado === 'extraedad';
    const Icono = extra ? CircleAlert : Info;

    return (
        <div
            role={extra ? 'alert' : undefined}
            className={cn(
                'flex items-start gap-3 rounded-[16px] px-4 py-3 text-[14px]',
                extra ? 'bg-[#FFF1E6] text-[#7A3B0B]' : 'bg-[#EEF2FB] text-[#1E3A7B]',
                className,
            )}
        >
            <Icono className={cn('mt-0.5 size-[18px] shrink-0', extra ? 'text-[#C2620F]' : 'text-[#4863B8]')} />
            <p>
                <b className="font-semibold">{extra ? 'Extraedad' : 'Edad aceptable'}</b>: {a.edad} años al 31 de marzo de {a.anio} para {grado}.
                <span className="block text-[13px] opacity-85">
                    Edad adecuada {a.adecuada} años · aceptable hasta los {a.aceptableHasta} años y 11 meses · extraedad desde los{' '}
                    {a.aceptableHasta + 1}.
                </span>
            </p>
        </div>
    );
}

/** En la lista: un ícono compacto (no le quita espacio al nombre), solo para la extraedad; el detalle, al pasar el mouse. */
export function MarcaExtraedad({ alerta: a }: { alerta: AlertaEdad | null }) {
    if (a?.estado !== 'extraedad') return null;
    const texto = `Extraedad: ${a.edad} años al 31 de marzo de ${a.anio} (en este grado, extraedad desde los ${a.aceptableHasta + 1}; adecuada ${a.adecuada}).`;
    return (
        <span title={texto} className="inline-flex shrink-0 items-center gap-1 self-center text-[11.5px] font-semibold text-[#C2620F]">
            <TriangleAlert aria-hidden className="size-3.5" />
            <span className="sr-only">{texto}</span>
        </span>
    );
}
