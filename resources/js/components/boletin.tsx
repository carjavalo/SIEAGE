import { type CSSProperties, type ReactNode } from 'react';

/**
 * La hoja del boletín de transición («Informe escolar de valoración»), copiada del
 * formato que usa el colegio: carta, medidas en puntos (pt) como el PDF original,
 * Tahoma en el encabezado y las firmas, Arial en el contenido.
 *
 * Solo el texto es de cada estudiante. Si no cabe en una hoja, primero se achica
 * la letra (hasta 8,7 pt, como hacía el formato original); si aun así no cabe,
 * sigue en otra hoja con el mismo encabezado y las firmas van al final.
 */

export type GrupoBoletin = {
    id: number;
    anio: number;
    sede: string;
    direccion: string;
    curso: string;
    codigo: string;
    jornada: string;
    jornada_boletin: string | null;
    jornada_grupo: string;
    director: string | null;
    director_id: number | null;
    coordinador: string | null;
    coordinador_id: number | null;
    sede_id: number;
};

export type EstudianteBoletin = {
    matricula_id: number;
    estudiante_id: number;
    nombre: string;
    apellidos_nombres: string;
    nombres_apellidos: string;
    modalidad: string;
    texto: string;
    /** Con qué versión se abrió (sube en cada guardado): si al guardar ya hay otra, alguien lo cambió. */
    version: string | null;
    actualizado_en: string | null;
    actualizado_por: string | null;
};

export const PROPOSITOS = [
    'Las niñas y los niños construyen su identidad en relación con los otros, se sienten queridos y valoran positivamente pertenecer a una familia y una comunidad.',
    'Las niñas y los niños expresan, imaginan y representan su realidad, apropian su lengua y son comunicadores activos de sus ideas, sentimientos y emociones.',
    'Las niñas y los niños indagan, exploran y resuelven problemas de la vida cotidiana para comprender y transformar el mundo que habitan.',
    'Las niñas y los niños experimentan el descubrimiento de sí mismos, apropian el espacio y el territorio que habitan, y se expresan a través del cuerpo y el movimiento libre en el encuentro con los otros.',
];

const TAHOMA = 'Tahoma, Verdana, "DejaVu Sans", sans-serif';
const ARIAL = 'Arial, "Liberation Sans", Arimo, Helvetica, sans-serif';

/** Tamaños de letra del texto, del normal al más chico (pt). */
export const TAMANOS = [10.2, 9.6, 9.0, 8.7] as const;
/** Interlineado del contenido: 11,6 pt para letra de 10,2 pt. */
const INTERLINEA = 11.6 / 10.2;
/** Ancho del texto dentro del recuadro (pt). */
export const ANCHO = 564;
/** Un pelo más juntas que Arial de Chrome: así los renglones cortan donde corta el formato original. */
export const ESPACIADO = '-0.01pt';

/**
 * Cuánto texto (nombre + párrafos, cada uno con su espacio de abajo) cabe en el
 * recuadro, en pt. La primera hoja lleva los propósitos; la que cierra, las firmas.
 */
const CABE = { primeraConFirmas: 299.8, primeraSinFirmas: 366, otraConFirmas: 464, otraSinFirmas: 530 };

/** Los párrafos: cada salto de línea empieza uno. */
export const parrafos = (texto: string) =>
    texto
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

// ---------------------------------------------------------------- medir el texto

type Bloque = { texto: string; titulo?: boolean; partido?: boolean; sigue?: boolean };
export type Pagina = { bloques: Bloque[]; primera: boolean; firmas: boolean };

let medidor: HTMLParagraphElement | null = null;
const medidas = new Map<string, number>();

/** Alto en pt de un párrafo con esa letra, medido en el navegador con la misma tipografía. */
function alto(texto: string, tamano: number, negrita = false): number {
    const clave = `${tamano}|${negrita ? 1 : 0}|${texto}`;
    const guardada = medidas.get(clave);
    if (guardada !== undefined) return guardada;
    if (!medidor) {
        medidor = document.createElement('p');
        Object.assign(medidor.style, {
            position: 'absolute',
            left: '-10000px',
            top: '0',
            visibility: 'hidden',
            width: `${ANCHO}pt`,
            margin: '0',
            fontFamily: ARIAL,
            letterSpacing: ESPACIADO,
            textAlign: 'justify',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
        } satisfies Partial<CSSStyleDeclaration>);
        medidor.setAttribute('aria-hidden', 'true');
        document.body.append(medidor);
    }
    medidor.style.fontSize = `${tamano}pt`;
    medidor.style.lineHeight = String(INTERLINEA);
    medidor.style.fontWeight = negrita ? '700' : '400';
    medidor.textContent = texto;
    const pt = medidor.getBoundingClientRect().height * 0.75;
    if (medidas.size > 4000) medidas.clear();
    medidas.set(clave, pt);
    return pt;
}

