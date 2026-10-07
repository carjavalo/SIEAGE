/** Lo que HandleInertiaRequests::share() manda en todas las páginas. */
export interface Auth {
    user: User;
    /** Lo que puede hacer: claves de App\Support\Permisos (ver lib/permisos). */
    permisos: string[];
    /** Para mostrar el menú "Usuarios" solo a quien puede usarlo. */
    puedeGestionarUsuarios: boolean;
    /** Promover al grado siguiente. */
    puedePromover: boolean;
    /** Deshabilitar o habilitar matrículas. */
    puedeDeshabilitar: boolean;
    /** Cambiar los cupos de los grupos. */
    puedeEditarCupos: boolean;
    /** Corregir los datos del estudiante y de sus acudientes. */
    puedeEditarDatos: boolean;
    /** Crear y cambiar sedes y grupos. */
    puedeGestionarSedes: boolean;
    /** Ve todas las sedes (administrador o "todas las sedes"); si no, solo las de `sedes`. */
    todasLasSedes: boolean;
    /** Las sedes asignadas, cuando no ve todas. */
    sedes: { id: number; codigo: string; nombre: string }[];
}

/** Cómo están los datos (App\Support\Pulso): dos firmas que cambian cuando alguien más toca algo. */
export interface Pulso {
    inscritos: string;
    datos: string;
    /** Quién está en línea (App\Support\Presencia); solo la usa la lista de usuarios. */
    presencia: string;
    pendientes: number;
    ultima_inscripcion: number;
}

export interface SharedData {
    auth: Auth;
    /** Aviso del menú "Inscritos" (0 sin sesión). */
    inscritosPendientes: number;
    /** Los datos tal como estaban al armar la página; null sin sesión. */
    pulso: Pulso | null;
    flash: { success: string | null };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    usuario: string;
    email: string | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
