/** Roles de los usuarios de SIEAGE (tabla roles). */

export type Rol = { id: number; nombre: string; descripcion: string | null };

const NOMBRES: Record<string, string> = {
    administrador: 'Administrador',
    coordinacion: 'Coordinación',
    secretaria: 'Secretaría',
    docente: 'Docente',
};

export const nombreRol = (nombre?: string | null) => (nombre ? (NOMBRES[nombre] ?? nombre) : 'Sin rol');

/** Punto de color de cada rol, como las sedes: sin pastillas rellenas. */
const PUNTOS: Record<string, string> = {
    administrador: 'bg-[#1E3A7B]',
    coordinacion: 'bg-[#5B7BD0]',
    secretaria: 'bg-[#3BA67A]',
    docente: 'bg-[#D99A2B]',
};

export const puntoRol = (nombre?: string | null) => PUNTOS[nombre ?? ''] ?? 'bg-[#AEB7CC]';

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
