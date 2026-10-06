import { Desplegable } from '@/components/desplegable';
import { botonPrimario } from '@/components/formulario';
import { ExportarExcel } from '@/components/informe/exportar-excel';
import { Hoja } from '@/components/informe/hoja';
import { AnexoGrupo, Grados, Grupos, IndiceAnexo, Perfil, Portada, Resumen, Retiros, Sedes } from '@/components/informe/secciones';
import { type Informe, alcanceInforme, cifra, enHojas, fechaCorta, fechaLarga, institucionCorta } from '@/lib/informe';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

const claseFiltro =
    'h-[26px] rounded-full bg-white pr-2 pl-2.5 text-[14px] font-semibold text-[#1E3A7B] tabular-nums ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] aria-expanded:ring-[#6E8BD6]';

/** Filas por hoja: la primera del bloque lleva el titular, así que caben menos. */
const FILAS_GRUPOS = { primera: 36, siguientes: 42 };
const FILAS_ANEXO = { primera: 36, siguientes: 40 };

type Pieza = { clave: string; contenido: ReactNode; sinMarco?: boolean };

/**
 * Informe de matrícula del año: vista previa hoja por hoja (A4). «Guardar PDF»
 * abre el cuadro de impresión del navegador, donde se elige «Guardar como PDF»;
 * al imprimir solo salen las hojas (ver @page informe en app.css).
 */
export default function InformeMatricula(informe: Informe) {
    const hojas = useMemo(() => armar(informe), [informe]);
    const { anio, anios, totales, corte, institucion, sedes, filtro, opciones } = informe;
    const alcance = alcanceInforme(filtro);

    // Los grados de la sede elegida; sin sede, los de todas las que ve el usuario.
    const grados = useMemo(() => {
        const de = filtro.sede ? opciones.filter((o) => o.codigo === filtro.sede) : opciones;
        const unicos = new Map(de.flatMap((o) => o.grados).map((g) => [g.id, g]));
        return [...unicos.values()].sort((a, b) => a.numero - b.numero);
    }, [opciones, filtro.sede]);
    const unaSede = opciones.length === 1;

    // Los grupos del grado elegido, en la sede elegida (o en todas las que ve).
    const grupos = useMemo(() => {
        if (!filtro.grado) return [];
        const de = filtro.sede ? opciones.filter((o) => o.codigo === filtro.sede) : opciones;
        return de.flatMap((o) => o.grados.filter((g) => g.id === filtro.grado).flatMap((g) => g.grupos.map((gr) => ({ ...gr, sede: o.nombre }))));
    }, [opciones, filtro.sede, filtro.grado]);

    /** Cambia año, sede, grado o grupo. Al cambiar la sede o el grado se quita el grupo; un grado que la sede nueva no tiene, también. */
    const filtrar = (cambios: { anio?: number; sede?: string | null; grado?: number | null; grupo?: number | null }) => {
        const sede = cambios.sede !== undefined ? cambios.sede : filtro.sede;
        let grado = cambios.grado !== undefined ? cambios.grado : filtro.grado;
        if (cambios.sede !== undefined && sede && grado && !opciones.find((o) => o.codigo === sede)?.grados.some((g) => g.id === grado)) grado = null;
        // Otro año tiene otros grupos: el grupo solo se conserva si no cambia nada más.
        const grupo = cambios.grupo !== undefined ? cambios.grupo : Object.keys(cambios).length ? null : filtro.grupo;
        router.get('/informes/matricula', { anio: cambios.anio ?? anio, ...(sede && { sede }), ...(grado && { grado }), ...(grupo && { grupo }) });
    };

    const encabezado: [ReactNode, ReactNode] = [
        <>
            <b className="font-semibold text-[#1E3A7B]">Informe de matrícula {anio}</b>
            {alcance && ` · ${alcance}`} · {institucionCorta(institucion?.nombre)}
        </>,
        <>Corte: {fechaCorta(corte)}</>,
    ];

    return (
        <>
            {/* El título es el nombre que propone el navegador para el PDF. */}
            <Head title={`Informe de matrícula ${anio}${alcance ? ` · ${alcance}` : ''}`} />

            <div className="min-h-screen bg-[#DDE3EE] font-sans text-[#16223F] print:bg-white">
                <div className="sticky top-0 z-20 border-b border-[#E3E9F6] bg-white/90 backdrop-blur print:hidden">
                    <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 md:px-8">
                        <Link
                            href={`/estudiantes?anio=${anio}`}
                            aria-label="Volver a Estudiantes"
                            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full pr-3.5 pl-2.5 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                        >
                            <ArrowLeft className="size-4" />
                            <span className="hidden sm:inline">Estudiantes</span>
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em] max-sm:sr-only">Informe de matrícula</h1>
                                <Desplegable
                                    etiqueta="Año lectivo"
                                    valor={anio}
                                    opciones={anios.map((a) => ({ valor: a, etiqueta: String(a) }))}
                                    onCambio={(a) => filtrar({ anio: a })}
                                    claseBoton={claseFiltro}
                                />
                                {!unaSede && (
                                    <Desplegable
                                        etiqueta="Sede"
                                        valor={filtro.sede ?? ''}
                                        opciones={[
                                            { valor: '', etiqueta: 'Todas las sedes' },
                                            ...opciones.map((o) => ({ valor: o.codigo, etiqueta: o.nombre })),
                                        ]}
                                        onCambio={(s) => filtrar({ sede: s || null })}
                                        claseBoton={cn(claseFiltro, 'max-w-[200px] truncate')}
                                    />
                                )}
                                <Desplegable
                                    etiqueta="Grado"
                                    valor={filtro.grado ? String(filtro.grado) : ''}
                                    opciones={[
                                        { valor: '', etiqueta: 'Todos los grados' },
                                        ...grados.map((g) => ({ valor: String(g.id), etiqueta: g.nombre })),
                                    ]}
                                    onCambio={(g) => filtrar({ grado: g ? Number(g) : null })}
                                    claseBoton={claseFiltro}
                                />
                                {grupos.length > 0 && (
                                    <Desplegable
                                        etiqueta="Grupo"
                                        valor={filtro.grupo ? String(filtro.grupo) : ''}
                                        opciones={[
                                            { valor: '', etiqueta: 'Todos los grupos' },
                                            // Sin sede elegida, cada grupo dice de qué sede es.
                                            ...grupos.map((g) => ({
                                                valor: String(g.id),
                                                etiqueta: g.codigo,
                                                ...(!filtro.sede && !unaSede && { detalle: g.sede }),
                                            })),
                                        ]}
                                        onCambio={(g) => filtrar({ grupo: g ? Number(g) : null })}
                                        claseBoton={claseFiltro}
                                    />
                                )}
                            </div>
                            <p className="truncate text-[12.5px] text-[#56627F]">
                                {hojas.length} hojas · {cifra(totales.activos)} estudiantes · corte {fechaCorta(corte)}
                            </p>
                        </div>
                        <p className="ml-auto hidden max-w-[260px] text-right text-[12.5px] leading-snug text-[#56627F] xl:block">
                            En el cuadro que se abre, elige <b className="font-semibold text-[#16223F]">«Guardar como PDF»</b> como destino.
                        </p>
                        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
                            <ExportarExcel anio={anio} sedes={sedes} />
                            <button type="button" onClick={() => window.print()} className={botonPrimario}>
                                <Download className="size-[18px]" />
                                {/* En el celular, solo «PDF», para que quepa el título. */}
                                <span>
                                    <span className="max-sm:sr-only">Guardar </span>PDF
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <main className="flex flex-col items-center gap-6 overflow-x-auto px-4 py-8 print:block print:overflow-visible print:p-0">
                    {hojas.map((h, n) => (
                        <Hoja
                            key={h.clave}
                            numero={n + 1}
                            total={hojas.length}
                            sinMarco={h.sinMarco}
                            encabezado={encabezado}
                            pie={<>SIEAGE · generado el {fechaLarga(corte)}</>}
                        >
                            {h.contenido}
                        </Hoja>
                    ))}
                </main>
            </div>
        </>
    );
}

