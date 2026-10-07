<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Un rol de usuario. `nombre` es la clave interna y no cambia (administrador,
 * coordinacion…); `etiqueta` es como se ve y se puede cambiar. Lo que puede
 * hacer cada rol está en rol_permiso (ver App\Support\Permisos).
 */
class Rol extends Model
{
    protected $table = 'roles';

    protected $fillable = [
        'nombre',
        'etiqueta',
        'descripcion',
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'rol_id');
    }

    /** El rol que tiene todo siempre y no se puede borrar. */
    public function esAdministrador(): bool
    {
        return $this->nombre === 'administrador';
    }
}
