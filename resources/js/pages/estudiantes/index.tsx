import { Condicion, Estado, Sede, iniciales } from '@/components/estudiantes/etiquetas';
import PanelLayout from '@/layouts/panel-layout';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { ChevronRight, Phone, Search, X } from 'lucide-react';
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

/** Un cuadro por cupo del grupo: relleno = estudiante activo; los que exceden el cupo, en rojo. */
function Asientos({ activos, cupos }: { activos: number; cupos: number }) {
    const total = Math.max(activos, cupos);
    return (
        <span role="img" aria-label={`${activos} de ${cupos} cupos ocupados`} className="grid grid-cols-[repeat(9,10px)] gap-1">
            {Array.from({ length: total }, (_, i) => (
                <span key={i} className={cn('size-2.5 rounded-[3px]', i >= cupos ? 'bg-[#D05454]' : i < activos ? 'bg-[#5B7BD0]' : 'bg-[#EEF2FB]')} />
            ))}
        </span>
    );
}

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

    const activosGrado = estudiantes.filter((e) => e.estado === 'activo');
    const distribucion = repartir(activosGrado);
    const sedesGrado = [...new Set(grupos.map((g) => g.sede))];
    const jornadasGrado = [...new Set(grupos.map((g) => g.jornada))];
    const grupoSeleccionado = grupos.find((g) => g.id === grupoId);

    return (
        <PanelLayout titulo="Estudiantes">
            {/* Encabezado: las cifras del colegio van en una línea discreta */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                    <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Estudiantes</h1>
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
                        Año
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

            {/* Grados */}
            <nav aria-label="Grados" className="-mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
                {grados.map((g) => (
                    <button
                        key={g.id}
                        type="button"
                        onClick={() => ir({ grado: g.id })}
                        disabled={g.activos === 0 && g.grupos === 0}
                        aria-current={g.id === gradoId ? 'page' : undefined}
                        className={cn(
                            'shrink-0 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition disabled:opacity-40',
                            g.id === gradoId
                                ? 'bg-[#1E3A7B] text-white'
                                : 'bg-white text-[#16223F] ring-1 ring-[#E3E9F6] ring-inset hover:bg-[#EEF2FB]',
                        )}
                    >
                        {g.nombre}
                    </button>
                ))}
            </nav>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                {/* El grado y sus grupos */}
                <section className="rounded-[18px] border border-[#E3E9F6] bg-white p-5 md:p-6">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h2 className="text-[28px] font-semibold tracking-[-0.02em]">{grado?.nombre ?? 'Sin grado'}</h2>
                        <p className="text-[15px] text-[#56627F]">
                            {grado?.activos ?? 0} activos en {grupos.length} {grupos.length === 1 ? 'grupo' : 'grupos'}
                            {sedesGrado.length > 0 && ` · ${sedesGrado.length > 2 ? `${sedesGrado.length} sedes` : sedesGrado.join(' y ')}`}
                            {jornadasGrado.length > 0 && ` · ${jornadasGrado.join(' y ')}`}
                        </p>
                        {grupoSeleccionado && (
                            <button
                                type="button"
                                onClick={() => setGrupoId(null)}
                                className="ml-auto flex items-center gap-1.5 rounded-full bg-[#EEF2FB] px-3 py-1.5 text-sm font-medium text-[#1E3A7B] hover:bg-[#DCE5F8]"
                            >
                                <X className="size-3.5" />
                                Ver todo el grado
                            </button>
                        )}
                    </div>

                    <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-2.5">
                        {grupos.map((g) => {
                            const seleccionado = g.id === grupoId;
                            const exceso = g.activos - g.cupos;
                            return (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => setGrupoId(seleccionado ? null : g.id)}
                                    aria-pressed={seleccionado}
                                    className={cn(
                                        'flex flex-col gap-3 rounded-[14px] border-[1.5px] bg-white p-4 text-left transition',
                                        seleccionado
                                            ? 'border-[#1E3A7B] shadow-[0_8px_20px_-12px_rgba(30,58,123,0.5)]'
                                            : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                    )}
                                >
                                    <span className="flex items-baseline justify-between gap-2">
                                        <span className="text-xl font-semibold">{g.codigo}</span>
                                        <span
                                            className={cn('text-[13px] tabular-nums', exceso > 0 ? 'font-medium text-[#B23A3A]' : 'text-[#56627F]')}
                                        >
                                            {exceso > 0 ? `+${exceso} sobre cupo` : `${-exceso} ${exceso === -1 ? 'cupo libre' : 'cupos libres'}`}
                                        </span>
                                    </span>
                                    <Asientos activos={g.activos} cupos={g.cupos} />
                                    <span className="text-[13px] text-[#56627F]">
                                        <b className="font-semibold text-[#16223F] tabular-nums">{g.activos}</b> activos · {g.nuevos} nuevos
                                        {sedesGrado.length > 1 && <span className="block text-xs text-[#8C97B3]">{g.sede}</span>}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Reparto del grado */}
                <section className="rounded-[18px] border border-[#E3E9F6] bg-white p-5 md:p-6">
                    <h3 className="text-sm font-semibold">{distribucion.titulo}</h3>
                    <div className="mt-4 flex flex-col gap-3.5">
                        {distribucion.filas.map(([nombre, valor]) => (
                            <div key={nombre} className="flex flex-col gap-1.5">
                                <span className="flex justify-between text-[13px]">
                                    <span className="text-[#3E4A68]">{nombre}</span>
                                    <b className="font-semibold tabular-nums">{valor}</b>
                                </span>
                                <span className="h-1.5 overflow-hidden rounded-full bg-[#EEF2FB]">
                                    <span
                                        className="block h-full rounded-full bg-[#1E3A7B]"
                                        style={{ width: `${activosGrado.length ? (valor / activosGrado.length) * 100 : 0}%` }}
                                    />
                                </span>
                            </div>
                        ))}
                        {distribucion.filas.length === 0 && <p className="text-sm text-[#56627F]">Sin estudiantes activos.</p>}
                    </div>
                </section>
            </div>

            <div className="mt-4">
                <section className="min-w-0 space-y-5">
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
