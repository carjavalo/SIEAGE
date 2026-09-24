import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

type Props = { solicitudId: number; actual: 1 | 2; padresListos: boolean; matriculado: boolean };

/** Los dos pasos para matricular a un inscrito: madre y padre, y luego el grupo. */
export function Pasos({ solicitudId, actual, padresListos, matriculado }: Props) {
    const pasos = [
        { numero: 1, titulo: 'Madre y padre', href: `/inscritos/${solicitudId}`, hecho: padresListos, disponible: true },
        {
            numero: 2,
            titulo: 'Grupo y matrícula',
            href: `/inscritos/${solicitudId}/grupo`,
            hecho: matriculado,
            disponible: padresListos || matriculado,
        },
    ];

    return (
        <nav aria-label="Pasos para matricular" className="inline-flex items-center gap-1 rounded-full bg-white/75 p-1 ring-1 ring-[#D3DDF3]">
            {pasos.map((p) => {
                const esActual = p.numero === actual;
                const contenido = (
                    <>
                        <span
                            aria-hidden
                            className={cn(
                                'flex size-5 items-center justify-center rounded-full text-[12px] font-semibold',
                                esActual ? 'bg-white/20' : p.hecho ? 'bg-[#3BA67A] text-white' : 'ring-1 ring-[#B7C6EA] ring-inset',
                            )}
                        >
                            {p.hecho && !esActual ? <Check className="size-3" strokeWidth={3} /> : p.numero}
                        </span>
                        {p.titulo}
                        {p.hecho && <span className="sr-only"> (listo)</span>}
                    </>
                );
                const clase = cn(
                    'flex h-8 items-center gap-2 rounded-full pr-3.5 pl-1.5 text-[14px] font-medium whitespace-nowrap transition',
                    esActual ? 'bg-[#1E3A7B] text-white' : p.disponible ? 'text-[#3E4A68] hover:bg-white' : 'cursor-not-allowed text-[#8C97B3]',
                );

                return esActual || !p.disponible ? (
                    <span
                        key={p.numero}
                        aria-current={esActual ? 'step' : undefined}
                        className={clase}
                        title={p.disponible ? undefined : 'Primero completa la madre y el padre'}
                    >
                        {contenido}
                    </span>
                ) : (
                    <Link key={p.numero} href={p.href} className={clase}>
                        {contenido}
                    </Link>
                );
            })}
        </nav>
    );
}
