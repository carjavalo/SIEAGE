import { type CSSProperties, type ReactNode, useLayoutEffect, useRef } from 'react';

/** Lo que manda App\Support\ActasGrado por cada programa (una modalidad técnica o los ciclos). */
export type Programa = {
    clave: string;
    nombre: string;
    tipo: 'tecnico' | 'ciclos';
    titulo: string;
    especialidad: string | null;
    graduandos: Graduando[];
};

export type Graduando = { matricula: number; nombre: string; documento: string; grupo: string | null };

export type Graduacion = {
    fecha: string | null;
    rector: string | null;
    cargo_rector: string;
    secretario: string | null;
    cargo_secretario: string;
    actas: Record<
        string,
        { acta: string | null; libro: string | null; folio: string | null; primero?: string | null; ultimo?: string | null } | undefined
    >;
};

export type Institucion = { nombre: string; codigo_dane: string; municipio: string } | null;

export type Documento = 'acta' | 'diploma';

/** Lo que va en cada hoja: el graduando y todo lo que es igual para su acta general. */
export type DatosHoja = {
    programa: Programa;
    graduando: Graduando;
    graduacion: Graduacion;
    institucion: Institucion;
    anio: number;
};

const ACTA = { ancho: '215.9mm', alto: '279.4mm' };
const DIPLOMA = { ancho: '215.9mm', alto: '330.2mm' };

const fuentes = {
    acta: "'Architects Daughter', cursive",
    texto: "'Open Sans', Arial, sans-serif",
    nombre: "'Pinyon Script', cursive",
    gotica: "'UnifrakturMaguntia', 'Old English Text MT', serif",
    firma: 'Arial, Helvetica, sans-serif',
};

const CREADA = 'Creada por Resolución No. 1697 del 3 de septiembre de 2002';

/** «Alfonso López Pumarejo»: el nombre sin «Institución Educativa». */
const nombreCorto = (i: Institucion) => (i?.nombre ?? 'Institución Educativa Alfonso López Pumarejo').replace(/^instituci[oó]n\s+educativa\s+/i, '');

/** «a los 10 días del mes de diciembre de 2024»; sin fecha, con líneas para llenar a mano. */
function fechaEnLetras(fecha: string | null, anio: number) {
    if (!fecha) return `a los ____ días del mes de __________ de ${anio}`;
    const d = new Date(`${fecha}T00:00:00`);
    const dia = d.getDate();
    const mes = d.toLocaleDateString('es-CO', { month: 'long' });
    return `${dia === 1 ? 'al primer día' : `a los ${dia} días`} del mes de ${mes} de ${d.getFullYear()}`;
}

/**
 * Una línea que se achica hasta caber en su ancho: los nombres largos en letra
 * cursiva no deben partirse ni salirse de la hoja.
 */
function Ajustada({
    tamano,
    minimo,
    className,
    style,
    children,
}: {
    tamano: number;
    minimo: number;
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
}) {
    const caja = useRef<HTMLParagraphElement>(null);
    useLayoutEffect(() => {
        const ajustar = () => {
            const el = caja.current;
            const texto = el?.firstElementChild as HTMLElement | null;
            if (!el || !texto) return;
            let pt = tamano;
            el.style.fontSize = `${pt}pt`;
            // Con margen: los rasgos de las mayúsculas cursivas se salen de la caja de la letra.
            while (texto.offsetWidth > el.clientWidth * 0.9 && pt > minimo) {
                pt -= 1;
                el.style.fontSize = `${pt}pt`;
            }
        };
        ajustar();
        // La letra cursiva llega después: se vuelve a medir con ella.
        let vigente = true;
        document.fonts?.ready.then(() => vigente && ajustar());
        return () => {
            vigente = false;
        };
    });
    return (
        <p ref={caja} className={`whitespace-nowrap ${className ?? ''}`} style={{ ...style, fontSize: `${tamano}pt` }}>
            <span>{children}</span>
        </p>
    );
}

