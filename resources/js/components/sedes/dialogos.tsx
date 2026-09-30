import { Desplegable } from '@/components/desplegable';
import { Cabeza, Cuerpo, type EstadoDialogo, Marco, Pie, claseLista, exito, revisar, useAvisar } from '@/components/dialogo-formulario';
import { Campo, claseCampo } from '@/components/formulario';
import { type GradoSede, type GrupoSede, type SedeConGrupos } from '@/lib/sedes';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { type ComponentProps, type FormEventHandler, type ReactNode, type RefObject, useId, useState } from 'react';
import { sileo } from 'sileo';

/**
 * Los diálogos de Sedes: crear o editar una sede, y crear o editar un grupo.
 * Eliminar solo se ofrece cuando no se pierde nada: una sede sin historia, un
 * grupo sin estudiantes.
 */

const angosto = 'max-w-[480px]';

/** «¿Eliminar…?» con su confirmación en el mismo sitio; si no se puede, dice por qué. */
function Eliminar({
    pregunta,
    confirmacion,
    impedimento,
    ocupado,
    onEliminar,
}: {
    pregunta: string;
    confirmacion: ReactNode;
    /** Si está, no hay botón: solo la explicación. */
    impedimento?: ReactNode;
    ocupado: boolean;
    onEliminar: () => void;
}) {
    const [confirmando, setConfirmando] = useState(false);

    if (impedimento) {
        return <p className="mt-5 rounded-[14px] bg-[#F5F7FC] px-4 py-3 text-[14px] leading-snug text-[#56627F]">{impedimento}</p>;
    }

    return (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[14px] bg-[#F5F7FC] px-4 py-3 text-[14px]">
            {confirmando ? (
                <>
                    <p>{confirmacion}</p>
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => setConfirmando(false)}
                            disabled={ocupado}
                            className="flex h-9 cursor-pointer items-center rounded-full px-3.5 font-medium text-[#56627F] transition hover:bg-white hover:text-[#16223F]"
                        >
                            No
                        </button>
                        <button
                            type="button"
                            onClick={onEliminar}
                            disabled={ocupado}
                            className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-[#A12B2B] px-4 font-semibold text-white transition hover:bg-[#8E2323] disabled:cursor-default disabled:opacity-60"
                        >
                            {ocupado && <LoaderCircle className="size-4 animate-spin" />}
                            Sí, eliminar
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-[#56627F]">{pregunta}</p>
                    <button
                        type="button"
                        onClick={() => setConfirmando(true)}
                        className="-my-0.5 flex h-7 cursor-pointer items-center rounded-full font-semibold text-[#A12B2B] underline-offset-4 hover:underline focus-visible:ring-4 focus-visible:ring-[#F6D5D2] focus-visible:outline-none"
                    >
                        Eliminar
                    </button>
                </>
            )}
        </div>
    );
}

/** Eliminar con Inertia, avisando al diálogo mientras tanto. */
function useEliminar(url: string, titulo: string, onCerrar: () => void) {
    const [ocupado, setOcupado] = useState(false);
    const eliminar = () =>
        router.delete(url, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setOcupado(true),
            onFinish: () => setOcupado(false),
            onSuccess: (pagina) => {
                onCerrar();
                exito(titulo)(pagina);
            },
            onError: (fallos) =>
                sileo.warning({ title: 'No se pudo eliminar', description: fallos.eliminar ?? fallos.numero ?? 'Inténtalo de nuevo.' }),
        });

    return { ocupado, eliminar };
}

// ------------------------------------------------------------------ sede

/** `sede` null: es una sede nueva. */
export function DialogoSede({ sede, abierto, onCambio }: { sede: SedeConGrupos | null; abierto: boolean; onCambio: (v: boolean) => void }) {
    return (
        <Marco abierto={abierto} onCambio={onCambio} className={angosto} enfocar={sede ? undefined : '[data-primero]'}>
            {(estado) => <FormularioSede sede={sede} estado={estado} onCerrar={() => onCambio(false)} />}
        </Marco>
    );
}

function FormularioSede({ sede, estado, onCerrar }: { sede: SedeConGrupos | null; estado: RefObject<EstadoDialogo>; onCerrar: () => void }) {
    const form = useForm({ nombre: sede?.nombre ?? '', codigo: sede?.codigo ?? '', direccion: sede?.direccion ?? '' });
    const prefijo = useId();
    const id = (campo: string) => `${prefijo}-${campo}`;
    const borrar = useEliminar(`/sedes/${sede?.id}`, 'Sede eliminada', onCerrar);
    useAvisar(estado, form.isDirty, form.processing || borrar.ocupado);

    const guardar: FormEventHandler = (ev) => {
        ev.preventDefault();
        const opciones = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (pagina: { props: unknown }) => {
                onCerrar();
                exito(sede ? 'Sede actualizada' : 'Sede creada')(pagina);
            },
            onError: revisar,
        };
        if (sede) form.put(`/sedes/${sede.id}`, opciones);
        else form.post('/sedes', opciones);
    };

    return (
        <form onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
            <Cabeza titulo={sede ? 'Editar sede' : 'Nueva sede'}>
                {sede ? 'El nombre y el código se ven en las listas, el informe y el libro de Excel.' : 'Después de crearla, agrégale sus grupos.'}
            </Cabeza>

            <Cuerpo>
                <div className="grid gap-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
                        <Campo id={id('nombre')} etiqueta="Nombre" error={form.errors.nombre}>
                            <input
                                id={id('nombre')}
                                data-primero=""
                                value={form.data.nombre}
                                onChange={(e) => form.setData('nombre', e.target.value)}
                                aria-invalid={!!form.errors.nombre}
                                placeholder="Ej. San Judas"
                                autoComplete="off"
                                maxLength={80}
                                className={claseCampo}
                            />
                        </Campo>
                        <Campo id={id('codigo')} etiqueta="Código" error={form.errors.codigo}>
                            <input
                                id={id('codigo')}
                                value={form.data.codigo}
                                onChange={(e) => form.setData('codigo', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                aria-invalid={!!form.errors.codigo}
                                placeholder="SJ"
                                autoComplete="off"
                                maxLength={5}
                                className={`${claseCampo} uppercase`}
                            />
                        </Campo>
                    </div>
                    <p className="-mt-2 text-[13px] leading-snug text-[#56627F]">
                        El código son sus iniciales (hasta 5 letras): sale junto a cada grupo en el libro de Excel.
                    </p>
                    <Campo id={id('direccion')} etiqueta="Dirección" opcional error={form.errors.direccion}>
                        <input
                            id={id('direccion')}
                            value={form.data.direccion}
                            onChange={(e) => form.setData('direccion', e.target.value)}
                            aria-invalid={!!form.errors.direccion}
                            placeholder="Ej. Calle 73 # 7M-18"
                            autoComplete="off"
                            maxLength={150}
                            className={claseCampo}
                        />
                    </Campo>
                </div>

                {sede && (
                    <Eliminar
                        pregunta="¿Se creó por error?"
                        confirmacion={
                            <>
                                ¿Eliminar la sede <b className="font-semibold">{sede.nombre}</b>?
                            </>
                        }
                        impedimento={sede.se_puede_eliminar ? undefined : 'Esta sede tiene grupos o estudiantes registrados: no se puede eliminar.'}
                        ocupado={borrar.ocupado}
                        onEliminar={borrar.eliminar}
                    />
                )}
            </Cuerpo>

            <Pie
                sucio={form.isDirty}
                cargando={form.processing}
                desactivado={!form.isDirty || borrar.ocupado}
                guardar={sede ? 'Guardar' : 'Crear sede'}
                onCancelar={onCerrar}
            />
        </form>
    );
}

// ------------------------------------------------------------------ grupo

type PropsGrupo = {
    sede: SedeConGrupos;
    /** null: es un grupo nuevo. */
    grupo: GrupoSede | null;
    anio: number;
    grados: GradoSede[];
    jornadas: string[];
};

export function DialogoGrupo({ abierto, onCambio, ...props }: PropsGrupo & { abierto: boolean; onCambio: (v: boolean) => void }) {
    return (
        <Marco abierto={abierto} onCambio={onCambio} className={angosto}>
            {(estado) => <FormularioGrupo {...props} estado={estado} onCerrar={() => onCambio(false)} />}
        </Marco>
    );
}

type FormGrupo = { anio: number; grado_id: number; numero: string; jornada: string; cupos: string };

function FormularioGrupo({
    sede,
    grupo,
    anio,
    grados,
    jornadas,
    estado,
    onCerrar,
}: PropsGrupo & { estado: RefObject<EstadoDialogo>; onCerrar: () => void }) {
    /** El número que sigue en la sede para ese grado. */
    const siguiente = (gradoId: number) => String(Math.max(0, ...sede.grupos.filter((g) => g.grado_id === gradoId).map((g) => g.numero)) + 1);
    /** Por defecto, la jornada que más se repite en la sede; si está vacía, la primera. */
    const jornadaHabitual =
        jornadas.map((j) => ({ j, n: sede.grupos.filter((g) => g.jornada === j).length })).sort((a, b) => b.n - a.n)[0]?.j ?? jornadas[0];
    // Un grupo nuevo empieza en el último grado que tiene la sede (lo usual es abrir otro curso del mismo grado).
    const gradoInicial = grupo?.grado_id ?? sede.grupos.at(-1)?.grado_id ?? 0;

    const form = useForm<FormGrupo>({
        anio,
        grado_id: gradoInicial,
        numero: grupo ? String(grupo.numero) : gradoInicial ? siguiente(gradoInicial) : '1',
        jornada: grupo?.jornada ?? jornadaHabitual,
        cupos: String(grupo?.cupos ?? 34),
    });
    const errores = form.errors as Partial<Record<string, string>>;
    const d = form.data;
    const prefijo = useId();
    const id = (campo: string) => `${prefijo}-${campo}`;
    const borrar = useEliminar(`/grupos/${grupo?.id}`, 'Grupo eliminado', onCerrar);
    useAvisar(estado, form.isDirty, form.processing || borrar.ocupado);

    const grado = grados.find((g) => g.id === d.grado_id);
    const codigo = grado && d.numero ? `${grado.numero}-${d.numero}` : null;
    const numero = (campo: 'numero' | 'cupos', extra: ComponentProps<'input'>) => ({
        id: id(campo),
        type: 'number',
        inputMode: 'numeric' as const,
        value: d[campo],
        onChange: (e: { target: { value: string } }) => form.setData(campo, e.target.value),
        'aria-invalid': !!errores[campo],
        className: `${claseCampo} tabular-nums`,
        ...extra,
    });

    const guardar: FormEventHandler = (ev) => {
        ev.preventDefault();
        const opciones = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (pagina: { props: unknown }) => {
                onCerrar();
                exito(grupo ? 'Grupo actualizado' : 'Grupo creado')(pagina);
            },
            onError: revisar,
        };
        if (grupo) form.put(`/grupos/${grupo.id}`, opciones);
        else form.post(`/sedes/${sede.id}/grupos`, opciones);
    };

    return (
        <form onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
            <Cabeza titulo={grupo ? `Grupo ${grupo.codigo}` : 'Agregar grupo'}>
                {sede.nombre} · año lectivo {anio}
                {grupo && ` · ${grupo.grado}`}
            </Cabeza>

            <Cuerpo>
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                    {!grupo && (
                        <div className="sm:col-span-2">
                            <Campo id={id('grado_id')} etiqueta="Grado" error={errores.grado_id}>
                                <Desplegable
                                    id={id('grado_id')}
                                    etiqueta="Grado"
                                    placeholder="Elige el grado"
                                    valor={d.grado_id}
                                    opciones={grados.map((g) => ({ valor: g.id, etiqueta: g.nombre }))}
                                    onCambio={(v) => form.setData((antes) => ({ ...antes, grado_id: v, numero: siguiente(v) }))}
                                    invalido={!!errores.grado_id}
                                    claseBoton={claseLista}
                                />
                            </Campo>
                        </div>
                    )}
                    <Campo
                        id={id('numero')}
                        etiqueta="Número del grupo"
                        ayuda={codigo && codigo !== grupo?.codigo ? `Se llamará ${codigo}.` : undefined}
                        error={errores.numero ?? errores.anio}
                    >
                        <input {...numero('numero', { min: 1, max: 30 })} />
                    </Campo>
                    <Campo id={id('cupos')} etiqueta="Cupos" error={errores.cupos}>
                        <input {...numero('cupos', { min: 1, max: 99 })} />
                    </Campo>
                    <div className="sm:col-span-2">
                        <Campo id={id('jornada')} etiqueta="Jornada" error={errores.jornada}>
                            <Desplegable
                                id={id('jornada')}
                                etiqueta="Jornada"
                                valor={d.jornada}
                                opciones={jornadas.map((j) => ({ valor: j, etiqueta: j }))}
                                onCambio={(v) => form.setData('jornada', v)}
                                invalido={!!errores.jornada}
                                claseBoton={claseLista}
                            />
                        </Campo>
                    </div>
                </div>

                {grupo && (
                    <>
                        <Link
                            href={`/estudiantes?anio=${anio}&grado=${grupo.grado_id}&sede=${encodeURIComponent(sede.codigo)}`}
                            className="mt-5 flex items-center justify-between gap-3 rounded-[14px] bg-[#EEF2FB] px-4 py-3 text-[14px] font-semibold text-[#1E3A7B] transition hover:bg-[#DCE5F8] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none"
                        >
                            <span>
                                {grupo.activos} {grupo.activos === 1 ? 'estudiante activo' : 'estudiantes activos'}
                                <span className="block text-[13px] font-normal text-[#3E4A68]">Ver la lista de {grupo.grado} en esta sede</span>
                            </span>
                            <ArrowRight aria-hidden className="size-[18px] shrink-0" />
                        </Link>
                        <Eliminar
                            pregunta="¿Se creó por error?"
                            confirmacion={
                                <>
                                    ¿Eliminar el grupo <b className="font-semibold">{grupo.codigo}</b>?
                                </>
                            }
                            impedimento={
                                grupo.matriculas > 0
                                    ? `Tiene ${grupo.matriculas} ${grupo.matriculas === 1 ? 'estudiante registrado' : 'estudiantes registrados'}: no se puede eliminar.`
                                    : undefined
                            }
                            ocupado={borrar.ocupado}
                            onEliminar={borrar.eliminar}
                        />
                    </>
                )}
            </Cuerpo>

            <Pie
                sucio={form.isDirty}
                cargando={form.processing}
                desactivado={(!!grupo && !form.isDirty) || !d.grado_id || borrar.ocupado}
                guardar={grupo ? 'Guardar' : 'Crear grupo'}
                onCancelar={onCerrar}
            />
        </form>
    );
}
