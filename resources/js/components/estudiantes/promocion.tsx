import { Razon, dialogo } from '@/components/estudiantes/deshabilitar';
import { botonPrimario, botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Estudiante, type Grado, type Grupo, type GrupoDestino } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { ArrowUpRight, GraduationCap, LoaderCircle, type LucideIcon, RotateCcw, Undo2 } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import { sileo } from 'sileo';

/** Lo que devuelve el servidor después de promover (PromocionController → flash.promocion). */
export type ResumenPromocion = {
    anio: number;
    promovidos: number;
    /** Reprobaron: repiten su mismo grado. */
    repiten: number;
    graduados: number;
    sobreCupo: number;
    /** Los que pasaron a sexto: sin grupo ni jornada hasta que se asignen. */
    sinGrupo: number;
    /** Sin grupo, `grupo` es el nombre del grado y `libres` es null. */
    reparto: { grupo: string; sede: string; n: number; libres: number | null }[];
};

type Alcance = { estudiante_id?: number; grado_id?: number; sede?: string; grupo_id?: number; grupo_destino_id?: number };

/** Promueve y avisa con los toasts de Sileo: primero "Promoviendo…", luego el resultado. */
export function promover(anio: number, alcance: Alcance, { onFin }: { onFin?: () => void } = {}) {
    const envio = new Promise<ResumenPromocion>((resolver, rechazar) => {
        router.post(
            '/promociones',
            { anio, ...alcance },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (pagina) => {
                    const resumen = (pagina.props as unknown as { flash: { promocion?: ResumenPromocion } }).flash.promocion;
                    if (resumen) resolver(resumen);
                    else rechazar(new Error('Sin respuesta'));
                },
                onError: (errores) => rechazar(new Error(Object.values(errores)[0] ?? 'No se pudo promover.')),
                onFinish: onFin,
            },
        );
    });

    sileo.promise(envio, {
        loading: { title: alcance.estudiante_id ? 'Promoviendo…' : 'Promoviendo estudiantes…' },
        success: (r) => mensaje(r, !!alcance.estudiante_id),
        error: (e) => ({ title: 'No se pudo promover', description: e instanceof Error ? e.message : undefined }),
    });

    envio
        .then((r) => {
            if (r.sobreCupo > 0) {
                sileo.warning({
                    title: `${r.sobreCupo} ${r.sobreCupo === 1 ? 'quedó' : 'quedaron'} sobre el cupo`,
                    description: `Se promovieron igual. Revisa esos grupos de ${r.anio} y deshabilita a quienes no continúan.`,
                    duration: 8000,
                });
            }
            if (r.sinGrupo > 0 && !alcance.estudiante_id) {
                sileo.info({
                    title: `${r.sinGrupo} ${r.sinGrupo === 1 ? 'pasó' : 'pasaron'} a sexto sin grupo ni jornada`,
                    description: `Se asignan en Estudiantes (${r.anio}, Sexto) cuando estén los grupos según la proyección de cupos.`,
                    duration: 8000,
                });
            }
        })
        .catch(() => {});
}

function mensaje(r: ResumenPromocion, uno: boolean) {
    if (r.promovidos === 0 && r.graduados === 0 && r.repiten === 0) {
        return { type: 'info' as const, title: 'No había a quién promover', description: 'Ya estaban promovidos o no están activos.' };
    }
    if (uno) {
        const g = r.reparto[0];
        if (r.graduados) return { title: 'Graduado', description: 'Terminó undécimo: quedó como graduado.' };
        if (r.repiten) return { title: `Repite: ${g.grupo}`, description: `Reprobó: queda en el mismo grado · ${g.sede} · ${r.anio}` };
        if (g.libres === null)
            return { title: `Promovido a ${g.grupo}`, description: `${g.sede} · ${r.anio} · sin grupo ni jornada: se asignan después` };
        return {
            title: `Promovido a ${g.grupo}`,
            description: `${g.sede} · ${r.anio} · ${g.libres < 0 ? `el grupo queda ${-g.libres} sobre el cupo` : `${g.libres} cupos libres en el grupo`}`,
        };
    }
    const partes = [
        r.promovidos && `${r.promovidos} promovido${r.promovidos === 1 ? '' : 's'} a ${r.anio}`,
        r.repiten && `${r.repiten} repite${r.repiten === 1 ? '' : 'n'} el grado`,
        r.graduados && `${r.graduados} graduado${r.graduados === 1 ? '' : 's'}`,
    ].filter(Boolean);
    const reparto = r.reparto.slice(0, 8).map((g) => `${g.grupo}: ${g.n}`);
    return {
        title: partes.join(' · '),
        description: reparto.length ? `${reparto.join(' · ')}${r.reparto.length > 8 ? ' …' : ''}` : undefined,
        duration: 8000,
    };
}

