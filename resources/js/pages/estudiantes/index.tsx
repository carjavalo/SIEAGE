import { Cabecera } from '@/components/estudiantes/cabecera';
import { sedeInfo } from '@/components/estudiantes/etiquetas';
import { FichaEstudiante } from '@/components/estudiantes/ficha-estudiante';
import { ListaEstudiantes } from '@/components/estudiantes/lista-estudiantes';
import { TableroGrupos } from '@/components/estudiantes/tablero-grupos';
import PanelLayout from '@/layouts/panel-layout';
import {
    type Estudiante,
    type FichaDetalle,
    type FiltroEstado,
    type Grado,
    type Grupo,
    type Resultado,
    cumpleEstado,
    cumpleTexto,
    palabras,
} from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

/** En 2xl la ficha es una columna más al lado de la tabla: no se cierra al pulsar fuera. */
const esAncha = () => window.matchMedia('(min-width: 1536px)').matches;

/**
 * Tablero del grado: grados arriba, los grupos en tarjetas y la lista con la
 * ficha del estudiante elegido. Cambiar de grado o de año es una visita nueva
 * (router.get), así que todo este estado vuelve a empezar solo.
 */
export default function Estudiantes({ anios, anio, grados, gradoId, totales, grupos: gruposServidor, estudiantes, busqueda, detalle }: Props) {
    // Si la URL trae ?ver= (p. ej. desde la búsqueda global), se abre con esa ficha.
    const inicial = detalle ? estudiantes.find((e) => e.id === detalle.estudiante.id) : undefined;
    const [grupoId, setGrupoId] = useState<number | null>(null);
    const [estado, setEstado] = useState<FiltroEstado>(inicial && inicial.estado !== 'activo' ? 'todos' : 'activo');
    const [filtro, setFiltro] = useState('');
    const [seleccion, setSeleccion] = useState<number | null>(inicial?.id ?? null);
    const [abierta, setAbierta] = useState(!!inicial);
    const [cargando, setCargando] = useState(false);

    const lista = useRef<HTMLDivElement>(null);
    const campoFiltro = useRef<HTMLInputElement>(null);
    const campoBusqueda = useRef<HTMLInputElement>(null);
    const panel = useRef<HTMLElement>(null);
    // Qué hacer con la fila elegida en el próximo pintado: llevarla a la vista y, si toca, darle el foco.
    const pedidoFila = useRef<{ centrar: boolean; enfocar: boolean } | null>(inicial ? { centrar: true, enfocar: false } : null);

    // activos, nuevos y cupos llegan como texto (son SUM en MySQL). Orden: por sede y luego por código.
    const grupos = useMemo(
        () =>
            gruposServidor
                .map((g) => ({ ...g, activos: Number(g.activos), nuevos: Number(g.nuevos), cupos: Number(g.cupos) }))
                .sort(
                    (a, b) =>
                        sedeInfo(a.sede_codigo).orden - sedeInfo(b.sede_codigo).orden || a.codigo.localeCompare(b.codigo, 'es', { numeric: true }),
                ),
        [gruposServidor],
    );
    const grado = grados.find((g) => g.id === gradoId);
    const grupo = grupos.find((g) => g.id === grupoId);

    const buscadas = useMemo(() => palabras(filtro), [filtro]);
    const delAlcance = useMemo(() => estudiantes.filter((e) => grupoId === null || e.grupo_id === grupoId), [estudiantes, grupoId]);
    const conTexto = useMemo(() => delAlcance.filter((e) => cumpleTexto(e, buscadas)), [delAlcance, buscadas]);
    const visibles = useMemo(() => conTexto.filter((e) => cumpleEstado(e.estado, estado)), [conTexto, estado]);
    const conteos = useMemo(
        () => ({
            activo: conTexto.filter((e) => e.estado === 'activo').length,
            inactivo: conTexto.filter((e) => e.estado !== 'activo').length,
            todos: conTexto.length,
        }),
        [conTexto],
    );
    const total = useMemo(() => delAlcance.filter((e) => cumpleEstado(e.estado, estado)).length, [delAlcance, estado]);
    // Las columnas que no distinguen nada en el grado no se muestran.
    const columnas = useMemo(
        () => ({
            sede: new Set(grupos.map((g) => g.sede_codigo)).size > 1,
            jornada: new Set(grupos.map((g) => g.jornada)).size > 1,
            modalidad: estudiantes.some((e) => e.modalidad),
            todosNuevos: estudiantes.length > 0 && estudiantes.every((e) => e.condicion === 'nuevo'),
        }),
        [grupos, estudiantes],
    );
    const posicion = visibles.findIndex((e) => e.id === seleccion);

    // La ficha se pide un instante después de elegir: recorrer la lista con
    // ↑ ↓ no dispara una consulta por cada fila que pasa.
    useEffect(() => {
        if (!abierta || seleccion === null || seleccion === detalle?.estudiante.id) return;
        const t = setTimeout(() => {
            router.reload({
                only: ['detalle'],
                data: { anio, grado: gradoId ?? undefined, ver: seleccion },
                onStart: () => setCargando(true),
                onFinish: () => setCargando(false),
            });
        }, 120);
        return () => clearTimeout(t);
    }, [abierta, seleccion]); // eslint-disable-line react-hooks/exhaustive-deps

    // Después de elegir, la fila queda a la vista (y con el foco si no se está escribiendo en el filtro).
    useEffect(() => {
        const pedido = pedidoFila.current;
        if (!pedido || seleccion === null) return;
        pedidoFila.current = null;
        const fila = lista.current?.querySelector<HTMLElement>(`[data-fila="${seleccion}"]`);
        const caja = lista.current?.getBoundingClientRect();
        if (!fila || !caja) return;
        // Solo se desplaza si no se ve entera (el encabezado fijo de la tabla tapa unos 36 px).
        const { top, bottom } = fila.getBoundingClientRect();
        if (top < caja.top + 36 || bottom > caja.bottom) fila.scrollIntoView({ block: pedido.centrar ? 'center' : 'nearest' });
        if (pedido.enfocar && document.activeElement !== campoFiltro.current) fila.focus({ preventScroll: true });
    });

    const elegir = useCallback((id: number, { abrir = false, centrar = false } = {}) => {
        setSeleccion(id);
        if (abrir) setAbierta(true);
        pedidoFila.current = { centrar, enfocar: true };
    }, []);
    const abrirFila = useCallback((id: number) => elegir(id, { abrir: true }), [elegir]);

    const mover = (paso: 1 | -1) => {
        if (!visibles.length) return;
        const i = visibles.findIndex((e) => e.id === seleccion);
        elegir(visibles[i < 0 ? 0 : Math.min(Math.max(i + paso, 0), visibles.length - 1)].id);
    };

    const cerrar = () => {
        setAbierta(false);
        pedidoFila.current = { centrar: false, enfocar: true };
    };

    const alInicio = () => lista.current?.scrollTo({ top: 0 });

    const irAResultado = (r: Resultado) => {
        // Sin matrícula en este año: no está en ningún grado, se abre su ficha completa.
        if (r.grado_id === null) return router.visit(`/estudiantes/${r.id}`);
        if (r.grado_id !== gradoId) return router.get('/estudiantes', { anio, grado: r.grado_id, ver: r.id });
        const e = estudiantes.find((x) => x.id === r.id);
        if (!e) return;
        if (grupoId !== null && grupoId !== e.grupo_id) setGrupoId(null);
        if (!cumpleEstado(e.estado, estado)) setEstado('todos');
        setFiltro('');
        elegir(e.id, { abrir: true, centrar: true });
    };

    // Teclado de la página: ↑ ↓ recorren la lista (también desde el filtro), Enter abre
    // la ficha, "/" lleva a la búsqueda y Esc cierra por capas (ficha → filtro).
    useEffect(() => {
        const alTeclear = (ev: KeyboardEvent) => {
            const t = ev.target;
            if (!(t instanceof HTMLElement) || ev.ctrlKey || ev.metaKey || ev.altKey || t === campoBusqueda.current) return;
            const enCampo = t.matches('input, select, textarea');
            const enFiltro = t === campoFiltro.current;

            if (ev.key === 'Escape') {
                if (abierta) {
                    ev.preventDefault();
                    cerrar();
                } else if (enFiltro && filtro) setFiltro('');
                else if (enCampo) t.blur();
            } else if (ev.key === '/' && !enCampo) {
                ev.preventDefault();
                campoBusqueda.current?.focus();
            } else if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && (!enCampo || enFiltro)) {
                ev.preventDefault();
                mover(ev.key === 'ArrowDown' ? 1 : -1);
            } else if (ev.key === 'Enter' && seleccion !== null && !abierta) {
                if (enFiltro || (!enCampo && !panel.current?.contains(t) && !t.matches('button, a'))) {
                    ev.preventDefault();
                    setAbierta(true);
                }
            }
        };
        window.addEventListener('keydown', alTeclear);
        return () => window.removeEventListener('keydown', alTeclear);
    });

    // Flotante (menos de 2xl): pulsar fuera la cierra. Otra fila solo cambia de estudiante.
    useEffect(() => {
        if (!abierta) return;
        const alPulsar = (ev: MouseEvent) => {
            const t = ev.target;
            if (!(t instanceof Element) || esAncha() || panel.current?.contains(t) || t.closest('[data-fila], header, [data-busqueda], [role=menu]'))
                return;
            setAbierta(false);
        };
        document.addEventListener('mousedown', alPulsar);
        // Acoplada, la lista se angosta: la fila elegida sigue a la vista.
        const t = esAncha()
            ? setTimeout(() => lista.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' }), 320)
            : undefined;
        return () => {
            document.removeEventListener('mousedown', alPulsar);
            clearTimeout(t);
        };
    }, [abierta]);

    return (
        <PanelLayout titulo="Estudiantes" completa>
            {/* El mismo degradado del login detrás de la parte alta, sin caja. */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-x-0 top-[65px] h-[270px] overflow-hidden print:hidden [@media(min-height:860px)]:h-[350px]"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-[#E4EBFA] via-[#EEF2FB] to-[#F5F7FC]" />
                <div className="absolute -top-24 right-[8%] size-96 rounded-full bg-white/70 blur-3xl" />
                <div className="absolute -top-10 left-[-6%] size-80 rounded-full bg-[#C4D2F1]/60 blur-3xl" />
            </div>

            <Cabecera
                anios={anios}
                anio={anio}
                grados={grados}
                gradoId={gradoId}
                totales={totales}
                busqueda={busqueda}
                entrada={campoBusqueda}
                onElegir={irAResultado}
            />

            <TableroGrupos
                grupos={grupos}
                estudiantes={estudiantes}
                grupoId={grupoId}
                anio={anio}
                onElegir={(id) => {
                    setGrupoId(id);
                    alInicio();
                }}
            />

            <div className="relative mt-1.5 flex min-h-[420px] flex-col lg:min-h-0 lg:flex-1 lg:flex-row [@media(min-height:860px)]:mt-3">
                <ListaEstudiantes
                    grado={grado}
                    grupos={grupos}
                    grupo={grupo}
                    estado={estado}
                    conteos={conteos}
                    filtro={filtro}
                    buscadas={buscadas}
                    total={total}
                    filas={visibles}
                    columnas={columnas}
                    seleccion={seleccion}
                    lista={lista}
                    campoFiltro={campoFiltro}
                    onEstado={(e) => {
                        setEstado(e);
                        alInicio();
                    }}
                    onFiltro={(texto) => {
                        setFiltro(texto);
                        alInicio();
                    }}
                    onQuitarGrupo={() => setGrupoId(null)}
                    onQuitarFiltros={() => {
                        setFiltro('');
                        setGrupoId(null);
                        setEstado('activo');
                    }}
                    onFila={abrirFila}
                />

                <FichaEstudiante
                    ficha={detalle}
                    abierta={abierta}
                    cargando={cargando || (abierta && seleccion !== detalle?.estudiante.id)}
                    posicion={posicion}
                    total={visibles.length}
                    panel={panel}
                    onCerrar={cerrar}
                    onMover={mover}
                />
            </div>

            {/* Velo apenas visible mientras la ficha flota sobre la lista. */}
            <div
                aria-hidden
                className={cn(
                    'pointer-events-none fixed inset-x-0 top-[65px] bottom-0 z-30 bg-[#16223F]/[0.07] transition-opacity duration-300 2xl:hidden print:hidden',
                    abierta ? 'opacity-100' : 'opacity-0',
                )}
            />
        </PanelLayout>
    );
}
