import { Condicion, Estado, Sede, iniciales } from '@/components/estudiantes/etiquetas';
import PanelLayout from '@/layouts/panel-layout';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { ChevronRight, Phone, Search, UserCheck, UserMinus, UserPlus, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
};

const niveles: { clave: string; nombre: string }[] = [
    { clave: 'preescolar', nombre: 'Preescolar' },
    { clave: 'primaria', nombre: 'Primaria' },
    { clave: 'secundaria', nombre: 'Secundaria' },
    { clave: 'media', nombre: 'Media técnica' },
];

const filtrosEstado = [
    { clave: 'activo', nombre: 'Activos' },
    { clave: 'inactivo', nombre: 'Retirados' },
    { clave: 'todos', nombre: 'Todos' },
];

export default function Estudiantes({ anios, anio, grados, gradoId, totales, grupos, estudiantes, busqueda }: Props) {
    const [grupoId, setGrupoId] = useState<number | null>(null);
    const [estado, setEstado] = useState('activo');
    const [filtro, setFiltro] = useState('');
    const [consulta, setConsulta] = useState('');

    const grado = grados.find((g) => g.id === gradoId);
    const hayModalidad = estudiantes.some((e) => e.modalidad);

    useEffect(() => setGrupoId(null), [gradoId, anio]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (consulta.trim().length < 2) return;
            router.reload({ only: ['busqueda'], data: { q: consulta } });
        }, 250);
        return () => clearTimeout(t);
    }, [consulta]);

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

    const kpis = [
        { titulo: 'Matriculados activos', valor: totales.activos, icono: Users, tono: 'bg-[#1E3A7B] text-white' },
        { titulo: 'Nuevos', valor: totales.nuevos, icono: UserPlus, tono: 'bg-[#DCE5F8] text-[#1E3A7B]' },
        { titulo: 'Antiguos', valor: totales.antiguos, icono: UserCheck, tono: 'bg-[#E3F4EC] text-[#1C6B4A]' },
        { titulo: 'Retirados / cancelados', valor: totales.retirados, icono: UserMinus, tono: 'bg-[#FDECEC] text-[#A12B2B]' },
    ];

    return (
        <PanelLayout titulo="Estudiantes">
            {/* Encabezado */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-[#5B7BD0]">Panel administrativo</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-[-0.02em]">Estudiantes por grado</h1>
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
                            className="h-11 w-full rounded-xl border border-[#D3DDF3] bg-white pr-9 pl-10 text-sm outline-none placeholder:text-[#8C97B3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8]"
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
                            <div className="absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-xl border border-[#E3E9F6] bg-white shadow-lg">
                                {busqueda.length === 0 ? (
                                    <p className="px-4 py-3 text-sm text-[#56627F]">Sin resultados para «{consulta}».</p>
                                ) : (
                                    busqueda.map((r) => (
                                        <Link
                                            key={r.id}
                                            href={`/estudiantes/${r.id}`}
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
                        Año lectivo
                        <select
                            value={anio}
                            onChange={(e) => ir({ anio: Number(e.target.value) })}
                            className="h-11 rounded-xl border border-[#D3DDF3] bg-white px-3 text-sm font-medium text-[#16223F] outline-none focus:border-[#6E8BD6]"
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

            {/* Indicadores */}
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpis.map(({ titulo, valor, icono: Icono, tono }) => (
                    <div key={titulo} className="flex items-center gap-4 rounded-2xl border border-[#E3E9F6] bg-white p-4">
                        <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tono)}>
                            <Icono className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-2xl font-semibold tabular-nums">{valor.toLocaleString('es-CO')}</p>
                            <p className="truncate text-xs text-[#56627F]">{titulo}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
                {/* Grados */}
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <nav
                        aria-label="Grados"
                        className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-5 lg:overflow-visible lg:rounded-2xl lg:border lg:border-[#E3E9F6] lg:bg-white lg:p-4"
                    >
                        {niveles.map((nivel) => (
                            <div key={nivel.clave} className="contents lg:block">
                                <p className="mb-1.5 hidden px-2 text-[11px] font-semibold tracking-wider text-[#8C97B3] uppercase lg:block">
                                    {nivel.nombre}
                                </p>
                                <div className="contents lg:flex lg:flex-col lg:gap-0.5">
                                    {grados
                                        .filter((g) => g.nivel === nivel.clave)
                                        .map((g) => (
                                            <button
                                                key={g.id}
                                                type="button"
                                                onClick={() => ir({ grado: g.id })}
                                                disabled={g.activos === 0 && g.grupos === 0}
                                                className={cn(
                                                    'flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition disabled:opacity-40',
                                                    g.id === gradoId
                                                        ? 'bg-[#1E3A7B] text-white'
                                                        : 'border border-[#E3E9F6] bg-white hover:bg-[#EEF2FB] lg:border-0',
                                                )}
                                            >
                                                <span className="font-medium whitespace-nowrap">{g.nombre}</span>
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 text-xs tabular-nums',
                                                        g.id === gradoId ? 'bg-white/20' : 'bg-[#EEF2FB] text-[#1E3A7B]',
                                                    )}
                                                >
                                                    {g.activos}
                                                </span>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                <section className="min-w-0 space-y-5">
                    {/* Grupos del grado */}
                    <div className="rounded-2xl border border-[#E3E9F6] bg-white p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="text-xl font-semibold">{grado?.nombre ?? 'Sin grado'}</h2>
                            <p className="text-sm text-[#56627F]">
                                {grupos.length} {grupos.length === 1 ? 'grupo' : 'grupos'} · {grado?.activos ?? 0} activos
                            </p>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            <button
                                type="button"
                                onClick={() => setGrupoId(null)}
                                className={cn(
                                    'flex flex-col justify-center rounded-xl border-[1.5px] p-4 text-left transition',
                                    grupoId === null ? 'border-[#1E3A7B] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                )}
                            >
                                <span className="text-lg font-semibold">Todos</span>
                                <span className="text-sm text-[#56627F]">{estudiantes.length} matrículas en el año</span>
                            </button>
                            {grupos.map((g) => {
                                const porcentaje = g.cupos ? Math.min(100, Math.round((g.activos / g.cupos) * 100)) : 0;
                                const lleno = g.activos > g.cupos;
                                return (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => setGrupoId(g.id === grupoId ? null : g.id)}
                                        className={cn(
                                            'rounded-xl border-[1.5px] p-4 text-left transition',
                                            g.id === grupoId ? 'border-[#1E3A7B] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-lg font-semibold">{g.codigo}</span>
                                            <Sede codigo={g.sede_codigo} nombre={g.sede} />
                                        </div>
                                        <p className="mt-0.5 text-xs text-[#56627F]">
                                            Jornada {g.jornada.toLowerCase()}
                                            {g.director ? ` · ${g.director}` : ''}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between text-xs">
                                            <span className="font-medium tabular-nums">
                                                {g.activos} / {g.cupos} cupos
                                            </span>
                                            <span className={cn('tabular-nums', lleno ? 'font-medium text-[#A12B2B]' : 'text-[#56627F]')}>
                                                {lleno ? `+${g.activos - g.cupos} sobre cupo` : `${g.cupos - g.activos} libres`}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EEF2FB]">
                                            <div
                                                className={cn('h-full rounded-full', lleno ? 'bg-[#D05454]' : 'bg-[#5B7BD0]')}
                                                style={{ width: `${porcentaje}%` }}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Listado */}
                    <div className="overflow-hidden rounded-2xl border border-[#E3E9F6] bg-white">
                        <div className="flex flex-col gap-3 border-b border-[#E3E9F6] p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-1 rounded-xl bg-[#F5F7FC] p-1">
                                {filtrosEstado.map((f) => (
                                    <button
                                        key={f.clave}
                                        type="button"
                                        onClick={() => setEstado(f.clave)}
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                                            estado === f.clave ? 'bg-white text-[#1E3A7B] shadow-sm' : 'text-[#56627F] hover:text-[#16223F]',
                                        )}
                                    >
                                        {f.nombre} <span className="tabular-nums opacity-70">{conteoEstado(f.clave)}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="relative sm:w-72">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8C97B3]" />
                                <input
                                    type="search"
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value)}
                                    placeholder="Filtrar este grado"
                                    aria-label="Filtrar estudiantes del grado"
                                    className="h-10 w-full rounded-xl border border-[#D3DDF3] pr-3 pl-9 text-sm outline-none placeholder:text-[#8C97B3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8]"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-sm">
                                <thead>
                                    <tr className="bg-[#F9FAFD] text-left text-xs font-medium tracking-wide text-[#56627F] uppercase">
                                        <th className="w-12 py-3 pl-4">#</th>
                                        <th className="py-3 pr-3">Estudiante</th>
                                        <th className="py-3 pr-3">Grupo</th>
                                        <th className="py-3 pr-3">Jornada</th>
                                        {hayModalidad && <th className="py-3 pr-3">Modalidad</th>}
                                        <th className="py-3 pr-3">Condición</th>
                                        <th className="py-3 pr-3">Estado</th>
                                        <th className="py-3 pr-3">Acudiente</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEF2F9]">
                                    {visibles.map((e, i) => (
                                        <tr
                                            key={e.id}
                                            onClick={() => router.visit(`/estudiantes/${e.id}`)}
                                            className="group cursor-pointer transition hover:bg-[#F5F7FC]"
                                        >
                                            <td className="py-3 pl-4 text-xs text-[#8C97B3] tabular-nums">{i + 1}</td>
                                            <td className="py-3 pr-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FB] text-xs font-semibold text-[#1E3A7B]">
                                                        {iniciales(e.nombre)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/estudiantes/${e.id}`}
                                                            onClick={(ev) => ev.stopPropagation()}
                                                            className="block truncate font-medium hover:text-[#1E3A7B]"
                                                        >
                                                            {e.nombre}
                                                        </Link>
                                                        <p className="text-xs text-[#56627F]">
                                                            {e.tipo_documento} {e.numero_documento}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{e.grupo ?? '—'}</span>
                                                    <Sede codigo={e.sede_codigo} />
                                                </div>
                                            </td>
                                            <td className="py-3 pr-3 text-[#3E4A68]">{e.jornada ?? '—'}</td>
                                            {hayModalidad && <td className="py-3 pr-3 text-[#3E4A68]">{e.modalidad ?? '—'}</td>}
                                            <td className="py-3 pr-3">
                                                <Condicion valor={e.condicion} />
                                            </td>
                                            <td className="py-3 pr-3">
                                                <Estado valor={e.estado} />
                                            </td>
                                            <td className="py-3 pr-3">
                                                {e.acudiente ? (
                                                    <div className="min-w-0">
                                                        <p className="max-w-[200px] truncate text-[#3E4A68]">{e.acudiente}</p>
                                                        {e.telefono && (
                                                            <p className="flex items-center gap-1 text-xs text-[#56627F]">
                                                                <Phone className="size-3" />
                                                                {e.telefono}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[#8C97B3]">Sin registrar</span>
                                                )}
                                            </td>
                                            <td className="pr-4 text-[#B9C3DC] group-hover:text-[#1E3A7B]">
                                                <ChevronRight className="size-4" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {visibles.length === 0 && (
                                <p className="px-4 py-12 text-center text-sm text-[#56627F]">No hay estudiantes que coincidan con los filtros.</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </PanelLayout>
    );
}
