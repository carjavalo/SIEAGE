import { type EstudianteBoletin, type GrupoBoletin, HojasBoletin, paginar } from '@/components/boletin';
import { botonPrimario } from '@/components/formulario';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CircleAlert, Printer } from 'lucide-react';
import { useMemo } from 'react';

type Props = { titulo: string; volver: string; periodo: string; grupo: GrupoBoletin; estudiantes: EstudianteBoletin[]; sinTexto: number };

/**
 * Boletines para imprimir: vista previa hoja por hoja (carta) y «Imprimir», que abre el
 * cuadro del navegador (ahí también se puede «Guardar como PDF»). Al imprimir solo
 * salen las hojas (ver @page boletin en app.css).
 */
export default function ImprimirBoletines({ titulo, volver, periodo, grupo, estudiantes, sinTexto }: Props) {
    const n = estudiantes.length;
    const hojas = useMemo(() => estudiantes.reduce((s, e) => s + paginar(e.nombres_apellidos, e.texto).paginas.length, 0), [estudiantes]);
    const periodoCorto = periodo.charAt(0) + periodo.slice(1).toLowerCase();

    return (
        <>
            {/* El título es el nombre que propone el navegador para el PDF. */}
            <Head title={`Boletines · ${titulo} · ${periodoCorto}`} />

            <div className="min-h-screen bg-[#DDE3EE] font-sans text-[#16223F] print:bg-white">
                <div className="sticky top-0 z-20 border-b border-[#E3E9F6] bg-white/90 backdrop-blur print:hidden">
                    <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 md:px-8">
                        <Link
                            href={volver}
                            aria-label="Volver"
                            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full pr-3.5 pl-2.5 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                        >
                            <ArrowLeft className="size-4" />
                            <span className="hidden sm:inline">Volver</span>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em]">
                                {n === 1 ? 'Boletín' : 'Boletines'} · {titulo}
                            </h1>
                            <p className="truncate text-[12.5px] text-[#56627F]">
                                {periodoCorto} · {n === 1 ? '1 boletín' : `${n} boletines`} · {hojas === 1 ? '1 hoja' : `${hojas} hojas`} carta
                            </p>
                        </div>
                        <button type="button" onClick={() => window.print()} disabled={n === 0} className={`${botonPrimario} ml-auto shrink-0`}>
                            <Printer className="size-[18px]" />
                            Imprimir
                        </button>
                    </div>
                    {sinTexto > 0 && (
                        <p className="flex items-center justify-center gap-2 border-t border-[#F1E3C4] bg-[#FFF8E8] px-4 py-2 text-center text-[13px] text-[#6B4E12]">
                            <CircleAlert className="size-4 shrink-0" />
                            {sinTexto === 1 ? '1 estudiante aún no tiene texto: no sale.' : `${sinTexto} estudiantes aún no tienen texto: no salen.`}
                        </p>
                    )}
                </div>

                <main className="flex flex-col [align-items:safe_center] gap-6 overflow-x-auto px-4 py-8 print:block print:overflow-visible print:p-0">
                    {n === 0 ? (
                        <p className="mt-16 text-[15px] text-[#56627F]">Todavía no hay boletines escritos en este grupo para este periodo.</p>
                    ) : (
                        estudiantes.map((e) => (
                            <div key={e.matricula_id} className="contents">
                                <HojasBoletin grupo={grupo} estudiante={e} periodo={periodo} />
                            </div>
                        ))
                    )}
                </main>
            </div>
        </>
    );
}