/** Las esquinas doradas: la de arriba a la izquierda y la misma girada abajo a la derecha. */
function Esquinas({ tamano, arriba, abajo, lado }: { tamano: string; arriba: string; abajo: string; lado: string }) {
    return (
        <>
            <img
                src="/actas/esquina.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute"
                style={{ top: arriba, left: lado, width: tamano }}
            />
            <img
                src="/actas/esquina.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute rotate-180"
                style={{ bottom: abajo, right: lado, width: tamano }}
            />
        </>
    );
}

/**
 * El logo IEALP de las actas: la casa naranja con el nombre debajo. `marca` es la
 * versión grande y pálida que va de fondo en el diploma (sin el nombre).
 */
export function LogoIealp({ className, style, marca }: { className?: string; style?: CSSProperties; marca?: boolean }) {
    const color = marca ? '#FCF5DA' : '#F47B20';
    return (
        <svg
            viewBox="0 0 850 410"
            className={className}
            style={style}
            aria-hidden={marca}
            role={marca ? undefined : 'img'}
            aria-label={marca ? undefined : 'IEALP'}
        >
            <polyline points="22,400 22,196 152,142 152,110 384,16 446,42" fill="none" stroke={color} strokeWidth="10" strokeLinejoin="miter" />
            <polygon points="80,214 216,166 216,134 410,52 704,188 704,206 836,232 836,280 80,280" fill={color} />
            <text
                x="450"
                y="242"
                textAnchor="middle"
                fill="#fff"
                fontFamily="Arial Black, Arial, sans-serif"
                fontWeight="900"
                fontSize="104"
                letterSpacing="2"
            >
                IEALP
            </text>
            {!marca && (
                <>
                    <text x="460" y="326" textAnchor="middle" fill="#222" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="31">
                        INSTITUCION EDUCATIVA
                    </text>
                    <text x="460" y="364" textAnchor="middle" fill="#222" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="31">
                        ALFONSO LOPEZ PUMAREJO
                    </text>
                </>
            )}
            <line x1="22" y1="398" x2="820" y2="398" stroke={color} strokeWidth="10" />
        </svg>
    );
}

/** Rector(a) — logo — secretario(a): igual en el acta y en el diploma. */
function Firmas({ graduacion, logo, tamano }: { graduacion: Graduacion; logo: string; tamano: number }) {
    const firma = (nombre: string | null, cargo: string) => (
        <div className="min-w-0 flex-1 text-center leading-tight" style={{ fontFamily: fuentes.firma }}>
            <p className="font-bold whitespace-nowrap" style={{ fontSize: `${tamano}pt` }}>
                {nombre || <span className="text-[#B9BFCC]">________________________</span>}
            </p>
            <p style={{ fontSize: `${tamano - 2.5}pt` }}>{cargo}</p>
        </div>
    );
    return (
        <div className="flex items-center gap-[2mm]">
            {firma(graduacion.rector, graduacion.cargo_rector)}
            <LogoIealp className="shrink-0" style={{ width: logo }} />
            {firma(graduacion.secretario, graduacion.cargo_secretario)}
        </div>
    );
}

// ------------------------------------------------------------------ acta

