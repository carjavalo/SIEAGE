/** Roles de los usuarios de SIEAGE (tabla roles). */

/** `nombre` es la clave interna (no cambia); `etiqueta`, como se ve (se cambia en Roles y permisos). */
export type Rol = { id: number; nombre: string; etiqueta: string | null; descripcion: string | null };
type ConNombre = { nombre: string; etiqueta?: string | null };

const NOMBRES: Record<string, string> = {
    administrador: 'Administrador',
    coordinacion: 'Coordinación',
    secretaria: 'Secretaría',
    docente: 'Docente',
};

/** Cómo se ve un rol: su etiqueta; si no llega, el nombre de siempre. */
export const nombreRol = (rol?: ConNombre | string | null) => {
    if (!rol) return 'Sin rol';
    if (typeof rol === 'string') return NOMBRES[rol] ?? rol;
    return rol.etiqueta || NOMBRES[rol.nombre] || rol.nombre;
};

/** Punto de color de cada rol, como las sedes: sin pastillas rellenas. */
const PUNTOS: Record<string, string> = {
    administrador: 'bg-[#1E3A7B]',
    coordinacion: 'bg-[#5B7BD0]',
    secretaria: 'bg-[#3BA67A]',
    docente: 'bg-[#D99A2B]',
};
/** Los roles nuevos toman uno de estos, siempre el mismo para el mismo rol. */
const OTROS = ['bg-[#8E6CC9]', 'bg-[#2E9AA6]', 'bg-[#C8607A]', 'bg-[#7A8F2E]', 'bg-[#B07A4A]', 'bg-[#4F6D9A]'];

export const puntoRol = (rol?: ConNombre | string | null) => {
    const nombre = typeof rol === 'string' ? rol : rol?.nombre;
    if (!nombre) return 'bg-[#AEB7CC]';
    return PUNTOS[nombre] ?? OTROS[[...nombre].reduce((s, c) => s + c.charCodeAt(0), 0) % OTROS.length];
};

/** "Hace 5 min", "Ayer"… para el último ingreso. */
export function haceCuanto(fecha: string | null) {
    if (!fecha) return 'Nunca';
    const d = new Date(fecha);
    const min = Math.floor((Date.now() - d.getTime()) / 60_000);
    if (min < 2) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    if (min < 60 * 24) return `Hace ${Math.floor(min / 60)} h`;
    const dias = Math.floor(min / (60 * 24));
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ');
}

/** Iniciales de un nombre "Nombre Apellido" (usuarios, no estudiantes). */
export const inicialesPersona = (nombre: string) =>
    nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
