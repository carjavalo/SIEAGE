/** Tipos y colores del apartado de Sedes (SedeController). */

export type GrupoSede = {
    id: number;
    sede_id: number;
    codigo: string;
    numero: number;
    jornada: string;
    cupos: number;
    grado_id: number;
    grado_numero: number;
    grado: string;
    /** Estudiantes activos del grupo. */
    activos: number;
    /** Matrículas de cualquier estado: con alguna, el grupo no se puede eliminar. */
    matriculas: number;
};

export type SedeConGrupos = {
    id: number;
    codigo: string;
    nombre: string;
    direccion: string | null;
    es_principal: boolean;
    /** Activos en el año, tengan grupo o no. */
    estudiantes: number;
    sin_grupo: number;
    grupos: GrupoSede[];
    /** Sin grupos ni matrículas de ningún año. */
    se_puede_eliminar: boolean;
};

export type GradoSede = { id: number; numero: number; nombre: string };

/** Las cinco sedes con las que empezó el colegio tienen su color; las nuevas toman uno de reserva, siempre el mismo. */
const FIJOS: Record<string, string> = { P: '#1E3A7B', LF: '#5B7BD0', CP: '#23948C', RP: '#D08A1E', PT: '#C04E83' };
const RESERVA = ['#7A5AC8', '#3D8B5E', '#B5563A', '#3F8FA8', '#8A6D1F', '#9B4D96'];

export const colorDeSede = (codigo: string | null | undefined) => {
    const c = codigo ?? '';
    return FIJOS[c] ?? RESERVA[[...c].reduce((suma, letra) => suma + letra.charCodeAt(0), 0) % RESERVA.length];
};

/** «mañana», «mañana y tarde»… según las jornadas de sus grupos. */
export const jornadasDe = (grupos: GrupoSede[], orden: string[]) => {
    const presentes = orden.filter((j) => grupos.some((g) => g.jornada === j)).map((j) => j.toLowerCase());
    return presentes.length > 1 ? `${presentes.slice(0, -1).join(', ')} y ${presentes.at(-1)}` : (presentes[0] ?? null);
};
