<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Madre o padre de un inscrito o de un estudiante (ver migración create_padres_table). */
class Padre extends Model
{
    protected $table = 'padres';

    public const CAMPOS = [
        'situacion', 'es_acudiente',
        'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
        'tipo_documento', 'numero_documento', 'fecha_nacimiento', 'telefono', 'correo', 'ocupacion',
    ];

    protected $fillable = ['solicitud_inscripcion_id', 'estudiante_id', 'parentesco', 'registrado_por', ...self::CAMPOS];

    protected function casts(): array
    {
        return [
            'es_acudiente' => 'boolean',
            'fecha_nacimiento' => 'date:Y-m-d',
        ];
    }
}
