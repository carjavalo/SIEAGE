/** Tipos y formatos de la vista de estudiantes (EstudianteController). */

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

export type Acudiente = {
    nombre: string;
    tipo_documento: string;
    numero_documento: string;
    parentesco: string;
    direccion: string | null;
    barrio: string | null;
    telefono_fijo: string | null;
    telefono_celular: string | null;
    email: string | null;
    es_principal: number;
};

/** Los mismos datos que usa la página de ficha completa (EstudianteController::ficha). */
export type FichaDetalle = {
    estudiante: {
        id: number;
        tipo_documento: string;
        numero_documento: string;
        nombre_completo: string;
        fecha_nacimiento: string | null;
        genero: 'F' | 'M' | 'O' | null;
    };
    actual: Matricula | null;
    historia: Matricula[];
    acudientes: Acudiente[];
    boletines: { numero: number; valor: string }[];
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
