<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'usuario',
        'email',
        'password',
        'rol_id',
        'todas_las_sedes',
        'activo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
            'todas_las_sedes' => 'boolean',
            'ultimo_acceso' => 'datetime',
            'ultima_actividad' => 'datetime',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class);
    }

    /** Administrador o super administrador: los dos pueden todo lo de la administración. */
    public function esAdministrador(): bool
    {
        return $this->activo && in_array($this->rol?->nombre, ['administrador', 'superadministrador'], true);
    }

    /** Lo saca de los equipos donde tenga una sesión abierta o recordada, menos de la sesión $salvo. */
    public function cerrarSesiones(?string $salvo = null): void
    {
        $this->forceFill(['remember_token' => null])->save();

        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $this->id)
                ->when($salvo, fn ($q) => $q->where('id', '!=', $salvo))
                ->delete();
        }
    }

    /** El equipo de SIEAGE: además de todo, es el único que maneja Roles y permisos. */
    public function esSuperAdministrador(): bool
    {
        return $this->activo && $this->rol?->nombre === 'superadministrador';
    }
}
