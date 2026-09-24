import { Marca, Resaltado, iniciales } from '@/components/estudiantes/etiquetas';
import { type Grado, type Resultado, gradoCorto, numero, palabras } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Fragment, type RefObject, useEffect, useState } from 'react';

type Props = {
    anios: { id: number; anio: number; estado: string }[];
    anio: number;
    grados: Grado[];
    gradoId: number | null;
    totales: { activos: number; nuevos: number; retirados: number };
    busqueda?: Resultado[];
    entrada: RefObject<HTMLInputElement | null>;
    onElegir: (r: Resultado) => void;
};

const alto = '[@media(min-height:860px)]';

/** Primera franja: título con el año, grados en segmentos y búsqueda en todo el colegio. */
export function Cabecera({ anios, anio, grados, gradoId, totales, busqueda, entrada, onElegir }: Props) {
    const ir = (datos: { anio?: number; grado?: number }) =>
        router.get('/estudiantes', { anio: datos.anio ?? anio, grado: datos.grado ?? gradoId ?? undefined });

    return (
        <section className="relative flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 xl:flex-nowrap">
            <div className="shrink-0">
                <div className="flex items-center gap-2">
                    <h1 className={`text-[24px] leading-[26px] font-semibold tracking-[-0.025em] ${alto}:text-[28px] ${alto}:leading-8`}>
                        Estudiantes
                    </h1>
                    <label className="relative flex items-center" title="Año lectivo">
                        <span className="sr-only">Año lectivo</span>
                        <select
                            value={anio}
                            onChange={(e) => ir({ anio: Number(e.target.value) })}
                            className={`h-[26px] cursor-pointer appearance-none rounded-full bg-white/75 pr-7 pl-2.5 text-[15px] font-semibold text-[#1E3A7B] tabular-nums ring-1 ring-[#D3DDF3] transition outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[#6E8BD6] ${alto}:h-8 ${alto}:text-[16px]`}
                        >
                            {anios.map((a) => (
                                <option key={a.id} value={a.anio}>
                                    {a.anio}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 size-4 text-[#1E3A7B]" />
                    </label>
                </div>
                <dl
                    className={`mt-0.5 flex items-baseline gap-1.5 text-[13px] leading-4 whitespace-nowrap text-[#56627F] ${alto}:mt-1 ${alto}:text-[14px] ${alto}:leading-5`}
                >
                    {[
                        [totales.activos, 'activos'],
                        [totales.nuevos, 'nuevos'],
                        [totales.retirados, 'retirados'],
                    ].map(([n, texto], i) => (
                        <Fragment key={texto}>
                            {i > 0 && (
                                <span aria-hidden className="text-[#8C97B3]">
                                    ·
                                </span>
                            )}
                            <div className="flex items-baseline gap-1">
                                <dt className="sr-only">{texto}</dt>
                                <dd className="font-semibold text-[#16223F] tabular-nums">{numero(Number(n))}</dd>
                                <span aria-hidden>{texto}</span>
                            </div>
                        </Fragment>
                    ))}
                </dl>
            </div>

            <nav
                aria-label="Grados"
                className={`order-last flex h-11 w-full min-w-0 items-stretch gap-0.5 overflow-x-auto rounded-[16px] bg-[#D3DDF3]/45 p-1 ring-1 ring-white/70 [scrollbar-width:none] xl:order-none xl:w-auto xl:flex-1 ${alto}:h-[52px] ${alto}:rounded-[18px]`}
            >
                {grados.map((g, i) => {
                    const actual = g.id === gradoId;
                    return (
                        <Fragment key={g.id}>
                            {i > 0 && g.nivel !== grados[i - 1].nivel && (
                                <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 self-center bg-[#B7C6EA]" />
                            )}
                            <button
                                type="button"
                                onClick={() => !actual && ir({ grado: g.id })}
                                aria-current={actual ? 'page' : undefined}
                                title={`${g.nombre} · ${g.activos} activos · ${g.grupos} grupos`}
                                className={cn(
                                    `flex min-w-[46px] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[12px] leading-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none ${alto}:rounded-[14px]`,
                                    actual
                                        ? 'bg-white text-[#1E3A7B] shadow-[0_1px_3px_rgba(22,34,63,0.14)] ring-1 ring-[#C4D2F1]'
                                        : 'text-[#16223F] hover:bg-white/60',
                                )}
                            >
                                <span className={`text-[15px] font-semibold tracking-[-0.01em] ${alto}:text-[17px]`}>{gradoCorto(g)}</span>
                                <span className={cn('text-[13px] tabular-nums', actual ? 'text-[#5B7BD0]' : 'text-[#56627F]')}>{g.activos}</span>
                            </button>
                        </Fragment>
                    );
                })}
            </nav>

            <BusquedaGlobal grados={grados} busqueda={busqueda} entrada={entrada} onElegir={onElegir} />
        </section>
    );
}

/** Búsqueda por nombre o documento en todo el colegio (la consulta la hace el servidor). */
function BusquedaGlobal({
    grados,
    busqueda,
    entrada,
    onElegir,
}: {
    grados: Grado[];
    busqueda?: Resultado[];
    entrada: RefObject<HTMLInputElement | null>;
    onElegir: (r: Resultado) => void;
}) {
    const [consulta, setConsulta] = useState('');
    const [abierta, setAbierta] = useState(false);
    const [activo, setActivo] = useState(0);
    const hay = consulta.trim().length >= 2;
    const resultados = hay ? (busqueda ?? []) : [];
    const buscadas = palabras(consulta);

    useEffect(() => {
        if (!hay) return;
        const t = setTimeout(() => router.reload({ only: ['busqueda'], data: { q: consulta } }), 250);
        return () => clearTimeout(t);
    }, [consulta, hay]);

    useEffect(() => setActivo(0), [busqueda]);

    const limpiar = () => {
        setConsulta('');
        setAbierta(false);
    };
    const elegir = (r: Resultado | undefined) => {
        if (!r) return;
        limpiar();
        entrada.current?.blur();
        onElegir(r);
    };

    return (
        <div className="relative ml-auto w-full sm:w-[300px] xl:ml-0 xl:w-[280px] 2xl:w-[340px]" data-busqueda>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[#6B7690]" />
            <input
                ref={entrada}
                type="search"
                autoComplete="off"
                spellCheck={false}
                value={consulta}
                onChange={(e) => {
                    setConsulta(e.target.value);
                    setAbierta(true);
                }}
                onFocus={() => setAbierta(true)}
                onBlur={() => setAbierta(false)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        if (consulta) limpiar();
                        else entrada.current?.blur();
                    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && resultados.length) {
                        e.preventDefault();
                        const paso = e.key === 'ArrowDown' ? 1 : -1;
                        setActivo((i) => (i + paso + resultados.length) % resultados.length);
                    } else if (e.key === 'Enter' && resultados.length) {
                        e.preventDefault();
                        elegir(resultados[activo]);
                    }
                }}
                placeholder="Buscar en todo el colegio…"
                aria-label="Buscar estudiante por nombre o documento en todo el colegio"
                aria-expanded={abierta && hay}
                role="combobox"
                aria-controls="resultados-busqueda"
                className="h-10 w-full rounded-[14px] border-[1.5px] border-[#D3DDF3] bg-white pr-10 pl-10 text-[15px] text-[#16223F] shadow-[0_1px_2px_rgba(22,34,63,0.05)] transition outline-none placeholder:text-[#8C97B3] hover:border-[#B7C6EA] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] [&::-webkit-search-cancel-button]:hidden [@media(min-height:860px)]:h-11"
            />
            {consulta ? (
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        limpiar();
                        entrada.current?.focus();
                    }}
                    aria-label="Limpiar búsqueda"
                    className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#56627F] hover:bg-[#EEF2FB] hover:text-[#16223F]"
                >
                    <X className="size-4" />
                </button>
            ) : (
                <kbd
                    title="Atajo: /"
                    className="pointer-events-none absolute top-1/2 right-3 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-md border border-[#D3DDF3] bg-[#F5F7FC] px-1.5 font-sans text-[12px] text-[#56627F]"
                >
                    /
                </kbd>
            )}

            {abierta && hay && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-50 w-full overflow-hidden rounded-[18px] border border-[#E3E9F6] bg-white shadow-[0_24px_48px_-16px_rgba(22,34,63,0.28)] lg:w-[440px]">
                    {busqueda === undefined ? (
                        <p className="px-4 py-4 text-sm text-[#56627F]">Buscando…</p>
                    ) : resultados.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-[#56627F]">Sin resultados para «{consulta.trim()}».</p>
                    ) : (
                        <>
                            <ul
                                id="resultados-busqueda"
                                role="listbox"
                                aria-label="Resultados de la búsqueda"
                                className="max-h-[360px] overflow-y-auto p-1.5"
                            >
                                {resultados.map((r, i) => (
                                    <li
                                        key={r.id}
                                        role="option"
                                        aria-selected={i === activo}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // que el campo no pierda el foco antes de elegir
                                            elegir(r);
                                        }}
                                        onMouseMove={() => i !== activo && setActivo(i)}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2',
                                            i === activo ? 'bg-[#EEF2FB]' : 'hover:bg-[#F5F7FC]',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                                                i === activo ? 'bg-[#1E3A7B] text-white' : 'bg-[#EEF2FB] text-[#1E3A7B]',
                                            )}
                                        >
                                            {iniciales(r.nombre)}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[14px] text-[#16223F]">
                                                <Resaltado texto={r.nombre} buscadas={buscadas} />
                                            </span>
                                            <span className="block text-[13px] text-[#56627F] tabular-nums">
                                                {r.tipo_documento} <Resaltado texto={r.numero_documento} buscadas={buscadas} />
                                            </span>
                                        </span>
                                        <span className="flex shrink-0 flex-col items-end text-[13px]">
                                            <span className="font-semibold text-[#1E3A7B]">{r.grupo ?? '—'}</span>
                                            {r.estado && r.estado !== 'activo' ? (
                                                <Marca valor={r.estado} />
                                            ) : (
                                                <span className="text-[#56627F]">
                                                    {grados.find((g) => g.id === r.grado_id)?.nombre ?? 'Sin matrícula este año'}
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="flex items-center gap-3 border-t border-[#EEF2F9] bg-[#FAFBFE] px-4 py-2 text-[12px] text-[#56627F]">
                                <span>
                                    <kbd className="font-sans">↑ ↓</kbd> moverse
                                </span>
                                <span>
                                    <kbd className="font-sans">Enter</kbd> abrir ficha
                                </span>
                                <span>
                                    <kbd className="font-sans">Esc</kbd> cerrar
                                </span>
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
