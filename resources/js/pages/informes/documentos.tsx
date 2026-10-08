import { BarraInforme } from '@/components/informe/barra-informe';
import { Bloque, Cifras, Hoja, Titular, num, tabla, td, th } from '@/components/informe/hoja';
import {
    type EstadoDocumentoInforme,
    type InformeDocumentos as Informe,
    alcanceInforme,
    cifra,
    fechaCorta,
    fechaLarga,
    institucionCorta,
    pct,
} from '@/lib/informe';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { type ReactNode, useMemo } from 'react';

/** Filas por hoja del listado (el título de cada grupo cuenta como una). */
const FILAS_POR_HOJA = 28;

type Estudiante = Informe['grupos'][number]['estudiantes'][number];
type Fila = { tipo: 'grupo'; grupo: Informe['grupos'][number]; continua: boolean } | { tipo: 'estudiante'; estudiante: Estudiante };

/**
 * Documentos de matrícula pendientes por estudiante, con los mismos filtros del
 * informe de matrícula. La primera hoja resume; las demás listan, por grupo, a
 * quienes les falta algo y qué. Se guarda como PDF igual que el otro informe.
 */
export default function InformeDocumentos(informe: Informe) {
    const { anio, anios, corte, institucion, filtro, opciones, totales, grupos } = informe;
    const alcance = alcanceInforme(filtro);
    const listado = useMemo(() => paginar(grupos), [grupos]);
    const total = 1 + listado.length;

    const encabezado: [ReactNode, ReactNode] = [
        <>
            <b className="font-semibold text-[#1E3A7B]">Documentos pendientes {anio}</b>
            {alcance && ` · ${alcance}`} · {institucionCorta(institucion?.nombre)}
        </>,
        <>Corte: {fechaCorta(corte)}</>,
    ];
    const pie = <>SIEAGE · generado el {fechaLarga(corte)}</>;

    return (
        <>
            {/* El título es el nombre que propone el navegador para el PDF. */}
            <Head title={`Documentos pendientes ${anio}${alcance ? ` · ${alcance}` : ''}`} />

            <div className="min-h-screen bg-[#DDE3EE] font-sans text-[#16223F] print:bg-white">
                <BarraInforme
                    ruta="/informes/documentos"
                    anio={anio}
                    anios={anios}
                    filtro={filtro}
                    opciones={opciones}
                    resumen={
                        <>
                            {total} {total === 1 ? 'hoja' : 'hojas'} · {cifra(totales.pendientes)} de {cifra(totales.activos)} estudiantes con
                            documentos pendientes
                        </>
                    }
                />

                <main className="flex flex-col items-center gap-6 overflow-x-auto px-4 py-8 print:block print:overflow-visible print:p-0">
                    <Hoja numero={1} total={total} encabezado={encabezado} pie={pie}>
                        <Resumen informe={informe} />
                    </Hoja>
                    {listado.map((filas, k) => (
                        <Hoja key={k} numero={k + 2} total={total} encabezado={encabezado} pie={pie}>
                            <Listado filas={filas} documentos={informe.documentos} primera={k === 0} />
                        </Hoja>
                    ))}
                </main>
            </div>
        </>
    );
}

/** Reparte los grupos en hojas; si un grupo sigue en la hoja siguiente, se repite su título. */
function paginar(grupos: Informe['grupos']): Fila[][] {
    const hojas: Fila[][] = [];
    let actual: Fila[] = [];
    for (const grupo of grupos) {
        // Un título de grupo solo al final de la hoja no sirve: pasa a la siguiente.
        if (actual.length >= FILAS_POR_HOJA - 1) {
            hojas.push(actual);
            actual = [];
        }
        actual.push({ tipo: 'grupo', grupo, continua: false });
        for (const estudiante of grupo.estudiantes) {
            if (actual.length >= FILAS_POR_HOJA) {
                hojas.push(actual);
                actual = [{ tipo: 'grupo', grupo, continua: true }];
            }
            actual.push({ tipo: 'estudiante', estudiante });
        }
    }
    if (actual.length) hojas.push(actual);
    return hojas;
}

