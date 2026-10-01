import { botonPrimario, botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Grado, type Grupo, type SedeFiltro } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, FileBadge } from 'lucide-react';
import { useState } from 'react';

type Alcance = { clave: string; titulo: string; detalle: string; n: number; href: string };

/**
 * «Constancias» en la lista de estudiantes: imprimir de una vez las del grupo elegido, del
 * grado, de la sede o de todo el colegio (solo los activos del año que se está viendo).
 */
export function BotonConstancias({
    anio,
    grado,
    grupo,
    sede,
    sedes,
}: {
    anio: number;
    grado: Grado;
    grupo?: Grupo;
    sede: string | null;
    sedes: SedeFiltro[];
}) {
    // Para un usuario de sede, "todo el colegio" son sus sedes (el servidor ya limita la lista).
    const todoElColegio = usePage<SharedData>().props.auth.todasLasSedes !== false;
    const laSede = sedes.find((s) => s.codigo === sede);
    const ruta = (filtros: Record<string, string | number | undefined>) => {
        const consulta = new URLSearchParams({ anio: String(anio) });
        for (const [clave, valor] of Object.entries(filtros)) if (valor !== undefined) consulta.set(clave, String(valor));
        return `/constancias?${consulta}`;
    };

    const alcances: Alcance[] = [
        ...(grupo
            ? [
                  {
                      clave: 'grupo',
                      titulo: `Grupo ${grupo.codigo}`,
                      detalle: `Sede ${grupo.sede} · jornada ${grupo.jornada.toLowerCase()}`,
                      n: grupo.activos,
                      href: ruta({ grupo: grupo.id }),
                  },
              ]
            : []),
        {
            clave: 'grado',
            titulo: `Todo ${grado.nombre}`,
            detalle: laSede ? `Sede ${laSede.nombre}` : 'Todas las sedes',
            n: grado.activos,
            href: ruta({ grado: grado.id, sede: laSede?.codigo }),
        },
        ...(laSede
            ? [
                  {
                      clave: 'sede',
                      titulo: `Sede ${laSede.nombre}`,
                      detalle: 'Todos los grados',
                      n: laSede.activos,
                      href: ruta({ sede: laSede.codigo }),
                  },
              ]
            : []),
        {
            clave: 'colegio',
            titulo: todoElColegio ? 'Todo el colegio' : 'Todas mis sedes',
            detalle: 'Todas las sedes y grados',
            n: sedes.reduce((t, s) => t + s.activos, 0),
            href: ruta({}),
        },
    ];

    const [abierto, setAbierto] = useState(false);
    const [elegido, setElegido] = useState(alcances[0].clave);
    const alcance = alcances.find((a) => a.clave === elegido) ?? alcances[0];

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setElegido(alcances[0].clave);
                    setAbierto(true);
                }}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
            >
                <FileBadge className="size-4" />
                Constancias
            </button>

            <Dialog open={abierto} onOpenChange={setAbierto}>
                <DialogContent className="flex max-w-[480px] flex-col gap-0 overflow-hidden rounded-[22px] border-[#E3E9F6] p-0 font-sans text-[#16223F] sm:rounded-[22px]">
                    <DialogHeader className="px-6 pt-6 pr-14 pb-4">
                        <DialogTitle className="text-xl font-semibold">Imprimir constancias</DialogTitle>
                        <DialogDescription className="text-[14px] leading-snug text-[#56627F]">
                            Una hoja por estudiante, con la copia para la familia y la del colegio. Solo los activos de {anio}.
                        </DialogDescription>
                    </DialogHeader>

                    <div role="radiogroup" aria-label="Cuáles constancias" className="space-y-2 px-6 pb-5">
                        {alcances.map((a) => (
                            <button
                                key={a.clave}
                                type="button"
                                role="radio"
                                aria-checked={a.clave === elegido}
                                onClick={() => setElegido(a.clave)}
                                className={cn(
                                    'flex w-full cursor-pointer items-center gap-3.5 rounded-2xl px-4 py-3 text-left ring-1 transition focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none',
                                    a.clave === elegido ? 'bg-[#EEF2FB] ring-[#1E3A7B]' : 'ring-[#E3E9F6] hover:bg-[#F7F9FD] hover:ring-[#D3DDF3]',
                                )}
                            >
                                <span
                                    aria-hidden
                                    className={cn(
                                        'flex size-[18px] shrink-0 items-center justify-center rounded-full ring-[1.5px]',
                                        a.clave === elegido ? 'ring-[#1E3A7B]' : 'ring-[#B7C6EA]',
                                    )}
                                >
                                    {a.clave === elegido && <span className="size-2.5 rounded-full bg-[#1E3A7B]" />}
                                </span>
                                <span className="min-w-0 flex-1 leading-snug">
                                    <span className="block text-[15px] font-semibold">{a.titulo}</span>
                                    <span className="block truncate text-[13px] text-[#56627F]">{a.detalle}</span>
                                </span>
                                <span className="shrink-0 text-right text-[13px] leading-snug text-[#56627F] tabular-nums">
                                    <b className="block text-[15px] font-semibold text-[#16223F]">{a.n.toLocaleString('es-CO')}</b>
                                    {a.n === 1 ? 'hoja' : 'hojas'}
                                </span>
                            </button>
                        ))}
                        {alcance.n > 300 && (
                            <p className="rounded-xl bg-[#FFF8E8] px-3.5 py-2.5 text-[13px] leading-snug text-[#6B4E12]">
                                Son muchas hojas: el navegador puede tardar unos minutos en preparar la impresión. Si puedes, imprime por sede o por
                                grado.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-[#EEF2F9] px-6 py-4">
                        <button type="button" onClick={() => setAbierto(false)} className={botonSecundario}>
                            Cancelar
                        </button>
                        <Link
                            href={alcance.href}
                            className={cn(botonPrimario, alcance.n === 0 && 'pointer-events-none opacity-60')}
                            aria-disabled={alcance.n === 0}
                        >
                            Ver e imprimir
                            <ArrowRight className="size-[18px]" />
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
