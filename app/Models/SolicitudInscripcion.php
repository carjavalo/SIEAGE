<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Inscripción enviada desde el formulario público, a la espera de que la
 * secretaría la revise. No es una matrícula: al aprobarla se crearán el
 * estudiante, el acudiente y la matrícula oficiales.
 */
class SolicitudInscripcion extends Model
{
    public const PENDIENTE = 'pendiente';

    public const APROBADA = 'aprobada';

    public const RECHAZADA = 'rechazada';

    protected $table = 'solicitudes_inscripcion';

    /**
     * `estado` queda fuera a propósito: el formulario es público y nadie debe
     * poder crear una solicitud que ya venga "aprobada".
     */
    protected $fillable = [
        'anio_lectivo_id',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'sexo',
        'pais_nacimiento',
        'ciudad_nacimiento',
        'fecha_nacimiento',
        'tipo_documento',
        'tipo_documento_otro',
        'numero_documento',
        'ciudad_expedicion',
        'grado_id',
        'tipo_sangre',
        'sisben',
        'eps',
        'grupo_etnico',
        'discapacidad',
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
        'acudiente_parentesco_id',
        'acudiente_parentesco_otro',
        'acudiente_telefono_1',
        'acudiente_telefono_2',
        'acudiente_correo',
        'autorizo_datos_en',
        'ip',
        'navegador',
    ];

    /**
     * El valor por defecto también vive aquí (no solo en la columna) para que
     * un modelo recién creado ya diga 'pendiente' sin volver a leerlo.
     */
    protected $attributes = [
        'estado' => self::PENDIENTE,
    ];

    protected function casts(): array
    {
        return [
            'anio_lectivo_id' => 'integer',
            'grado_id' => 'integer',
            'acudiente_parentesco_id' => 'integer',
            'fecha_nacimiento' => 'date',
            'acudiente_fecha_nacimiento' => 'date',
            'autorizo_datos_en' => 'datetime',
        ];
    }

    /** Id del año lectivo marcado como 'activo', o null si no hay ninguno. */
    public static function anioLectivoActivoId(): ?int
    {
        $id = DB::table('anios_lectivos')->where('estado', 'activo')->value('id');

        return $id === null ? null : (int) $id;
    }
}
