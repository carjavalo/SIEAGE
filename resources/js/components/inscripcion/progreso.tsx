import { PASOS } from '@/lib/inscripcion';
import { cn } from '@/lib/utils';
import { Check, ShieldCheck } from 'lucide-react';

/** Logo + nombre, igual que en el login. */
export function Marca({ compacta }: { compacta?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <img src="/logo-escuela.jpg" alt="" className={cn('rounded-xl object-cover', compacta ? 'size-9' : 'size-11')} />
            <div className="leading-tight">
                <p className={cn('font-semibold tracking-tight', compacta ? 'text-base' : 'text-xl')}>SIEAGE</p>
                <p className="text-[13px] text-[#55706A]">I.E. Alfonso López Pumarejo · Cali</p>
            </div>
        </div>
    );
}

type ProgresoProps = {
    anio: number;
    /** -1 = bienvenida, 0..PASOS.length-1 = pasos, PASOS.length = enviado. */
    actual: number;
    /** El paso más lejano al que ya llegó: hasta ahí se puede saltar. */
    alcanzado: number;
    onIr: (paso: number) => void;
};

export function PanelLateral({ anio, actual, alcanzado, onIr }: ProgresoProps) {
    const enviado = actual >= PASOS.length;

    return (
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] flex-col justify-between overflow-y-auto rounded-[32px] bg-[#F2FBF7] p-10 lg:flex xl:p-12">
            <Marca />

            {/* En pantallas bajas (laptops de 768 px) todo se compacta para no necesitar scroll. */}
            <div className="py-10 [@media(max-height:820px)]:py-6">
                <p className="text-[13px] font-medium text-[#55706A]">Inscripción · Año lectivo {anio}</p>
                <p className="mt-3 max-w-sm text-[38px] leading-[1.08] font-semibold tracking-[-0.03em] xl:text-[42px] [@media(max-height:680px)]:hidden [@media(max-height:820px)]:text-[30px]">
                    Tu lugar en el colegio empieza aquí.
                </p>

                <ol className="mt-10 [@media(max-height:820px)]:mt-7">
                    {PASOS.map((paso, i) => {
                        const hecho = actual > i;
                        const esActual = actual === i;
                        const puedeIr = !enviado && !esActual && i <= alcanzado;
                        const Icono = paso.icono;

                        return (
                            <li key={paso.corto} className="relative pb-6 last:pb-0 [@media(max-height:820px)]:pb-4">
                                {i < PASOS.length - 1 && (
                                    <span aria-hidden className="absolute top-11 bottom-1 left-[19px] w-[2px] overflow-hidden rounded-full bg-[#D5E8E0]">
                                        <span
                                            className={cn(
                                                'block w-full rounded-full bg-[#1F7A5C] transition-[height] duration-500 ease-out',
                                                hecho ? 'h-full' : 'h-0',
                                            )}
                                        />
                                    </span>
                                )}
                                <button
                                    type="button"
                                    disabled={!puedeIr}
                                    onClick={() => onIr(i)}
                                    aria-current={esActual ? 'step' : undefined}
                                    className="group flex w-full items-center gap-4 rounded-2xl text-left focus-visible:ring-4 focus-visible:ring-[#DDF4EA] focus-visible:outline-none disabled:cursor-default"
                                >
                                    <span
                                        className={cn(
                                            'flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                                            hecho && 'bg-[#1F7A5C] text-white',
                                            esActual && 'scale-105 bg-white text-[#1F7A5C] shadow-[0_6px_18px_-6px_rgba(31,122,92,0.45)] ring-2 ring-[#1F7A5C]',
                                            !hecho && !esActual && 'bg-white text-[#8AA39C] ring-1 ring-[#D5E8E0]',
                                            puedeIr && 'group-hover:scale-105',
                                        )}
                                    >
                                        {hecho ? <Check className="size-[18px]" strokeWidth={2.5} /> : <Icono className="size-[18px]" />}
                                    </span>
                                    <span className="leading-tight">
                                        <span className={cn('block text-[15px] font-medium', !hecho && !esActual && 'text-[#55706A]')}>{paso.corto}</span>
                                        <span className="text-[13px] text-[#8AA39C]">{hecho ? 'Listo' : esActual ? 'En curso' : `Paso ${i + 1}`}</span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <p className="flex items-center gap-2 text-[13px] text-[#55706A]">
                <ShieldCheck className="size-4 shrink-0 text-[#1F7A5C]" />
                Tus datos se usan solo para el proceso de matrícula.
            </p>
        </aside>
    );
}

/** En celular el panel lateral no cabe: una barra fija con el avance. */
export function BarraMovil({ actual }: Pick<ProgresoProps, 'actual'>) {
    const enPasos = actual >= 0 && actual < PASOS.length;
    const avance = actual >= PASOS.length ? 100 : ((actual + 1) / PASOS.length) * 100;

    return (
        <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-[#E4F1EC] bg-white/90 px-4 pt-4 pb-3 backdrop-blur-md lg:hidden">
            <div className="flex items-center justify-between gap-3">
                <Marca compacta />
                {enPasos && (
                    <p className="text-[13px] font-medium text-[#55706A]">
                        {actual + 1} de {PASOS.length}
                    </p>
                )}
            </div>
            {actual >= 0 && (
                <div
                    role="progressbar"
                    aria-label="Avance de la inscripción"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(avance)}
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E4F1EC]"
                >
                    <div className="h-full rounded-full bg-[#1F7A5C] transition-[width] duration-500 ease-out" style={{ width: `${avance}%` }} />
                </div>
            )}
        </div>
    );
}