const altoBloque = (b: Bloque, tamano: number) => alto(b.texto, tamano, b.titulo) + tamano;

/** Parte un párrafo por palabras: lo que cabe en `resto` pt y lo que sigue. Null si no caben ni dos líneas. */
function partir(b: Bloque, resto: number, tamano: number): [Bloque, Bloque] | null {
    const palabras = b.texto.split(' ');
    if (resto < tamano * INTERLINEA * 2 || palabras.length < 4) return null;
    let bajo = 1;
    let alto_ = palabras.length - 1;
    let mejor = 0;
    while (bajo <= alto_) {
        const medio = (bajo + alto_) >> 1;
        if (alto(palabras.slice(0, medio).join(' '), tamano, b.titulo) <= resto) {
            mejor = medio;
            bajo = medio + 1;
        } else alto_ = medio - 1;
    }
    if (mejor < 2) return null;
    return [
        { ...b, texto: palabras.slice(0, mejor).join(' '), partido: true },
        { texto: palabras.slice(mejor).join(' '), sigue: true },
    ];
}

/**
 * Reparte el nombre y los párrafos en hojas. Devuelve la letra que se usa y las
 * hojas: una sola si cabe (achicando la letra si hace falta), o varias.
 */
export function paginar(nombre: string, texto: string): { tamano: number; paginas: Pagina[] } {
    const bloques: Bloque[] = [{ texto: nombre, titulo: true }, ...parrafos(texto).map((t) => ({ texto: t }))];

    for (const tamano of TAMANOS) {
        const total = bloques.reduce((s, b) => s + altoBloque(b, tamano), 0);
        if (total <= CABE.primeraConFirmas) return { tamano, paginas: [{ bloques, primera: true, firmas: true }] };
    }

    // Varias hojas con la letra normal.
    const tamano = TAMANOS[0];
    const paginas: (Pagina & { usado: number })[] = [];
    let actual: Pagina & { usado: number } = { bloques: [], primera: true, firmas: false, usado: 0 };
    let cabe: number = CABE.primeraSinFirmas;
    const cola = [...bloques];
    while (cola.length) {
        const b = cola.shift()!;
        const h = altoBloque(b, tamano);
        if (actual.usado + h <= cabe) {
            actual.bloques.push(b);
            actual.usado += h;
            continue;
        }
        const partes = partir(b, cabe - actual.usado, tamano);
        if (partes) {
            actual.bloques.push(partes[0]);
            cola.unshift(partes[1]);
        } else if (actual.bloques.length === 0) {
            // Un párrafo enorme que no se deja partir: va igual (no debería pasar).
            actual.bloques.push(b);
        } else cola.unshift(b);
        paginas.push(actual);
        actual = { bloques: [], primera: false, firmas: false, usado: 0 };
        cabe = CABE.otraSinFirmas;
    }
    paginas.push(actual);

    // La última lleva las firmas: si con ellas no cabe, lo que sobra pasa a una hoja nueva.
    const ultima = paginas[paginas.length - 1];
    const conFirmas = ultima.primera ? CABE.primeraConFirmas : CABE.otraConFirmas;
    if (ultima.usado > conFirmas) {
        const pasan: Bloque[] = [];
        while (ultima.bloques.length && ultima.usado > conFirmas) {
            const b = ultima.bloques.pop()!;
            ultima.usado -= altoBloque(b, tamano);
            const partes = ultima.usado < conFirmas ? partir(b, conFirmas - ultima.usado, tamano) : null;
            if (partes) {
                ultima.bloques.push(partes[0]);
                ultima.usado += alto(partes[0].texto, tamano, b.titulo);
                pasan.unshift(partes[1]);
            } else pasan.unshift(b);
        }
        paginas.push({ bloques: pasan, primera: false, firmas: true, usado: 0 });
    } else ultima.firmas = true;

    return { tamano, paginas: paginas.map(({ bloques: bl, primera, firmas }) => ({ bloques: bl, primera, firmas })) };
}

