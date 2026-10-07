import { type SharedData } from '@/types';

/** Lo que se le puede permitir a un rol (las claves de App\Support\Permisos). */
export type Permiso =
    | 'ver-estudiantes'
    | 'editar-estudiantes'
    | 'deshabilitar-matriculas'
    | 'promover-estudiantes'
    | 'constancias'
    | 'ver-inscritos'
    | 'matricular'
    | 'escribir-boletines'
    | 'configurar-boletines'
    | 'todas-las-sedes'
    | 'ver-sedes'
    | 'gestionar-sedes'
    | 'cambiar-cupos'
    | 'informes'
    | 'importar-datos'
    | 'gestionar-usuarios'
    | 'gestionar-roles';

/** Si quien está usando SIEAGE tiene ese permiso (el servidor lo vuelve a revisar siempre). */
export const puede = (auth: SharedData['auth'], permiso: Permiso) => auth.permisos?.includes(permiso) ?? false;
