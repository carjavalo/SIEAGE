/** Tipos y utilidades de la sección Inscritos (InscritoController). */

type Nombres = { primer_nombre: string; segundo_nombre: string | null; primer_apellido: string; segundo_apellido: string | null };

/** Como en el Excel: apellidos y luego nombres. */
export const nombreInscrito = (i: Nombres) => [i.primer_apellido, i.segundo_apellido, i.primer_nombre, i.segundo_nombre].filter(Boolean).join(' ');

export function hace(fecha: string) {
    const d = new Date(fecha.replace(' ', 'T'));
    const dias = Math.floor((Date.now() - d.getTime()) / 86_400_000);
    if (dias <= 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export type Situacion = 'registrado' | 'fallecido' | 'desconocido';

export type DatosPadre = {
    situacion: Situacion;
    es_acudiente: boolean;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    tipo_documento: string;
    numero_documento: string;
    fecha_nacimiento: string;
    telefono: string;
    correo: string;
    ocupacion: string;
};

export const PADRE_VACIO: DatosPadre = {
    situacion: 'registrado',
    es_acudiente: false,
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    tipo_documento: '',
    numero_documento: '',
    fecha_nacimiento: '',
    telefono: '',
    correo: '',
    ocupacion: '',
};
