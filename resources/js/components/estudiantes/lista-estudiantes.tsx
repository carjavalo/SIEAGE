import { Marca, PuntoSede, Resaltado, sedeInfo } from '@/components/estudiantes/etiquetas';
import { type Estudiante, type FiltroEstado, type Grado, type Grupo, telefono } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { ChevronRight, ListFilter, X } from 'lucide-react';
import { type ReactNode, type RefObject, memo, useMemo } from 'react';

const alto = '[@media(min-height:860px)]';

type Columnas = { sede: boolean; jornada: boolean; modalidad: boolean; todosNuevos: boolean };

type Props = {
    grado: Grado | undefined;
    grupos: Grupo[];
    grupo: Grupo | undefined;
    estado: FiltroEstado;
    conteos: Record<FiltroEstado, number>;
    filtro: string;
    buscadas: string[];
    total: number;
    filas: Estudiante[];
    columnas: Columnas;
    seleccion: number | null;
    lista: RefObject<HTMLDivElement | null>;
    campoFiltro: RefObject<HTMLInputElement | null>;
    onEstado: (e: FiltroEstado) => void;
    onFiltro: (texto: string) => void;
    onQuitarGrupo: () => void;
    onQuitarFiltros: () => void;
    onFila: (id: number) => void;
};

const opcionesEstado: { clave: FiltroEstado; nombre: string; titulo?: string }[] = [
    { clave: 'activo', nombre: 'Activos' },
    { clave: 'inactivo', nombre: 'Retirados', titulo: 'Retirados, cancelados y trasladados' },
    { clave: 'todos', nombre: 'Todos' },
];

const suma = (lista: Grupo[], clave: 'activos' | 'cupos' | 'nuevos') => lista.reduce((s, g) => s + g[clave], 0);
const Cifra = ({ children, className }: { children: ReactNode; className?: string }) => (
    <b className={cn('font-semibold text-[#16223F] tabular-nums', className)}>{children}</b>
);
const Sep = () => (
    <span aria-hidden className="mx-1 text-[#8C97B3]">
        ·
    </span>
);

/** Tercera franja: la lista del grado (o del grupo elegido) con sus filtros. */
export function ListaEstudiantes(p: Props) {
    const hayTexto = p.buscadas.length > 0;

    return (
        <section
            aria-label="Lista de estudiantes"
            className="flex min-h-[420px] min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#E3E9F6] bg-white shadow-[0_1px_2px_rgba(22,34,63,0.04),0_12px_32px_-20px_rgba(22,34,63,0.18)] lg:min-h-0"
        >
            <div
                className={`flex shrink-0 flex-col gap-2.5 border-b border-[#EEF2F9] px-4 py-2.5 md:h-[42px] md:flex-row md:items-center md:gap-4 md:px-5 md:py-0 ${alto}:md:h-12`}
            >
                <Alcance grado={p.grado} grupos={p.grupos} grupo={p.grupo} onQuitarGrupo={p.onQuitarGrupo} />

                <div role="group" aria-label="Estado" className="flex shrink-0 gap-0.5 rounded-[11px] bg-[#F1F4FA] p-[3px]">
                    {opcionesEstado.map((o) => {
                        const activo = p.estado === o.clave;
                        return (
                            <button
                                key={o.clave}
                                type="button"
                                aria-pressed={activo}
                                title={o.titulo}
                                onClick={() => p.onEstado(o.clave)}
                                className={cn(
                                    'flex h-[30px] cursor-pointer items-center gap-1.5 rounded-[9px] px-2.5 text-sm font-medium whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none',
                                    activo ? 'bg-white text-[#1E3A7B] shadow-[0_1px_3px_rgba(22,34,63,0.12)]' : 'text-[#56627F] hover:text-[#16223F]',
                                )}
                            >
                                {o.nombre}
                                <span className={cn('tabular-nums', activo ? 'text-[#5B7BD0]' : 'text-[#6B7690]')}>{p.conteos[o.clave]}</span>
                            </button>
                        );
                    })}
                </div>

                <p className="ml-auto hidden shrink-0 items-center gap-1.5 text-[12px] text-[#6B7690] xl:flex">
                    <Tecla>↑</Tecla>
                    <Tecla>↓</Tecla>
                    <span>moverse</span>
                    <Tecla className="ml-1.5 px-1">Enter</Tecla>
                    <span>ver ficha</span>
                </p>

                <div className="relative md:ml-auto md:w-[220px] xl:ml-0 2xl:w-[260px]">
                    <ListFilter className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6B7690]" />
                    <input
                        ref={p.campoFiltro}
                        type="search"
                        autoComplete="off"
                        spellCheck={false}
                        value={p.filtro}
                        onChange={(e) => p.onFiltro(e.target.value)}
                        placeholder="Filtrar esta lista"
                        aria-label="Filtrar la lista por nombre, documento o acudiente"
                        aria-describedby="filtro-cuenta"
                        data-filtro
                        className={cn(
                            'h-9 w-full rounded-[12px] border-[1.5px] border-[#E3E9F6] bg-white pl-9 text-sm transition outline-none placeholder:text-[#8C97B3] hover:border-[#D3DDF3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] [&::-webkit-search-cancel-button]:hidden',
                            hayTexto ? 'pr-[84px]' : 'pr-3',
                        )}
                    />
                    <span
                        id="filtro-cuenta"
                        aria-live="polite"
                        className="pointer-events-none absolute top-1/2 right-9 -translate-y-1/2 text-[13px] whitespace-nowrap text-[#56627F] tabular-nums"
                    >
                        {hayTexto && `${p.filas.length} de ${p.total}`}
                    </span>
                    {p.filtro && (
                        <button
                            type="button"
                            onClick={() => {
                                p.onFiltro('');
                                p.campoFiltro.current?.focus();
                            }}
                            aria-label="Quitar el filtro de texto"
                            className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#56627F] hover:bg-[#EEF2FB] hover:text-[#16223F]"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
            </div>

            <div
                ref={p.lista}
                className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]"
            >
                <Tabla filas={p.filas} columnas={p.columnas} seleccion={p.seleccion} buscadas={p.buscadas} onFila={p.onFila} />
                {p.filas.length === 0 &&
                    (p.grupos.length === 0 && p.total === 0 ? (
                        <Vacio titulo={`${p.grado?.nombre ?? 'Este grado'} no tiene estudiantes matriculados este año`} />
                    ) : (
                        <Vacio
                            titulo="Nadie coincide con los filtros"
                            texto={p.filtro ? `No hay resultados para «${p.filtro.trim()}» en esta vista.` : 'Prueba con otro estado o grupo.'}
                            onQuitar={p.onQuitarFiltros}
                        />
                    ))}
            </div>
        </section>
    );
}

