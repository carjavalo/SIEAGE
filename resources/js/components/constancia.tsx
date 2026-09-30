import { cn } from '@/lib/utils';
import { Scissors } from 'lucide-react';
import { type CSSProperties, type ReactNode } from 'react';

/** Lo que manda App\Support\Constancias por cada matrícula. */
export type Constancia = {
    id: number;
    anio: number;
    fecha: string;
    estudiante: {
        nombre: string;
        documento: string;
        grado: string;
        grupo: string | null;
        sede: string;
        jornada: string | null;
        modalidad: string | null;
        condicion: string;
    };
    acudiente: {
        nombre: string;
        documento: string | null;
        parentesco: string;
        direccion: string | null;
        barrio: string | null;
        telefonos: string[];
    } | null;
    observaciones: string | null;
    historia: { anio: number; grupo: string; sede: string }[];
};

export type Institucion = { nombre: string; nit: string; codigo_dane: string; resolucion: string; municipio: string } | null;

export type Papel = 'carta' | 'oficio';

/** Alto de la hoja: carta (8,5 × 11 in) u oficio (8,5 × 13 in). Las dos miden 215,9 mm de ancho. */
export const ALTO: Record<Papel, string> = { carta: '279.4mm', oficio: '330.2mm' };

const COMPROMISO =
    'Al firmar esta ficha de matrícula se compromete a ser parte de las estrategias educativas que se implementan en la Ley 2025 de 2020, asistir a todas las reuniones de entrega de informes y atender el llamado de los docentes.';

const fechaLarga = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

const mayuscula = (texto: string | null) => (texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : null);

/** En la historia cabe una línea por año: «Purificación Trujillo» sale como «P. Trujillo». */
const sedeCorta = (sede: string) => {
    const palabras = sede.split(' ');
    return sede.length <= 12 || palabras.length < 2 ? sede : [...palabras.slice(0, -1).map((p) => `${p[0]}.`), palabras.at(-1)].join(' ');
};

/** "Tia(o)" viene así del Excel. */
const parentesco = (texto: string) => texto.replace(/^Tia\(o\)$/, 'Tía(o)');

/**
 * Una hoja con la constancia dos veces: arriba la copia para la familia, abajo la del
 * colegio, con la línea para recortar. En pantalla, una hoja blanca con sombra; al
 * imprimir, la página exacta (ver @page constancia-* en app.css). Todo va en mm y pt.
 */
export function HojaConstancia({ constancia, institucion, papel }: { constancia: Constancia; institucion: Institucion; papel: Papel }) {
    return (
        <section
            data-papel={papel}
            aria-label={`Constancia de ${constancia.estudiante.nombre}`}
            // Con cientos de hojas, la pantalla solo pinta las que se ven (al imprimir salen todas).
            style={{ height: ALTO[papel], containIntrinsicSize: `215.9mm ${ALTO[papel]}` } as CSSProperties}
            className="pliego relative grid w-[215.9mm] shrink-0 grid-rows-2 overflow-hidden bg-white font-sans text-[#16223F] shadow-[0_10px_30px_-12px_rgba(22,34,63,0.35)] [content-visibility:auto] [print-color-adjust:exact] print:shadow-none"
        >
            <Copia constancia={constancia} institucion={institucion} papel={papel} para="Copia para la familia" />
            <Copia constancia={constancia} institucion={institucion} papel={papel} para="Copia para el colegio" />
            {/* El carácter de la tijera sale como emoji de color en Windows; el ícono se imprime igual en todas partes. */}
            <Scissors
                aria-hidden
                className="absolute top-1/2 left-[4.2mm] size-[3.6mm] -translate-y-1/2 bg-white px-[0.6mm] text-[#AEB8CF]"
                strokeWidth={1.75}
            />
        </section>
    );
}

