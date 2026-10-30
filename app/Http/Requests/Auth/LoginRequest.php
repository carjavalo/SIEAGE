<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /** Hash de una clave al azar que nadie conoce: ver authenticate(). */
    private const HASH_DE_RELLENO = '$2y$12$HxBGGi2IiabjjzAs2VhMEuBu3GLadD1bkl8AUuRvXuN8LDyb4dAJG';

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'usuario' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $credenciales = [...$this->only('usuario', 'password'), 'activo' => true];

        if (! Auth::attempt($credenciales, $this->boolean('remember'))) {
            // Sin usuario activo no se compara ninguna clave y la respuesta salía antes: por el
            // tiempo se podía averiguar qué usuarios existen. Así tarda lo mismo.
            if (! User::where('usuario', $this->string('usuario'))->where('activo', true)->exists()) {
                Hash::check($this->string('password'), self::HASH_DE_RELLENO);
            }

            foreach ($this->limites() as $llave => [, $segundos]) {
                RateLimiter::hit($llave, $segundos);
            }

            throw ValidationException::withMessages([
                'usuario' => 'Usuario o clave incorrectos.',
            ]);
        }

        // Quien acierta no borra el contador de su IP: si no, bastaría con entrar con
        // un usuario propio entre intento e intento para seguir probando sin límite.
        foreach (array_slice(array_keys($this->limites()), 0, 2) as $llave) {
            RateLimiter::clear($llave);
        }

        Auth::user()->forceFill(['ultimo_acceso' => now()])->save();
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        foreach ($this->limites() as $llave => [$intentos]) {
            if (RateLimiter::tooManyAttempts($llave, $intentos)) {
                event(new Lockout($this));

                throw ValidationException::withMessages([
                    'usuario' => 'Demasiados intentos. Espera '.ceil(RateLimiter::availableIn($llave) / 60).' min y vuelve a intentarlo.',
                ]);
            }
        }
    }

    /**
     * Los intentos fallidos que se aguantan: llave => [cuántos, en cuántos segundos].
     *
     * @return array<string, array{int, int}>
     */
    private function limites(): array
    {
        $usuario = Str::transliterate(Str::lower($this->string('usuario')));

        return [
            // Lo normal: alguien que no recuerda su clave.
            "login:{$usuario}|{$this->ip()}" => [5, 300],
            // Muchas claves contra un usuario desde muchas IP.
            "login-usuario:{$usuario}" => [20, 900],
            // Muchos usuarios desde una IP. Es alto porque la institución entera sale por la misma.
            "login-ip:{$this->ip()}" => [40, 300],
        ];
    }
}
