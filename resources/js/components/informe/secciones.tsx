import { Anillo, Barra100, Columnas, FilaBarra, Leyenda, Ocupacion, colorNivel, colorSede, colores } from '@/components/informe/graficos';
import { Bloque, Cifras, Titular, filaTotal, num, tabla, td, th } from '@/components/informe/hoja';
import { telefono } from '@/lib/estudiantes';
import {
    type EstudianteInforme,
    type GrupoInforme,
    type Informe,
    cifra,
    decimal,
    fechaLarga,
    gradoCorto,
    mesConAnio,
    mesCorto,
    pct,
    porcentaje,
} from '@/lib/informe';
import { cn } from '@/lib/utils';
import { Fragment } from 'react';

const mayorPor = <T,>(lista: T[], valor: (x: T) => number) => lista.reduce((m, x) => (valor(x) > valor(m) ? x : m), lista[0]);
const menorPor = <T,>(lista: T[], valor: (x: T) => number) => lista.reduce((m, x) => (valor(x) < valor(m) ? x : m), lista[0]);
const cantidad = (n: number, uno: string, varios: string) => `${cifra(n)} ${n === 1 ? uno : varios}`;

// ------------------------------------------------------------------ portada

export function Portada({ informe: i, indice }: { informe: Informe; indice: { titulo: string; pagina: number }[] }) {
    const t = i.totales;
    return (
        <div className="flex h-full flex-col bg-[linear-gradient(180deg,#F5F7FD_0%,#fff_55%)] px-[64px] pt-[70px] pb-[64px]">
            <div className="flex items-center gap-[12px] text-[12px] text-[#3E4A68]">
                <img src="/sieage-logo.webp" alt="" className="h-[52px] w-auto rounded-[6px]" />
                <div className="leading-[1.45]">
                    <b className="text-[#16223F]">SIEAGE</b>
                    <br />
                    {i.institucion?.nombre ?? 'Institución Educativa'}
                    {i.institucion?.municipio && ` · ${i.institucion.municipio}`}
                </div>
            </div>

            <h1 className="mt-[170px] text-[60px] leading-none font-bold tracking-[-2px]">
                Informe de
                <br />
                matrícula <span className="text-[#4863B8]">{i.anio}</span>
            </h1>
            <p className="mt-[18px] max-w-[460px] text-[15px] leading-[1.5] text-[#56627F]">
                Estudiantes, grupos y cupos de {t.sedes === 1 ? 'la sede' : `las ${t.sedes} sedes`}, con el listado completo de estudiantes por grupo
                al final.
            </p>

            <div className="mt-auto grid grid-cols-3 border-t-[1.5px] border-[#16223F] pt-[18px]">
                {[
                    [cifra(t.activos), 'estudiantes activos'],
                    [cifra(t.grupos), `grupos en ${cantidad(t.sedes, 'sede', 'sedes')}`],
                    [t.cupos ? porcentaje(t.activos, t.cupos).replace(/,\d/, '') : '—', 'de los cupos ocupados'],
                ].map(([v, texto]) => (
                    <div key={texto}>
                        <b className="block text-[26px] tracking-[-0.6px] tabular-nums">{v}</b>
                        <span className="text-[11px] text-[#56627F]">{texto}</span>
                    </div>
                ))}
            </div>
            <ol className="mt-[26px] grid grid-cols-2 gap-x-[40px] gap-y-[5px] text-[11px] text-[#56627F]">
                {indice.map((s, n) => (
                    <li key={s.titulo} className="flex items-baseline gap-[6px]">
                        <span className="text-[#4863B8]">{n < indice.length - 1 ? n + 1 : 'A'}</span>
                        <span>{s.titulo}</span>
                        <span className="mb-[3px] flex-1 border-b border-dotted border-[#C4D2F1]" />
                        <span className="text-[#16223F] tabular-nums">{s.pagina}</span>
                    </li>
                ))}
            </ol>
            <p className="mt-[22px] text-[10.5px] text-[#8C97B3]">Datos con corte al {fechaLarga(i.corte)}</p>
        </div>
    );
}

// ------------------------------------------------------------------ 1. resumen

