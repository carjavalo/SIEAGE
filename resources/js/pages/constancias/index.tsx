import { type Constancia, HojaConstancia, type Institucion, type Papel } from '@/components/constancia';
import { botonPrimario } from '@/components/formulario';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useState } from 'react';

type Props = { titulo: string; volver: string; constancias: Constancia[]; institucion: Institucion };

const GUARDADO = 'constancias.papel';

function papelGuardado(): Papel {
    try {
        return localStorage.getItem(GUARDADO) === 'oficio' ? 'oficio' : 'carta';
    } catch {
        return 'carta';
    }
}

/**
 * Constancias de matrícula: vista previa hoja por hoja y «Imprimir», que abre el cuadro del
 * navegador (ahí también se puede elegir «Guardar como PDF»). Una hoja por estudiante con
 * dos copias; al imprimir solo salen las hojas (ver @page constancia-* en app.css).
 */
export default function Constancias({ titulo, volver, constancias, institucion }: Props) {
    const [papel, setPapel] = useState<Papel>(papelGuardado);
    const elegir = (p: Papel) => {
        setPapel(p);
        try {
            localStorage.setItem(GUARDADO, p);
        } catch {
            // Sin almacenamiento, solo no se recuerda para la próxima vez.
        }
    };
    const n = constancias.length;

    return (
        <>
            {/* El título es el nombre que propone el navegador para el PDF. */}
            <Head title={`Constancias · ${titulo}`}>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Serif:opsz,wght@8..144,600..700&display=swap" />
            </Head>

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
                                {n === 1 ? 'Constancia de matrícula' : 'Constancias de matrícula'}
                            </h1>
                            <p className="truncate text-[12.5px] text-[#56627F]">
                                {titulo} · {n === 1 ? '1 hoja' : `${n.toLocaleString('es-CO')} hojas`}, dos copias en cada una
                            </p>
                        </div>

                        <div className="ml-auto flex shrink-0 items-center gap-2">
                            <div role="radiogroup" aria-label="Tamaño del papel" className="flex h-9 items-center rounded-full bg-[#EEF2FB] p-1">
                                {(['carta', 'oficio'] as const).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        role="radio"
                                        aria-checked={papel === p}
                                        onClick={() => elegir(p)}
                                        className={cn(
                                            'h-7 cursor-pointer rounded-full px-3 text-[13px] font-semibold capitalize transition focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none',
                                            papel === p
                                                ? 'bg-white text-[#1E3A7B] shadow-[0_1px_2px_rgba(22,34,63,0.12)]'
                                                : 'text-[#56627F] hover:text-[#16223F]',
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button type="button" onClick={() => window.print()} disabled={n === 0} className={botonPrimario}>
                                <Printer className="size-[18px]" />
                                Imprimir
                            </button>
                        </div>
                    </div>
                    {n > 300 && (
                        <p className="border-t border-[#F1E3C4] bg-[#FFF8E8] px-4 py-2 text-center text-[13px] text-[#6B4E12]">
                            Son {n.toLocaleString('es-CO')} hojas: el navegador puede tardar unos minutos en preparar la impresión.
                        </p>
                    )}
                </div>

                <main className="flex flex-col items-center gap-6 overflow-x-auto px-4 py-8 print:block print:overflow-visible print:p-0">
                    {n === 0 ? (
                        <p className="mt-16 text-[15px] text-[#56627F]">No hay estudiantes activos en esta selección.</p>
                    ) : (
                        constancias.map((c) => <HojaConstancia key={c.id} constancia={c} institucion={institucion} papel={papel} />)
                    )}
                </main>
            </div>
        </>
    );
}
