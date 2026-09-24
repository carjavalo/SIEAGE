import { PuntoSede, sedeInfo } from '@/components/estudiantes/etiquetas';
import { type Estudiante, type Grupo, directorCorto } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { Fragment, type ReactNode, useEffect, useRef } from 'react';

type Props = {
    grupos: Grupo[];
    estudiantes: Estudiante[];
    grupoId: number | null;
    onElegir: (id: number | null) => void;
    anio: number;
};

const alto = '[@media(min-height:860px)]';
export const tarjetaBase = `group/t relative flex min-w-[150px] flex-1 basis-0 snap-start cursor-pointer flex-col rounded-[18px] px-3.5 pt-2 pb-2 text-left transition duration-200 @container focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:ring-offset-2 focus-visible:outline-none ${alto}:rounded-[20px] ${alto}:px-4 ${alto}:pt-2.5 ${alto}:pb-3`;
export const tonoElegido = 'bg-[#1E3A7B] text-white shadow-[0_18px_32px_-18px_rgba(30,58,123,0.9)]';
export const tonoNormal =
    'bg-white text-[#16223F] shadow-[0_1px_2px_rgba(22,34,63,0.06),0_10px_24px_-18px_rgba(22,34,63,0.35)] ring-1 ring-[#E3E9F6] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(22,34,63,0.06),0_16px_28px_-16px_rgba(22,34,63,0.35)] hover:ring-[#C4D2F1]';
export const rotuloBase = 'flex h-[18px] min-w-0 items-center gap-2 text-[13px] leading-[18px] whitespace-nowrap';
export const Regla = () => <span aria-hidden className="h-px min-w-3 flex-1 bg-[#C4D2F1]" />;
const Punto = () => (
    <span aria-hidden className="-mx-0.5 text-[#8C97B3]">
        ·
    </span>
);
const Cifra = ({ children }: { children: ReactNode }) => <b className="font-semibold text-[#16223F] tabular-nums">{children}</b>;

const suma = (lista: Grupo[], clave: 'activos' | 'cupos' | 'nuevos') => lista.reduce((s, g) => s + g[clave], 0);

