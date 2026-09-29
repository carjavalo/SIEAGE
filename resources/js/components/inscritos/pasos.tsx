import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

type Props = { solicitudId: number; actual: 1 | 2 | 3; padresListos: boolean; documentosListos: boolean; matriculado: boolean };

/**
 * Los tres pasos para matricular a un inscrito: madre y padre, los documentos
 * que trajo el acudiente y el grupo. Los documentos no frenan la matrícula (los
 * que falten se piden después); la madre y el padre sí.
 */
export function Pasos({ solicitudId, actual, padresListos, documentosListos, matriculado }: Props) {
    const despuesDePadres = padresListos || matriculado;
    const pasos = [
        { numero: 1, titulo: 'Madre y padre', corto: 'Padres', href: `/inscritos/${solicitudId}`, hecho: padresListos, disponible: true },
        {
            numero: 2,
            titulo: 'Documentos',
            corto: 'Documentos',
            href: `/inscritos/${solicitudId}/documentos`,
            hecho: documentosListos,
            disponible: despuesDePadres,
        },
        {
            numero: 3,
            titulo: 'Grupo y matrícula',
            corto: 'Grupo',
            href: `/inscritos/${solicitudId}/grupo`,
            hecho: matriculado,
            disponible: despuesDePadres,
        },
    ];

    return (
        <nav
            aria-label="Pasos para matricular"
            className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white/75 p-1 ring-1 ring-[#D3DDF3] [scrollbar-width:none]"
        >
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
                        {/* En celular, el nombre corto: los tres pasos caben en una línea. */}
                        <span aria-hidden className="sm:hidden">
                            {p.corto}
                        </span>
                        <span className="sr-only sm:not-sr-only">{p.titulo}</span>
                        {p.hecho && <span className="sr-only"> (listo)</span>}
                        {/* El title solo lo ve quien pasa el mouse: el lector de pantalla también debe saber por qué no se puede. */}
                        {!p.disponible && !esActual && <span className="sr-only"> (se habilita al completar la madre y el padre)</span>}
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