/** El acta de grado de un graduando: hoja carta, con el formato de su programa. */
export function HojaActa({ programa, graduando, graduacion, institucion, anio }: DatosHoja) {
    const ciclos = programa.tipo === 'ciclos';
    const nombre = nombreCorto(institucion);
    const enMayusculas = `INSTITUCIÓN EDUCATIVA ${nombre.toLocaleUpperCase('es-CO')}`;
    const lista = programa.graduandos;
    const { acta, primero, ultimo } = graduacion.actas[programa.clave] ?? {};
    const municipio = institucion?.municipio ?? 'Santiago de Cali';
    const fecha = fechaEnLetras(graduacion.fecha, anio);

    return (
        <section
            aria-label={`Acta de grado de ${graduando.nombre}`}
            style={{ width: ACTA.ancho, height: ACTA.alto, fontFamily: fuentes.texto } as CSSProperties}
            className="hoja-acta relative shrink-0 overflow-hidden bg-white text-[#1A1A1A] [print-color-adjust:exact]"
        >
            <Esquinas tamano="70mm" arriba="19mm" abajo="19mm" lado="17mm" />

            <div className="absolute inset-x-[29mm] top-[33mm] bottom-[31mm] flex flex-col">
                <h1 className="text-center leading-none tracking-[0.04em]" style={{ fontFamily: fuentes.acta, fontSize: '40pt' }}>
                    ACTA DE GRADO
                </h1>
                <p className="mt-[9mm] text-center leading-[1.2]" style={{ fontSize: '22pt' }}>
                    INSTITUCIÓN EDUCATIVA
                    <br />
                    {nombre.toLocaleUpperCase('es-CO')}
                </p>
                {ciclos && <p className="text-center text-[11pt]">Ciclo VI - Jornada Sabatina</p>}
                <p className="mt-[5mm] text-right text-[10.5pt]">DANE {institucion?.codigo_dane}</p>

                <div className="mt-[2.5mm] space-y-[4mm] text-justify text-[11pt] leading-[1.38] italic">
                    <p>
                        En la ciudad de {municipio} {fecha}, se reunieron los suscritos {graduacion.cargo_rector} y {graduacion.cargo_secretario}, con
                        el fin de formalizar la graduación de los alumnos de último grado del{' '}
                        {ciclos ? 'Bachillerato Académico por ciclos' : 'Bachillerato Técnico Diurno'} de la <b>{enMayusculas}.</b> {CREADA} y
                        autorizada por la Secretaría de Educación Municipal de Santiago de Cali, según la{' '}
                        {ciclos ? 'Resolución Oficial N°. 057 de enero 19 de 2005.' : 'Resolución No. 7957 del 21 de octubre de 2013.'}
                    </p>
                    <p>
                        Comprobada la situación legal y académica de cada uno de los alumnos que cursaron y aprobaron los estudios correspondientes al
                        Nivel de Educación {ciclos ? 'Media Académica (Art. 29, ley 115 de 1994)' : 'Media Técnica (Art. 32, ley 115 de 1994)'} se
                        procedió a otorgar el título de:
                    </p>
                </div>

                <div className="mt-[4mm] text-center leading-[1.15]">
                    <p style={{ fontSize: ciclos ? '30pt' : '27pt' }}>{programa.titulo}</p>
                    {programa.especialidad && (
                        <p className="mx-auto max-w-[125mm] text-balance" style={{ fontSize: '17pt' }}>
                            - {programa.especialidad} -
                        </p>
                    )}
                </div>

                <p className="mt-[3mm] text-[11pt] italic">Al Graduando:</p>
                <Ajustada tamano={56} minimo={28} className="mt-[1.5mm] text-center leading-[1.25]" style={{ fontFamily: fuentes.nombre }}>
                    {graduando.nombre}
                </Ajustada>
                <p className="text-center text-[10.5pt]">{graduando.documento}</p>

                <p className="mt-[4mm] text-justify text-[11pt] leading-[1.38] italic">
                    Es fiel copia tomada del Acta Original General N°. {acta || '______'} que consta de {lista.length}{' '}
                    {lista.length === 1 ? 'alumno' : 'alumnos'}, que comienza con el nombre de <b>{primero || lista[0]?.nombre}</b> y se cierra con el
                    nombre de <b>{ultimo || lista.at(-1)?.nombre}.</b>
                </p>

                <div className="mt-auto">
                    <Firmas graduacion={graduacion} logo="36mm" tamano={12.5} />
                    <p className="mt-[8mm] text-center text-[11pt] italic">
                        Dado en {municipio} (Valle), {fecha}.
                    </p>
                </div>
            </div>
        </section>
    );
}