function Copia({ constancia: c, institucion, papel, para }: { constancia: Constancia; institucion: Institucion; papel: Papel; para: string }) {
    const { estudiante: e, acudiente: a } = c;
    // En oficio sobra alto: se reparte entre los bloques en vez de quedar todo al final.
    const aire = papel === 'oficio' ? 'mt-[4.6mm]' : 'mt-[1.7mm]';

    return (
        <div className="flex min-h-0 flex-col px-[8mm] pt-[4mm] pb-[3.6mm] [&+&]:border-t-[0.3mm] [&+&]:border-dashed [&+&]:border-[#AEB8CF]">
            <div className="relative flex flex-1 flex-col rounded-[1.5mm] border-[0.5mm] border-[#1E3A7B] px-[5.5mm] pt-[2.8mm] pb-[2.6mm]">
                {/* Segundo filete del marco. */}
                <span aria-hidden className="pointer-events-none absolute inset-[0.8mm] rounded-[0.9mm] border-[0.2mm] border-[#1E3A7B]" />

                <header className="grid grid-cols-[30mm_1fr_30mm] items-center">
                    <img src="/constancia/ealp.png" alt="Institución Educativa Alfonso López Pumarejo" className="h-[11.5mm] w-auto" />
                    <div className="text-center leading-[1.3]">
                        <p className="font-['Roboto_Serif',Georgia,serif] text-[10.5pt] font-bold tracking-[0.01em] [font-variation-settings:'opsz'_24]">
                            {institucion?.nombre}
                        </p>
                        <p className="text-[6.6pt] text-[#56627F]">{institucion?.resolucion}</p>
                        <p className="text-[6.6pt] text-[#56627F]">
                            NIT {institucion?.nit} · DANE {institucion?.codigo_dane}
                        </p>
                    </div>
                    <img
                        src="/constancia/alcaldia.png"
                        alt="Alcaldía de Santiago de Cali, Secretaría de Educación"
                        className="h-[11.5mm] w-auto justify-self-end"
                    />
                </header>

                <h1 className="mt-[2.2mm] flex items-center gap-[3mm] font-['Roboto_Serif',Georgia,serif] text-[12pt] font-bold tracking-[0.12em] text-[#1E3A7B] uppercase [font-variation-settings:'opsz'_24] before:h-[0.25mm] before:flex-1 before:bg-[#1E3A7B] before:content-[''] after:h-[0.25mm] after:flex-1 after:bg-[#1E3A7B] after:content-['']">
                    Constancia de matrícula
                </h1>
                <p className="mt-[1mm] flex justify-between text-[7pt] text-[#3E4A68]">
                    <span>
                        Año lectivo <b className="font-semibold">{c.anio}</b> · {institucion?.municipio ?? 'Santiago de Cali'}, {fechaLarga(c.fecha)}
                    </span>
                    <span className="text-[6.2pt] font-bold tracking-[0.12em] text-[#1E3A7B] uppercase">{para}</span>
                </p>

                <Seccion titulo="Datos del estudiante" className={aire}>
                    <Tabla>
                        <Celda etiqueta="Nombre">{e.nombre}</Celda>
                        <Celda etiqueta="Documento">{e.documento}</Celda>
                        <Celda etiqueta="Grupo">{e.grupo ? `${e.grupo} · ${e.grado}` : e.grado}</Celda>
                        <Celda etiqueta="Condición">{mayuscula(e.condicion)}</Celda>
                        <Celda etiqueta="Sede" ultima>
                            {e.sede}
                        </Celda>
                        <Celda etiqueta="Jornada" ultima>
                            {e.jornada}
                        </Celda>
                        <Celda etiqueta="Modalidad" ultima>
                            {e.modalidad}
                        </Celda>
                        <Celda etiqueta="Año lectivo" ultima>
                            {c.anio}
                        </Celda>
                    </Tabla>
                </Seccion>

                <Seccion titulo="Datos del acudiente" className={aire}>
                    <Tabla>
                        <Celda etiqueta="Nombre">{a?.nombre}</Celda>
                        <Celda etiqueta="C.C.">{a?.documento}</Celda>
                        <Celda etiqueta="Parentesco">{a && parentesco(a.parentesco)}</Celda>
                        <Celda etiqueta="Barrio">{a?.barrio}</Celda>
                        <Celda etiqueta="Dirección" ultima>
                            {a?.direccion}
                        </Celda>
                        <Celda etiqueta="Teléfonos" ultima className="col-span-3">
                            {a?.telefonos.join(' · ')}
                        </Celda>
                    </Tabla>
                </Seccion>

                <p className="mt-[1.4mm] line-clamp-2 text-[7.2pt] text-[#3E4A68]">
                    <b className="mr-[1.4mm] text-[5.8pt] font-bold tracking-[0.1em] text-[#1E3A7B] uppercase">Observaciones</b>
                    {c.observaciones || 'Ninguna.'}
                </p>

                {c.historia.length > 0 && (
                    <Seccion titulo="Precedentes años escolares" className={aire}>
                        {/* Doce columnas como en el Excel; si tiene menos años, el recuadro se acorta. */}
                        <ol
                            className="grid rounded-tr-[1mm] rounded-b-[1mm] border-[0.25mm] border-[#B7C6EA] text-center"
                            style={{
                                gridTemplateColumns: `repeat(${c.historia.length}, minmax(0, 1fr))`,
                                width: `${(c.historia.length / 12) * 100}%`,
                            }}
                        >
                            {c.historia.map((h) => (
                                <li
                                    key={h.anio}
                                    className={cn(
                                        'flex flex-col border-r-[0.25mm] border-[#DCE5F8] last:border-r-0',
                                        h.anio === c.anio && 'bg-[#EEF2FB]',
                                    )}
                                >
                                    <small className="border-b-[0.25mm] border-[#DCE5F8] py-[0.4mm] text-[5.8pt] text-[#6B7690]">{h.anio}</small>
                                    <b className={cn('pt-[0.4mm] text-[8pt] leading-tight', h.anio === c.anio && 'text-[#1E3A7B]')}>{h.grupo}</b>
                                    <span className="truncate px-[0.5mm] pb-[0.6mm] text-[5.2pt] leading-[1.2] text-[#56627F]">
                                        {sedeCorta(h.sede)}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </Seccion>
                )}

                <div className="mt-auto pt-[1.6mm]">
                    <p className="text-center text-[6.4pt] leading-[1.38] text-[#56627F] italic">{COMPROMISO}</p>
                    <div className="mt-[6mm] grid grid-cols-2 gap-[20mm] px-[8mm] text-center text-[6.2pt] text-[#56627F]">
                        <div className="border-t-[0.3mm] border-[#16223F] pt-[0.8mm]">
                            <b className="block h-[1.45em] truncate text-[7.4pt] leading-[1.45] font-semibold text-[#16223F]">{a?.nombre}</b>
                            Firma del acudiente{a?.documento && ` · C.C. ${a.documento}`}
                        </div>
                        <div className="border-t-[0.3mm] border-[#16223F] pt-[0.8mm]">
                            <b className="block h-[1.45em] text-[7.4pt] leading-[1.45]" />
                            Firma Registro Académico
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Seccion({ titulo, className, children }: { titulo: string; className?: string; children: ReactNode }) {
    return (
        <section className={className}>
            <h2 className="inline-block rounded-t-[1mm] bg-[#1E3A7B] px-[2.4mm] py-[0.7mm] text-[6.2pt] font-bold tracking-[0.14em] text-white uppercase">
                {titulo}
            </h2>
            {children}
        </section>
    );
}

const Tabla = ({ children }: { children: ReactNode }) => (
    <div className="grid grid-cols-[2.1fr_1.2fr_1fr_1.1fr] rounded-tr-[1mm] rounded-b-[1mm] border-[0.25mm] border-[#B7C6EA]">{children}</div>
);

function Celda({ etiqueta, ultima, className, children }: { etiqueta: string; ultima?: boolean; className?: string; children: ReactNode }) {
    return (
        <div
            className={cn(
                'min-w-0 border-r-[0.25mm] border-[#DCE5F8] px-[2mm] pt-[0.8mm] pb-[0.9mm] last:border-r-0 [&:nth-child(4n)]:border-r-0',
                !ultima && 'border-b-[0.25mm]',
                className,
            )}
        >
            <small className="block text-[5.6pt] font-semibold tracking-[0.06em] text-[#6B7690] uppercase">{etiqueta}</small>
            <span className="block truncate text-[8.4pt] font-medium">{children || '—'}</span>
        </div>
    );
}