/** Qué se está mirando (el grado o un grupo) y sus cifras de cupos. */
function Alcance({
    grado,
    grupos,
    grupo,
    onQuitarGrupo,
}: {
    grado: Grado | undefined;
    grupos: Grupo[];
    grupo: Grupo | undefined;
    onQuitarGrupo: () => void;
}) {
    const nombre = grado?.nombre ?? 'Grado';
    const alcance = grupo ? [grupo] : grupos;
    const activos = suma(alcance, 'activos');
    const cupos = suma(alcance, 'cupos');
    const nuevos = suma(alcance, 'nuevos');
    const libres = cupos - activos;
    const variasSedes = new Set(grupos.map((g) => g.sede_codigo)).size > 1;

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 md:flex-nowrap">
            {grupo ? (
                <>
                    <button
                        type="button"
                        onClick={onQuitarGrupo}
                        title="Ver todo el grado"
                        className="cursor-pointer text-[16px] font-semibold tracking-[-0.01em] whitespace-nowrap text-[#56627F] transition hover:text-[#1E3A7B]"
                    >
                        {nombre}
                    </button>
                    <ChevronRight className="size-4 shrink-0 text-[#8C97B3]" />
                    <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#EEF2FB] pr-1 pl-3 text-[14px] text-[#1E3A7B] ring-1 ring-[#D3DDF3]">
                        <span className="font-semibold">{grupo.codigo}</span>
                        {variasSedes && <span className="text-[#3E4A68]">· {sedeInfo(grupo.sede_codigo).corto}</span>}
                        <button
                            type="button"
                            onClick={onQuitarGrupo}
                            aria-label="Quitar el filtro de grupo y ver todo el grado"
                            title="Ver todo el grado"
                            className="flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-white"
                        >
                            <X className="size-3.5" />
                        </button>
                    </span>
                </>
            ) : (
                <h2 className="text-[16px] font-semibold tracking-[-0.01em] whitespace-nowrap">{nombre}</h2>
            )}
            {alcance.length > 0 && (
                <p className="min-w-0 text-[14px] text-[#56627F] md:truncate">
                    <Cifra>{activos}</Cifra> de {cupos} cupos
                    <Sep />
                    {libres >= 0 ? (
                        <>
                            <Cifra>{libres}</Cifra> libre{libres === 1 ? '' : 's'}
                        </>
                    ) : (
                        <>
                            <Cifra className="text-[#B42318]">{-libres}</Cifra> <span className="text-[#B42318]">sobre el cupo</span>
                        </>
                    )}
                    <Sep />
                    {nuevos === 0 ? (
                        'sin nuevos'
                    ) : nuevos === activos ? (
                        'todos nuevos'
                    ) : (
                        <span className="inline-flex items-baseline gap-1.5">
                            <span
                                aria-hidden
                                className="inline-block size-2 translate-y-[-1px] rounded-[2px] bg-[#B3C4EE]"
                                title="Tramo claro de la barra"
                            />
                            <Cifra>{nuevos}</Cifra> nuevos
                        </span>
                    )}
                </p>
            )}
        </div>
    );
}