function Resumen({ informe: i }: { informe: Informe }) {
    const t = i.totales;
    const conFaltas = i.documentos.filter((d) => d.faltan > 0).sort((a, b) => b.faltan - a.faltan);
    const maximo = Math.max(1, ...conFaltas.map((d) => d.faltan));

    return (
        <>
            <Titular
                seccion="Documentos de matrícula"
                titulo={
                    t.activos === 0
                        ? 'No hay estudiantes activos con estos filtros'
                        : t.pendientes === 0
                          ? 'Todos los estudiantes tienen sus documentos completos'
                          : `${cifra(t.pendientes)} de ${cifra(t.activos)} estudiantes tienen documentos pendientes`
                }
            >
                Lo que se marca en la ficha de cada estudiante (o en Inscritos, al matricular). En las hojas siguientes, por grupo, quiénes deben
                documentos y cuáles.
            </Titular>

            <Cifras
                className="mt-[22px]"
                items={[
                    { valor: cifra(t.activos), texto: 'estudiantes activos' },
                    { valor: cifra(t.completos), texto: `con todo entregado (${pct(t.completos, t.activos)} %)` },
                    { valor: cifra(t.pendientes), texto: 'con documentos pendientes' },
                    { valor: cifra(t.sinRegistro), texto: 'sin ningún documento registrado' },
                ]}
            />

            {conFaltas.length > 0 && (
                <Bloque titulo="Qué documento falta más" nota="estudiantes que no lo han traído">
                    <table className={tabla}>
                        <colgroup>
                            <col className="w-[190px]" />
                            <col />
                            <col className="w-[70px]" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th className={th}>Documento</th>
                                <th className={th} />
                                <th className={cn(th, num)}>Faltan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {conFaltas.map((d) => (
                                <tr key={d.clave}>
                                    <td className={td}>{d.corto}</td>
                                    <td className={td}>
                                        <span
                                            className="block h-[8px] rounded-full bg-[#E0897D]"
                                            style={{ width: `${(d.faltan / maximo) * 100}%` }}
                                        />
                                    </td>
                                    <td className={cn(td, num, 'font-semibold')}>{cifra(d.faltan)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Bloque>
            )}

            {t.sinRegistro > 0 && (
                <p className="mt-[18px] max-w-[600px] text-[11px] leading-[1.55] text-[#56627F]">
                    <b className="text-[#16223F]">{cifra(t.sinRegistro)}</b> estudiantes no tienen ningún documento marcado; casi siempre son los que
                    vinieron del Excel del colegio, antes de SIEAGE. Aparecen con todo pendiente hasta que se marquen en su ficha.
                </p>
            )}

            <Bloque titulo="Cómo leer el listado">
                <div className="flex flex-wrap gap-x-[22px] gap-y-[6px] text-[11px] text-[#3E4A68]">
                    {(['falta', 'entregado', 'no_aplica'] as const).map((e) => (
                        <span key={e} className="flex items-center gap-[6px]">
                            <Marca estado={e} />
                            {e === 'falta' ? 'Falta' : e === 'entregado' ? 'Entregado' : 'No aplica'}
                        </span>
                    ))}
                    <span className="flex items-center gap-[6px]">
                        <Marca />
                        No se le pide (p. ej. vacunas en bachillerato)
                    </span>
                </div>
            </Bloque>
        </>
    );
}

function Listado({ filas, documentos, primera }: { filas: Fila[]; documentos: Informe['documentos']; primera: boolean }) {
    return (
        <>
            <h2 className="mb-[12px] text-[15px] font-bold tracking-[-0.2px]">
                Estudiantes con documentos pendientes{!primera && <span className="font-normal text-[#6B7690]"> (continúa)</span>}
            </h2>
            <table className={tabla}>
                <colgroup>
                    <col className="w-[190px]" />
                    <col className="w-[150px]" />
                    {documentos.map((d) => (
                        <col key={d.clave} />
                    ))}
                </colgroup>
                <thead>
                    <tr>
                        <th className={th}>Estudiante</th>
                        <th className={th}>Acudiente</th>
                        {documentos.map((d) => (
                            <th key={d.clave} className={cn(th, 'px-[2px] text-center text-[7.5px] leading-[1.15] tracking-[0.2px]')}>
                                {d.corto}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filas.map((f, k) =>
                        f.tipo === 'grupo' ? (
                            <tr key={`g-${k}`}>
                                <td colSpan={2 + documentos.length} className="h-[30px] border-b border-[#D3DDF3] px-[6px] pt-[8px] align-bottom">
                                    <b className="text-[11.5px] text-[#1E3A7B]">{f.grupo.grupo}</b>
                                    <span className="text-[10px] text-[#6B7690]">
                                        {' '}
                                        · {f.grupo.grado} · {f.grupo.sede} · {f.grupo.estudiantes.length} con pendientes
                                        {f.continua && ' (continúa)'}
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            <tr key={`e-${k}`}>
                                <td className={cn(td, 'h-[32px] leading-[1.25]')}>
                                    <span className="block truncate font-semibold">{f.estudiante.nombre}</span>
                                    <span className="block truncate text-[9px] text-[#6B7690]">
                                        {f.estudiante.documento} · falta{f.estudiante.faltan === 1 ? '' : 'n'} {f.estudiante.faltan}
                                    </span>
                                </td>
                                <td className={cn(td, 'leading-[1.25]')}>
                                    <span className="block truncate">{f.estudiante.acudiente ?? '—'}</span>
                                    {f.estudiante.telefono && (
                                        <span className="block text-[9px] text-[#6B7690] tabular-nums">{f.estudiante.telefono}</span>
                                    )}
                                </td>
                                {documentos.map((d) => (
                                    <td key={d.clave} className={cn(td, 'px-0 text-center')}>
                                        <Marca estado={f.estudiante.estados[d.clave]} />
                                    </td>
                                ))}
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
        </>
    );
}

/** ✗ falta (rojo), ✓ entregado, N/A no aplica; vacío si no se le pide. */
function Marca({ estado }: { estado?: EstadoDocumentoInforme }) {
    if (estado === 'falta') {
        return (
            <span className="inline-flex size-[16px] items-center justify-center rounded-[4px] bg-[#FDECEC] text-[10px] font-bold text-[#B42318]">
                ✗
            </span>
        );
    }
    if (estado === 'entregado') return <span className="inline-flex size-[16px] items-center justify-center text-[10px] text-[#3BA67A]">✓</span>;
    if (estado === 'no_aplica') return <span className="text-[8px] font-semibold text-[#8C97B3]">N/A</span>;
    return <span className="inline-block size-[16px] rounded-[4px] bg-[#F5F7FC]" />;
}