export const puedePromover = (auth: SharedData['auth']) => !!(auth as { puedePromover?: boolean }).puedePromover;

/** Lo que devuelve el servidor al deshacer una promoción (PromocionController → flash.reversion). */
export type ResumenReversion = { anio: number; revertidos: number; reactivados: number };

type AlcanceReversion = { estudiante_id?: number; grado_id?: number; sede?: string; grupo_id?: number };

/** Deshace la promoción del alcance y avisa con los toasts de Sileo. */
export function revertir(anio: number, alcance: AlcanceReversion, { onFin }: { onFin?: () => void } = {}) {
    const envio = new Promise<ResumenReversion>((resolver, rechazar) => {
        router.post(
            '/promociones/revertir',
            { anio, ...alcance },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (pagina) => {
                    const resumen = (pagina.props as unknown as { flash: { reversion?: ResumenReversion } }).flash.reversion;
                    if (resumen) resolver(resumen);
                    else rechazar(new Error('Sin respuesta'));
                },
                onError: (errores) => rechazar(new Error(Object.values(errores)[0] ?? 'No se pudo deshacer.')),
                onFinish: onFin,
            },
        );
    });

    sileo.promise(envio, {
        loading: { title: 'Deshaciendo promoción…' },
        success: (r) =>
            r.revertidos === 0 && r.reactivados === 0
                ? { type: 'info' as const, title: 'No había promoción que deshacer' }
                : {
                      title: 'Promoción deshecha',
                      description: [
                          r.revertidos && `${r.revertidos} ${r.revertidos === 1 ? 'matrícula borrada' : 'matrículas borradas'} de ${r.anio}`,
                          r.reactivados && `${r.reactivados} ${r.reactivados === 1 ? 'graduado' : 'graduados'} volvió a activo`,
                      ]
                          .filter(Boolean)
                          .join(' · '),
                      duration: 7000,
                  },
        error: (e) => ({ title: 'No se pudo deshacer', description: e instanceof Error ? e.message : undefined }),
    });
}

/**
 * Botón de la lista: promueve el grado a la vista o todo el institución, después
 * de confirmar. Solo en el año en curso y para quien tiene permiso.
 */