export function Resumen({ informe: i }: { informe: Informe }) {
    const t = i.totales;
    const grados = i.grados.filter((g) => g.activos > 0);
    const mayor = mayorPor(grados, (g) => g.activos);
    const menor = menorPor(grados, (g) => g.activos);
    const maxSede = Math.max(1, ...i.sedes.map((s) => s.activos));

    return (
        <>
            <Titular
                seccion="1 · Resumen del año"
                titulo={
                    <>
                        {cifra(t.activos)} estudiantes activos{t.cupos > 0 && `, ${pct(t.activos, t.cupos)} % de los cupos`}
                    </>
                }
            >
                {t.nuevos > 0 && `Una de cada ${Math.round(t.activos / t.nuevos)} matrículas activas es nueva. `}
                {mayor &&
                    menor &&
                    `${mayor.nombre} es el grado con más estudiantes (${cifra(mayor.activos)}) y ${menor.nombre}, el que menos (${cifra(menor.activos)}).`}
            </Titular>

            <div className="mt-[22px] flex items-end gap-[30px] border-b border-[#E9EEF8] pb-[20px]">
                <div className="shrink-0">
                    <div className="text-[62px] leading-[0.9] font-bold tracking-[-2.5px] tabular-nums">{cifra(t.activos)}</div>
                    <div className="mt-[8px] text-[12px] text-[#56627F]">estudiantes activos</div>
                </div>
                <Cifras
                    className="flex-1"
                    items={[
                        { valor: cifra(t.nuevos), texto: <>nuevos · {porcentaje(t.nuevos, t.activos)}</> },
                        { valor: cifra(t.repitentes), texto: <>repitentes · {porcentaje(t.repitentes, t.activos)}</> },
                        {
                            valor: cifra(t.retirados + t.cancelados),
                            texto: <>retirados o cancelados · {porcentaje(t.retirados + t.cancelados, t.matriculas)}</>,
                        },
                        {
                            valor: porcentaje(t.extraedad, t.conEdad),
                            texto: <>en extraedad · {cantidad(t.extraedad, 'estudiante', 'estudiantes')}</>,
                        },
                    ]}
                />
            </div>

            <Bloque titulo="Activos por grado" nota={`de ${i.grados[0]?.nombre ?? ''} a ${i.grados[i.grados.length - 1]?.nombre ?? ''}`}>
                <Columnas
                    ancho={682}
                    alto={196}
                    datos={i.grados.map((g) => ({
                        etiqueta: gradoCorto(g.numero),
                        partes: [
                            { valor: g.activos - g.nuevos, color: colores.fuerte },
                            { valor: g.nuevos, color: colores.claro },
                        ],
                    }))}
                />
                <Leyenda
                    className="mt-[8px]"
                    items={[
                        { texto: 'Antiguos y repitentes', color: colores.fuerte },
                        { texto: 'Nuevos', color: colores.claro },
                    ]}
                />
            </Bloque>

            <div className="grid grid-cols-[1.1fr_1fr] gap-[34px]">
                <Bloque titulo="Por sede" nota="activos">
                    {i.sedes.map((s) => (
                        <FilaBarra key={s.codigo} etiqueta={s.nombre} valor={s.activos} max={maxSede} color={colorSede[s.codigo] ?? colores.fuerte} />
                    ))}
                </Bloque>
                <Bloque titulo="Por jornada y sexo">
                    <div className="flex items-center gap-[18px]">
                        <Anillo partes={i.jornadas.map((j, n) => ({ valor: j.activos, color: n === 0 ? colores.manana : colores.tarde }))} />
                        <div className="text-[11.5px] leading-[1.9]">
                            {i.jornadas.map((j, n) => (
                                <div key={j.nombre} className="flex items-center gap-[6px]">
                                    <span className="size-[8px] rounded-full" style={{ background: n === 0 ? colores.manana : colores.tarde }} />
                                    {j.nombre} <b className="tabular-nums">{cifra(j.activos)}</b>
                                    <span className="text-[#6B7690]">· {porcentaje(j.activos, t.activos)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-[10px]">
                        <FilaBarra etiqueta="Niñas" valor={t.ninas} max={Math.max(t.ninas, t.ninos)} color={colores.ninas} anchoEtiqueta={56} />
                        <FilaBarra etiqueta="Niños" valor={t.ninos} max={Math.max(t.ninas, t.ninos)} color={colores.ninos} anchoEtiqueta={56} />
                    </div>
                </Bloque>
            </div>

            <Bloque titulo="Por nivel" nota="estudiantes activos y grupos">
                <Barra100 className="h-[12px]" partes={i.niveles.map((n) => ({ valor: n.activos, color: colorNivel[n.clave] }))} />
                <div className="mt-[12px] grid" style={{ gridTemplateColumns: `repeat(${i.niveles.length}, minmax(0, 1fr))` }}>
                    {i.niveles.map((n) => (
                        <div key={n.clave} className="flex items-start gap-[8px]">
                            <span className="mt-[5px] size-[9px] shrink-0 rounded-full" style={{ background: colorNivel[n.clave] }} />
                            <span className="text-[11px] leading-[1.4] text-[#56627F]">
                                <b className="block text-[16px] font-bold text-[#16223F] tabular-nums">{cifra(n.activos)}</b>
                                {n.nombre} · {pct(n.activos, t.activos)} % · {cantidad(n.grupos, 'grupo', 'grupos')}
                            </span>
                        </div>
                    ))}
                </div>
            </Bloque>
        </>
    );
}

// ------------------------------------------------------------------ 2. sedes y jornadas

export function Sedes({ informe: i }: { informe: Informe }) {
    const t = i.totales;
    const mayor = mayorPor(i.sedes, (s) => s.activos);
    const manana = i.jornadas.find((j) => j.nombre === 'Mañana')?.activos ?? 0;
    const rango = (grados: number[]) => (grados.length ? `${gradoCorto(grados[0])} – ${gradoCorto(grados[grados.length - 1])}` : '—');

    return (
        <>
            <Titular
                seccion="2 · Sedes y jornadas"
                titulo={
                    mayor ? (
                        <>
                            La sede {mayor.nombre} reúne el {pct(mayor.activos, t.activos)} % de los estudiantes
                        </>
                    ) : (
                        'Sedes y jornadas'
                    )
                }
            >
                {cantidad(t.sedes, 'sede', 'sedes')}, {cantidad(t.grupos, 'grupo', 'grupos')} y {cifra(t.cupos)} cupos.{' '}
                {manana > 0 && `El ${pct(manana, t.activos)} % estudia en la jornada de la mañana.`}
            </Titular>

            <Bloque titulo="Cifras por sede">
                <table className={tabla}>
                    <thead>
                        <tr>
                            <th className={cn(th, 'w-[150px]')}>Sede</th>
                            <th className={cn(th, 'w-[70px]')}>Grados</th>
                            <th className={cn(th, num)}>Grupos</th>
                            <th className={cn(th, num)}>Cupos</th>
                            <th className={cn(th, num)}>Activos</th>
                            <th className={cn(th, 'w-[92px]')}>Ocupación</th>
                            <th className={cn(th, num)}>Nuevos</th>
                            <th className={cn(th, num)}>Mañana</th>
                            <th className={cn(th, num)}>Tarde</th>
                        </tr>
                    </thead>
                    <tbody>
                        {i.sedes.map((s) => (
                            <tr key={s.codigo}>
                                <td className={td}>
                                    <span className="flex items-center gap-[7px]">
                                        <span
                                            className="size-[8px] shrink-0 rounded-full"
                                            style={{ background: colorSede[s.codigo] ?? colores.fuerte }}
                                        />
                                        <b className="truncate font-medium">{s.nombre}</b>
                                    </span>
                                </td>
                                <td className={cn(td, 'text-[#56627F]')}>{rango(s.grados)}</td>
                                <td className={cn(td, num)}>{s.grupos}</td>
                                <td className={cn(td, num)}>{cifra(s.cupos)}</td>
                                <td className={cn(td, num, 'font-semibold')}>{cifra(s.activos)}</td>
                                <td className={td}>
                                    <span className="flex items-center gap-[6px]">
                                        <Ocupacion activos={s.activos} cupos={s.cupos} />
                                        <span className="w-[30px] shrink-0 text-right text-[10px] text-[#56627F] tabular-nums">
                                            {pct(s.activos, s.cupos)} %
                                        </span>
                                    </span>
                                </td>
                                <td className={cn(td, num)}>{cifra(s.nuevos)}</td>
                                <td className={cn(td, num)}>{cifra(s.jornadas['Mañana'] ?? 0)}</td>
                                <td className={cn(td, num)}>{cifra(s.jornadas['Tarde'] ?? 0)}</td>
                            </tr>
                        ))}
                        <tr className={filaTotal}>
                            <td className={td}>Total</td>
                            <td className={td} />
                            <td className={cn(td, num)}>{t.grupos}</td>
                            <td className={cn(td, num)}>{cifra(t.cupos)}</td>
                            <td className={cn(td, num)}>{cifra(t.activos)}</td>
                            <td className={cn(td, 'text-[10px] font-semibold')}>{pct(t.activos, t.cupos)} %</td>
                            <td className={cn(td, num)}>{cifra(t.nuevos)}</td>
                            <td className={cn(td, num)}>{cifra(manana)}</td>
                            <td className={cn(td, num)}>{cifra(i.jornadas.find((j) => j.nombre === 'Tarde')?.activos ?? 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </Bloque>

            <Bloque titulo="Niveles en cada sede" nota="estudiantes activos de cada nivel">
                {i.sedes.map((s) => {
                    const deLaSede = i.grupos.filter((g) => g.sede_codigo === s.codigo);
                    return (
                        <div key={s.codigo} className="flex h-[30px] items-center gap-[12px] border-b border-[#F1F4FA] text-[11.5px]">
                            <span className="w-[150px] shrink-0 truncate">{s.nombre}</span>
                            <Barra100
                                className="flex-1"
                                partes={i.niveles.map((n) => ({
                                    valor: deLaSede.filter((g) => g.nivel === n.clave).reduce((suma, g) => suma + g.activos, 0),
                                    color: colorNivel[n.clave],
                                }))}
                            />
                            <b className="w-[40px] shrink-0 text-right tabular-nums">{cifra(s.activos)}</b>
                        </div>
                    );
                })}
                <Leyenda className="mt-[10px]" items={i.niveles.map((n) => ({ texto: n.nombre, color: colorNivel[n.clave] }))} />
            </Bloque>

            <Bloque titulo="Jornada en cada sede">
                {i.sedes.map((s) => (
                    <div key={s.codigo} className="flex h-[30px] items-center gap-[12px] border-b border-[#F1F4FA] text-[11.5px]">
                        <span className="w-[150px] shrink-0 truncate">{s.nombre}</span>
                        <Barra100
                            className="flex-1"
                            partes={[
                                { valor: s.jornadas['Mañana'] ?? 0, color: colores.manana },
                                { valor: s.jornadas['Tarde'] ?? 0, color: colores.tarde },
                            ]}
                        />
                        <span className="w-[120px] shrink-0 text-right text-[10.5px] text-[#56627F] tabular-nums">
                            {cifra(s.jornadas['Mañana'] ?? 0)} mañana · {cifra(s.jornadas['Tarde'] ?? 0)} tarde
                        </span>
                    </div>
                ))}
                <Leyenda
                    className="mt-[10px]"
                    items={[
                        { texto: 'Mañana', color: colores.manana },
                        { texto: 'Tarde', color: colores.tarde },
                    ]}
                />
            </Bloque>
        </>
    );
}

// ------------------------------------------------------------------ 3. grados

export function Grados({ informe: i }: { informe: Informe }) {
    const t = i.totales;
    const nivelMayor = mayorPor(i.niveles, (n) => n.activos);
    const conEdad = i.grados.filter((g) => g.edadPromedio !== null);
    const retiros = (g: { retirados: number; cancelados: number }) => g.retirados + g.cancelados;

    return (
        <>
            <Titular
                seccion="3 · Grados"
                titulo={
                    nivelMayor ? (
                        <>
                            {nivelMayor.nombre} concentra el {pct(nivelMayor.activos, t.activos)} % de los estudiantes
                        </>
                    ) : (
                        'Grados'
                    )
                }
            >
                {conEdad.length > 1 &&
                    `La edad promedio va de ${decimal(conEdad[0].edadPromedio)} años en ${conEdad[0].nombre} a ${decimal(conEdad[conEdad.length - 1].edadPromedio)} en ${conEdad[conEdad.length - 1].nombre}.`}
            </Titular>

            <div className="mt-[22px] border-b border-[#E9EEF8] pb-[18px]">
                <Cifras
                    className="-mx-[14px] [&>div:first-child]:border-l-0"
                    items={i.niveles.map((n) => ({
                        valor: (
                            <span className="flex items-center gap-[8px]">
                                <span className="size-[9px] rounded-full" style={{ background: colorNivel[n.clave] }} />
                                {cifra(n.activos)}
                            </span>
                        ),
                        texto: `${n.nombre} · ${pct(n.activos, t.activos)} % · ${cantidad(n.grupos, 'grupo', 'grupos')}`,
                    }))}
                />
            </div>

            <Bloque titulo="Cifras por grado" nota="retiros: retirados y cancelados del año">
                <table className={tabla}>
                    <thead>
                        <tr>
                            <th className={cn(th, 'w-[92px]')}>Grado</th>
                            <th className={cn(th, num)}>Grupos</th>
                            <th className={cn(th, num)}>Cupos</th>
                            <th className={cn(th, num)}>Activos</th>
                            <th className={cn(th, 'w-[70px]')}>Ocupación</th>
                            <th className={cn(th, num)}>Nuevos</th>
                            <th className={cn(th, num)}>Repit.</th>
                            <th className={cn(th, num)}>Retiros</th>
                            <th className={cn(th, num)}>Niñas</th>
                            <th className={cn(th, num)}>Niños</th>
                            <th className={cn(th, num, 'w-[54px]')}>Edad</th>
                            <th className={cn(th, num, 'w-[62px]')}>Extraedad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {i.grados.map((g, n) => (
                            <Fragment key={g.numero}>
                                {n > 0 && g.nivel !== i.grados[n - 1].nivel && (
                                    <tr aria-hidden>
                                        <td colSpan={12} className="h-[6px]" />
                                    </tr>
                                )}
                                <tr>
                                    <td className={td}>
                                        <span className="flex items-center gap-[7px]">
                                            <span className="size-[7px] shrink-0 rounded-full" style={{ background: colorNivel[g.nivel] }} />
                                            <b className="font-medium">{g.nombre}</b>
                                        </span>
                                    </td>
                                    <td className={cn(td, num)}>{g.grupos}</td>
                                    <td className={cn(td, num)}>{cifra(g.cupos)}</td>
                                    <td className={cn(td, num, 'font-semibold')}>{cifra(g.activos)}</td>
                                    <td className={td}>
                                        <Ocupacion activos={g.activos} cupos={g.cupos} />
                                    </td>
                                    <td className={cn(td, num)}>{cifra(g.nuevos)}</td>
                                    <td className={cn(td, num)}>{cifra(g.repitentes)}</td>
                                    <td className={cn(td, num)}>{cifra(retiros(g))}</td>
                                    <td className={cn(td, num)}>{cifra(g.ninas)}</td>
                                    <td className={cn(td, num)}>{cifra(g.ninos)}</td>
                                    <td className={cn(td, num)}>{decimal(g.edadPromedio)}</td>
                                    <td className={cn(td, num, g.extraedad > 0 && 'text-[#8A5A0B]')}>{cifra(g.extraedad)}</td>
                                </tr>
                            </Fragment>
                        ))}
                        <tr className={filaTotal}>
                            <td className={td}>Total</td>
                            <td className={cn(td, num)}>{t.grupos}</td>
                            <td className={cn(td, num)}>{cifra(t.cupos)}</td>
                            <td className={cn(td, num)}>{cifra(t.activos)}</td>
                            <td className={cn(td, 'text-[10px]')}>{pct(t.activos, t.cupos)} %</td>
                            <td className={cn(td, num)}>{cifra(t.nuevos)}</td>
                            <td className={cn(td, num)}>{cifra(t.repitentes)}</td>
                            <td className={cn(td, num)}>{cifra(t.retirados + t.cancelados)}</td>
                            <td className={cn(td, num)}>{cifra(t.ninas)}</td>
                            <td className={cn(td, num)}>{cifra(t.ninos)}</td>
                            <td className={cn(td, num)}>{decimal(t.edadPromedio)}</td>
                            <td className={cn(td, num)}>{cifra(t.extraedad)}</td>
                        </tr>
                    </tbody>
                </table>
                <p className="mt-[10px] text-[10px] text-[#6B7690]">
                    Edad: promedio al 31 de marzo. Extraedad: 2 o más años por encima de la edad esperada del grado (5 años en Transición y uno más
                    por grado).
                </p>
            </Bloque>
        </>
    );
}

// ------------------------------------------------------------------ 4. grupos (varias hojas)

export function Grupos({ informe: i, filas, primera }: { informe: Informe; filas: GrupoInforme[]; primera: boolean }) {
    const t = i.totales;
    const llenos = i.grupos.filter((g) => g.cupos > 0 && g.activos === g.cupos).length;
    const sobre = i.grupos.filter((g) => g.cupos > 0 && g.activos > g.cupos).length;
    const libres = i.grupos.reduce((s, g) => s + Math.max(0, g.cupos - g.activos), 0);

    return (
        <>
            {primera ? (
                <Titular
                    seccion="4 · Grupos"
                    titulo={
                        <>
                            {cantidad(t.grupos, 'grupo', 'grupos')}: {cifra(llenos)} {llenos === 1 ? 'lleno' : 'llenos'}
                            {sobre > 0 && ` y ${cifra(sobre)} sobre el cupo`}
                        </>
                    }
                >
                    Quedan {cantidad(libres, 'cupo libre', 'cupos libres')} en total. Los grupos van por grado, sede y número.
                </Titular>
            ) : (
                <p className="text-[11px] font-semibold text-[#4863B8]">4 · Grupos (continuación)</p>
            )}

            <table className={cn(tabla, primera ? 'mt-[20px]' : 'mt-[10px]')}>
                <thead>
                    <tr>
                        <th className={cn(th, 'w-[52px]')}>Grupo</th>
                        <th className={cn(th, 'w-[74px]')}>Grado</th>
                        <th className={cn(th, 'w-[122px]')}>Sede</th>
                        <th className={cn(th, 'w-[56px]')}>Jornada</th>
                        <th className={cn(th, num, 'w-[58px]')}>Activos</th>
                        <th className={th}>Ocupación</th>
                        <th className={cn(th, num, 'w-[54px]')}>Libres</th>
                        <th className={cn(th, num)}>Nuevos</th>
                        <th className={cn(th, num)}>Repit.</th>
                        <th className={cn(th, num)}>Niñas</th>
                        <th className={cn(th, num)}>Niños</th>
                    </tr>
                </thead>
                <tbody>
                    {filas.map((g) => {
                        const libresG = g.cupos - g.activos;
                        return (
                            <tr key={g.id}>
                                <td className={cn(td, 'font-bold')}>{g.codigo}</td>
                                <td className={cn(td, 'text-[#56627F]')}>{g.grado_nombre}</td>
                                <td className={td}>
                                    <span className="flex items-center gap-[6px]">
                                        <span
                                            className="size-[7px] shrink-0 rounded-full"
                                            style={{ background: colorSede[g.sede_codigo] ?? colores.fuerte }}
                                        />
                                        <span className="truncate">{g.sede}</span>
                                    </span>
                                </td>
                                <td className={cn(td, 'text-[#56627F]')}>{g.jornada ?? '—'}</td>
                                <td className={cn(td, num)}>
                                    <b className="font-semibold">{g.activos}</b>
                                    <span className="text-[#8C97B3]">/{g.cupos}</span>
                                </td>
                                <td className={td}>
                                    <Ocupacion activos={g.activos} cupos={g.cupos} />
                                </td>
                                <td className={cn(td, num, libresG < 0 && 'font-semibold text-[#B42318]')}>
                                    {libresG < 0 ? `+${-libresG}` : libresG}
                                </td>
                                <td className={cn(td, num)}>{g.nuevos}</td>
                                <td className={cn(td, num)}>{g.repitentes}</td>
                                <td className={cn(td, num)}>{g.ninas}</td>
                                <td className={cn(td, num)}>{g.ninos}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {primera && (
                <p className="mt-[8px] text-[10px] text-[#6B7690]">
                    Libres: cupos sin ocupar. En rojo, los estudiantes que pasan del cupo del grupo.
                </p>
            )}
        </>
    );
}

// ------------------------------------------------------------------ 5. perfil

export function Perfil({ informe: i }: { informe: Informe }) {
    const t = i.totales;
    const maxExtra = Math.max(1, ...i.grados.map((g) => g.extraedad));
    // "Otro" (así se llama en la base) va junto con los parentescos poco frecuentes.
    const conNombre = i.parentescos.filter((p) => p.nombre !== 'Otro');
    const parentescos = conNombre.slice(0, 5);
    const otros = conNombre.slice(5).reduce((s, p) => s + p.n, 0) + (i.parentescos.find((p) => p.nombre === 'Otro')?.n ?? 0);
    const maxParentesco = Math.max(1, ...i.parentescos.map((p) => p.n));

    return (
        <>
            <Titular
                seccion="5 · Perfil de los estudiantes"
                titulo={
                    <>
                        {pct(t.ninas, t.activos)} % niñas y {pct(t.ninos, t.activos)} % niños; {porcentaje(t.extraedad, t.conEdad)} en extraedad
                    </>
                }
            >
                Edad promedio: {decimal(t.edadPromedio)} años. {porcentaje(t.conTelefono, t.activos)} de los estudiantes tiene un acudiente principal
                con teléfono registrado.
            </Titular>

            <Bloque titulo="Por grado" nota="edad al 31 de marzo · esperada entre paréntesis">
                <div className="grid grid-cols-[92px_1fr_52px_96px_132px] items-center gap-x-[12px] border-b-[1.5px] border-[#16223F] pb-[6px] text-[9px] font-semibold tracking-[0.6px] text-[#6B7690] uppercase">
                    <span>Grado</span>
                    <span>Niñas y niños</span>
                    <span className="text-right">Niñas</span>
                    <span className="text-right">Edad (esperada)</span>
                    <span>Extraedad</span>
                </div>
                {i.grados.map((g) => (
                    <div
                        key={g.numero}
                        className="grid h-[25px] grid-cols-[92px_1fr_52px_96px_132px] items-center gap-x-[12px] border-b border-[#F1F4FA] text-[11px]"
                    >
                        <b className="font-medium">{g.nombre}</b>
                        <Barra100
                            partes={[
                                { valor: g.ninas, color: colores.ninas },
                                { valor: g.ninos, color: colores.ninos },
                            ]}
                        />
                        <span className="text-right text-[#56627F] tabular-nums">{porcentaje(g.ninas, g.ninas + g.ninos)}</span>
                        <span className="text-right tabular-nums">
                            {decimal(g.edadPromedio)} <span className="text-[#8C97B3]">({g.edadEsperada})</span>
                        </span>
                        <span className="flex items-center gap-[8px]">
                            <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#F1F4FA]">
                                <span className="block h-full rounded-full bg-[#D08A2B]" style={{ width: `${(g.extraedad / maxExtra) * 100}%` }} />
                            </span>
                            <span className="w-[54px] shrink-0 text-right text-[10.5px] tabular-nums">
                                <b className="font-semibold">{g.extraedad}</b>{' '}
                                <span className="text-[#6B7690]">{porcentaje(g.extraedad, g.activos)}</span>
                            </span>
                        </span>
                    </div>
                ))}
                <Leyenda
                    className="mt-[10px]"
                    items={[
                        { texto: 'Niñas', color: colores.ninas },
                        { texto: 'Niños', color: colores.ninos },
                        { texto: 'Extraedad', color: '#D08A2B' },
                    ]}
                />
            </Bloque>

            <div className="grid grid-cols-2 gap-[34px]">
                {i.modalidades.length > 0 && (
                    <Bloque titulo="Media técnica" nota="activos por modalidad">
                        <table className={tabla}>
                            <thead>
                                <tr>
                                    <th className={th}>Modalidad</th>
                                    <th className={cn(th, num, 'w-[46px]')}>10°</th>
                                    <th className={cn(th, num, 'w-[46px]')}>11°</th>
                                    <th className={cn(th, num, 'w-[50px]')}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {i.modalidades.map((m) => (
                                    <tr key={m.nombre}>
                                        <td className={cn(td, 'truncate font-medium')}>{m.nombre}</td>
                                        <td className={cn(td, num)}>{m.decimo}</td>
                                        <td className={cn(td, num)}>{m.undecimo}</td>
                                        <td className={cn(td, num, 'font-semibold')}>{m.total}</td>
                                    </tr>
                                ))}
                                <tr className={filaTotal}>
                                    <td className={td}>Total</td>
                                    <td className={cn(td, num)}>{cifra(i.modalidades.reduce((s, m) => s + m.decimo, 0))}</td>
                                    <td className={cn(td, num)}>{cifra(i.modalidades.reduce((s, m) => s + m.undecimo, 0))}</td>
                                    <td className={cn(td, num)}>{cifra(i.modalidades.reduce((s, m) => s + m.total, 0))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Bloque>
                )}
                <Bloque titulo="Acudiente principal" nota="parentesco con el estudiante">
                    {parentescos.map((p) => (
                        <FilaBarra
                            key={p.nombre}
                            etiqueta={p.nombre}
                            valor={p.n}
                            max={maxParentesco}
                            detalle={porcentaje(p.n, t.activos)}
                            anchoEtiqueta={96}
                        />
                    ))}
                    {otros > 0 && (
                        <FilaBarra
                            etiqueta="Otros parentescos"
                            valor={otros}
                            max={maxParentesco}
                            detalle={porcentaje(otros, t.activos)}
                            anchoEtiqueta={96}
                        />
                    )}
                </Bloque>
            </div>
        </>
    );
}

// ------------------------------------------------------------------ 6. retiros, ritmo de matrícula e inscripciones

export function Retiros({ informe: i }: { informe: Informe }) {
    const t = i.totales;
    const retiros = t.retirados + t.cancelados;
    const porEstado = Array.isArray(i.inscripciones.porEstado) ? {} : i.inscripciones.porEstado;
    const conFecha = i.porMes.reduce((s, m) => s + m.n, 0);

    return (
        <>
            <Titular
                seccion="6 · Retiros y ritmo de matrícula"
                titulo={
                    <>
                        {cantidad(retiros, 'matrícula retirada o cancelada', 'matrículas retiradas o canceladas')}, el{' '}
                        {porcentaje(retiros, t.matriculas)} del año
                    </>
                }
            >
                De {cifra(t.matriculas)} matrículas registradas en {i.anio}, {cifra(t.activos)} siguen activas: {cifra(t.retirados)} se retiraron y{' '}
                {cifra(t.cancelados)} se cancelaron.
            </Titular>

            <Bloque titulo="Retiros por grado">
                <Columnas
                    ancho={682}
                    alto={170}
                    datos={i.grados.map((g) => ({
                        etiqueta: gradoCorto(g.numero),
                        partes: [
                            { valor: g.retirados, color: colores.alerta },
                            { valor: g.cancelados, color: '#AEB7CC' },
                        ],
                    }))}
                />
                <Leyenda
                    className="mt-[8px]"
                    items={[
                        { texto: 'Retirados', color: colores.alerta },
                        { texto: 'Cancelados', color: '#AEB7CC' },
                    ]}
                />
            </Bloque>

            {i.porMes.length > 0 && (
                <Bloque
                    titulo="Matrículas por mes"
                    nota={`fecha de matrícula${i.sinFecha > 0 ? ` · ${cantidad(i.sinFecha, 'matrícula', 'matrículas')} sin fecha` : ''}`}
                >
                    <Columnas
                        ancho={682}
                        alto={150}
                        rejilla={2}
                        datos={i.porMes.map((m) => ({ etiqueta: mesConAnio(m.mes), partes: [{ valor: m.n, color: colores.fuerte }] }))}
                    />
                    <p className="mt-[4px] text-[10px] text-[#6B7690]">
                        De {mesCorto(i.porMes[0].mes)} a {mesCorto(i.porMes[i.porMes.length - 1].mes)} · {cifra(conFecha)} matrículas con fecha.
                    </p>
                </Bloque>
            )}

            <div className="grid grid-cols-2 gap-[34px]">
                <Bloque titulo="Inscripciones por el formulario">
                    {i.inscripciones.total > 0 ? (
                        <Cifras
                            className="-mx-[14px] [&>div:first-child]:border-l-0"
                            items={[
                                { valor: cifra(porEstado.pendiente ?? 0), texto: 'pendientes' },
                                { valor: cifra(porEstado.aprobada ?? 0), texto: 'aprobadas (matriculadas)' },
                                { valor: cifra(porEstado.rechazada ?? 0), texto: 'rechazadas' },
                            ]}
                        />
                    ) : (
                        <p className="text-[11.5px] text-[#56627F]">Todavía no han llegado inscripciones por el formulario para este año.</p>
                    )}
                </Bloque>
                <Bloque titulo="Sobre los datos">
                    <ul className="space-y-[4px] text-[10.5px] leading-[1.45] text-[#56627F]">
                        <li>Las cifras son las del {fechaLarga(i.corte)} y cambian con cada matrícula, retiro o promoción.</li>
                        <li>Activos: matrículas del año en estado activo. Nuevo: primer año en el colegio.</li>
                        {i.sinRegistrar.length > 0 && <li>No se muestran {i.sinRegistrar.join(', ')}: faltan para la mayoría de los estudiantes.</li>}
                    </ul>
                </Bloque>
            </div>
        </>
    );
}

// ------------------------------------------------------------------ anexo

/** Índice del anexo: cada grupo con su página, agrupados por grado. */
export function IndiceAnexo({ informe: i, paginas }: { informe: Informe; paginas: Map<number, number> }) {
    const conEstudiantes = i.grupos.filter((g) => paginas.has(g.id));
    const porGrado = i.grados
        .map((gr) => ({ grado: gr, grupos: conEstudiantes.filter((g) => g.grado === gr.numero) }))
        .filter((x) => x.grupos.length > 0);

    return (
        <>
            <Titular
                seccion="Anexo · Estudiantes por grupo"
                titulo={
                    <>
                        {cifra(i.totales.activos)} estudiantes en {cantidad(conEstudiantes.length, 'grupo', 'grupos')}
                    </>
                }
            >
                Una hoja por grupo con sus estudiantes activos, ordenados por apellido: documento, edad, sexo, condición y el acudiente principal con
                su teléfono.
            </Titular>
            <div className="mt-[22px] columns-3 gap-x-[30px]">
                {porGrado.map(({ grado, grupos }) => (
                    <div key={grado.numero} className="mb-[12px] break-inside-avoid">
                        <p className="mb-[3px] text-[10px] font-semibold tracking-[0.5px] text-[#4863B8] uppercase">{grado.nombre}</p>
                        {grupos.map((g) => (
                            <div key={g.id} className="flex items-baseline gap-[6px] text-[11px] leading-[1.75]">
                                <b className="w-[34px] shrink-0 font-semibold">{g.codigo}</b>
                                <span className="truncate text-[#56627F]">{g.sede}</span>
                                <span className="mb-[3px] min-w-[8px] flex-1 border-b border-dotted border-[#C4D2F1]" />
                                <span className="tabular-nums">{paginas.get(g.id)}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}

/** Una hoja del anexo: el grupo con sus cifras y sus estudiantes (o la continuación). */
export function AnexoGrupo({
    grupo: g,
    estudiantes,
    desde,
    primera,
}: {
    grupo: GrupoInforme;
    estudiantes: EstudianteInforme[];
    desde: number;
    primera: boolean;
}) {
    const conModalidad = estudiantes.some((e) => e.modalidad);

    return (
        <>
            {primera ? (
                <div className="flex items-end justify-between border-b-[1.5px] border-[#16223F] pb-[14px]">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#4863B8]">
                            Anexo · {g.grado_nombre} · Sede {g.sede}
                            {g.jornada && ` · ${g.jornada}`}
                        </p>
                        <p className="mt-[6px] text-[42px] leading-none font-bold tracking-[-1.5px]">{g.codigo}</p>
                    </div>
                    <Cifras
                        className="shrink-0 [&>div]:px-[12px]"
                        items={[
                            {
                                valor: (
                                    <>
                                        {g.activos}
                                        <span className="text-[13px] text-[#8C97B3]">/{g.cupos}</span>
                                    </>
                                ),
                                texto: 'activos / cupos',
                            },
                            { valor: g.nuevos, texto: g.nuevos === 1 ? 'nuevo' : 'nuevos' },
                            { valor: g.repitentes, texto: g.repitentes === 1 ? 'repitente' : 'repitentes' },
                            { valor: `${g.ninas} · ${g.ninos}`, texto: 'niñas · niños' },
                        ]}
                    />
                </div>
            ) : (
                <div className="flex items-baseline justify-between border-b-[1.5px] border-[#16223F] pb-[8px]">
                    <p className="text-[18px] font-bold tracking-[-0.4px]">
                        {g.codigo} <span className="text-[12px] font-normal text-[#56627F]">· continuación</span>
                    </p>
                    <p className="text-[11px] text-[#56627F]">
                        {g.grado_nombre} · Sede {g.sede}
                    </p>
                </div>
            )}

            <table className={cn(tabla, 'mt-[4px]')}>
                <thead>
                    <tr>
                        <th className={cn(th, num, 'w-[24px]')}>#</th>
                        <th className={th}>Estudiante</th>
                        <th className={cn(th, 'w-[100px]')}>Documento</th>
                        <th className={cn(th, num, 'w-[30px]')}>Edad</th>
                        <th className={cn(th, 'w-[52px]')} />
                        {conModalidad && <th className={cn(th, 'w-[80px]')}>Modalidad</th>}
                        <th className={cn(th, conModalidad ? 'w-[136px]' : 'w-[200px]')}>Acudiente</th>
                        <th className={cn(th, num, 'w-[78px]')}>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    {estudiantes.map((e, n) => (
                        <tr key={desde + n}>
                            <td className={cn(td, num, 'text-[#8C97B3]')}>{desde + n + 1}</td>
                            <td className={cn(td, 'truncate font-medium')}>{e.nombre}</td>
                            <td className={cn(td, 'truncate text-[#56627F] tabular-nums')}>{e.documento}</td>
                            <td className={cn(td, num, e.extraedad && 'font-semibold text-[#8A5A0B]')}>{e.edad ?? '—'}</td>
                            <td className={cn(td, 'text-[9.5px] font-semibold')}>
                                {e.condicion === 'nuevo' ? (
                                    <span className="text-[#4863B8]">Nuevo</span>
                                ) : e.condicion === 'repitente' ? (
                                    <span className="text-[#8A5A0B]">Repitente</span>
                                ) : null}
                            </td>
                            {conModalidad && <td className={cn(td, 'truncate text-[#56627F]')}>{e.modalidad ?? '—'}</td>}
                            <td className={cn(td, 'truncate')}>{e.acudiente ?? <span className="text-[#8C97B3]">Sin registrar</span>}</td>
                            <td className={cn(td, num, 'text-[#56627F]')}>{e.telefono ? telefono(e.telefono) : '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {primera && estudiantes.some((e) => e.extraedad) && (
                <p className="mt-[8px] text-[9.5px] text-[#6B7690]">Edad en ámbar: extraedad (2 o más años por encima de la edad del grado).</p>
            )}
        </>
    );
}