// ------------------------------------------------------------------ diploma

/** El diploma de un graduando: hoja oficio, en letra gótica, con el escudo y el logo de fondo. */
export function HojaDiploma({ programa, graduando, graduacion, institucion, anio }: DatosHoja) {
    const ciclos = programa.tipo === 'ciclos';
    const datos = graduacion.actas[programa.clave];
    const gotica = { fontFamily: fuentes.gotica };

    return (
        <section
            aria-label={`Diploma de ${graduando.nombre}`}
            style={{ width: DIPLOMA.ancho, height: DIPLOMA.alto } as CSSProperties}
            className="hoja-diploma relative shrink-0 overflow-hidden bg-white text-[#1A1A1A] [print-color-adjust:exact]"
        >
            <Esquinas tamano="66mm" arriba="22mm" abajo="26mm" lado="12mm" />
            <LogoIealp marca className="absolute top-[128mm] left-1/2 -translate-x-1/2" style={{ width: '182mm' }} />

            <div className="absolute inset-x-[16mm] top-[27mm] flex flex-col items-center text-center" style={gotica}>
                <img src="/actas/escudo.png" alt="Escudo de Colombia" className="h-[45mm]" />
                <p className="mt-[3mm] text-[12.5pt] leading-[1.1]">
                    La República de Colombia
                    <br />y en su nombre
                </p>
                <p className="mt-[3mm] text-[27pt] leading-[1.15]">La Institución Educativa</p>
                <p className="text-[35pt] leading-[1.15]">“{nombreCorto(institucion)}”</p>
                <p className="mt-[2mm] text-[9.5pt] leading-[1.35]">
                    {CREADA} y autorizada
                    <br />
                    por la Secretaría de Educación Municipal de Santiago de Cali,
                    <br />
                    {ciclos ? 'Según la Resolución No. 057 del 19 de Enero de 2005.' : 'según la Resolución No. 7957 del 21 de octubre de 2013.'}
                </p>

                <p className="mt-[5mm] text-[21pt]">Confiere a:</p>
                <Ajustada tamano={56} minimo={30} className="w-full leading-[1.3]" style={{ fontFamily: fuentes.nombre }}>
                    {graduando.nombre}
                </Ajustada>
                <p className="text-[9.5pt]">{graduando.documento}</p>

                <p className="mt-[4mm] text-[21pt]">El Título de:</p>
                <p className="mt-[3mm] text-[30pt] leading-[1.15]">{programa.titulo}</p>
                {programa.especialidad && <p className="max-w-[160mm] text-[18pt] leading-[1.25] text-balance">- {programa.especialidad} -</p>}
                <p className="mt-[4mm] text-[10pt] leading-[1.35]">
                    Por haber cursado y aprobado los estudios correspondientes al
                    <br />
                    {ciclos
                        ? 'Plan de Estudios Bachillerato por Ciclos (Decreto 3011 de 1997)'
                        : 'Nivel de la Educación Media Técnica (art. 32 ley 115 de 1994)'}
                    <br />
                    Según los planes y programas vigentes y el P.E.I.
                </p>
            </div>

            <div className="absolute inset-x-[22mm] bottom-[38mm]">
                <Firmas graduacion={graduacion} logo="52mm" tamano={11.5} />
                <p className="mt-[7mm] text-center text-[11pt]" style={gotica}>
                    Dado en {institucion?.municipio ?? 'Santiago de Cali'} (Valle), {fechaEnLetras(graduacion.fecha, anio)}.
                </p>
                <p className="mt-[2mm] text-center text-[11pt] [word-spacing:0.15em]" style={gotica}>
                    Libro No. {datos?.libro || '____'}&emsp;Folio No. {datos?.folio || '______'}
                </p>
            </div>
        </section>
    );
}
