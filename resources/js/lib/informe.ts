/** Tipos y utilidades del informe de matrícula (App\Support\InformeMatricula). */

export type Totales = {
    matriculas: number;
    activos: number;
    nuevos: number;
    antiguos: number;
    repitentes: number;
    retirados: number;
    cancelados: number;
    otrosEstados: number;
    cupos: number;
    grupos: number;
    sedes: number;
    ninas: number;
    ninos: number;
    extraedad: number;
    conEdad: number;
    edadPromedio: number | null;
    conAcudiente: number;
    conTelefono: number;
};

export type SedeInforme = {
    codigo: string;
    nombre: string;
    activos: number;
    grupos: number;
    cupos: number;
    nuevos: number;
    ninas: number;
    ninos: number;
    jornadas: Record<string, number>;
    grados: number[];
};

export type GradoInforme = {
    numero: number;
    nombre: string;
    nivel: string;
    grupos: number;
    cupos: number;
    activos: number;
    nuevos: number;
    repitentes: number;
    retirados: number;
    cancelados: number;
    ninas: number;
    ninos: number;
    edadEsperada: number;
    edadPromedio: number | null;
    extraedad: number;
};

export type GrupoInforme = {
    id: number;
    codigo: string;
    jornada: string | null;
    cupos: number;
    grado: number;
    grado_nombre: string;
    nivel: string;
    sede_codigo: string;
    sede: string;
    activos: number;
    nuevos: number;
    repitentes: number;
    ninas: number;
    ninos: number;
};

export type EstudianteInforme = {
    nombre: string;
    documento: string;
    edad: number | null;
    extraedad: boolean;
    sexo: 'F' | 'M' | 'O' | null;
    condicion: 'nuevo' | 'antiguo' | 'repitente' | 'trasladado';
    modalidad: string | null;
    acudiente: string | null;
    parentesco: string | null;
    telefono: string | null;
};

export type Informe = {
    institucion: { nombre: string; municipio: string | null; codigo_dane: string | null } | null;
    anio: number;
    anios: number[];
    corte: string;
    totales: Totales;
    sedes: SedeInforme[];
    jornadas: { nombre: string; activos: number }[];
    niveles: { clave: string; nombre: string; activos: number; grupos: number }[];
    grados: GradoInforme[];
    grupos: GrupoInforme[];
    modalidades: { nombre: string; decimo: number; undecimo: number; total: number }[];
    parentescos: { nombre: string; n: number }[];
    porMes: { mes: string; n: number }[];
    sinFecha: number;
    inscripciones: { total: number; porEstado: Partial<Record<'pendiente' | 'aprobada' | 'rechazada', number>> | [] };
    /** Datos que faltan para la mayoría de los activos (no se muestran). */
    sinRegistrar: string[];
    anexo: { grupo: number; estudiantes: EstudianteInforme[] }[];
};

const numeros = new Intl.NumberFormat('es-CO');
const decimales = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

/** 2184 → "2.184". */
export const cifra = (n: number) => numeros.format(n);

/** Porcentaje de a sobre b, con un decimal si hace falta: "26,7 %". Sin base, "—". */
export const porcentaje = (a: number, b: number) => (b > 0 ? `${decimales.format((a / b) * 100)} %` : '—');

/** Solo el número del porcentaje, redondeado, para frases: "93". */
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

export const decimal = (n: number | null) => (n === null ? '—' : decimales.format(n));

/** "Tr", "1°"… "11°". */
export const gradoCorto = (numero: number) => (numero === 0 ? 'Tr' : `${numero}°`);

/** Nombre corto de la institución para el encabezado de cada hoja. */
export const institucionCorta = (nombre: string | undefined) => (nombre ?? 'Institución Educativa').replace(/^Instituci[oó]n Educativa/i, 'I.E.');

export const fechaCorta = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ');

export const fechaLarga = (iso: string) =>
    new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** "2025-03" → "mar 2025". */
export const mesCorto = (mes: string) =>
    new Date(`${mes}-01T00:00:00`).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ');

/** Parte una lista en trozos: la primera hoja lleva menos filas (tiene el titular). */
export function enHojas<T>(filas: T[], primera: number, siguientes: number): T[][] {
    if (filas.length <= primera) return [filas];
    const hojas = [filas.slice(0, primera)];
    for (let i = primera; i < filas.length; i += siguientes) hojas.push(filas.slice(i, i + siguientes));
    return hojas;
}