export const Tecla = ({ children, className }: { children: ReactNode; className?: string }) => (
    <kbd
        className={cn(
            'flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-[#E3E9F6] bg-[#F5F7FC] font-sans text-[12px] text-[#3E4A68]',
            className,
        )}
    >
        {children}
    </kbd>
);

type Columna = {
    titulo: string;
    ancho: string;
    visible?: string;
    extra?: string;
    celda: (e: Estudiante, i: number, elegida: boolean, buscadas: string[]) => ReactNode;
};

const guion = <span className="text-[#8C97B3]">—</span>;

/** Las columnas que no distinguen nada en el grado (una sola sede, una jornada, sin modalidad) no aparecen. */
function armarColumnas(c: Columnas): Columna[] {
    const columnas: (Columna | false)[] = [
        {
            titulo: '#',
            ancho: 'w-12',
            visible: 'hidden sm:table-cell',
            extra: 'pr-2 pl-5 text-right',
            celda: (_e, i) => <span className="text-[13px] text-[#6B7690] tabular-nums">{i + 1}</span>,
        },
        {
            titulo: 'Estudiante',
            ancho: '',
            extra: 'max-sm:pl-4',
            celda: (e, _i, elegida, b) => (
                <span
                    className={cn(
                        'block truncate font-medium',
                        elegida ? 'text-[#1E3A7B]' : e.estado !== 'activo' ? 'text-[#56627F]' : 'text-[#16223F]',
                    )}
                    title={e.nombre}
                >
                    <Resaltado texto={e.nombre} buscadas={b} />
                </span>
            ),
        },
        {
            titulo: 'Documento',
            ancho: 'w-[172px]',
            visible: 'hidden md:table-cell',
            celda: (e, _i, _el, b) => (
                <span className="whitespace-nowrap text-[#3E4A68] tabular-nums">
                    <span className="mr-1.5 text-[13px] text-[#56627F]">{e.tipo_documento}</span>
                    <Resaltado texto={e.numero_documento} buscadas={b} />
                </span>
            ),
        },
        {
            titulo: 'Grupo',
            ancho: 'w-[76px]',
            celda: (e) => <span className="font-semibold text-[#16223F] tabular-nums">{e.grupo ?? '—'}</span>,
        },
        c.sede && {
            titulo: 'Sede',
            ancho: 'w-[148px]',
            visible: 'hidden lg:table-cell',
            celda: (e) => (
                <span className="flex min-w-0 items-center gap-2 text-[#3E4A68]" title={e.sede}>
                    <PuntoSede codigo={e.sede_codigo} />
                    <span className="truncate">{sedeInfo(e.sede_codigo).corto}</span>
                </span>
            ),
        },
        c.jornada && {
            titulo: 'Jornada',
            ancho: 'w-[92px]',
            visible: 'hidden lg:table-cell',
            celda: (e) => <span className={e.jornada === 'Tarde' ? 'font-medium text-[#8A5A0B]' : 'text-[#3E4A68]'}>{e.jornada ?? '—'}</span>,
        },
        c.modalidad && {
            titulo: 'Modalidad',
            ancho: 'w-[140px]',
            visible: 'hidden lg:table-cell',
            celda: (e) => (e.modalidad ? <span className="block truncate text-[#3E4A68]">{e.modalidad}</span> : guion),
        },
        {
            titulo: 'Acudiente',
            ancho: '',
            visible: 'hidden md:table-cell',
            celda: (e, _i, _el, b) =>
                e.acudiente ? (
                    <span className="block truncate text-[#3E4A68]" title={e.acudiente}>
                        <Resaltado texto={e.acudiente} buscadas={b} />
                    </span>
                ) : (
                    guion
                ),
        },
        {
            titulo: 'Teléfono',
            ancho: 'w-[136px]',
            visible: 'hidden sm:table-cell',
            celda: (e) =>
                e.telefono ? (
                    <a
                        href={`tel:${e.telefono}`}
                        onClick={(ev) => ev.stopPropagation()} // llamar no cambia de estudiante
                        className="whitespace-nowrap text-[#3E4A68] tabular-nums decoration-[#8C97B3] underline-offset-4 hover:text-[#1E3A7B] hover:underline"
                    >
                        {telefono(e.telefono)}
                    </a>
                ) : (
                    guion
                ),
        },
        {
            titulo: 'Situación',
            ancho: 'w-[104px] sm:w-[120px]',
            extra: 'pr-4 sm:pr-5',
            // Solo lo que se sale de "activo y antiguo".
            celda: (e) =>
                e.estado !== 'activo' ? (
                    <Marca valor={e.estado} />
                ) : e.condicion === 'repitente' ? (
                    <Marca valor="repitente" />
                ) : e.condicion === 'nuevo' && !c.todosNuevos ? (
                    <Marca valor="nuevo" />
                ) : null,
        },
    ];
    return columnas.filter((x): x is Columna => x !== false);
}