// ---------------------------------------------------------------- la hoja

const pt = (n: number) => `${n}pt`;

function Encabezado({ grupo }: { grupo: GrupoBoletin }) {
    const institucion = `INSTITUCIÓN ETNOEDUCATIVA ALFONSO LÓPEZ PUMAREJO - ${grupo.sede}`;
    // Bordes del encabezado: el «relieve» de una tabla HTML con borde, como en el original.
    const exterior: CSSProperties = {
        position: 'absolute',
        left: pt(15.3),
        top: pt(16.7),
        width: pt(581.4),
        height: pt(77.8),
        borderStyle: 'solid',
        borderWidth: pt(0.7),
        borderColor: '#EEEEEE #9A9A9A #9A9A9A #EEEEEE',
    };
    const celda = (izquierda: number, ancho: number): CSSProperties => ({
        position: 'absolute',
        left: pt(izquierda - 16),
        top: pt(18.9 - 17.4),
        width: pt(ancho),
        height: pt(73.4),
        borderStyle: 'solid',
        borderWidth: pt(0.7),
        borderColor: '#9A9A9A #EEEEEE #EEEEEE #9A9A9A',
        boxSizing: 'border-box',
    });
    // Cada línea donde está en el original (pt desde arriba de la hoja). Si el texto es más largo
    // (otra sede, otra dirección), la letra se achica para que no se salga de la celda.
    const linea = (arriba: number, tamano: number, negrita = false, texto = '', caben = 999): CSSProperties => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: pt(arriba - 19.6),
        fontSize: pt(tamano * Math.min(1, caben / Math.max(texto.length, 1))),
        lineHeight: 1.207,
        fontWeight: negrita ? 700 : 400,
        textAlign: 'center',
        whiteSpace: 'nowrap',
    });
    const logo: CSSProperties = { position: 'absolute', left: pt(5.2), top: pt(5.1), width: pt(53.8), height: pt(61.8) };

    return (
        <div style={exterior}>
            <div style={celda(17.4, 65.5)}>
                <img src="/boletin/ealp.jpg" alt="" style={logo} />
            </div>
            <div style={celda(84.3, 443.4)}>
                <p style={linea(22.5, 10.2, true, institucion, 68)}>{institucion}</p>
                <p style={linea(37.1, 8)}>Secretaría de Educación Municipal</p>
                <p style={linea(46.5, 8.7)}>AÑO LECTIVO {grupo.anio} - CALENDARIO A</p>
                <p style={linea(56.7, 8.7, false, grupo.direccion, 82)}>{grupo.direccion}</p>
                <p style={linea(66.9, 12.4, true)}>INFORME ESCOLAR DE VALORACIÓN</p>
            </div>
            <div style={celda(529.1, 65.5)}>
                <img src="/boletin/alcaldia.png" alt="" style={logo} />
            </div>
        </div>
    );
}

/** Las líneas dobles que separan (la línea con relieve de un <hr>). */
const Raya = ({ arriba = 0, abajo = 0 }: { arriba?: number; abajo?: number }) => (
    <div
        style={{ marginTop: pt(arriba), marginBottom: pt(abajo), borderTop: `${pt(0.7)} solid #9A9A9A`, borderBottom: `${pt(0.7)} solid #EEEEEE` }}
    />
);

function Propositos() {
    return (
        <div style={{ width: pt(ANCHO), fontFamily: ARIAL, fontWeight: 700, fontSize: pt(10.2), lineHeight: INTERLINEA, textAlign: 'justify' }}>
            {PROPOSITOS.map((p, i) => (
                <div key={i}>
                    <p>{p}</p>
                    <Raya arriba={5} abajo={i === PROPOSITOS.length - 1 ? 30 : 5.3} />
                </div>
            ))}
        </div>
    );
}

