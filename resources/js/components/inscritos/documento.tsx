import { type EstadoDocumento, type Requisito } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

/** Un documento: la fila entera marca el chulo; los que pueden no corresponder traen "No aplica". */
export function Documento({
    requisito: r,
    estado,
    onCambio,
}: {
    requisito: Requisito;
    estado: EstadoDocumento | undefined;
    onCambio: (v: EstadoDocumento | undefined) => void;
}) {
    const entregado = estado === 'entregado';
    const noAplica = estado === 'no_aplica';

    return (
        <li
            className={cn(
                'flex items-center gap-2 rounded-[20px] pr-2 transition-colors duration-200',
                entregado ? 'bg-white shadow-[0_1px_2px_rgba(22,34,63,0.05)]' : 'hover:bg-white/60',
            )}
        >
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 py-3.5 pl-4">
                <input
                    type="checkbox"
                    checked={entregado}
                    onChange={(e) => onCambio(e.target.checked ? 'entregado' : undefined)}
                    className="peer sr-only"
                />
                <span
                    aria-hidden
                    className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-[9px] transition duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-[#B7C6EA]',
                        entregado
                            ? 'bg-[#1E3A7B] text-white'
                            : noAplica
                              ? 'bg-[#E3E9F6] text-[#5E6983]'
                              : 'bg-white ring-[1.5px] ring-[#C4D2F1] ring-inset',
                    )}
                >
                    {entregado && <Check className="animate-in zoom-in-50 size-4 duration-200 motion-reduce:animate-none" strokeWidth={3} />}
                    {noAplica && <Minus className="size-4" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                    <span className={cn('block text-[15px] leading-snug font-medium', noAplica ? 'text-[#56627F]' : 'text-[#16223F]')}>
                        {r.nombre}
                    </span>
                    {(r.ayuda || noAplica) && (
                        <span className="mt-0.5 block text-[13px] leading-snug text-[#5E6983]">
                            {noAplica ? 'No aplica para este estudiante.' : r.ayuda}
                        </span>
                    )}
                </span>
            </label>
            {r.noAplica && (
                <button
                    type="button"
                    aria-pressed={noAplica}
                    onClick={() => onCambio(noAplica ? undefined : 'no_aplica')}
                    className={cn(
                        'h-8 shrink-0 cursor-pointer rounded-full px-3 text-[13px] font-medium transition focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none',
                        noAplica ? 'bg-[#1E3A7B] text-white hover:bg-[#172E63]' : 'text-[#56627F] ring-1 ring-[#D3DDF3] ring-inset hover:bg-white',
                    )}
                >
                    No aplica
                </button>
            )}
        </li>
    );
}