export const th = `sticky top-0 z-10 h-[30px] border-b border-[#E3E9F6] bg-white/95 px-3 text-left align-middle text-[12px] font-semibold tracking-[0.06em] text-[#56627F] uppercase backdrop-blur ${alto}:h-9`;
export const td = `h-9 border-b border-[#EEF2F9] px-3 align-middle transition-colors duration-150 ${alto}:h-10`;

function Tabla({
    filas,
    columnas,
    seleccion,
    buscadas,
    onFila,
}: {
    filas: Estudiante[];
    columnas: Columnas;
    seleccion: number | null;
    buscadas: string[];
    onFila: (id: number) => void;
}) {
    const cols = useMemo(() => armarColumnas(columnas), [columnas]);

    return (
        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
            <thead>
                <tr>
                    {cols.map((k) => (
                        <th key={k.titulo} scope="col" className={cn(th, k.ancho, k.visible, k.extra)}>
                            {k.titulo === '#' ? (
                                <>
                                    <span className="sr-only">Número de lista</span>#
                                </>
                            ) : (
                                k.titulo
                            )}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filas.map((e, i) => (
                    <Fila key={e.id} estudiante={e} indice={i} columnas={cols} elegida={e.id === seleccion} buscadas={buscadas} onFila={onFila} />
                ))}
            </tbody>
        </table>
    );
}

/** Memorizada: al recorrer con ↑ ↓ solo se vuelven a pintar la fila que se deja y la que se elige. */
const Fila = memo(function Fila({
    estudiante: e,
    indice,
    columnas,
    elegida,
    buscadas,
    onFila,
}: {
    estudiante: Estudiante;
    indice: number;
    columnas: Columna[];
    elegida: boolean;
    buscadas: string[];
    onFila: (id: number) => void;
}) {
    return (
        <tr
            data-fila={e.id}
            tabIndex={elegida ? 0 : -1}
            aria-selected={elegida}
            onClick={() => onFila(e.id)}
            className={`group cursor-pointer scroll-mt-[30px] outline-none ${alto}:scroll-mt-9`}
        >
            {columnas.map((k, j) => (
                <td
                    key={k.titulo}
                    className={cn(
                        td,
                        elegida ? 'bg-[#EEF2FB]' : 'group-hover:bg-[#F7F9FD]',
                        k.visible,
                        k.extra,
                        j === 0 && elegida && 'shadow-[inset_3px_0_0_#1E3A7B]',
                        // Con el foco del teclado en la fila, el mismo borde azul.
                        j === 0 && 'group-focus-visible:shadow-[inset_3px_0_0_#1E3A7B]',
                    )}
                >
                    {k.celda(e, indice, elegida, buscadas)}
                </td>
            ))}
        </tr>
    );
});

export function Vacio({ titulo, texto, onQuitar }: { titulo: string; texto?: string; onQuitar?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <p className="text-[15px] font-semibold">{titulo}</p>
            {texto && <p className="text-sm text-[#56627F]">{texto}</p>}
            {onQuitar && (
                <button
                    type="button"
                    onClick={onQuitar}
                    className="mt-2 h-9 cursor-pointer rounded-[12px] border-[1.5px] border-[#D3DDF3] px-4 text-sm font-medium text-[#1E3A7B] hover:border-[#1E3A7B]"
                >
                    Quitar filtros
                </button>
            )}
        </div>
    );
}
