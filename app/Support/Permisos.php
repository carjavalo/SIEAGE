<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Lo que se le puede permitir a cada rol desde Usuarios → Roles y permisos.
 * Cada clave es también una regla (Gate) con el mismo nombre: las rutas y las
 * pantallas preguntan por la clave, nunca por el nombre del rol. Qué claves
 * tiene cada rol se guarda en rol_permiso; el administrador las tiene todas
 * siempre, para que nunca se pierda el acceso.
 */
final class Permisos
{
    /** Por área, en el orden de la pantalla: clave => [nombre, para qué sirve]. */
    public const AREAS = [
        'Estudiantes' => [
            'ver-estudiantes' => ['Ver estudiantes', 'La lista de estudiantes, su ficha y su historial.'],
            'editar-estudiantes' => ['Corregir datos', 'Los datos del estudiante y de sus acudientes.'],
            'deshabilitar-matriculas' => ['Deshabilitar matrículas', 'Retirar una matrícula o volver a habilitarla.'],
            'promover-estudiantes' => ['Promover', 'Pasar estudiantes al grado siguiente.'],
            'constancias' => ['Constancias', 'Sacar constancias de estudio, una o varias.'],
        ],
        'Inscritos' => [
            'ver-inscritos' => ['Ver inscritos', 'Las inscripciones que llegan del formulario.'],
            'matricular' => ['Matricular', 'Revisar padres y documentos, elegir grupo y matricular.'],
        ],
        'Boletines' => [
            'escribir-boletines' => ['Escribir boletines', 'Escribir, copiar e imprimir los boletines de transición.'],
            'configurar-boletines' => ['Firmas y jornada', 'Quién firma el boletín y cómo sale la jornada.'],
        ],
        'Sedes y grupos' => [
            'todas-las-sedes' => ['Ver todas las sedes', 'Estudiantes, inscritos y grupos de todas las sedes. Apagado, cada persona ve solo las que tiene marcadas en Usuarios.'],
            'ver-sedes' => ['Ver sedes', 'Las sedes con sus grupos.'],
            'gestionar-sedes' => ['Crear y cambiar sedes y grupos', 'Agregar, editar y quitar sedes y grupos.'],
            'cambiar-cupos' => ['Cambiar cupos', 'Cuántos estudiantes caben en cada grupo.'],
        ],
        'Informes e importación' => [
            'informes' => ['Informe de matrícula', 'Ver el informe y descargarlo en Excel.'],
            'importar-datos' => ['Importar datos', 'Subir archivos de otros sistemas.'],
        ],
        'Administración' => [
            'gestionar-usuarios' => ['Usuarios', 'Crear y cambiar usuarios, sus claves y sus sedes.'],
            'gestionar-roles' => ['Roles y permisos', 'Crear roles y decidir qué puede hacer cada uno.'],
        ],
    ];

    /** Permisos que solo sirven junto con otro (para corregir datos hay que poder ver al estudiante). */
    public const REQUIERE = [
        'editar-estudiantes' => 'ver-estudiantes',
        'deshabilitar-matriculas' => 'ver-estudiantes',
        'promover-estudiantes' => 'ver-estudiantes',
        'constancias' => 'ver-estudiantes',
        'matricular' => 'ver-inscritos',
        'configurar-boletines' => 'escribir-boletines',
        'gestionar-sedes' => 'ver-sedes',
    ];

    /** La primera pantalla de cada permiso, en el orden en que se busca dónde empezar. */
    private const INICIO = [
        'ver-estudiantes' => '/estudiantes',
        'ver-inscritos' => '/inscritos',
        'escribir-boletines' => '/boletines',
        'ver-sedes' => '/sedes',
        'informes' => '/informes/matricula',
        'importar-datos' => '/dashboard',
        'gestionar-usuarios' => '/usuarios',
        'gestionar-roles' => '/usuarios/roles',
    ];

    /** @return list<string> */
    public static function claves(): array
    {
        return array_merge(...array_map('array_keys', array_values(self::AREAS)));
    }

    /**
     * Lo que puede hacer el usuario: el administrador, todo; inactivo o sin rol,
     * nada. Se lee una vez por petición.
     *
     * @return list<string>
     */
    public static function de(?User $user): array
    {
        if (! $user || ! $user->activo || ! $user->rol_id) {
            return [];
        }
        if ($user->esAdministrador()) {
            return self::claves();
        }

        $clave = "permisos.{$user->id}";
        $guardados = request()->attributes->get($clave);
        if ($guardados === null) {
            $guardados = DB::table('rol_permiso')->where('rol_id', $user->rol_id)->pluck('permiso')->all();
            request()->attributes->set($clave, $guardados);
        }

        return array_values(array_intersect(self::claves(), $guardados));
    }

    public static function tiene(?User $user, string $permiso): bool
    {
        return in_array($permiso, self::de($user), true);
    }

    /** Lo que se guarda para un rol: solo claves conocidas, cada una con la que necesita. */
    public static function completar(array $permisos): array
    {
        $permisos = array_intersect(self::claves(), $permisos);
        foreach (self::REQUIERE as $permiso => $base) {
            if (in_array($permiso, $permisos, true)) {
                $permisos[] = $base;
            }
        }

        return array_values(array_intersect(self::claves(), array_unique($permisos)));
    }

    /** Dónde empieza: la primera pantalla que puede abrir (al entrar, o en «/»). */
    public static function inicio(?User $user): string
    {
        foreach (self::INICIO as $permiso => $url) {
            if (self::tiene($user, $permiso)) {
                return $url;
            }
        }

        return '/settings/profile';
    }

    /** Olvida lo leído en esta petición (después de cambiar los permisos de un rol). */
    public static function olvidar(): void
    {
        foreach (array_keys(request()->attributes->all()) as $clave) {
            if (str_starts_with($clave, 'permisos.')) {
                request()->attributes->remove($clave);
            }
        }
    }
}
