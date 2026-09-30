import { Desplegable } from '@/components/desplegable';
import { Lapiz } from '@/components/dialogo-formulario';
import { botonPrimario } from '@/components/formulario';
import { DialogoGrupo, DialogoSede } from '@/components/sedes/dialogos';
import PanelLayout from '@/layouts/panel-layout';
import { numero } from '@/lib/estudiantes';
import { type GradoSede, type GrupoSede, type SedeConGrupos, colorDeSede, jornadasDe } from '@/lib/sedes';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

type Props = {
    anios: { id: number; anio: number; estado: string }[];
    anio: number;
    /** Falso en un año lectivo cerrado: solo se consulta. */
    editable: boolean;
    sedes: SedeConGrupos[];
    grados: GradoSede[];
    jornadas: string[];
};

/** Qué diálogo está abierto. Se guarda aparte de `abierto` para que no se vacíe mientras se cierra. */
type Dialogo = { tipo: 'sede'; sede: SedeConGrupos | null } | { tipo: 'grupo'; sede: SedeConGrupos; grupo: GrupoSede | null };

/**
 * Sedes: una tarjeta por sede con sus grupos del año a la vista (matriculados
 * sobre cupos). Desde aquí se crean las sedes y sus grupos.
 */
export default function Sedes({ anios, anio, editable, sedes, grados, jornadas }: Props) {
    const { auth } = usePage<SharedData>().props;
    const puede = auth.puedeGestionarSedes;
    const [dialogo, setDialogo] = useState<Dialogo>({ tipo: 'sede', sede: null });
    const [abierto, setAbierto] = useState(false);
    const abrir = (d: Dialogo) => {
        setDialogo(d);
        setAbierto(true);
    };
    // Tras guardar llegan sedes nuevas: el diálogo toma la versión fresca de la suya.
    const sedeDelGrupo = dialogo.tipo === 'grupo' ? (sedes.find((s) => s.id === dialogo.sede.id) ?? dialogo.sede) : null;

    const grupos = sedes.reduce((t, s) => t + s.grupos.length, 0);
    const estudiantes = sedes.reduce((t, s) => t + s.estudiantes, 0);

    return (
        <PanelLayout titulo="Sedes">
            <section className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-[24px] leading-[26px] font-bold tracking-[-0.025em]">Sedes</h1>
                        <Desplegable
                            etiqueta="Año lectivo"
                            valor={anio}
                            opciones={anios.map((a) => ({
                                valor: a.anio,
                                etiqueta: String(a.anio),
                                detalle: a.estado === 'activo' ? 'en curso' : a.estado === 'planeado' ? 'planeado' : undefined,
                            }))}
                            onCambio={(valor) => router.get('/sedes', { anio: valor })}
                            claseBoton="h-[26px] rounded-full bg-white/75 pr-2 pl-2.5 text-[15px] font-semibold text-[#1E3A7B] tabular-nums ring-1 ring-[#D3DDF3] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#6E8BD6] aria-expanded:bg-white aria-expanded:ring-[#6E8BD6]"
                        />
                    </div>
                    <p className="mt-1 text-[13px] text-[#56627F]">
                        <b className="font-semibold text-[#16223F] tabular-nums">{sedes.length}</b> {sedes.length === 1 ? 'sede' : 'sedes'} ·{' '}
                        <b className="font-semibold text-[#16223F] tabular-nums">{grupos}</b> grupos ·{' '}
                        <b className="font-semibold text-[#16223F] tabular-nums">{numero(estudiantes)}</b> estudiantes
                        {!editable && ' · año cerrado, solo consulta'}
                    </p>
                </div>
                {puede && (
                    <button type="button" onClick={() => abrir({ tipo: 'sede', sede: null })} className={cn(botonPrimario, 'ml-auto shrink-0')}>
                        <Plus aria-hidden className="size-[18px]" strokeWidth={2.4} />
                        Nueva sede
                    </button>
                )}
            </section>

            {/* Dos columnas que se llenan hacia abajo: cada tarjeta tiene el alto de sus grupos. */}
            <div className="mt-5 gap-5 lg:columns-2">
                {sedes.map((s) => (
                    <TarjetaSede
                        key={s.id}
                        sede={s}
                        anio={anio}
                        jornadas={jornadas}
                        puede={puede}
                        editable={editable}
                        onEditar={() => abrir({ tipo: 'sede', sede: s })}
                        onGrupo={(grupo) => abrir({ tipo: 'grupo', sede: s, grupo })}
                    />
                ))}
            </div>

            {puede && (
                <>
                    <DialogoSede
                        sede={dialogo.tipo === 'sede' ? dialogo.sede : null}
                        abierto={abierto && dialogo.tipo === 'sede'}
                        onCambio={setAbierto}
                    />
                    {sedeDelGrupo && dialogo.tipo === 'grupo' && (
                        <DialogoGrupo
                            sede={sedeDelGrupo}
                            grupo={dialogo.grupo}
                            anio={anio}
                            grados={grados}
                            jornadas={jornadas}
                            abierto={abierto}
                            onCambio={setAbierto}
                        />
                    )}
                </>
            )}
        </PanelLayout>
    );
}