function Firmas({ grupo }: { grupo: GrupoBoletin }) {
    return (
        <div style={{ fontFamily: TAHOMA, lineHeight: 1.207 }}>
            <Raya />
            <div style={{ display: 'flex', paddingBottom: pt(16.75) }}>
                <div style={{ width: pt(376.5), paddingTop: pt(21.8), color: '#333333', fontSize: pt(11.6) }}>
                    <p style={{ fontWeight: 700 }}>Rector(a) o coordinador(a) titular o designado(a)</p>
                    <p>{grupo.coordinador ?? ' '}</p>
                </div>
                <div style={{ width: pt(168.6), paddingTop: pt(11), color: '#111111', fontSize: pt(10.2) }}>
                    <p
                        style={{
                            fontWeight: 700,
                            fontSize: pt(10.2 * Math.min(1, 46 / Math.max((grupo.director ?? '').length, 1))),
                            minHeight: pt(24.6),
                            marginBottom: pt(7.4),
                        }}
                    >
                        {grupo.director ?? ''}
                    </p>
                    <div style={{ borderTop: `${pt(0.7)} solid #333333` }} />
                    <p>Firma del director(a) de grupo</p>
                </div>
            </div>
        </div>
    );
}

/** El texto de la hoja: el nombre en negrita y los párrafos, justificados. */
export function TextoBoletin({ bloques, tamano }: { bloques: Bloque[]; tamano: number }) {
    return (
        <div
            style={{
                width: pt(ANCHO),
                fontFamily: ARIAL,
                fontSize: pt(tamano),
                lineHeight: INTERLINEA,
                textAlign: 'justify',
                letterSpacing: ESPACIADO,
                overflowWrap: 'break-word',
            }}
        >
            {bloques.map((b, i) => (
                <p
                    key={i}
                    style={{
                        fontWeight: b.titulo ? 700 : 400,
                        // El pedazo de un párrafo que sigue en la otra hoja va justificado hasta el final.
                        marginBottom: b.partido ? 0 : '1em',
                        textAlignLast: b.partido ? 'justify' : undefined,
                    }}
                >
                    {b.texto}
                </p>
            ))}
        </div>
    );
}

/**
 * Una hoja carta. `children` reemplaza el texto (el editor pone ahí el campo
 * donde se escribe); `alta` deja que la hoja crezca si el texto no cabe.
 */
export function HojaBoletin({
    grupo,
    estudiante,
    periodo,
    pagina,
    tamano,
    children,
    alta,
    className,
}: {
    grupo: GrupoBoletin;
    estudiante: EstudianteBoletin;
    periodo: string;
    pagina: Pagina;
    tamano: number;
    children?: ReactNode;
    alta?: boolean;
    className?: string;
}) {
    const renglon = `JORNADA: ${grupo.jornada} CURSO: ${grupo.curso} PERIODO: ${periodo} MODALIDAD: ${estudiante.modalidad}`;
    return (
        <article
            className={`hoja-boletin ${className ?? ''}`}
            style={{
                position: 'relative',
                width: pt(612),
                height: alta ? 'auto' : pt(792),
                minHeight: pt(792),
                paddingBottom: alta ? pt(60) : undefined,
                background: '#FFFFFF',
                color: '#000000',
                fontFamily: TAHOMA,
                overflow: 'hidden',
                textRendering: 'geometricPrecision',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
            }}
        >
            <Encabezado grupo={grupo} />

            <div style={{ position: 'relative', marginLeft: pt(15.3), width: pt(581.4), paddingTop: pt(95.2) }}>
                <p style={{ fontSize: pt(14.5), lineHeight: 1.207, fontWeight: 700, color: '#111111', textAlign: 'center' }}>
                    {estudiante.apellidos_nombres}
                </p>
                <p
                    style={{
                        marginTop: pt(0.5),
                        fontSize: pt(10.2 * Math.min(1, 88 / renglon.length)),
                        lineHeight: pt(12.31),
                        whiteSpace: 'nowrap',
                        color: '#111111',
                        textAlign: 'center',
                    }}
                >
                    <b>JORNADA:</b> {grupo.jornada} <b>CURSO:</b> {grupo.curso} <b>PERIODO:</b> {periodo} <b>MODALIDAD:</b>
                    {estudiante.modalidad ? ` ${estudiante.modalidad}` : ''}
                </p>
                <h2 style={{ marginTop: pt(15.6), fontFamily: ARIAL, fontSize: pt(13.8), lineHeight: pt(16), fontWeight: 700, textAlign: 'center' }}>
                    Valoración y seguimiento del proceso de desarrollo y aprendizaje de los niños y las niñas
                </h2>
                <p style={{ marginTop: pt(0.4), fontFamily: ARIAL, fontSize: pt(12.4), lineHeight: 1.117, fontWeight: 700, textAlign: 'center' }}>
                    Propósitos de la educación inicial
                </p>

                {/* El recuadro del original es de 1,4 pt; el navegador redondea los bordes a píxeles enteros y 1,4 pt quedaría en 1 px. */}
                {/* El texto mide justo 564 pt de ancho, como en el original (de eso dependen los cortes de renglón). */}
                <div style={{ marginTop: pt(-0.35), border: '2px solid #000000', padding: `${pt(8.15)} ${pt(7.2)} 0` }}>
                    {pagina.primera && <Propositos />}
                    {children ?? <TextoBoletin bloques={pagina.bloques} tamano={tamano} />}
                    {pagina.firmas ? <Firmas grupo={grupo} /> : <div style={{ height: pt(7.5) }} />}
                </div>
            </div>

            <footer
                style={{
                    position: 'absolute',
                    left: pt(15.3),
                    width: pt(581.4),
                    ...(alta ? { bottom: pt(31) } : { top: pt(743.6) }),
                    borderTop: `${pt(0.7)} solid #333333`,
                    // Como en el original: no va centrado en la hoja, empieza a 155 pt del borde.
                    padding: `${pt(2.9)} 0 0 ${pt(139.9)}`,
                    fontSize: pt(10.9),
                    lineHeight: 1.207,
                }}
            >
                Sistema integral de apoyo a la gestión educativa
            </footer>
        </article>
    );
}

