/** Tipos y formatos de la vista de estudiantes (EstudianteController). */

/** Sede en el filtro del panel, con sus estudiantes activos en el año. */
export type SedeFiltro = { codigo: string; nombre: string; activos: number };

export type Grado = { id: number; numero: number; nombre: string; nivel: string; activos: number; grupos: number };

/** activos y nuevos llegan como texto desde MySQL (son SUM): se convierten al recibirlos. */
export type Grupo = {
    id: number;
    codigo: string;
    jornada: string;
    cupos: number;
    sede: string;
    sede_codigo: string;
    director: string | null;
    activos: number;
    nuevos: number;
};

export type Estudiante = {
    id: number;
    nombre: string;
    tipo_documento: string;
    numero_documento: string;
    genero: string | null;
    grupo_id: number | null;
    grupo: string | null;
    sede: string;
    sede_codigo: string;
    jornada: string | null;
    modalidad: string | null;
    condicion: string;
    estado: string;
    acudiente: string | null;
    telefono: string | null;
    /** Grupo del año siguiente, si ya fue promovido. */
    promovido_a: string | null;
};

export type Resultado = {
    id: number;
    nombre: string;
    tipo_documento: string;
    numero_documento: string;
    grado_id: number | null;
    grupo: string | null;
    sede: string | null;
    sede_codigo: string | null;
    estado: string | null;
};

export type Matricula = {
    id: number;
    anio: number;
    grado_id: number;
    grado: string;
    grado_numero: number;
    grupo: string | null;
    sede: string;
    sede_codigo: string;
    jornada: string | null;
    modalidad: string | null;
    fecha_matricula: string | null;
    condicion: string;
    estado: string;
    es_historico: number;
    observaciones: string | null;
    fecha_retiro: string | null;
    motivo_retiro: string | null;
};

/** Quién corrigió por última vez esos datos desde la ficha. */
export type UltimaEdicion = { usuario: string | null; fecha: string } | null;

/** El nombre en cuatro partes solo lo tienen quienes llegaron por el formulario; del Excel viene en una. */
type NombreEnPartes = {
    primer_nombre: string | null;
    segundo_nombre: string | null;
    primer_apellido: string | null;
    segundo_apellido: string | null;
};

export type Acudiente = NombreEnPartes & {
    id: number;
    nombre: string;
    tipo_documento: string;
    numero_documento: string;
    parentesco: string;
    parentesco_id: number;
    parentesco_otro: string | null;
    direccion: string | null;
    barrio: string | null;
    telefono_fijo: string | null;
    telefono_celular: string | null;
    email: string | null;
    es_principal: number;
    /** Sus otros estudiantes (hermanos…): lo que se le cambie vale también para ellos. */
    otros_estudiantes: { nombre: string; grupo: string | null }[];
    ultima_edicion: UltimaEdicion;
};

export type DatosEstudiante = NombreEnPartes & {
    id: number;
    tipo_documento: string;
    tipo_documento_otro: string | null;
    numero_documento: string;
    nombre_completo: string;
    fecha_nacimiento: string | null;
    genero: 'F' | 'M' | 'O' | null;
    tiene_foto: number;
    ciudad_expedicion: string | null;
    pais_nacimiento: string | null;
    ciudad_nacimiento: string | null;
    tipo_sangre: string | null;
    sisben: string | null;
    eps: string | null;
    grupo_etnico: string | null;
    discapacidad: string | null;
    direccion: string | null;
    barrio: string | null;
    telefono_1: string | null;
    telefono_2: string | null;
    correo: string | null;
    ultima_edicion: UltimaEdicion;
};

export type Parentesco = { id: number; nombre: string };

/** "Otro" con lo que se escribió, y "Tía(o)" con su tilde. */
export const parentescoDe = (a: Pick<Acudiente, 'parentesco' | 'parentesco_otro'>) =>
    a.parentesco === 'Otro' && a.parentesco_otro ? a.parentesco_otro : a.parentesco.replace(/^Tia\(o\)$/, 'Tía(o)');

/** Los mismos datos que usa la página de ficha completa (EstudianteController::ficha). */
export type FichaDetalle = {
    estudiante: DatosEstudiante;
    actual: Matricula | null;
    /** Está en transición este año: tiene boletín para escribir e imprimir. */
    boletin: boolean;
    /** Matrícula del año siguiente (planeado), si ya fue promovido. */
    promocion: {
        anio: number;
        grado_id: number;
        grado: string;
        grupo: string | null;
        sede: string;
        sede_codigo: string;
        jornada: string | null;
    } | null;
    historia: Matricula[];
    /** Deshabilitaciones y habilitaciones de la matrícula actual, la más reciente primero. */
    novedades: import('@/components/estudiantes/deshabilitar').Novedad[];
    acudientes: Acudiente[];
    boletines: { numero: number; valor: string }[];
    parentescos: Parentesco[];
    /** Los documentos de matrícula de la matrícula actual y cuáles se recibieron (null si no tiene matrícula). */
    documentos: DocumentosEstudiante | null;
};

export type DocumentosEstudiante = {
    lista: (import('@/lib/inscritos').Requisito & { estado: import('@/lib/inscritos').EstadoDocumento | null })[];
    registro: { por: string | null; en: string } | null;
};

/** Filtro de estado de la lista: "inactivo" agrupa retirados, cancelados y trasladados. */
export type FiltroEstado = 'activo' | 'inactivo' | 'todos';

export const cumpleEstado = (estado: string, filtro: FiltroEstado) =>
    filtro === 'todos' || (filtro === 'activo' ? estado === 'activo' : estado !== 'activo');

export const numero = (n: number) => n.toLocaleString('es-CO');

/** Minúsculas y sin tildes, para comparar lo que se escribe con los nombres. */
export const plano = (texto: string | null | undefined) => (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const palabras = (consulta: string) => plano(consulta.trim()).split(/\s+/).filter(Boolean);

/** Cada palabra escrita debe aparecer en el nombre, el documento o el acudiente. */
export const cumpleTexto = (e: Estudiante, buscadas: string[]) =>
    buscadas.every((p) => plano(e.nombre).includes(p) || e.numero_documento.includes(p) || plano(e.acudiente).includes(p));

export const gradoCorto = (g: Pick<Grado, 'numero'>) => (g.numero === 0 ? 'Tr' : `${g.numero}°`);

/** 3001234567 → 300 123 4567. */
export const telefono = (t: string) => (t.length === 10 ? `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}` : t);

/** 2026-02-26 → 26 feb 2026. */
export function fecha(valor: string | null) {
    if (!valor) return null;
    return new Date(`${valor}T00:00:00`)
        .toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
        .replace(/\./g, '')
        .replace(/ de /g, ' ');
}

export function edad(valor: string | null) {
    if (!valor) return null;
    const nacimiento = new Date(`${valor}T00:00:00`);
    const hoy = new Date();
    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())) anios--;
    return anios;
}

/** "Carlos Andrés Holguín Díaz" → "Carlos A. Holguín", solo si no cabe; el nombre completo va en el title. */
export function directorCorto(nombre: string) {
    if (nombre.length <= 20) return nombre;
    const p = nombre.split(/\s+/);
    return p.length < 3 ? nombre : `${p[0]} ${p[1][0]}. ${p[2]}`;
}