export function BotonPromover({
    anio,
    grado,
    siguiente,
    pendientes,
    sede,
    grupos,
    gruposDestino,
    estudiantes,
}: {
    anio: number;
    grado: Grado;
    siguiente?: Grado;
    pendientes: number;
    /** Con filtro de sede, "este grado" es solo el de esa sede. */
    sede?: { codigo: string; nombre: string };
    /** Grupos del grado a la vista (para promover uno completo). */
    grupos: Grupo[];
    /** Grupos del grado siguiente (año siguiente) a los que se puede promover. */
    gruposDestino: GrupoDestino[];
    /** Estudiantes del grado a la vista (para contar los pendientes de cada grupo). */
    estudiantes: Estudiante[];
}) {
    const { auth } = usePage<SharedData>().props;
    const todoElColegio = auth.todasLasSedes !== false;
    const misSedes = (auth.sedes ?? []).map((s) => s.nombre).join(', ');
    const [abierto, setAbierto] = useState(false);
    const [alcance, setAlcance] = useState<'grado' | 'grupo' | 'todos'>('grado');
    const [grupoOrigen, setGrupoOrigen] = useState('');
    const [grupoDestino, setGrupoDestino] = useState('');
    const [enviando, setEnviando] = useState(false);
    const gradua = !siguiente;
    // Promover un grupo completo a uno elegido: solo si hay grupos a la vista y de destino.
    const puedeGrupo = !gradua && grupos.length > 0 && gruposDestino.length > 0;
    const pendientesDe = (gid: number) => estudiantes.filter((e) => e.grupo_id === gid && e.estado === 'activo' && !e.promovido_a).length;

    const alcanceData = (): Alcance => {
        if (alcance === 'grupo') return { grupo_id: Number(grupoOrigen), grupo_destino_id: Number(grupoDestino) };
        if (alcance === 'grado') return { grado_id: grado.id, ...(sede ? { sede: sede.codigo } : {}) };
        return {};
    };

    const confirmar = () => {
        setEnviando(true);
        promover(anio, alcanceData(), {
            onFin: () => {
                setEnviando(false);
                setAbierto(false);
            },
        });
    };

    const opcion = (valor: 'grado' | 'grupo' | 'todos', titulo: string, texto: string) => (
        <label
            className={cn(
                'flex cursor-pointer gap-3 rounded-[14px] border-[1.5px] p-3.5 transition',
                alcance === valor ? 'border-[#1E3A7B] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
            )}
        >
            <input
                type="radio"
                name="alcance"
                checked={alcance === valor}
                onChange={() => setAlcance(valor)}
                className="mt-0.5 size-4 accent-[#1E3A7B]"
            />
            <span>
                <span className="block text-[15px] font-medium">{titulo}</span>
                <span className="block text-[13px] leading-snug text-[#56627F]">{texto}</span>
            </span>
        </label>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setAlcance('grado');
                    setGrupoOrigen('');
                    setGrupoDestino('');
                    setAbierto(true);
                }}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[12px] bg-[#1E3A7B] px-3.5 text-sm font-semibold text-white transition hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
            >
                {gradua ? <GraduationCap className="size-4" /> : <ArrowUpRight className="size-4" />}
                Promover
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !enviando && setAbierto(v)}>
                <DialogContent className="max-w-md rounded-[22px] border-[#E3E9F6] p-6 font-sans text-[#16223F] sm:rounded-[22px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Promover al año {anio + 1}</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            Todos los estudiantes activos pasan al mismo grupo del grado siguiente (9-1 → 10-1), aunque quede sobre el cupo; si ese
                            grupo no existe, van al de menos estudiantes. Los de quinto pasan a sexto sin grupo ni jornada, los de noveno a décimo sin
                            técnica (se asignan después) y los de undécimo quedan graduados. Los marcados como reprobados repiten su mismo grado. Los
                            grupos de {anio + 1} se crean antes en Sedes, según la proyección de matrícula.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        {opcion(
                            'grado',
                            `${gradua ? `Graduar ${grado.nombre}` : `${grado.nombre} → ${siguiente.nombre}`}${sede ? ` · solo ${sede.nombre}` : ''}`,
                            pendientes === 0
                                ? 'Ya están todos promovidos.'
                                : `${pendientes} estudiante${pendientes === 1 ? '' : 's'} activo${pendientes === 1 ? '' : 's'} por promover.`,
                        )}
                        {puedeGrupo &&
                            opcion('grupo', 'Un grupo a otro grupo', 'Promueve todo un grupo (p. ej. 5-2) al grupo que elijas del grado siguiente (6-2).')}
                        {opcion(
                            'todos',
                            todoElColegio ? 'Todo el institución' : 'Todas mis sedes',
                            todoElColegio ? `Todos los grados de ${anio}, de transición a undécimo.` : `Todos los grados de ${anio} en ${misSedes}.`,
                        )}
                    </div>

                    {alcance === 'grupo' && (
                        <div className="flex flex-col gap-3 rounded-[14px] bg-[#F5F7FC] p-3.5">
                            <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#16223F]">Grupo a promover</label>
                                <select
                                    value={grupoOrigen}
                                    onChange={(e) => setGrupoOrigen(e.target.value)}
                                    disabled={enviando}
                                    className="w-full rounded-lg border border-[#D3DDF3] px-3 py-2 text-[14px] focus:ring-2 focus:ring-[#1E3A7B] focus:outline-none"
                                >
                                    <option value="">Elige el grupo...</option>
                                    {grupos.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.codigo} ({g.sede}) · {pendientesDe(g.id)} por promover
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[13px] font-semibold text-[#16223F]">
                                    A qué grupo de {siguiente?.nombre} ({anio + 1})
                                </label>
                                <select
                                    value={grupoDestino}
                                    onChange={(e) => setGrupoDestino(e.target.value)}
                                    disabled={enviando}
                                    className="w-full rounded-lg border border-[#D3DDF3] px-3 py-2 text-[14px] focus:ring-2 focus:ring-[#1E3A7B] focus:outline-none"
                                >
                                    <option value="">Elige el grupo de destino...</option>
                                    {gruposDestino.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.codigo} ({g.sede})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="mt-1 flex justify-end gap-2">
                        <button type="button" onClick={() => setAbierto(false)} disabled={enviando} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={
                                enviando ||
                                (alcance === 'grado' && pendientes === 0) ||
                                (alcance === 'grupo' && (!grupoOrigen || !grupoDestino))
                            }
                            className={botonPrimario}
                        >
                            {enviando && <LoaderCircle className="size-4 animate-spin" />}
                            {alcance === 'todos'
                                ? todoElColegio
                                    ? 'Promover todo el institución'
                                    : 'Promover mis sedes'
                                : gradua
                                  ? 'Graduar'
                                  : 'Promover'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

/**
 * Botón de la lista para deshacer la promoción: de un grupo, del grado a la vista
 * o de todo. Borra las matrículas que la promoción creó en el año siguiente.
 */
export function BotonDeshacer({
    anio,
    grado,
    sede,
    grupos,
}: {
    anio: number;
    grado: Grado;
    sede?: { codigo: string; nombre: string };
    grupos: Grupo[];
}) {
    const { auth } = usePage<SharedData>().props;
    const todoElColegio = auth.todasLasSedes !== false;
    const [abierto, setAbierto] = useState(false);
    const [alcance, setAlcance] = useState<'grado' | 'grupo' | 'todos'>('grado');
    const [grupoId, setGrupoId] = useState('');
    const [enviando, setEnviando] = useState(false);

    const confirmar = () => {
        const datos: AlcanceReversion =
            alcance === 'grupo'
                ? { grupo_id: Number(grupoId) }
                : alcance === 'grado'
                  ? { grado_id: grado.id, ...(sede ? { sede: sede.codigo } : {}) }
                  : {};
        setEnviando(true);
        revertir(anio, datos, {
            onFin: () => {
                setEnviando(false);
                setAbierto(false);
            },
        });
    };

    const opcion = (valor: 'grado' | 'grupo' | 'todos', titulo: string, texto: string) => (
        <label
            className={cn(
                'flex cursor-pointer gap-3 rounded-[14px] border-[1.5px] p-3.5 transition',
                alcance === valor ? 'border-[#1E3A7B] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
            )}
        >
            <input type="radio" name="deshacer" checked={alcance === valor} onChange={() => setAlcance(valor)} className="mt-0.5 size-4 accent-[#1E3A7B]" />
            <span>
                <span className="block text-[15px] font-medium">{titulo}</span>
                <span className="block text-[13px] leading-snug text-[#56627F]">{texto}</span>
            </span>
        </label>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setAlcance('grado');
                    setGrupoId('');
                    setAbierto(true);
                }}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-3.5 text-sm font-semibold text-[#3E4A68] transition hover:bg-[#F5F7FC] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
            >
                <Undo2 className="size-4" />
                Deshacer promoción
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !enviando && setAbierto(v)}>
                <DialogContent className="max-w-md rounded-[22px] border-[#E3E9F6] p-6 font-sans text-[#16223F] sm:rounded-[22px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Deshacer la promoción al año {anio + 1}</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            Borra las matrículas que la promoción creó en {anio + 1} y vuelve a dejar activos a los estudiantes en {anio}. No toca a los
                            inscritos nuevos de {anio + 1} ni a quien se deshabilitó a mano. A los reprobados se les borra la matrícula en que repetían.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        {opcion('grado', `${grado.nombre}${sede ? ` · solo ${sede.nombre}` : ''}`, `Deshace la promoción de ${grado.nombre} de ${anio}.`)}
                        {grupos.length > 0 && opcion('grupo', 'Un grupo', 'Deshace la promoción de todo un grupo (p. ej. 5-2).')}
                        {opcion('todos', todoElColegio ? 'Todo el institución' : 'Todas mis sedes', `Deshace la promoción de todos los grados de ${anio}.`)}
                    </div>

                    {alcance === 'grupo' && (
                        <div className="rounded-[14px] bg-[#F5F7FC] p-3.5">
                            <label className="mb-1.5 block text-[13px] font-semibold text-[#16223F]">Grupo</label>
                            <select
                                value={grupoId}
                                onChange={(e) => setGrupoId(e.target.value)}
                                disabled={enviando}
                                className="w-full rounded-lg border border-[#D3DDF3] px-3 py-2 text-[14px] focus:ring-2 focus:ring-[#1E3A7B] focus:outline-none"
                            >
                                <option value="">Elige el grupo...</option>
                                {grupos.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.codigo} ({g.sede})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mt-1 flex justify-end gap-2">
                        <button type="button" onClick={() => setAbierto(false)} disabled={enviando} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={enviando || (alcance === 'grupo' && !grupoId)}
                            className={botonPrimario}
                        >
                            {enviando && <LoaderCircle className="size-4 animate-spin" />}
                            Deshacer
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

/**
 * Acción de la ficha lateral: promover a este estudiante, o a dónde quedó. Si
 * reprobó, al promover repite su mismo grado; se marca (y se quita) aquí.
 */
export function PromocionEstudiante({
    anio,
    estudianteId,
    nombre,
    grado,
    reprobado,
    activo,
    siguiente,
    promocion,
}: {
    anio: number;
    estudianteId: number;
    nombre: string;
    /** El grado que cursa (el que repite si reprobó). */
    grado: string;
    reprobado: boolean;
    /** Activo en el año en curso: se puede promover y marcar la reprobación. */
    activo: boolean;
    siguiente?: Grado;
    promocion: { anio: number; grado: string; grupo: string | null; sede: string; condicion: string } | null;
}) {
    const { auth } = usePage<SharedData>().props;
    const [enviando, setEnviando] = useState(false);
    const puede = puedePromover(auth) && activo;

    return (
        <div className="flex flex-col gap-2">
            {reprobado && (
                <p className="flex items-start gap-2 rounded-[14px] bg-[#FFF4E5] px-4 py-3 text-[14px] text-[#8A4B00]">
                    <RotateCcw className="mt-0.5 size-4 shrink-0" />
                    <span>
                        <b className="font-semibold">Reprobó {grado}.</b> Al promover, repite {grado} en {anio + 1}.
                    </span>
                </p>
            )}
            {promocion ? (
                <>
                    <p className="flex items-center gap-2 rounded-[14px] bg-[#EEF2FB] px-4 py-3 text-[14px] text-[#1E3A7B]">
                        {promocion.condicion === 'repitente' ? <RotateCcw className="size-4 shrink-0" /> : <ArrowUpRight className="size-4 shrink-0" />}
                        <span>
                            {promocion.condicion === 'repitente' ? 'Repite en' : 'Promovido a'}{' '}
                            <b className="font-semibold">{promocion.grupo ?? promocion.grado}</b> · {promocion.sede} · {promocion.anio}
                        </span>
                    </p>
                    {puede && (
                        <button
                            type="button"
                            disabled={enviando}
                            onClick={() => {
                                setEnviando(true);
                                revertir(anio, { estudiante_id: estudianteId }, { onFin: () => setEnviando(false) });
                            }}
                            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white text-[14px] font-semibold text-[#3E4A68] transition hover:bg-[#F5F7FC] disabled:opacity-60"
                        >
                            {enviando ? <LoaderCircle className="size-4 animate-spin" /> : <Undo2 className="size-4" />}
                            Deshacer promoción
                        </button>
                    )}
                </>
            ) : (
                puede && (
                    <BotonPromoverEstudiante
                        enviando={enviando}
                        onClick={() => {
                            setEnviando(true);
                            promover(anio, { estudiante_id: estudianteId }, { onFin: () => setEnviando(false) });
                        }}
                        icono={reprobado ? RotateCcw : siguiente ? ArrowUpRight : GraduationCap}
                        texto={
                            reprobado ? `Promover: repite ${grado} ${anio + 1}` : siguiente ? `Promover a ${siguiente.nombre} ${anio + 1}` : 'Graduar'
                        }
                    />
                )
            )}
            {puede && (
                <Reprobacion estudianteId={estudianteId} nombre={nombre} grado={grado} anio={anio} reprobado={reprobado} promovido={!!promocion} />
            )}
        </div>
    );
}

function BotonPromoverEstudiante({
    enviando,
    onClick,
    icono: Icono,
    texto,
}: {
    enviando: boolean;
    onClick: () => void;
    icono: LucideIcon;
    texto: string;
}) {
    return (
        <button
            type="button"
            disabled={enviando}
            onClick={onClick}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#6E8BD6] bg-[#EEF2FB] text-[14px] font-semibold text-[#1E3A7B] transition hover:bg-[#DCE5F8] disabled:opacity-60"
        >
            {enviando ? <LoaderCircle className="size-4 animate-spin" /> : <Icono className="size-4" />}
            {texto}
        </button>
    );
}

/** Marcar que reprobó el año (repite el grado al promover), o quitar esa marca. Pide la razón. */
function Reprobacion({
    estudianteId,
    nombre,
    grado,
    anio,
    reprobado,
    promovido,
}: {
    estudianteId: number;
    nombre: string;
    grado: string;
    anio: number;
    reprobado: boolean;
    promovido: boolean;
}) {
    const [abierto, setAbierto] = useState(false);
    const form = useForm({ razon: '' });

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        const opciones = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (pagina: { props: unknown }) => {
                setAbierto(false);
                const mensaje = (pagina.props as { flash: { success?: string } }).flash.success;
                sileo.success({ title: reprobado ? 'Ya no repite' : 'Reprobó el año', description: mensaje ?? nombre });
            },
            onError: (errores: Record<string, string>) => sileo.error({ title: 'No se pudo guardar', description: errores.razon }),
        };
        if (reprobado) form.delete(`/estudiantes/${estudianteId}/reprobar`, opciones);
        else form.post(`/estudiantes/${estudianteId}/reprobar`, opciones);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    form.reset();
                    form.clearErrors();
                    setAbierto(true);
                }}
                className={cn(
                    'flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] bg-white text-[14px] font-semibold transition',
                    reprobado ? 'border-[#D3DDF3] text-[#3E4A68] hover:bg-[#F5F7FC]' : 'border-[#F2C98F] text-[#8A4B00] hover:bg-[#FFF4E5]',
                )}
            >
                {reprobado ? <Undo2 className="size-4" /> : <RotateCcw className="size-4" />}
                {reprobado ? 'Quitar reprobación' : 'Reprobó el año (repite el grado)'}
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !form.processing && setAbierto(v)}>
                <DialogContent className={dialogo}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">{reprobado ? 'Quitar reprobación' : 'Reprobó el año'}</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            {reprobado ? (
                                <>
                                    {nombre} ya no repite: al promover pasará al grado siguiente.
                                    {promovido && ` Se quita la matrícula de ${anio + 1} en que repetía; vuelve a promoverlo después.`}
                                </>
                            ) : (
                                <>
                                    {nombre} sigue activo en {anio}, pero al promover <b className="font-semibold text-[#16223F]">repite {grado}</b>{' '}
                                    en {anio + 1}, como repitente.
                                    {promovido && ` Ya lo habían promovido: esa matrícula de ${anio + 1} se quita; vuelve a promoverlo después.`}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={enviar} className="flex flex-col gap-4">
                        <Razon
                            valor={form.data.razon}
                            onCambio={(v) => form.setData('razon', v)}
                            error={form.errors.razon}
                            placeholder={
                                reprobado
                                    ? 'Ej. Se marcó por error; aprobó la recuperación.'
                                    : 'Ej. Perdió matemáticas y lenguaje en la comisión de evaluación.'
                            }
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setAbierto(false)} disabled={form.processing} className={botonSecundario}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={form.processing || form.data.razon.trim().length < 5} className={botonPrimario}>
                                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                                {reprobado ? 'Quitar reprobación' : 'Marcar que repite'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
