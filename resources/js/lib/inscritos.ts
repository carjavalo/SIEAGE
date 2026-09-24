/** Tipos y utilidades de la sección Inscritos (InscritoController). */

type Nombres = { primer_nombre: string; segundo_nombre: string | null; primer_apellido: string; segundo_apellido: string | null };

/** Como en el Excel: apellidos y luego nombres. */
/** Primer apellido + primer nombre (el segundo apellido puede faltar). */
export const inicialesInscrito = (i: Nombres) => `${i.primer_apellido[0] ?? ''}${i.primer_nombre[0] ?? ''}`.toUpperCase();

export const nombreInscrito = (i: Nombres) => [i.primer_apellido, i.segundo_apellido, i.primer_nombre, i.segundo_nombre].filter(Boolean).join(' ');

export function hace(fecha: string) {
    const d = new Date(fecha.replace(' ', 'T'));
    const dias = Math.floor((Date.now() - d.getTime()) / 86_400_000);
    if (dias <= 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    // Corta ("15 sept"), para que quepa en la lista; el año solo si no es el actual.
    return d
        .toLocaleDateString('es-CO', { day: 'numeric', month: 'short', ...(d.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }) })
        .replace(/\./g, '')
        .replace(/ de /g, ' ');
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

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';
export type Rol = 'madre' | 'padre';

/** Una fila de la lista (InscritoController::index). */
export type InscritoFila = Nombres & {
    id: number;
    estado: EstadoSolicitud;
    created_at: string;
    tipo_documento: string;
    numero_documento: string;
    grado_id: number;
    grado_numero: number;
    grado: string;
    acudiente_primer_nombre: string;
    acudiente_primer_apellido: string;
    parentesco: string;
    acudiente_telefono_1: string;
    padres: Rol[];
    /** El grupo en que quedó, si ya se matriculó. */
    grupo_asignado: string | null;
};

/** Lo que llenó la familia en el formulario (InscritoController::ficha). */
export type Solicitud = Nombres & {
    id: number;
    estado: EstadoSolicitud;
    enviada: string;
    grado_id: number;
    grado: string;
    sexo: 'F' | 'M';
    fecha_nacimiento: string;
    pais_nacimiento: string;
    ciudad_nacimiento: string;
    tipo_documento: string;
    tipo_documento_otro: string | null;
    numero_documento: string;
    ciudad_expedicion: string;
    tipo_sangre: string;
    sisben: string;
    eps: string;
    grupo_etnico: string;
    discapacidad: string | null;
    direccion: string;
    barrio: string;
    telefono_1: string;
    telefono_2: string;
    correo: string;
    acudiente_primer_nombre: string;
    acudiente_segundo_nombre: string | null;
    acudiente_primer_apellido: string;
    acudiente_segundo_apellido: string | null;
    acudiente_fecha_nacimiento: string;
    acudiente_numero_documento: string;
    acudiente_ciudad_expedicion: string;
    acudiente_parentesco: string;
    acudiente_parentesco_otro: string | null;
    acudiente_telefono_1: string;
    acudiente_telefono_2: string;
    acudiente_correo: string | null;
};

export type PadreGuardado = { [K in keyof DatosPadre]: DatosPadre[K] | null };

/** Dónde quedó matriculado, cuando ya se aprobó. */
export type MatriculaInscrito = { estudiante_id: number; grado_id: number; grupo: string | null; anio: number };

export type FichaInscrito = { solicitud: Solicitud; padres: Partial<Record<Rol, PadreGuardado>>; matricula: MatriculaInscrito | null };

/** Ya se sabe algo de los dos (datos, fallecido o no registra): se puede matricular. */
export const padresListos = (padres: FichaInscrito['padres']) => !!padres.madre && !!padres.padre;

/** La ficha del estudiante en su grupo, en la página de Estudiantes. */
export const enlaceEstudiante = (m: MatriculaInscrito) => `/estudiantes?anio=${m.anio}&grado=${m.grado_id}&ver=${m.estudiante_id}`;

/** "Madre", o lo que escribió la familia si eligió "Otro". */
export const parentescoAcudiente = (s: Pick<Solicitud, 'acudiente_parentesco' | 'acudiente_parentesco_otro'>) =>
    s.acudiente_parentesco === 'Otro' ? (s.acudiente_parentesco_otro ?? 'Otro familiar') : s.acudiente_parentesco;

export const nombreAcudiente = (s: Solicitud) =>
    [s.acudiente_primer_nombre, s.acudiente_segundo_nombre, s.acudiente_primer_apellido, s.acudiente_segundo_apellido].filter(Boolean).join(' ');

export const nombrePadre = (p: PadreGuardado) => [p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido].filter(Boolean).join(' ');