/** Todas las hojas en orden, con los números de página que usan los índices. */
function armar(informe: Informe): Pieza[] {
    const gruposPorId = new Map(informe.grupos.map((g) => [g.id, g]));
    const hojasGrupos = enHojas(informe.grupos, FILAS_GRUPOS.primera, FILAS_GRUPOS.siguientes);
    const hojasAnexo = informe.anexo.flatMap(({ grupo, estudiantes }) =>
        enHojas(estudiantes, FILAS_ANEXO.primera, FILAS_ANEXO.siguientes).map((filas, k) => ({
            grupo,
            filas,
            primera: k === 0,
            desde: k === 0 ? 0 : FILAS_ANEXO.primera + (k - 1) * FILAS_ANEXO.siguientes,
        })),
    );

    // Portada (1), resumen, sedes, grados, grupos (varias), perfil, retiros, índice del anexo y el anexo.
    const inicio = {
        resumen: 2,
        sedes: 3,
        grados: 4,
        grupos: 5,
        perfil: 5 + hojasGrupos.length,
        retiros: 6 + hojasGrupos.length,
        anexo: 7 + hojasGrupos.length,
    };
    const paginaDelGrupo = new Map<number, number>();
    hojasAnexo.forEach((h, k) => h.primera && paginaDelGrupo.set(h.grupo, inicio.anexo + 1 + k));

    const indice = [
        { titulo: 'Resumen del año', pagina: inicio.resumen },
        { titulo: 'Sedes y jornadas', pagina: inicio.sedes },
        { titulo: 'Grados', pagina: inicio.grados },
        { titulo: 'Grupos', pagina: inicio.grupos },
        { titulo: 'Perfil de los estudiantes', pagina: inicio.perfil },
        { titulo: 'Retiros y ritmo de matrícula', pagina: inicio.retiros },
        { titulo: 'Estudiantes por grupo', pagina: inicio.anexo },
    ];

    return [
        { clave: 'portada', sinMarco: true, contenido: <Portada informe={informe} indice={indice} /> },
        { clave: 'resumen', contenido: <Resumen informe={informe} /> },
        { clave: 'sedes', contenido: <Sedes informe={informe} /> },
        { clave: 'grados', contenido: <Grados informe={informe} /> },
        ...hojasGrupos.map((filas, k) => ({ clave: `grupos-${k}`, contenido: <Grupos informe={informe} filas={filas} primera={k === 0} /> })),
        { clave: 'perfil', contenido: <Perfil informe={informe} /> },
        { clave: 'retiros', contenido: <Retiros informe={informe} /> },
        { clave: 'indice', contenido: <IndiceAnexo informe={informe} paginas={paginaDelGrupo} /> },
        ...hojasAnexo.map((h) => ({
            clave: `anexo-${h.grupo}-${h.desde}`,
            contenido: <AnexoGrupo grupo={gruposPorId.get(h.grupo)!} estudiantes={h.filas} desde={h.desde} primera={h.primera} />,
        })),
    ];
}
