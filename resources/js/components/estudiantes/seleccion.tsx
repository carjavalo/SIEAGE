import { dialogo } from '@/components/estudiantes/deshabilitar';
import { promover } from '@/components/estudiantes/promocion';
import { botonPrimario, botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Estudiante, type GrupoDestino } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ArrowUpRight, LoaderCircle, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sileo } from 'sileo';

/** Un grupo del año en curso al que se puede pasar a los marcados (EstudianteController::gruposParaCambiar). */
type GrupoCambio = { id: number; codigo: string; grado_id: number; grado: string; grado_numero: number; ciclo: boolean };
type SedeCambio = { id: number; codigo: string; nombre: string; grupos: GrupoCambio[] };

const plural = (n: number, uno: string, varios: string) => (n === 1 ? `1 ${uno}` : `${n} ${varios}`);
const claseSelect = 'w-full rounded-lg border border-[#D3DDF3] px-3 py-2 text-[14px] focus:ring-2 focus:ring-[#1E3A7B] focus:outline-none';

/**
 * Casilla de «marcar» con estado intermedio (algunos marcados): la del encabezado de la lista.
 */
export function Casilla({
    marcada,
    intermedia = false,
    etiqueta,
    onCambio,
}: {
    marcada: boolean;
    intermedia?: boolean;
    etiqueta: string;
    onCambio: () => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = intermedia;
    }, [intermedia]);

    return (
        <input
            ref={ref}
            type="checkbox"
            checked={marcada}
            onChange={onCambio}
            // Marcar no abre la ficha…
            onClick={(ev) => ev.stopPropagation()}
            // …ni se lleva el foco con el mouse: ↑ ↓ siguen moviéndose entre filas. Con Tab sí se llega.
            onMouseDown={(ev) => ev.preventDefault()}
            aria-label={etiqueta}
            className="size-4 cursor-pointer align-middle accent-[#1E3A7B]"
        />
    );
}

/**
 * La barra que aparece al marcar estudiantes en la lista: cuántos son y qué hacer con
 * todos a la vez (promoverlos al año siguiente o pasarlos a otro grupo o ciclo). Va
 * montada siempre que se pueda marcar; sin marcados no se ve.
 */