/** Todas las hojas del boletín de un estudiante (para imprimir). */
export function HojasBoletin({ grupo, estudiante, periodo }: { grupo: GrupoBoletin; estudiante: EstudianteBoletin; periodo: string }) {
    const { tamano, paginas } = paginar(estudiante.nombres_apellidos, estudiante.texto);
    return (
        <>
            {paginas.map((p, i) => (
                <HojaBoletin key={i} grupo={grupo} estudiante={estudiante} periodo={periodo} pagina={p} tamano={tamano} />
            ))}
        </>
    );
}

// ---------------------------------------------------------------- pegar desde Word o un PDF

const quitarTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Texto pegado → párrafos. Si viene de un PDF (líneas cortadas a lo ancho de la
 * hoja), vuelve a unir cada párrafo: una línea se une con la siguiente salvo que
 * sea corta y termine en punto (o la siguiente empiece con mayúscula). Si el
 * primer párrafo es solo el nombre del estudiante, se quita (la hoja ya lo pone).
 */
export function desenvolver(texto: string, nombre?: string): string[] {
    const lineas = texto
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((l) =>
            l
                .replace(/[ \t\u00A0]+/g, ' ')
                .replace(/ ([.,;:])/g, '$1')
                .trim(),
        );
    const largos = lineas
        .filter(Boolean)
        .map((l) => l.length)
        .sort((a, b) => a - b);
    const tipico = largos.length ? largos[Math.floor(largos.length * 0.8)] : 0;
    // Texto cortado por líneas (de un PDF): varias líneas casi del mismo largo y, casi siempre, sin
    // punto al final. Desde Word cada línea es un párrafo entero y termina en punto: esas no se unen.
    const llenas = lineas.filter(Boolean);
    const abiertas = llenas.slice(0, -1).filter((l) => !/[.!?…:»")]$/.test(l)).length;
    const cortado =
        largos.length >= 3 &&
        tipico >= 50 &&
        abiertas >= (llenas.length - 1) * 0.5 &&
        largos.filter((n) => n >= tipico * 0.7).length >= largos.length * 0.5;

    let salida: string[];
    if (!cortado) salida = lineas.filter(Boolean);
    else {
        salida = [];
        let actual = '';
        lineas.forEach((l, i) => {
            if (!l) {
                if (actual) salida.push(actual);
                actual = '';
                return;
            }
            actual = actual ? `${actual} ${l}` : l;
            const siguiente = lineas[i + 1];
            const corta = l.length < tipico * 0.85;
            const termina = /[.!?…:»")]$/.test(l);
            const mayuscula = !!siguiente && /^[A-ZÁÉÍÓÚÜÑ¿¡"«(•\-–\d]/.test(siguiente);
            if (!siguiente || (corta && (termina || mayuscula))) {
                salida.push(actual);
                actual = '';
            }
        });
        if (actual) salida.push(actual);
    }

    if (nombre && salida.length > 1 && quitarTildes(salida[0]) === quitarTildes(nombre)) salida = salida.slice(1);
    return salida;
}