function TarjetaSede({
    sede,
    anio,
    jornadas,
    puede,
    editable,
    onEditar,
    onGrupo,
}: {
    sede: SedeConGrupos;
    anio: number;
    jornadas: string[];
    puede: boolean;
    editable: boolean;
    onEditar: () => void;
    /** null: agregar un grupo. */
    onGrupo: (grupo: GrupoSede | null) => void;
}) {
    const titulo = `sede-${sede.id}`;
    // Con más de una jornada, los grupos van separados por jornada; con una sola, basta decirla arriba.
    const presentes = jornadas.filter((j) => sede.grupos.some((g) => g.jornada === j));
    const bloques =
        presentes.length > 1
            ? presentes.map((j) => ({ jornada: j, grupos: sede.grupos.filter((g) => g.jornada === j) }))
            : [{ jornada: null, grupos: sede.grupos }];

    return (
        <section aria-labelledby={titulo} className="mb-5 break-inside-avoid rounded-[28px] bg-[#F2F5FA] p-5 md:p-6">
            <div className="flex items-start gap-3.5">
                <span
                    aria-hidden
                    className="flex size-12 shrink-0 items-center justify-center rounded-[15px] text-[16px] font-semibold text-white"
                    style={{ backgroundColor: colorDeSede(sede.codigo) }}
                >
                    {sede.codigo}
                </span>
                <div className="min-w-0 flex-1">
                    <h2
                        id={titulo}
                        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[19px] leading-[1.2] font-semibold tracking-[-0.02em]"
                    >
                        {sede.nombre}
                        {/* Si ya se llama «Principal», la insignia sobra. */}
                        {sede.es_principal && !/principal/i.test(sede.nombre) && (
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[12px] font-medium tracking-normal text-[#1E3A7B] ring-1 ring-[#D3DDF3]">
                                Principal
                            </span>
                        )}
                    </h2>
                    <p className="mt-1 text-[14px] text-[#3E4A68]">
                        <b className="font-semibold text-[#16223F] tabular-nums">{numero(sede.estudiantes)}</b>{' '}
                        {sede.estudiantes === 1 ? 'estudiante' : 'estudiantes'} · {sede.grupos.length} {sede.grupos.length === 1 ? 'grupo' : 'grupos'}
                        {presentes.length === 1 && ` · ${jornadasDe(sede.grupos, jornadas)}`}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#56627F]">{sede.direccion ?? 'Sin dirección registrada'}</p>
                </div>
                {puede && <Lapiz etiqueta={`Editar la sede ${sede.nombre}`} onClick={onEditar} />}
            </div>

            {sede.grupos.length === 0 ? (
                <p className="mt-4 rounded-[14px] bg-white/70 px-4 py-3 text-[14px] text-[#56627F]">Todavía no tiene grupos en {anio}.</p>
            ) : (
                bloques.map(({ jornada, grupos }) => (
                    <div key={jornada ?? 'unica'} className="mt-4">
                        {jornada && (
                            <h3 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-[#5E6983] uppercase">
                                {jornada} · {grupos.length}
                            </h3>
                        )}
                        <PorGrado grupos={grupos} sede={sede} anio={anio} abrir={puede && editable ? onGrupo : undefined} />
                    </div>
                ))
            )}

            {sede.sin_grupo > 0 && (
                <p className="mt-3 text-[13px] text-[#8A5A0B]">
                    {sede.sin_grupo} {sede.sin_grupo === 1 ? 'estudiante activo no tiene' : 'estudiantes activos no tienen'} grupo asignado.
                </p>
            )}

            {puede && editable && (
                <button
                    type="button"
                    onClick={() => onGrupo(null)}
                    className="mt-3 -ml-1 flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-1.5 text-[14px] font-semibold text-[#1E3A7B] underline-offset-4 hover:underline focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none"
                >
                    <Plus aria-hidden className="size-3.5" strokeWidth={2.5} />
                    Agregar grupo
                </button>
            )}
        </section>
    );
}

/** Una fila por grado con sus grupos: «6-1 32/34». En rojo, el que pasó su cupo. */
function PorGrado({ grupos, sede, anio, abrir }: { grupos: GrupoSede[]; sede: SedeConGrupos; anio: number; abrir?: (g: GrupoSede) => void }) {
    const grados = [...new Map(grupos.map((g) => [g.grado_id, g.grado])).entries()];
    const clase = (lleno: boolean) =>
        cn(
            'inline-flex h-[30px] items-baseline gap-1.5 rounded-full bg-white px-2.5 text-[14px] leading-[30px] ring-1 transition hover:ring-[#6E8BD6] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none',
            lleno ? 'ring-[#F0C4C0]' : 'ring-[#DCE5F8]',
        );

    return (
        <dl>
            {grados.map(([gradoId, nombre]) => (
                <div key={gradoId} className="mt-2 flex items-start gap-3">
                    <dt className="w-[76px] shrink-0 pt-[5px] text-[14px] text-[#3E4A68]">{nombre}</dt>
                    <dd className="flex flex-wrap gap-1.5">
                        {grupos
                            .filter((g) => g.grado_id === gradoId)
                            .map((g) => {
                                const lleno = g.activos > g.cupos;
                                const contenido = (
                                    <>
                                        <b className="font-semibold text-[#16223F]">{g.codigo}</b>
                                        <span className={cn('text-[12.5px] tabular-nums', lleno ? 'text-[#A12B2B]' : 'text-[#56627F]')}>
                                            {g.activos}/{g.cupos}
                                        </span>
                                    </>
                                );
                                const etiqueta = `Grupo ${g.codigo}, jornada ${g.jornada}: ${g.activos} de ${g.cupos} cupos`;

                                return abrir ? (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => abrir(g)}
                                        aria-label={`${etiqueta}. Editar`}
                                        className={cn(clase(lleno), 'cursor-pointer')}
                                    >
                                        {contenido}
                                    </button>
                                ) : (
                                    <Link
                                        key={g.id}
                                        href={`/estudiantes?anio=${anio}&grado=${g.grado_id}&sede=${encodeURIComponent(sede.codigo)}`}
                                        aria-label={`${etiqueta}. Ver estudiantes`}
                                        className={clase(lleno)}
                                    >
                                        {contenido}
                                    </Link>
                                );
                            })}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
