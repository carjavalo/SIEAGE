import { Condicion, Estado, Sede, iniciales } from '@/components/estudiantes/etiquetas';
import { type FichaDetalle, FichaLateral } from '@/components/estudiantes/ficha-lateral';
import PanelLayout from '@/layouts/panel-layout';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { Phone, Search, X } from 'lucide-react';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

type Grado = { id: number; numero: number; nombre: string; nivel: string; activos: number; grupos: number };
type Grupo = {
    id: number;
    codigo: string;
    jornada: string;
    cupos: number;
    sede: string;
    sede_codigo: string;
    director: string | null;
    activos: number;
    nuevos: number;
};
type Estudiante = {
    id: number;
    nombre: string;
    tipo_documento: string;
    numero_documento: string;
    genero: string | null;
    grupo_id: number | null;
    grupo: string | null;
    sede: string;
    sede_codigo: string;
    jornada: string | null;
    modalidad: string | null;
    condicion: string;
    estado: string;
    acudiente: string | null;
    telefono: string | null;
};
type Resultado = {
    id: number;
    nombre: string;
    numero_documento: string;
    grado_id: number | null;
    grupo: string | null;
    sede: string | null;
    sede_codigo: string | null;
    estado: string | null;
};

type Props = {
    anios: { id: number; anio: number; estado: string }[];
    anio: number;
    grados: Grado[];
    gradoId: number | null;
    totales: { activos: number; nuevos: number; antiguos: number; retirados: number };
    grupos: Grupo[];
    estudiantes: Estudiante[];
    busqueda?: Resultado[];
    detalle: FichaDetalle | null;
};

/** Cómo se reparte el grado: por modalidad en media técnica; si no, por sede o por jornada. */
function repartir(activos: Estudiante[]) {
    const contar = (clave: (e: Estudiante) => string | null) => {
        const conteo = new Map<string, number>();
        for (const e of activos) {
            const k = clave(e);
            if (k) conteo.set(k, (conteo.get(k) ?? 0) + 1);
        }
        return [...conteo.entries()].sort((a, b) => b[1] - a[1]);
    };
    const modalidades = contar((e) => e.modalidad);
    if (modalidades.length) return { titulo: 'Modalidades', filas: modalidades };
    const sedes = contar((e) => e.sede);
    if (sedes.length > 1) return { titulo: 'Por sede', filas: sedes };
    return { titulo: 'Por jornada', filas: contar((e) => e.jornada) };
}

/** "Transición" no cabe en la cuadrícula de grados: se abrevia; el nombre completo va en el título. */
const gradoCorto = (g: Grado) => (g.numero === 0 ? 'Tr' : `${g.numero}°`);

const filtrosEstado = [
    { clave: 'activo', nombre: 'Activos' },
    { clave: 'inactivo', nombre: 'Retirados' },
    { clave: 'todos', nombre: 'Todos' },
];

const panel = 'rounded-[18px] border border-[#E3E9F6] bg-white';

