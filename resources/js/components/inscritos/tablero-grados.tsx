import { Regla, rotuloBase, tarjetaBase, tonoElegido, tonoNormal } from '@/components/estudiantes/tablero-grupos';
import { gradoCorto } from '@/lib/estudiantes';
import { type InscritoFila } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef } from 'react';

const alto = '[@media(min-height:860px)]';

type Resumen = { id: number; numero: number; nombre: string; total: number; completos: number; uno: number };

/** Segunda franja: a qué grados entran los inscritos y cuántos ya tienen madre y padre; pulsar uno filtra la lista. */
export function TableroGrados({
    inscritos,
    gradoId,
    onElegir,
}: {
    inscritos: InscritoFila[];
    gradoId: number | null;
    onElegir: (id: number | null) => void;
}) {
    const tablero = useRef<HTMLDivElement>(null);

    const grados = useMemo(() => {
        const porGrado = new Map<number, Resumen>();
        for (const i of inscritos) {
            const g = porGrado.get(i.grado_id) ?? { id: i.grado_id, numero: i.grado_numero, nombre: i.grado, total: 0, completos: 0, uno: 0 };
            g.total++;
            if (i.padres.length === 2) g.completos++;
            else if (i.padres.length === 1) g.uno++;
            porGrado.set(i.grado_id, g);
        }
        return [...porGrado.values()].sort((a, b) => a.numero - b.numero);
    }, [inscritos]);

    // Si las tarjetas no caben, se desplazan en horizontal con un desvanecido al borde.
    useEffect(() => {
        const t = tablero.current;
        if (!t) return;
        const medir = () => (t.dataset.desborda = String(t.scrollWidth > t.clientWidth + 1));
        const observador = new ResizeObserver(medir);
        observador.observe(t);
        medir();
        return () => observador.disconnect();
    }, [grados]);

    const completos = grados.reduce((s, g) => s + g.completos, 0);
    // Sin inscritos, la lista ya lo dice: el tablero no repite el mensaje.
    if (!grados.length) return <div className={`mt-1.5 ${alto}:mt-4`} />;

    return (
        <section aria-label="Inscritos por grado" className={`relative mt-1.5 flex shrink-0 flex-col gap-1.5 ${alto}:mt-4 ${alto}:gap-2`}>
            <p className={rotuloBase}>
                <span className="font-medium text-[#3E4A68]">Por grado al que ingresan</span>
                <Regla />
                <span className="flex shrink-0 items-center gap-3 text-[#56627F]">
                    <span className="inline-flex items-center gap-1.5">
                        <span aria-hidden className="inline-block size-2 rounded-[2px] bg-[#4F6FC6]" />
                        con madre y padre <b className="font-semibold text-[#16223F] tabular-nums">{completos}</b>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span aria-hidden className="inline-block size-2 rounded-[2px] bg-[#B3C4EE]" />
                        solo uno
                    </span>
                </span>
            </p>
            <div
                ref={tablero}
                data-desborda="false"
                className={`flex snap-x gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] data-[desborda=true]:[mask-image:linear-gradient(to_right,#000_calc(100%-56px),transparent)] ${alto}:gap-3`}
            >
                {grados.map((g, i) => (
                    <Tarjeta
                        key={g.id}
                        grado={g}
                        elegido={g.id === gradoId}
                        retraso={40 + i * 30}
                        onClick={() => onElegir(g.id === gradoId ? null : g.id)}
                    />
                ))}
            </div>
        </section>
    );
}

function Tarjeta({ grado: g, elegido, retraso, onClick }: { grado: Resumen; elegido: boolean; retraso: number; onClick: () => void }) {
    const faltan = g.total - g.completos;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={elegido}
            aria-label={`${g.nombre}: ${g.total} inscritos, ${g.completos} con madre y padre`}
            style={{ animationDelay: `${retraso}ms` }}
            className={cn(
                tarjetaBase,
                // Con pocos grados, las tarjetas no se estiran de lado a lado.
                'animate-in fade-in slide-in-from-bottom-2 fill-mode-both max-w-[300px] duration-[420ms] ease-out motion-reduce:animate-none',
                elegido ? tonoElegido : tonoNormal,
            )}
        >
            <span className="flex items-baseline gap-2">
                <span
                    className={`text-[20px] leading-[22px] font-semibold tracking-[-0.02em] whitespace-nowrap ${alto}:text-[22px] ${alto}:leading-6`}
                >
                    {gradoCorto(g)}
                </span>
                {/* El nombre solo si la tarjeta es ancha; "Tr", "1°"… ya lo dicen. */}
                <span className={cn('hidden truncate text-[13px] @min-[210px]:inline', elegido ? 'text-white/80' : 'text-[#56627F]')}>
                    {g.nombre}
                </span>
                <span className={cn('ml-auto shrink-0 text-[13px] tabular-nums', elegido ? 'text-white/70' : 'text-[#56627F]')}>
                    <b className={cn('text-[16px] font-semibold', elegido ? 'text-white' : 'text-[#16223F]')}>{g.total}</b> inscrito
                    {g.total === 1 ? '' : 's'}
                </span>
            </span>
            <div
                aria-hidden
                className={cn(`mt-1 flex h-[5px] overflow-hidden rounded-full ${alto}:mt-2 ${alto}:h-1.5`, elegido ? 'bg-white/15' : 'bg-[#E9EEF8]')}
            >
                <div className={cn('h-full', elegido ? 'bg-white' : 'bg-[#4F6FC6]')} style={{ width: `${(g.completos / g.total) * 100}%` }} />
                <div className={cn('h-full', elegido ? 'bg-white/45' : 'bg-[#B3C4EE]')} style={{ width: `${(g.uno / g.total) * 100}%` }} />
            </div>
            <span className={cn(`mt-1 truncate text-[13px] leading-[18px] ${alto}:mt-2`, elegido ? 'text-white/90' : 'text-[#3E4A68]')}>
                {faltan === 0 ? 'Todos completos' : `Faltan padres en ${faltan}`}
            </span>
        </button>
    );
}