/** Segunda franja: los grupos del grado como tarjetas; pulsar una filtra la lista. */
export function TableroGrupos({ grupos, estudiantes, grupoId, onElegir, anio }: Props) {
    const tablero = useRef<HTMLElement>(null);

    // Si las tarjetas no caben, se desplazan en horizontal con un desvanecido al borde.
    useEffect(() => {
        const t = tablero.current;
        if (!t) return;
        const medir = () => (t.dataset.desborda = String(t.scrollWidth > t.clientWidth + 1));
        const observador = new ResizeObserver(medir);
        observador.observe(t);
        medir();
        return () => observador.disconnect();
    }, [grupos]);

    if (!grupos.length) {
        return (
            <section ref={tablero} aria-label="Grupos del grado" className={`relative mt-1.5 shrink-0 ${alto}:mt-4`}>
                <p className={cn(rotuloBase, 'text-[#56627F]')}>
                    Sin grupos registrados en {anio}
                    <Regla />
                </p>
            </section>
        );
    }

    const jornadas = [...new Set(grupos.map((g) => g.jornada))];
    const conJornada = jornadas.length > 1; // la jornada va en cada tarjeta solo si el grado mezcla jornadas
    const bloques: { codigo: string; nombre: string; grupos: Grupo[] }[] = [];
    for (const g of grupos) {
        const b = bloques.find((k) => k.codigo === g.sede_codigo);
        if (b) b.grupos.push(g);
        else bloques.push({ codigo: g.sede_codigo, nombre: g.sede, grupos: [g] });
    }
    const variasSedes = bloques.length > 1;

    const porJornada = jornadas.map((j, i) => (
        <Fragment key={j}>
            {i > 0 && ' · '}
            {j.toLowerCase()}{' '}
            <Cifra>
                {suma(
                    grupos.filter((g) => g.jornada === j),
                    'activos',
                )}
            </Cifra>
        </Fragment>
    ));
    let orden = 0;

    return (
        <section
            ref={tablero}
            aria-label="Grupos del grado"
            data-desborda="false"
            className={`relative mt-1.5 flex shrink-0 snap-x gap-5 overflow-x-auto pb-1 [scrollbar-width:none] data-[desborda=true]:[mask-image:linear-gradient(to_right,#000_calc(100%-56px),transparent)] ${alto}:mt-4 ${alto}:gap-6`}
        >
            {bloques.map((b, k) => (
                <div key={b.codigo} className={`flex min-w-0 flex-col gap-1.5 ${alto}:gap-2`} style={{ flex: `${b.grupos.length} 1 0%` }}>
                    <p className={rotuloBase}>
                        <PuntoSede codigo={b.codigo} />
                        {variasSedes ? (
                            <>
                                <span className="min-w-0 truncate font-medium text-[#3E4A68]" title={b.nombre}>
                                    {sedeInfo(b.codigo).corto}
                                </span>
                                <Punto />
                                <span className="shrink-0 text-[#56627F] tabular-nums">{suma(b.grupos, 'activos')} activos</span>
                                <Regla />
                                {/* Con varias sedes, la jornada es de todo el grado: se rotula para no confundirla con la última sede. */}
                                {k === bloques.length - 1 && (
                                    <span className="min-w-0 truncate text-[#56627F]" title="Activos por jornada en todo el grado">
                                        <span className="text-[#3E4A68]">Todo el grado:</span> {conJornada ? porJornada : jornadas[0].toLowerCase()}
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="font-medium text-[#3E4A68]">Sede {b.nombre}</span>
                                <Punto />
                                {conJornada ? (
                                    <span className="min-w-0 truncate text-[#56627F]" title="Activos por jornada">
                                        {porJornada}
                                    </span>
                                ) : (
                                    <span className="shrink-0 text-[#56627F]">jornada de la {jornadas[0].toLowerCase()}</span>
                                )}
                                <Punto />
                                <span className="text-[#56627F]">{grupos.length} grupos</span>
                                <Regla />
                                <RepartoModalidad estudiantes={estudiantes} />
                            </>
                        )}
                    </p>
                    <div className={`flex gap-2.5 ${alto}:gap-3`}>
                        {b.grupos.map((g) => (
                            <Tarjeta
                                key={g.id}
                                grupo={g}
                                elegido={g.id === grupoId}
                                conJornada={conJornada}
                                retraso={40 + orden++ * 30}
                                onClick={() => onElegir(g.id === grupoId ? null : g.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}

function Tarjeta({
    grupo: g,
    elegido,
    conJornada,
    retraso,
    onClick,
}: {
    grupo: Grupo;
    elegido: boolean;
    conJornada: boolean;
    retraso: number;
    onClick: () => void;
}) {
    const exceso = g.activos > g.cupos;
    const director = g.director ?? 'Sin director asignado';
    const corto = directorCorto(director);
    const nuevos = g.nuevos === g.activos ? 'todos nuevos' : `${g.nuevos} nuevo${g.nuevos === 1 ? '' : 's'}`;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={elegido}
            aria-label={`Grupo ${g.codigo}, ${g.sede}, jornada ${g.jornada}: ${g.activos} de ${g.cupos} cupos, ${nuevos}. Director ${director}`}
            title={`${g.codigo} · ${g.sede} · ${g.jornada}\n${g.activos} de ${g.cupos} cupos · ${nuevos}\nDirector: ${director}`}
            style={{ animationDelay: `${retraso}ms` }}
            className={cn(
                tarjetaBase,
                'animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-[420ms] ease-out motion-reduce:animate-none',
                elegido ? tonoElegido : tonoNormal,
            )}
        >
            <span className="flex items-baseline gap-2">
                <span
                    className={`text-[20px] leading-[22px] font-semibold tracking-[-0.02em] whitespace-nowrap ${alto}:text-[22px] ${alto}:leading-6`}
                >
                    {g.codigo}
                </span>
                {conJornada && (
                    <span
                        className={cn(
                            'truncate text-[13px]',
                            elegido ? 'text-white/80' : g.jornada === 'Tarde' ? 'font-medium text-[#8A5A0B]' : 'text-[#56627F]',
                        )}
                    >
                        {g.jornada}
                    </span>
                )}
                <span className={cn('ml-auto shrink-0 text-[13px] tabular-nums', elegido ? 'text-white/65' : 'text-[#56627F]')}>
                    <b
                        className={cn(
                            'text-[16px] font-semibold',
                            exceso ? (elegido ? 'text-[#FFB4B4]' : 'text-[#B42318]') : elegido ? 'text-white' : 'text-[#16223F]',
                        )}
                    >
                        {g.activos}
                    </b>
                    /{g.cupos}
                </span>
            </span>
            <Barra grupo={g} elegido={elegido} />
            <span className={`mt-1 flex min-w-0 items-baseline gap-2 text-[13px] leading-[18px] ${alto}:mt-2`}>
                <span className={cn('min-w-0 truncate', elegido ? 'text-white/90' : 'text-[#3E4A68]')}>
                    <span className={elegido ? 'text-white/60' : 'text-[#6B7690]'}>Dir.</span>{' '}
                    {corto === director ? (
                        director
                    ) : (
                        <>
                            <span className="@min-[230px]:hidden">{corto}</span>
                            <span className="hidden @min-[230px]:inline">{director}</span>
                        </>
                    )}
                </span>
                {g.nuevos > 0 && g.nuevos !== g.activos && (
                    <span className={cn('ml-auto hidden shrink-0 tabular-nums @min-[230px]:inline', elegido ? 'text-white/70' : 'text-[#56627F]')}>
                        {nuevos}
                    </span>
                )}
            </span>
            {exceso && (
                <span className="absolute -top-2 right-3 rounded-full bg-[#B42318] px-2 py-0.5 text-[12px] leading-4 font-semibold text-white shadow-sm">
                    +{g.activos - g.cupos} sobre el cupo
                </span>
            )}
        </button>
    );
}

/** Ocupación: tramo fuerte = antiguos y repitentes; tramo claro = nuevos (si no son todos nuevos). */
export function Barra({ grupo: g, elegido, className }: { grupo: Grupo; elegido: boolean; className?: string }) {
    const exceso = g.activos > g.cupos;
    const total = Math.max(g.cupos, g.activos, 1);
    const partir = g.nuevos > 0 && g.nuevos < g.activos && !exceso;
    const fuerte = ((partir ? g.activos - g.nuevos : g.activos) / total) * 100;
    const claro = partir ? (g.nuevos / total) * 100 : 0;

    return (
        <div
            aria-hidden
            className={cn(
                `mt-1 flex h-[5px] overflow-hidden rounded-full ${alto}:mt-2 ${alto}:h-1.5`,
                elegido ? 'bg-white/15' : 'bg-[#E9EEF8]',
                className,
            )}
        >
            <div
                className={cn('h-full', exceso ? (elegido ? 'bg-[#FF9C9C]' : 'bg-[#D05454]') : elegido ? 'bg-white' : 'bg-[#4F6FC6]')}
                style={{ width: `${fuerte}%` }}
            />
            {claro > 0 && <div className={cn('h-full', elegido ? 'bg-white/45' : 'bg-[#B3C4EE]')} style={{ width: `${claro}%` }} />}
        </div>
    );
}

/** Activos por modalidad (media técnica): tres valores y "+N"; el resto va en el title. */
function RepartoModalidad({ estudiantes }: { estudiantes: Estudiante[] }) {
    const activos = estudiantes.filter((e) => e.estado === 'activo');
    if (!activos.some((e) => e.modalidad)) return null;
    const conteo = new Map<string, number>();
    for (const e of activos) conteo.set(e.modalidad ?? 'Sin modalidad', (conteo.get(e.modalidad ?? 'Sin modalidad') ?? 0) + 1);
    const filas = [...conteo.entries()].sort((a, b) => Number(a[0] === 'Sin modalidad') - Number(b[0] === 'Sin modalidad') || b[1] - a[1]);

    return (
        <span
            className="flex min-w-0 items-baseline gap-2 overflow-hidden text-[#56627F]"
            title={`Activos por modalidad: ${filas.map(([k, v]) => `${k} ${v}`).join(', ')}`}
        >
            <span className="shrink-0">Activos por modalidad</span>
            {filas.slice(0, 3).map(([k, v], i) => (
                <Fragment key={k}>
                    {i > 0 && (
                        <span aria-hidden className="text-[#8C97B3]">
                            ·
                        </span>
                    )}
                    <span className="shrink-0 text-[#3E4A68]">
                        {k} <Cifra>{v}</Cifra>
                    </span>
                </Fragment>
            ))}
            {filas.length > 3 && (
                <>
                    <span aria-hidden className="text-[#8C97B3]">
                        ·
                    </span>
                    <span className="shrink-0 font-medium text-[#3E4A68]">+{filas.length - 3}</span>
                </>
            )}
        </span>
    );
}