export default function Estudiantes({ anios, anio, grados, gradoId, totales, grupos, estudiantes, busqueda, detalle }: Props) {
    const [grupoId, setGrupoId] = useState<number | null>(null);
    const [estado, setEstado] = useState('activo');
    const [filtro, setFiltro] = useState('');
    const [consulta, setConsulta] = useState('');
    const [seleccion, setSeleccion] = useState<number | null>(detalle?.estudiante.id ?? null);
    const [cargando, setCargando] = useState(false);
    // En pantallas menores a xl la ficha es un panel flotante que se abre y se cierra.
    const [fichaAbierta, setFichaAbierta] = useState(false);
    const lista = useRef<HTMLDivElement>(null);

    const grado = grados.find((g) => g.id === gradoId);
    const hayModalidad = estudiantes.some((e) => e.modalidad);
    const variasSedes = new Set(grupos.map((g) => g.sede_codigo)).size > 1;
    const variasJornadas = new Set(grupos.map((g) => g.jornada)).size > 1;

    useEffect(() => setGrupoId(null), [gradoId, anio]);
    // Al cambiar de grado o año la ficha abierta se cierra (salvo que la URL traiga una).
    useEffect(() => setSeleccion(detalle?.estudiante.id ?? null), [gradoId, anio]); // eslint-disable-line react-hooks/exhaustive-deps
    // Llegó la ficha de otro estudiante (por ejemplo, desde la búsqueda global).
    useEffect(() => {
        if (detalle) setSeleccion(detalle.estudiante.id);
    }, [detalle?.estudiante.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const t = setTimeout(() => {
            if (consulta.trim().length < 2) return;
            router.reload({ only: ['busqueda'], data: { q: consulta } });
        }, 250);
        return () => clearTimeout(t);
    }, [consulta]);

    // La ficha se pide un instante después de seleccionar: recorrer la lista con
    // las flechas no dispara una consulta por cada fila que pasa.
    useEffect(() => {
        if (seleccion === null || seleccion === detalle?.estudiante.id) return;
        const t = setTimeout(() => {
            router.reload({
                only: ['detalle'],
                data: { anio, grado: gradoId ?? undefined, ver: seleccion },
                onStart: () => setCargando(true),
                onFinish: () => setCargando(false),
            });
        }, 120);
        return () => clearTimeout(t);
    }, [seleccion]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!fichaAbierta) return;
        const cerrar = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setFichaAbierta(false);
        window.addEventListener('keydown', cerrar);
        return () => window.removeEventListener('keydown', cerrar);
    }, [fichaAbierta]);

    const ir = (params: { anio?: number; grado?: number }) =>
        router.get('/estudiantes', { anio: params.anio ?? anio, grado: params.grado ?? gradoId ?? undefined }, { preserveScroll: true });

    const visibles = useMemo(() => {
        const texto = filtro.trim().toLowerCase();
        return estudiantes.filter(
            (e) =>
                (grupoId === null || e.grupo_id === grupoId) &&
                (estado === 'todos' || (estado === 'activo' ? e.estado === 'activo' : e.estado !== 'activo')) &&
                (!texto || e.nombre.toLowerCase().includes(texto) || e.numero_documento.includes(texto)),
        );
    }, [estudiantes, grupoId, estado, filtro]);

    const conteoEstado = (clave: string) =>
        estudiantes.filter(
            (e) =>
                (grupoId === null || e.grupo_id === grupoId) &&
                (clave === 'todos' || (clave === 'activo' ? e.estado === 'activo' : e.estado !== 'activo')),
        ).length;

    const activosGrado = estudiantes.filter((e) => e.estado === 'activo');
    const distribucion = repartir(activosGrado);
    const grupoSeleccionado = grupos.find((g) => g.id === grupoId);

    // Desde el clic hasta que llega la ficha nueva, la anterior se ve atenuada.
    const pendiente = cargando || (seleccion !== null && seleccion !== detalle?.estudiante.id);

    const seleccionar = (id: number) => {
        setSeleccion(id);
        setFichaAbierta(true);
    };

    /** ↑ ↓ recorren la lista; la fila elegida queda a la vista y con el foco. */
    const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const actual = visibles.findIndex((v) => v.id === seleccion);
        const siguiente = visibles[Math.min(Math.max(actual + (e.key === 'ArrowDown' ? 1 : -1), 0), visibles.length - 1)];
        if (!siguiente) return;
        setSeleccion(siguiente.id);
        const fila = lista.current?.querySelector<HTMLElement>(`[data-fila="${siguiente.id}"]`);
        fila?.focus({ preventScroll: true });
        fila?.scrollIntoView({ block: 'nearest' });
    };

    return (
        <PanelLayout titulo="Estudiantes" completa>
            {/* Barra superior: cifras del año, búsqueda global y año */}
            <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5">
                    <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Estudiantes</h1>
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#56627F]">
                        <span>
                            <b className="font-semibold text-[#16223F] tabular-nums">{totales.activos.toLocaleString('es-CO')}</b> activos
                        </span>
                        <span aria-hidden className="h-3.5 w-px bg-[#D3DDF3]" />
                        <span>
                            <b className="font-semibold text-[#16223F] tabular-nums">{totales.nuevos.toLocaleString('es-CO')}</b> nuevos
                        </span>
                        <span aria-hidden className="h-3.5 w-px bg-[#D3DDF3]" />
                        <span>
                            <b className="font-semibold text-[#16223F] tabular-nums">{totales.retirados.toLocaleString('es-CO')}</b> retirados
                        </span>
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative sm:w-80">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#8C97B3]" />
                        <input
                            type="search"
                            value={consulta}
                            onChange={(e) => setConsulta(e.target.value)}
                            placeholder="Buscar en todo el colegio…"
                            aria-label="Buscar estudiante por nombre o documento"
                            className="h-10 w-full rounded-xl border border-[#D3DDF3] bg-white pr-9 pl-10 text-sm outline-none placeholder:text-[#8C97B3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8]"
                        />
                        {consulta && (
                            <button
                                type="button"
                                onClick={() => setConsulta('')}
                                aria-label="Limpiar búsqueda"
                                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-[#8C97B3] hover:text-[#16223F]"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                        {consulta.trim().length >= 2 && busqueda && (
                            <div className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl border border-[#E3E9F6] bg-white shadow-lg">
                                {busqueda.length === 0 ? (
                                    <p className="px-4 py-3 text-sm text-[#56627F]">Sin resultados para «{consulta}».</p>
                                ) : (
                                    busqueda.map((r) => (
                                        <Link
                                            key={r.id}
                                            // Con matrícula en el año: se abre su grado con la ficha al lado.
                                            href={r.grado_id ? `/estudiantes?anio=${anio}&grado=${r.grado_id}&ver=${r.id}` : `/estudiantes/${r.id}`}
                                            onClick={() => setConsulta('')}
                                            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-[#F5F7FC]"
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate font-medium">{r.nombre}</span>
                                                <span className="text-xs text-[#56627F]">{r.numero_documento}</span>
                                            </span>
                                            <span className="shrink-0 text-xs font-medium text-[#1E3A7B]">{r.grupo ?? 'Sin matrícula'}</span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-[#56627F]">
                        Año
                        <select
                            value={anio}
                            onChange={(e) => ir({ anio: Number(e.target.value) })}
                            className="h-10 rounded-xl border border-[#D3DDF3] bg-white px-3 text-sm font-medium text-[#16223F] outline-none focus:border-[#6E8BD6]"
                        >
                            {anios.map((a) => (
                                <option key={a.id} value={a.anio}>
                                    {a.anio}
                                    {a.estado === 'activo' ? ' (actual)' : ''}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {/* Tres columnas: grados y grupos · lista · ficha. Cada una se desplaza por dentro. */}
            <div className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[236px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,1fr)_minmax(340px,380px)]">
                {/* ---------------------------------------------- grados y grupos */}
                <aside className={cn(panel, 'lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-width:thin]')}>
                    <div className="p-3.5">
                        <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[#8C97B3] uppercase">Grados</h2>
                        <nav aria-label="Grados" className="mt-2.5 grid grid-cols-4 gap-1.5">
                            {grados.map((g) => {
                                const actual = g.id === gradoId;
                                return (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => ir({ grado: g.id })}
                                        disabled={g.activos === 0 && g.grupos === 0}
                                        aria-current={actual ? 'page' : undefined}
                                        aria-label={`${g.nombre}, ${g.activos} activos`}
                                        title={`${g.nombre} · ${g.activos} activos`}
                                        className={cn(
                                            'flex flex-col items-center rounded-xl py-1 transition disabled:opacity-35',
                                            actual ? 'bg-[#1E3A7B] text-white' : 'bg-[#F5F7FC] text-[#16223F] hover:bg-[#E6ECFB]',
                                        )}
                                    >
                                        <span className="text-[15px] leading-tight font-semibold">{gradoCorto(g)}</span>
                                        <span className={cn('text-[11px] tabular-nums', actual ? 'text-white/75' : 'text-[#8C97B3]')}>{g.activos}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="border-t border-[#EEF2F9] p-3.5">
                        <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[#8C97B3] uppercase">Grupos</h2>
                        <ul className="mt-2 space-y-0.5">
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setGrupoId(null)}
                                    aria-pressed={grupoId === null}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-sm transition',
                                        grupoId === null ? 'bg-[#EEF2FB] font-semibold text-[#1E3A7B]' : 'hover:bg-[#F5F7FC]',
                                    )}
                                >
                                    Todos los grupos
                                    <span className="text-xs tabular-nums">{activosGrado.length}</span>
                                </button>
                            </li>
                            {grupos.map((g) => {
                                const seleccionado = g.id === grupoId;
                                const exceso = g.activos > g.cupos;
                                return (
                                    <li key={g.id}>
                                        <button
                                            type="button"
                                            onClick={() => setGrupoId(seleccionado ? null : g.id)}
                                            aria-pressed={seleccionado}
                                            title={`${g.codigo} · ${g.sede} · ${g.jornada}${g.director ? ` · Dir. ${g.director}` : ''}`}
                                            className={cn(
                                                'relative flex w-full items-center gap-2 rounded-xl px-2.5 pt-1 pb-2 text-sm transition',
                                                seleccionado ? 'bg-[#EEF2FB] text-[#1E3A7B]' : 'hover:bg-[#F5F7FC]',
                                            )}
                                        >
                                            <span className="w-9 shrink-0 text-left font-semibold">{g.codigo}</span>
                                            {variasSedes && <Sede codigo={g.sede_codigo} />}
                                            {variasJornadas && (
                                                <span className="text-[11px] font-medium text-[#8C97B3]" title={g.jornada}>
                                                    {g.jornada}
                                                </span>
                                            )}
                                            <span className="flex-1" />
                                            {/* Ocupación: línea fina a lo ancho; en rojo si el grupo pasa del cupo. */}
                                            <span aria-hidden className="absolute inset-x-2.5 bottom-[3px] h-[3px] overflow-hidden rounded-full bg-[#E6ECF8]">
                                                <span
                                                    className={cn('block h-full rounded-full', exceso ? 'bg-[#D05454]' : 'bg-[#5B7BD0]')}
                                                    style={{ width: `${Math.min(100, (g.activos / Math.max(g.cupos, 1)) * 100)}%` }}
                                                />
                                            </span>
                                            <span
                                                className={cn('shrink-0 text-xs tabular-nums', exceso ? 'font-semibold text-[#B23A3A]' : 'text-[#56627F]')}
                                                aria-label={`${g.activos} de ${g.cupos} cupos`}
                                            >
                                                {g.activos}/{g.cupos}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                </aside>

                {/* ---------------------------------------------- lista */}
                <section className={cn(panel, 'flex min-w-0 flex-col overflow-hidden lg:min-h-0')}>
                    <div className="shrink-0 border-b border-[#EEF2F9] px-4 py-3">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h2 className="text-xl font-semibold tracking-[-0.01em]">
                                {grado?.nombre ?? 'Sin grado'}
                                {grupoSeleccionado && <span className="text-[#5B7BD0]"> · {grupoSeleccionado.codigo}</span>}
                            </h2>
                            <p className="min-w-0 truncate text-[13px] text-[#56627F]" title={`${distribucion.titulo}: ${distribucion.filas.map(([n, v]) => `${n} ${v}`).join(', ')}`}>
                                {grupoSeleccionado
                                    ? `${grupoSeleccionado.sede} · ${grupoSeleccionado.jornada}${grupoSeleccionado.director ? ` · Dir. ${grupoSeleccionado.director}` : ''}`
                                    : // El reparto del grado (por modalidad, sede o jornada) en una línea.
                                      `${grupos.length} ${grupos.length === 1 ? 'grupo' : 'grupos'}${distribucion.filas.length ? ` · ${distribucion.filas.map(([nombre, valor]) => `${nombre} ${valor}`).join(' · ')}` : ''}`}
                            </p>
                        </div>
                        <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-1 rounded-xl bg-[#F5F7FC] p-1">
                                {filtrosEstado.map((f) => (
                                    <button
                                        key={f.clave}
                                        type="button"
                                        onClick={() => setEstado(f.clave)}
                                        aria-pressed={estado === f.clave}
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition',
                                            estado === f.clave ? 'bg-white text-[#1E3A7B] shadow-sm' : 'text-[#56627F] hover:text-[#16223F]',
                                        )}
                                    >
                                        {f.nombre} <span className="tabular-nums opacity-70">{conteoEstado(f.clave)}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="relative sm:w-60">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8C97B3]" />
                                <input
                                    type="search"
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value)}
                                    placeholder="Filtrar esta lista"
                                    aria-label="Filtrar estudiantes del grado"
                                    className="h-9 w-full rounded-xl border border-[#D3DDF3] pr-3 pl-9 text-sm outline-none placeholder:text-[#8C97B3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8]"
                                />
                            </div>
                        </div>
                    </div>

                    <div ref={lista} onKeyDown={alTeclear} className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-[#F9FAFD] shadow-[0_1px_0_#EEF2F9]">
                                <tr className="text-left text-[11px] font-medium tracking-wide text-[#56627F] uppercase">
                                    <th className="w-10 py-2.5 pl-4">#</th>
                                    <th className="py-2.5 pr-3">Estudiante</th>
                                    <th className="py-2.5 pr-3">Grupo</th>
                                    {/* Sin la ficha al lado (pantallas medianas) sobra espacio para el acudiente. */}
                                    <th className="hidden py-2.5 pr-3 lg:table-cell xl:hidden">Acudiente</th>
                                    <th className="py-2.5 pr-4 text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibles.map((e, i) => {
                                    const elegido = e.id === seleccion;
                                    return (
                                        <tr
                                            key={e.id}
                                            data-fila={e.id}
                                            tabIndex={0}
                                            aria-selected={elegido}
                                            onClick={() => seleccionar(e.id)}
                                            onKeyDown={(ev) => {
                                                if (ev.key === 'Enter' || ev.key === ' ') {
                                                    ev.preventDefault();
                                                    seleccionar(e.id);
                                                }
                                            }}
                                            className={cn(
                                                'cursor-pointer border-b border-[#F1F4FA] transition-colors outline-none focus-visible:bg-[#EEF2FB]',
                                                elegido ? 'bg-[#EEF2FB] shadow-[inset_3px_0_0_#1E3A7B]' : 'hover:bg-[#F7F9FD]',
                                            )}
                                        >
                                            <td className="py-1.5 pl-4 text-xs text-[#8C97B3] tabular-nums">{i + 1}</td>
                                            <td className="py-1.5 pr-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className={cn(
                                                            'flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                                                            elegido ? 'bg-[#1E3A7B] text-white' : 'bg-[#EEF2FB] text-[#1E3A7B]',
                                                        )}
                                                    >
                                                        {iniciales(e.nombre)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate leading-5 font-medium">{e.nombre}</p>
                                                        <p className="text-xs leading-4 text-[#56627F]">
                                                            {e.tipo_documento} {e.numero_documento}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-1.5 pr-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium">{e.grupo ?? '—'}</span>
                                                    {variasSedes && <Sede codigo={e.sede_codigo} />}
                                                </div>
                                                {hayModalidad && e.modalidad && <p className="text-xs text-[#56627F]">{e.modalidad}</p>}
                                            </td>
                                            <td className="hidden max-w-[220px] py-1.5 pr-3 lg:table-cell xl:hidden">
                                                {e.acudiente ? (
                                                    <>
                                                        <p className="truncate text-[#3E4A68]">{e.acudiente}</p>
                                                        {e.telefono && (
                                                            <p className="flex items-center gap-1 text-xs text-[#56627F]">
                                                                <Phone className="size-3" />
                                                                {e.telefono}
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-[#8C97B3]">Sin registrar</span>
                                                )}
                                            </td>
                                            <td className="py-1.5 pr-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {e.condicion !== 'antiguo' && <Condicion valor={e.condicion} />}
                                                    <Estado valor={e.estado} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {visibles.length === 0 && (
                            <p className="px-4 py-12 text-center text-sm text-[#56627F]">No hay estudiantes que coincidan con los filtros.</p>
                        )}
                    </div>
                </section>

                {/* ---------------------------------------------- ficha (pantallas grandes) */}
                <aside className={cn(panel, 'hidden min-h-0 flex-col overflow-hidden xl:flex')} aria-label="Ficha del estudiante">
                    <FichaLateral ficha={seleccion ? detalle : null} cargando={pendiente} />
                </aside>
            </div>

            {/* Ficha flotante en pantallas medianas y celular */}
            {fichaAbierta && seleccion !== null && (
                <div className="fixed inset-0 z-40 xl:hidden">
                    <button
                        type="button"
                        aria-label="Cerrar ficha"
                        onClick={() => setFichaAbierta(false)}
                        className="animate-in fade-in absolute inset-0 bg-[#16223F]/30 backdrop-blur-[2px] duration-200"
                    />
                    <aside
                        role="dialog"
                        aria-modal="true"
                        aria-label="Ficha del estudiante"
                        className="animate-in slide-in-from-right absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col bg-white shadow-2xl duration-300 motion-reduce:animate-none"
                    >
                        <FichaLateral ficha={detalle} cargando={pendiente} onCerrar={() => setFichaAbierta(false)} />
                    </aside>
                </div>
            )}
        </PanelLayout>
    );
}
