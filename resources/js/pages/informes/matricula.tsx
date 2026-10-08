import { BarraInforme } from '@/components/informe/barra-informe';
import { ExportarExcel } from '@/components/informe/exportar-excel';
import { Hoja } from '@/components/informe/hoja';
import { AnexoGrupo, Grados, Grupos, IndiceAnexo, Perfil, Portada, Resumen, Retiros, Sedes } from '@/components/informe/secciones';
import { type Informe, alcanceInforme, cifra, enHojas, fechaCorta, fechaLarga, institucionCorta } from '@/lib/informe';
import { Head } from '@inertiajs/react';
import { type ReactNode, useMemo } from 'react';

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
                <BarraInforme
                    ruta="/informes/matricula"
                    anio={anio}
                    anios={anios}
                    filtro={filtro}
                    opciones={opciones}
                    resumen={
                        <>
                            {hojas.length} hojas · {cifra(totales.activos)} estudiantes · corte {fechaCorta(corte)}
                        </>
                    }
                    acciones={<ExportarExcel anio={anio} sedes={sedes} />}
                />

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