export function BarraSeleccion({
    anio,
    marcados,
    puedePromover,
    puedeCambiar,
    gruposDestino,
    enSabatina,
    onLimpiar,
}: {
    anio: number;
    marcados: Estudiante[];
    puedePromover: boolean;
    puedeCambiar: boolean;
    /** Grupos del grado siguiente en el año siguiente (para promoverlos todos a uno). */
    gruposDestino: GrupoDestino[];
    enSabatina: boolean;
    onLimpiar: () => void;
}) {
    const [abierto, setAbierto] = useState(false);
    // Mientras se guarda: el diálogo no se cierra y los botones de la barra no responden (no se manda dos veces).
    const [ocupado, setOcupado] = useState(false);
    // Lo que muestra el diálogo, con los marcados de cuando se abrió. Se guarda aparte de
    // `abierto` para que no se vacíe mientras se cierra (si no, queda un recuadro en blanco
    // que tapa los clics hasta que termina de cerrarse).
    const [accion, setAccion] = useState<{ tipo: 'promover' | 'cambiar'; marcados: Estudiante[]; vez: number } | null>(null);
    const abrir = (tipo: 'promover' | 'cambiar') => {
        setAccion((antes) => ({ tipo, marcados, vez: (antes?.vez ?? 0) + 1 }));
        setAbierto(true);
    };
    const listo = () => {
        setAbierto(false);
        onLimpiar();
    };
    const boton =
        'flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold transition focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none';

    return (
        <>
            {marcados.length > 0 && (
                <div
                    role="region"
                    aria-label="Estudiantes marcados"
                    // Flota al pie de la lista: al aparecer no corre las filas (el siguiente clic cae donde se apunta).
                    className="absolute inset-x-3 bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-[16px] bg-[#EEF2FB]/95 px-4 py-2 shadow-[0_8px_24px_rgba(22,34,63,0.18)] ring-1 ring-[#C4D2F1] backdrop-blur"
                >
                    <p className="mr-auto text-[14px] text-[#1E3A7B]">
                        <b className="font-semibold tabular-nums">{marcados.length}</b> {marcados.length === 1 ? 'marcado' : 'marcados'}
                    </p>
                    {puedePromover && (
                        <button
                            type="button"
                            onClick={() => abrir('promover')}
                            disabled={ocupado}
                            className={cn(boton, 'bg-[#1E3A7B] text-white hover:bg-[#172E63] disabled:opacity-60')}
                        >
                            <ArrowUpRight className="size-4" />
                            Promover a {anio + 1}
                        </button>
                    )}
                    {puedeCambiar && (
                        <button
                            type="button"
                            onClick={() => abrir('cambiar')}
                            disabled={ocupado}
                            className={cn(boton, 'bg-white text-[#1E3A7B] ring-1 ring-[#C4D2F1] hover:bg-[#F7F9FD] disabled:opacity-60')}
                        >
                            <TrendingUp className="size-4" />
                            Cambiar de grupo o ciclo
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onLimpiar}
                        disabled={ocupado}
                        className={cn(boton, 'text-[#56627F] hover:bg-white hover:text-[#16223F] disabled:opacity-60')}
                    >
                        <X className="size-4" />
                        Quitar marcas
                    </button>
                </div>
            )}

            {/* Siempre montado (aunque no haya marcados): al terminar se quitan las marcas y el diálogo se cierra con calma. */}
            <Dialog open={abierto} onOpenChange={(v) => !ocupado && setAbierto(v)}>
                <DialogContent className={dialogo}>
                    {accion?.tipo === 'promover' && (
                        <PromoverMarcados
                            key={accion.vez}
                            anio={anio}
                            marcados={accion.marcados}
                            gruposDestino={enSabatina ? [] : gruposDestino}
                            enviando={ocupado}
                            onEnviando={setOcupado}
                            onListo={listo}
                            onCancelar={() => setAbierto(false)}
                        />
                    )}
                    {accion?.tipo === 'cambiar' && (
                        <CambiarMarcados
                            key={accion.vez}
                            marcados={accion.marcados}
                            enviando={ocupado}
                            onEnviando={setOcupado}
                            onListo={listo}
                            onCancelar={() => setAbierto(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

/** Lo que comparten los dos diálogos: si se está guardando (lo lleva la barra) y qué hacer al terminar. */
type PropsAccion = {
    marcados: Estudiante[];
    enviando: boolean;
    onEnviando: (v: boolean) => void;
    /** Solo si salió bien: cierra y quita las marcas. Con error se queda abierto y con las marcas. */
    onListo: () => void;
    onCancelar: () => void;
};

function PromoverMarcados({
    anio,
    marcados,
    gruposDestino,
    enviando,
    onEnviando,
    onListo,
    onCancelar,
}: PropsAccion & { anio: number; gruposDestino: GrupoDestino[] }) {
    const [destino, setDestino] = useState('');
    // Los retirados y los ya promovidos no se promueven.
    const pendientes = marcados.filter((e) => e.estado === 'activo' && !e.promovido_a);
    const fuera = marcados.length - pendientes.length;

    const confirmar = () => {
        onEnviando(true);
        promover(
            anio,
            { estudiantes: pendientes.map((e) => e.id), ...(destino ? { grupo_destino_id: Number(destino) } : {}) },
            { onFin: () => onEnviando(false), onExito: onListo },
        );
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Promover a {anio + 1}</DialogTitle>
                <DialogDescription className="text-[#56627F]">
                    {plural(pendientes.length, 'estudiante marcado pasa', 'estudiantes marcados pasan')} al año {anio + 1}: cada uno a su mismo grupo
                    del grado siguiente (los de ciclos, al ciclo siguiente), o todos al grupo que elijas. Los de undécimo quedan graduados y los
                    marcados como reprobados repiten.
                    {fuera > 0 && ` ${plural(fuera, 'no está activo o ya fue promovido', 'no están activos o ya fueron promovidos')}: no se tocan.`}
                </DialogDescription>
            </DialogHeader>

            {gruposDestino.length > 0 && (
                <div>
                    <label htmlFor="promover-destino" className="mb-1.5 block text-[13px] font-semibold text-[#16223F]">
                        A qué grupo de {anio + 1}
                    </label>
                    <select
                        id="promover-destino"
                        value={destino}
                        onChange={(e) => setDestino(e.target.value)}
                        disabled={enviando}
                        className={claseSelect}
                    >
                        <option value="">Cada uno a su mismo grupo (automático)</option>
                        {gruposDestino.map((g) => (
                            <option key={g.id} value={g.id}>
                                Todos al {g.codigo} ({g.sede})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="mt-1 flex justify-end gap-2">
                <button type="button" onClick={onCancelar} disabled={enviando} className={botonSecundario}>
                    Cancelar
                </button>
                <button type="button" onClick={confirmar} disabled={enviando || pendientes.length === 0} className={botonPrimario}>
                    {enviando && <LoaderCircle className="size-4 animate-spin" />}
                    {pendientes.length === 0 ? 'Nadie por promover' : `Promover ${plural(pendientes.length, 'estudiante', 'estudiantes')}`}
                </button>
            </div>
        </>
    );
}

function CambiarMarcados({ marcados, enviando, onEnviando, onListo, onCancelar }: PropsAccion) {
    const [sedes, setSedes] = useState<SedeCambio[] | null>(null);
    const [errorCarga, setErrorCarga] = useState(false);
    const [sedeId, setSedeId] = useState('');
    const [grupoId, setGrupoId] = useState('');
    const [razon, setRazon] = useState('');
    // Solo se cambian los activos.
    const activos = marcados.filter((e) => e.estado === 'activo');
    const fuera = marcados.length - activos.length;

    useEffect(() => {
        let vivo = true;
        fetch('/estudiantes/grupos-para-cambiar', { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => (r.ok ? r.json() : Promise.reject(r)))
            .then((datos: SedeCambio[]) => vivo && setSedes(datos))
            .catch(() => vivo && setErrorCarga(true));
        return () => {
            vivo = false;
        };
    }, []);

    const grupos = (sedes ?? [])
        .filter((s) => !sedeId || String(s.id) === sedeId)
        .flatMap((s) => s.grupos.map((g) => ({ ...g, sede: s.codigo })))
        .sort((a, b) => a.grado_numero - b.grado_numero || a.codigo.localeCompare(b.codigo, 'es', { numeric: true }));
    const regulares = grupos.filter((g) => !g.ciclo);
    const ciclos = grupos.filter((g) => g.ciclo);
    const grados = [...new Map(regulares.map((g) => [g.grado_id, g.grado])).entries()];

    const cambiar = () => {
        router.post(
            '/estudiantes/cambiar-grupo',
            { estudiantes: activos.map((e) => e.id), grupo_id: Number(grupoId), razon },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => onEnviando(true),
                onFinish: () => onEnviando(false),
                onSuccess: (pagina) => {
                    const flash = (pagina.props as { flash?: { success?: string | null } }).flash;
                    sileo.success({ title: 'Cambio registrado', description: flash?.success ?? undefined });
                    onListo();
                },
                onError: (errores) => sileo.error({ title: 'No se cambió a nadie', description: Object.values(errores)[0] as string }),
            },
        );
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Cambiar de grupo o ciclo</DialogTitle>
                <DialogDescription className="text-[#56627F]">
                    {plural(activos.length, 'estudiante marcado pasa', 'estudiantes marcados pasan')} al grupo o ciclo que elijas (puede ser de otro
                    grado o sede). Queda en el historial de cada uno.
                    {fuera > 0 && ` ${plural(fuera, 'no está activo', 'no están activos')}: no se cambia${fuera === 1 ? '' : 'n'}.`}
                </DialogDescription>
            </DialogHeader>

            {errorCarga ? (
                <p className="rounded-[12px] bg-[#FDECEC] px-3.5 py-2.5 text-[14px] text-[#A12B2B]">
                    No se pudieron cargar los grupos. Cierra y vuelve a intentar.
                </p>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="cambiar-sede" className="mb-1.5 block text-[13px] font-semibold text-[#16223F]">
                            Sede
                        </label>
                        <select
                            id="cambiar-sede"
                            value={sedeId}
                            onChange={(e) => {
                                setSedeId(e.target.value);
                                setGrupoId('');
                            }}
                            disabled={enviando || !sedes}
                            className={claseSelect}
                        >
                            <option value="">Todas las sedes</option>
                            {(sedes ?? []).map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cambiar-grupo" className="mb-1.5 block text-[13px] font-semibold text-[#16223F]">
                            Nuevo grupo o ciclo
                        </label>
                        <select
                            id="cambiar-grupo"
                            value={grupoId}
                            onChange={(e) => setGrupoId(e.target.value)}
                            disabled={enviando || !sedes}
                            className={claseSelect}
                        >
                            <option value="">{sedes ? 'Elige un grupo o ciclo...' : 'Cargando grupos...'}</option>
                            {grados.map(([id, nombre]) => (
                                <optgroup key={id} label={nombre}>
                                    {regulares
                                        .filter((g) => g.grado_id === id)
                                        .map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.codigo} ({g.sede})
                                            </option>
                                        ))}
                                </optgroup>
                            ))}
                            {ciclos.length > 0 && (
                                <optgroup label="Jornada sabatina (ciclos)">
                                    {ciclos.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.codigo} ({g.sede})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cambiar-razon" className="mb-1.5 block text-[13px] font-semibold text-[#16223F]">
                            Razón del cambio
                        </label>
                        <textarea
                            id="cambiar-razon"
                            value={razon}
                            onChange={(e) => setRazon(e.target.value)}
                            disabled={enviando}
                            placeholder="Explica por qué cambian de grupo o ciclo..."
                            maxLength={300}
                            rows={3}
                            className={claseSelect}
                        />
                        <p className="mt-1 text-xs text-[#8C97B3]">{razon.length}/300 · mínimo 10</p>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancelar} disabled={enviando} className={botonSecundario}>
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={cambiar}
                    disabled={enviando || !grupoId || razon.trim().length < 10 || activos.length === 0}
                    className={botonPrimario}
                >
                    {enviando && <LoaderCircle className="size-4 animate-spin" />}
                    Cambiar {plural(activos.length, 'estudiante', 'estudiantes')}
                </button>
            </div>
        </>
    );
}
