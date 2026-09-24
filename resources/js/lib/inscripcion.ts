import { ClipboardCheck, HeartPulse, House, type LucideIcon, UserRound, Users } from 'lucide-react';

/**
 * Formulario público de inscripción: datos, pasos y validación del lado del
 * navegador. Las reglas replican las de App\Http\Requests\InscripcionRequest;
 * si cambias una, cambia la otra.
 */

export type DatosInscripcion = {
    // 1. Estudiante
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    sexo: string;
    pais_nacimiento: string;
    pais_nacimiento_otro: string;
    ciudad_nacimiento: string;
    fecha_nacimiento: string;
    tipo_documento: string;
    tipo_documento_otro: string;
    numero_documento: string;
    ciudad_expedicion: string;
    // 2. Grado y salud
    grado_id: string;
    tipo_sangre: string;
    sisben: string;
    eps: string;
    grupo_etnico: string;
    grupo_etnico_otro: string;
    discapacidad: string;
    // 3. Residencia y contacto
    direccion: string;
    barrio: string;
    telefono_1: string;
    telefono_2: string;
    correo: string;
    // 4. Acudiente
    acudiente_primer_nombre: string;
    acudiente_segundo_nombre: string;
    acudiente_primer_apellido: string;
    acudiente_segundo_apellido: string;
    acudiente_fecha_nacimiento: string;
    acudiente_numero_documento: string;
    acudiente_ciudad_expedicion: string;
    acudiente_parentesco: string;
    acudiente_parentesco_otro: string;
    acudiente_telefono_1: string;
    acudiente_telefono_2: string;
    acudiente_correo: string;
    // 5. Revisión
    autorizacion_datos: boolean;
    sitio_web: string; // campo trampa para bots, invisible para las personas
};

export type Campo = keyof DatosInscripcion;
export type Errores = Partial<Record<Campo, string>>;

export type Grado = { id: number; numero: number; nombre: string };

export const DATOS_VACIOS: DatosInscripcion = {
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    sexo: '',
    pais_nacimiento: 'Colombia',
    pais_nacimiento_otro: '',
    ciudad_nacimiento: '',
    fecha_nacimiento: '',
    tipo_documento: '',
    tipo_documento_otro: '',
    numero_documento: '',
    ciudad_expedicion: '',
    grado_id: '',
    tipo_sangre: '',
    sisben: '',
    eps: '',
    grupo_etnico: '',
    grupo_etnico_otro: '',
    discapacidad: '',
    direccion: '',
    barrio: '',
    telefono_1: '',
    telefono_2: '',
    correo: '',
    acudiente_primer_nombre: '',
    acudiente_segundo_nombre: '',
    acudiente_primer_apellido: '',
    acudiente_segundo_apellido: '',
    acudiente_fecha_nacimiento: '',
    acudiente_numero_documento: '',
    acudiente_ciudad_expedicion: '',
    acudiente_parentesco: '',
    acudiente_parentesco_otro: '',
    acudiente_telefono_1: '',
    acudiente_telefono_2: '',
    acudiente_correo: '',
    autorizacion_datos: false,
    sitio_web: '',
};

/** Al inscribir a un hermano se conservan el acudiente y el hogar. */
export const CAMPOS_COMPARTIDOS_ENTRE_HERMANOS: Campo[] = [
    'direccion',
    'barrio',
    'telefono_1',
    'telefono_2',
    'correo',
    'acudiente_primer_nombre',
    'acudiente_segundo_nombre',
    'acudiente_primer_apellido',
    'acudiente_segundo_apellido',
    'acudiente_fecha_nacimiento',
    'acudiente_numero_documento',
    'acudiente_ciudad_expedicion',
    'acudiente_parentesco',
    'acudiente_parentesco_otro',
    'acudiente_telefono_1',
    'acudiente_telefono_2',
    'acudiente_correo',
];

// ---------------------------------------------------------------- opciones --

export type Opcion = { valor: string; etiqueta: string };

export const SEXOS: Opcion[] = [
    { valor: 'F', etiqueta: 'Femenino' },
    { valor: 'M', etiqueta: 'Masculino' },
];

export const PAISES: Opcion[] = [
    { valor: 'Colombia', etiqueta: 'Colombia' },
    { valor: 'Otro', etiqueta: 'Otro país' },
];

export const TIPOS_DOCUMENTO: Opcion[] = [
    { valor: 'R.C.', etiqueta: 'Registro civil' },
    { valor: 'T.I.', etiqueta: 'Tarjeta de identidad' },
    { valor: 'C.C.', etiqueta: 'Cédula de ciudadanía' },
    { valor: 'C.E.', etiqueta: 'Cédula de extranjería' },
    { valor: 'P.P.T.', etiqueta: 'Permiso de protección' },
    { valor: 'Otro', etiqueta: 'Otro' },
];

