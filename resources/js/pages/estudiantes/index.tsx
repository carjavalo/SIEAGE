import { Cabecera } from '@/components/estudiantes/cabecera';
import { sedeInfo } from '@/components/estudiantes/etiquetas';
import { FichaEstudiante } from '@/components/estudiantes/ficha-estudiante';
import { ListaEstudiantes } from '@/components/estudiantes/lista-estudiantes';
import { TableroGrupos } from '@/components/estudiantes/tablero-grupos';
import { VeloFicha } from '@/components/ficha';
import { useListaConFicha } from '@/hooks/use-lista-con-ficha';
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
import { router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

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
    const campoFiltro = useRef<HTMLInputElement>(null);
    const campoBusqueda = useRef<HTMLInputElement>(null);

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
    const ids = useMemo(() => visibles.map((e) => e.id), [visibles]);
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

    const ficha = useListaConFicha({
        visibles: ids,
        detalleId: detalle?.estudiante.id ?? null,
        inicial: inicial?.id ?? null,
        datosRecarga: { anio, grado: gradoId ?? undefined },
        campoFiltro,
        filtro,
        limpiarFiltro: () => setFiltro(''),
        campoAtajo: campoBusqueda,
        campoPropio: campoBusqueda,
    });

    const irAResultado = (r: Resultado) => {
        // Sin matrícula en este año: no está en ningún grado, se abre su ficha completa.
        if (r.grado_id === null) return router.visit(`/estudiantes/${r.id}`);
        if (r.grado_id !== gradoId) return router.get('/estudiantes', { anio, grado: r.grado_id, ver: r.id });
        const e = estudiantes.find((x) => x.id === r.id);
        if (!e) return;
        if (grupoId !== null && grupoId !== e.grupo_id) setGrupoId(null);
        if (!cumpleEstado(e.estado, estado)) setEstado('todos');
        setFiltro('');
        ficha.elegir(e.id, { abrir: true, centrar: true });
    };

    return (
        <PanelLayout titulo="Estudiantes" completa>
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
                    ficha.alInicio();
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
                    seleccion={ficha.seleccion}
                    lista={ficha.lista}
                    campoFiltro={campoFiltro}
                    onEstado={(e) => {
                        setEstado(e);
                        ficha.alInicio();
                    }}
                    onFiltro={(texto) => {
                        setFiltro(texto);
                        ficha.alInicio();
                    }}
                    onQuitarGrupo={() => setGrupoId(null)}
                    onQuitarFiltros={() => {
                        setFiltro('');
                        setGrupoId(null);
                        setEstado('activo');
                    }}
                    onFila={ficha.abrirFila}
                />

                <FichaEstudiante
                    ficha={detalle}
                    abierta={ficha.abierta}
                    cargando={ficha.cargando}
                    posicion={ficha.posicion}
                    total={visibles.length}
                    panel={ficha.panel}
                    onCerrar={ficha.cerrar}
                    onMover={ficha.mover}
                />
            </div>

            <VeloFicha abierta={ficha.abierta} />
        </PanelLayout>
    );
}
