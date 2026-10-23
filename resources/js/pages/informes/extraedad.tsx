import { BarraInforme } from '@/components/informe/barra-informe';
import { Bloque, Cifras, Hoja, Titular, num, tabla, td, th } from '@/components/informe/hoja';
import { type InformeExtraedad as Informe, alcanceInforme, cifra, fechaCorta, fechaLarga, institucionCorta, pct } from '@/lib/informe';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { type ReactNode, useMemo } from 'react';

/** Filas por hoja del listado (los títulos de sede y de grupo cuentan como una). */
const FILAS_POR_HOJA = 28;

type Estudiante = Informe['grupos'][number]['estudiantes'][number];
type Fila =
    | { tipo: 'sede'; sede: string }
    | { tipo: 'grupo'; grupo: Informe['grupos'][number]; continua: boolean }
    | { tipo: 'estudiante'; estudiante: Estudiante; n: number };

const fecha = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '—');

/**
 * Estudiantes en extraedad según la tabla de edades del institución, con los mismos
 * filtros del informe de matrícula. La primera hoja trae la tabla y cuántos hay por
 * grado; las demás, sede por sede y grupo por grupo, quiénes son. Se guarda en PDF.
 */
export default function InformeExtraedad(informe: Informe) {
    const { anio, anios, corte, institucion, filtro, opciones, totales, grupos } = informe;
    const alcance = alcanceInforme(filtro);
    const listado = useMemo(() => paginar(grupos), [grupos]);
    const total = 1 + listado.length;

    const encabezado: [ReactNode, ReactNode] = [
        <>
            <b className="font-semibold text-[#1E3A7B]">Extraedad {anio}</b>
            {alcance && ` · ${alcance}`} · {institucionCorta(institucion?.nombre)}
        </>,
        <>Corte: {fechaCorta(corte)}</>,
    ];
    const pie = <>SIEAGE · generado el {fechaLarga(corte)}</>;

    return (
        <>
            {/* El título es el nombre que propone el navegador para el PDF. */}
            <Head title={`Extraedad ${anio}${alcance ? ` · ${alcance}` : ''}`} />

            <div className="min-h-screen bg-[#DDE3EE] font-sans text-[#16223F] print:bg-white">
                <BarraInforme
                    ruta="/informes/extraedad"
                    anio={anio}
                    anios={anios}
                    filtro={filtro}
                    opciones={opciones}
                    resumen={
                        <>
                            {total} {total === 1 ? 'hoja' : 'hojas'} · {cifra(totales.extraedad)} de {cifra(totales.activos)} estudiantes en extraedad
                        </>
                    }
                />

                <main className="flex flex-col items-center gap-6 overflow-x-auto px-4 py-8 print:block print:overflow-visible print:p-0">
                    <Hoja numero={1} total={total} encabezado={encabezado} pie={pie}>
                        <Resumen informe={informe} />
                    </Hoja>
                    {listado.map((filas, k) => (
                        <Hoja key={k} numero={k + 2} total={total} encabezado={encabezado} pie={pie}>
                            <Listado filas={filas} primera={k === 0} />
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
    let sede: string | null = null;
    for (const grupo of grupos) {
        const nuevaSede = grupo.sede !== sede;
        sede = grupo.sede;
        // Un título solo al final de la hoja no sirve: pasa a la siguiente.
        if (actual.length >= FILAS_POR_HOJA - (nuevaSede ? 2 : 1)) {
            hojas.push(actual);
            actual = [];
        }
        if (nuevaSede) actual.push({ tipo: 'sede', sede: grupo.sede });
        actual.push({ tipo: 'grupo', grupo, continua: false });
        grupo.estudiantes.forEach((estudiante, n) => {
            if (actual.length >= FILAS_POR_HOJA) {
                hojas.push(actual);
                actual = [{ tipo: 'grupo', grupo, continua: true }];
            }
            actual.push({ tipo: 'estudiante', estudiante, n: n + 1 });
        });
    }
    if (actual.length) hojas.push(actual);
    return hojas;
}

function Resumen({ informe: i }: { informe: Informe }) {
    const t = i.totales;
    const maximo = Math.max(1, ...i.grados.map((g) => g.extraedad));

    return (
        <>
            <Titular
                seccion="Edades por grado"
                titulo={
                    t.activos === 0
                        ? 'No hay estudiantes activos con estos filtros'
                        : t.extraedad === 0
                          ? 'Ningún estudiante está en extraedad'
                          : `${cifra(t.extraedad)} de ${cifra(t.activos)} estudiantes están en extraedad`
                }
            >
                Según la tabla de edades del institución, con la edad al 31 de marzo de {i.anio}. En las hojas siguientes, sede por sede y grupo por
                grupo, quiénes son.
            </Titular>

            <Cifras
                className="mt-[22px]"
                items={[
                    { valor: cifra(t.activos), texto: 'estudiantes activos' },
                    { valor: cifra(t.adecuada), texto: `en la edad adecuada (${pct(t.adecuada, t.conEdad)} %)` },
                    { valor: cifra(t.aceptable), texto: `en edad aceptable (${pct(t.aceptable, t.conEdad)} %)` },
                    { valor: cifra(t.extraedad), texto: `en extraedad (${pct(t.extraedad, t.conEdad)} %)` },
                ]}
            />

            <Bloque titulo="Tabla de edades y extraedad por grado" nota={t.sinFecha > 0 ? `${cifra(t.sinFecha)} sin fecha de nacimiento` : undefined}>
                <table className={tabla}>
                    <colgroup>
                        <col className="w-[90px]" />
                        <col className="w-[70px]" />
                        <col className="w-[130px]" />
                        <col className="w-[86px]" />
                        <col className="w-[58px]" />
                        <col />
                        <col className="w-[54px]" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className={th}>Grado</th>
                            <th className={th}>Adecuada</th>
                            <th className={th}>Aceptable</th>
                            <th className={th}>Extraedad</th>
                            <th className={cn(th, num)}>Activos</th>
                            <th className={th}>En extraedad</th>
                            <th className={cn(th, num)} />
                        </tr>
                    </thead>
                    <tbody>
                        {i.grados.map((g) => (
                            <tr key={g.numero}>
                                <td className={cn(td, 'font-semibold')}>{g.nombre}</td>
                                <td className={td}>{g.adecuada} años</td>
                                <td className={td}>hasta {g.aceptableHasta} años y 11 meses</td>
                                <td className={td}>{g.aceptableHasta + 1} en adelante</td>
                                <td className={cn(td, num)}>{cifra(g.activos)}</td>
                                <td className={td}>
                                    <span
                                        className="block h-[8px] rounded-full bg-[#D08A2B]"
                                        style={{ width: `${(g.extraedad / maximo) * 100}%`, minWidth: g.extraedad ? 4 : 0 }}
                                    />
                                </td>
                                <td className={cn(td, num, g.extraedad > 0 && 'font-semibold text-[#8A5A0B]')}>{cifra(g.extraedad)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Bloque>
        </>
    );
}

function Listado({ filas, primera }: { filas: Fila[]; primera: boolean }) {
    const columnas = 6;
    return (
        <>
            <h2 className="mb-[12px] text-[15px] font-bold tracking-[-0.2px]">
                Estudiantes en extraedad{!primera && <span className="font-normal text-[#6B7690]"> (continúa)</span>}
            </h2>
            <table className={tabla}>
                <colgroup>
                    <col className="w-[24px]" />
                    <col />
                    <col className="w-[74px]" />
                    <col className="w-[78px]" />
                    <col className="w-[162px]" />
                    <col className="w-[80px]" />
                </colgroup>
                <thead>
                    <tr>
                        <th className={cn(th, num)}>#</th>
                        <th className={th}>Estudiante</th>
                        <th className={th}>Nacimiento</th>
                        <th className={cn(th, num)}>Edad</th>
                        <th className={th}>Acudiente</th>
                        <th className={cn(th, num)}>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    {filas.map((f, k) =>
                        f.tipo === 'sede' ? (
                            <tr key={`s-${k}`}>
                                <td colSpan={columnas} className="h-[30px] px-[6px] pt-[10px] align-bottom">
                                    <span className="text-[13px] font-bold tracking-[-0.2px] text-[#16223F]">Sede {f.sede}</span>
                                </td>
                            </tr>
                        ) : f.tipo === 'grupo' ? (
                            <tr key={`g-${k}`}>
                                <td colSpan={columnas} className="h-[30px] border-b border-[#D3DDF3] px-[6px] pt-[8px] align-bottom">
                                    <b className="text-[11.5px] text-[#1E3A7B]">{f.grupo.grupo}</b>
                                    <span className="text-[10px] text-[#6B7690]">
                                        {' '}
                                        · {f.grupo.grado}
                                        {f.grupo.jornada && ` · ${f.grupo.jornada}`} · adecuada {f.grupo.adecuada} · extraedad desde{' '}
                                        {f.grupo.aceptableHasta + 1}
                                        {' · '}
                                        {f.grupo.estudiantes.length} en extraedad
                                        {f.continua && ' (continúa)'}
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            <tr key={`e-${k}`}>
                                <td className={cn(td, num, 'text-[#8C97B3]')}>{f.n}</td>
                                <td className={cn(td, 'h-[30px] leading-[1.25]')}>
                                    <span className="block truncate font-semibold">{f.estudiante.nombre}</span>
                                    <span className="block truncate text-[9px] text-[#6B7690] tabular-nums">{f.estudiante.documento}</span>
                                </td>
                                <td className={cn(td, 'text-[#56627F] tabular-nums')}>{fecha(f.estudiante.nacimiento)}</td>
                                <td
                                    className={cn(td, num, 'whitespace-nowrap')}
                                    title={`${f.estudiante.deMas} años más que la edad adecuada del grado`}
                                >
                                    <b className="font-semibold text-[#8A5A0B]">{f.estudiante.edad} años</b>
                                    <span className="text-[9px] text-[#6B7690]"> · +{f.estudiante.deMas}</span>
                                </td>
                                <td className={cn(td, 'truncate')}>
                                    {f.estudiante.acudiente ?? <span className="text-[#8C97B3]">Sin registrar</span>}
                                </td>
                                <td className={cn(td, num, 'text-[#56627F]')}>{f.estudiante.telefono ?? '—'}</td>
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
        </>
    );
}
