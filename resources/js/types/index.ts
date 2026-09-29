/** Lo que HandleInertiaRequests::share() manda en todas las páginas. */
export interface Auth {
    user: User;
    /** Para mostrar el menú "Usuarios" solo a quien puede usarlo. */
    puedeGestionarUsuarios: boolean;
}

export interface SharedData {
    auth: Auth;
    /** Aviso del menú "Inscritos" (0 sin sesión). */
    inscritosPendientes: number;
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