export const TIPOS_SANGRE: Opcion[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((t) => ({ valor: t, etiqueta: t }));

export const NIVELES_SISBEN: Opcion[] = [
    { valor: 'ninguno', etiqueta: 'No tengo' },
    { valor: '1', etiqueta: 'Nivel 1' },
    { valor: '2', etiqueta: 'Nivel 2' },
    { valor: '3', etiqueta: 'Nivel 3' },
];

export const GRUPOS_ETNICOS: Opcion[] = ['Mestizo', 'Caucásico', 'Indígena', 'Afrocolombiano', 'Otro'].map((g) => ({ valor: g, etiqueta: g }));

/** El catálogo guarda "Tia(o)" sin tilde; aquí solo se corrige lo que se ve. */
export function etiquetaParentesco(nombre: string): string {
    return nombre.replace(/^Tia\(o\)$/, 'Tía(o)');
}

export function etiquetaDe(opciones: Opcion[], valor: string): string {
    return opciones.find((o) => o.valor === valor)?.etiqueta ?? valor;
}

// ------------------------------------------------------------------- pasos --

export type Paso = {
    corto: string;
    titulo: string;
    descripcion: string;
    icono: LucideIcon;
    campos: Campo[];
};

export const PASOS: Paso[] = [
    {
        corto: 'Estudiante',
        titulo: '¿A quién vas a inscribir?',
        descripcion: 'Escribe los datos tal como aparecen en su documento de identidad.',
        icono: UserRound,
        campos: [
            'primer_nombre',
            'segundo_nombre',
            'primer_apellido',
            'segundo_apellido',
            'sexo',
            'pais_nacimiento',
            'pais_nacimiento_otro',
            'ciudad_nacimiento',
            'fecha_nacimiento',
            'tipo_documento',
            'tipo_documento_otro',
            'numero_documento',
            'ciudad_expedicion',
        ],
    },
    {
        corto: 'Grado y salud',
        titulo: 'Grado y salud',
        descripcion: 'Nos ayuda a ubicar al estudiante y a atenderlo bien si algo pasa en el colegio.',
        icono: HeartPulse,
        campos: ['grado_id', 'tipo_sangre', 'sisben', 'eps', 'grupo_etnico', 'grupo_etnico_otro', 'discapacidad'],
    },
    {
        corto: 'Residencia y contacto',
        titulo: '¿Dónde vive el estudiante?',
        descripcion: 'Y cómo podemos comunicarnos con la familia.',
        icono: House,
        campos: ['direccion', 'barrio', 'telefono_1', 'telefono_2', 'correo'],
    },
    {
        corto: 'Acudiente',
        titulo: '¿Quién es el acudiente?',
        descripcion: 'Puede ser un familiar o una persona cercana. Será el contacto principal con el colegio.',
        icono: Users,
        campos: [
            'acudiente_primer_nombre',
            'acudiente_segundo_nombre',
            'acudiente_primer_apellido',
            'acudiente_segundo_apellido',
            'acudiente_fecha_nacimiento',
            'acudiente_numero_documento',
            'acudiente_ciudad_expedicion',
            'acudiente_parentesco',
            'acudiente_parentesco_otro',
            'acudiente_telefono_1',
            'acudiente_telefono_2',
            'acudiente_correo',
        ],
    },
    {
        corto: 'Revisión',
        titulo: 'Revisa antes de enviar',
        descripcion: 'Confirma que todo esté bien. Puedes volver a cualquier paso para corregir.',
        icono: ClipboardCheck,
        campos: ['autorizacion_datos'],
    },
];

/** Paso al que pertenece un campo; sirve para llevar al usuario al error. */
export function pasoDelCampo(campo: string): number {
    const i = PASOS.findIndex((p) => (p.campos as string[]).includes(campo));
    return i === -1 ? PASOS.length - 1 : i;
}

// -------------------------------------------------------------- validación --

const OBLIGATORIO = 'Este campo es obligatorio.';
// Letras (con sus tildes), espacios, apóstrofo, punto y guion, con al menos una letra.
const SOLO_LETRAS = /^(?=.*\p{L})[\p{L}\p{M}\s'.-]+$/u;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nombre(valor: string, obligatorio: boolean): string | undefined {
    // Igual que el servidor: el ’ del iPhone y el ´ cuentan como apóstrofo, y
    // una tilde pegada por separado (e + ◌́) se une a su letra.
    const v = valor.trim().normalize('NFC').replace(/[’‘´`]/g, "'");
    if (!v) return obligatorio ? OBLIGATORIO : undefined;
    if (!SOLO_LETRAS.test(v)) return 'Usa solo letras.';
    if (v.length > 40) return 'Es demasiado largo: máximo 40 caracteres.';
}

function texto(valor: string, max: number, obligatorio = true): string | undefined {
    const v = valor.trim();
    if (!v) return obligatorio ? OBLIGATORIO : undefined;
    if (v.length > max) return `Es demasiado largo: máximo ${max} caracteres.`;
}

function digitos(valor: string, min: number, max: number): string | undefined {
    if (!valor) return OBLIGATORIO;
    if (!/^\d+$/.test(valor) || valor.length < min || valor.length > max) return `Debe tener entre ${min} y ${max} dígitos.`;
}

function fechaPasada(valor: string): string | undefined {
    if (!valor) return OBLIGATORIO;
    const [a, m, d] = valor.split('-').map(Number);
    const fecha = new Date(a, m - 1, d);
    if (Number.isNaN(fecha.getTime()) || a < 1900) return 'Escribe una fecha válida.';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fecha >= hoy) return 'La fecha debe ser anterior a hoy.';
}

function correo(valor: string, obligatorio: boolean): string | undefined {
    const v = valor.trim();
    if (!v) return obligatorio ? OBLIGATORIO : undefined;
    if (!CORREO.test(v)) return 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    if (v.length > 120) return 'Es demasiado largo: máximo 120 caracteres.';
}

function elegido(valor: string): string | undefined {
    if (!valor) return 'Elige una de las opciones.';
}

/** El "¿cuál?" de una opción "Otro". Si la opción ya no es "Otro", no se valida. */
function cual(principal: string, otro: string, max: number): string | undefined {
    if (principal !== 'Otro') return;
    if (!otro.trim()) return 'Cuéntanos cuál.';
    if (otro.trim().length > max) return `Es demasiado largo: máximo ${max} caracteres.`;
}

export function validarPaso(paso: number, d: DatosInscripcion): Errores {
    const e: Errores = {};
    const poner = (campo: Campo, error: string | undefined) => {
        if (error) e[campo] = error;
    };

    if (paso === 0) {
        poner('primer_nombre', nombre(d.primer_nombre, true));
        poner('segundo_nombre', nombre(d.segundo_nombre, false));
        poner('primer_apellido', nombre(d.primer_apellido, true));
        poner('segundo_apellido', nombre(d.segundo_apellido, false));
        poner('sexo', elegido(d.sexo));
        poner('pais_nacimiento', elegido(d.pais_nacimiento));
        poner('pais_nacimiento_otro', cual(d.pais_nacimiento, d.pais_nacimiento_otro, 60));
        poner('ciudad_nacimiento', texto(d.ciudad_nacimiento, 80));
        poner('fecha_nacimiento', fechaPasada(d.fecha_nacimiento));
        poner('tipo_documento', elegido(d.tipo_documento));
        poner('tipo_documento_otro', cual(d.tipo_documento, d.tipo_documento_otro, 40));
        poner('numero_documento', digitos(d.numero_documento, 5, 15));
        poner('ciudad_expedicion', texto(d.ciudad_expedicion, 80));
    }

    if (paso === 1) {
        poner('grado_id', elegido(d.grado_id));
        poner('tipo_sangre', elegido(d.tipo_sangre));
        poner('sisben', elegido(d.sisben));
        poner('eps', texto(d.eps, 80));
        poner('grupo_etnico', elegido(d.grupo_etnico));
        poner('grupo_etnico_otro', cual(d.grupo_etnico, d.grupo_etnico_otro, 60));
        poner('discapacidad', texto(d.discapacidad, 300, false));
    }

    if (paso === 2) {
        poner('direccion', texto(d.direccion, 150));
        poner('barrio', texto(d.barrio, 80));
        poner('telefono_1', digitos(d.telefono_1, 7, 10));
        poner('telefono_2', digitos(d.telefono_2, 7, 10));
        poner('correo', correo(d.correo, true));
    }

    if (paso === 3) {
        poner('acudiente_primer_nombre', nombre(d.acudiente_primer_nombre, true));
        poner('acudiente_segundo_nombre', nombre(d.acudiente_segundo_nombre, false));
        poner('acudiente_primer_apellido', nombre(d.acudiente_primer_apellido, true));
        poner('acudiente_segundo_apellido', nombre(d.acudiente_segundo_apellido, false));
        poner('acudiente_fecha_nacimiento', fechaPasada(d.acudiente_fecha_nacimiento));
        poner('acudiente_numero_documento', digitos(d.acudiente_numero_documento, 5, 15));
        if (!e.acudiente_numero_documento && d.acudiente_numero_documento === d.numero_documento) {
            e.acudiente_numero_documento = 'Es el mismo documento del estudiante. Escribe el del acudiente.';
        }
        poner('acudiente_ciudad_expedicion', texto(d.acudiente_ciudad_expedicion, 80));
        poner('acudiente_parentesco', elegido(d.acudiente_parentesco));
        poner('acudiente_parentesco_otro', cual(d.acudiente_parentesco, d.acudiente_parentesco_otro, 40));
        poner('acudiente_telefono_1', digitos(d.acudiente_telefono_1, 7, 10));
        poner('acudiente_telefono_2', digitos(d.acudiente_telefono_2, 7, 10));
        poner('acudiente_correo', correo(d.acudiente_correo, false));
    }

    if (paso === 4 && !d.autorizacion_datos) {
        e.autorizacion_datos = 'Necesitamos tu autorización para procesar la inscripción.';
    }

    return e;
}

// ------------------------------------------------------------ presentación --

/** "2014-03-12" -> "12 de marzo de 2014", leída como fecha local (sin desfase de zona horaria). */
export function fechaLarga(valor: string): string {
    if (!valor) return '';
    const [a, m, d] = valor.split('-').map(Number);
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(a, m - 1, d));
}

export function nombreCompleto(...partes: string[]): string {
    return partes
        .map((p) => p.trim())
        .filter(Boolean)
        .join(' ');
}
