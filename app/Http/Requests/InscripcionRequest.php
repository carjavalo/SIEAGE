<?php

namespace App\Http\Requests;

use App\Models\SolicitudInscripcion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InscripcionRequest extends FormRequest
{
    /**
     * El formulario es público: lo llena el acudiente sin iniciar sesión.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Los documentos y teléfonos llegan a veces con puntos, guiones o
     * espacios ("1.109.684.010", "318 718 4003"); se dejan solo los dígitos.
     */
    protected function prepareForValidation(): void
    {
        $numericos = ['numero_documento', 'telefono_1', 'telefono_2',
            'acudiente_numero_documento', 'acudiente_telefono_1', 'acudiente_telefono_2'];

        $limpios = [];
        foreach ($numericos as $campo) {
            if (is_string($this->input($campo))) {
                $limpios[$campo] = preg_replace('/\D/', '', $this->input($campo));
            }
        }

        $this->merge($limpios);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $nombre = ['string', 'max:40', 'regex:/^[\pL\s\'.-]+$/u'];
        $documento = ['required', 'digits_between:5,15'];
        $telefono = ['required', 'digits_between:7,10'];
        // El campo de fecha del navegador siempre envía AAAA-MM-DD; se exige ese formato.
        $fechaPasada = ['required', 'date_format:Y-m-d', 'before:today', 'after:1900-01-01'];

        return [
            // 1. Estudiante
            'primer_nombre' => ['required', ...$nombre],
            'segundo_nombre' => ['nullable', ...$nombre],
            'primer_apellido' => ['required', ...$nombre],
            'segundo_apellido' => ['nullable', ...$nombre],
            'sexo' => ['required', Rule::in(['F', 'M'])],
            'pais_nacimiento' => ['required', Rule::in(['Colombia', 'Otro'])],
            'pais_nacimiento_otro' => ['required_if:pais_nacimiento,Otro', 'nullable', 'string', 'max:60'],
            'ciudad_nacimiento' => ['required', 'string', 'max:80'],
            'fecha_nacimiento' => $fechaPasada,
            'tipo_documento' => ['required', Rule::in(['R.C.', 'T.I.', 'C.C.', 'C.E.', 'P.P.T.', 'Otro'])],
            'tipo_documento_otro' => ['required_if:tipo_documento,Otro', 'nullable', 'string', 'max:40'],
            'numero_documento' => [
                ...$documento,
                'different:acudiente_numero_documento',
                // Un doble clic, o un padre que vuelve a llenar el formulario,
                // no debe dejar dos solicitudes del mismo estudiante en revisión.
                Rule::unique('solicitudes_inscripcion', 'numero_documento')
                    ->where('estado', SolicitudInscripcion::PENDIENTE)
                    ->where('anio_lectivo_id', SolicitudInscripcion::anioLectivoActivoId()),
            ],
            'ciudad_expedicion' => ['required', 'string', 'max:80'],

            // 2. Grado y salud
            'grado_id' => ['required', 'integer', 'exists:grados,id'],
            'tipo_sangre' => ['required', Rule::in(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])],
            'sisben' => ['required', Rule::in(['ninguno', '1', '2', '3'])],
            'eps' => ['required', 'string', 'max:80'],
            'grupo_etnico' => ['required', Rule::in(['Mestizo', 'Caucásico', 'Indígena', 'Afrocolombiano', 'Otro'])],
            'grupo_etnico_otro' => ['required_if:grupo_etnico,Otro', 'nullable', 'string', 'max:60'],
            'discapacidad' => ['nullable', 'string', 'max:300'],

            // 3. Residencia y contacto
            'direccion' => ['required', 'string', 'max:150'],
            'barrio' => ['required', 'string', 'max:80'],
            'telefono_1' => $telefono,
            'telefono_2' => $telefono,
            'correo' => ['required', 'email', 'max:120'],

            // 4. Acudiente
            'acudiente_primer_nombre' => ['required', ...$nombre],
            'acudiente_segundo_nombre' => ['nullable', ...$nombre],
            'acudiente_primer_apellido' => ['required', ...$nombre],
            'acudiente_segundo_apellido' => ['nullable', ...$nombre],
            'acudiente_fecha_nacimiento' => $fechaPasada,
            'acudiente_numero_documento' => $documento,
            'acudiente_ciudad_expedicion' => ['required', 'string', 'max:80'],
            'acudiente_parentesco' => ['required', Rule::in(DB::table('parentescos')->pluck('nombre'))],
            'acudiente_parentesco_otro' => ['required_if:acudiente_parentesco,Otro', 'nullable', 'string', 'max:40'],
            'acudiente_telefono_1' => $telefono,
            'acudiente_telefono_2' => $telefono,
            'acudiente_correo' => ['nullable', 'email', 'max:120'],

            // 5. Revisión
            'autorizacion_datos' => ['accepted'],
        ];
    }

    /**
     * La app corre con APP_LOCALE=en y sin traducciones, así que los
     * mensajes van aquí, en el mismo tono del resto del formulario.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => 'Este campo es obligatorio.',
            'required_if' => 'Cuéntanos cuál.',
            'string' => 'Revisa este campo.',
            'max' => 'Es demasiado largo: máximo :max caracteres.',
            'regex' => 'Usa solo letras.',
            'in' => 'Elige una de las opciones.',
            'integer' => 'Elige una de las opciones.',
            'exists' => 'Elige una de las opciones.',
            'date' => 'Escribe una fecha válida.',
            'before' => 'La fecha debe ser anterior a hoy.',
            'after' => 'Revisa el año de la fecha.',
            'digits_between' => 'Debe tener entre :min y :max dígitos.',
            'email' => 'Escribe un correo válido, por ejemplo nombre@correo.com.',
            'different' => 'El documento del estudiante no puede ser el mismo del acudiente.',
            'accepted' => 'Necesitamos tu autorización para procesar la inscripción.',
            'date_format' => 'Escribe una fecha válida.',
            'numero_documento.unique' => 'Ya recibimos una inscripción con este documento y está en revisión. La secretaría se comunicará contigo.',
        ];
    }

    /**
     * Traduce lo que envía el formulario a las columnas de
     * solicitudes_inscripcion: resuelve las opciones "Otro", pasa el
     * parentesco de nombre a id y deja constancia de la autorización.
     *
     * @return array<string, mixed>
     */
    public function datosParaGuardar(): array
    {
        $d = $this->validated();

        // Texto escrito en "¿cuál?" cuando se eligió "Otro"; null en cualquier otro caso.
        $cual = fn (string $campo) => ($d[$campo] ?? null) === 'Otro' ? ($d["{$campo}_otro"] ?? null) : null;
        $minusculas = fn (?string $correo) => $correo === null ? null : Str::lower($correo);

        return [
            'anio_lectivo_id' => SolicitudInscripcion::anioLectivoActivoId(),

            'primer_nombre' => $d['primer_nombre'],
            'segundo_nombre' => $d['segundo_nombre'] ?? null,
            'primer_apellido' => $d['primer_apellido'],
            'segundo_apellido' => $d['segundo_apellido'] ?? null,
            'sexo' => $d['sexo'],
            'pais_nacimiento' => $cual('pais_nacimiento') ?? $d['pais_nacimiento'],
            'ciudad_nacimiento' => $d['ciudad_nacimiento'],
            'fecha_nacimiento' => $d['fecha_nacimiento'],
            'tipo_documento' => $d['tipo_documento'],
            'tipo_documento_otro' => $cual('tipo_documento'),
            'numero_documento' => $d['numero_documento'],
            'ciudad_expedicion' => $d['ciudad_expedicion'],

            'grado_id' => (int) $d['grado_id'],
            'tipo_sangre' => $d['tipo_sangre'],
            'sisben' => $d['sisben'],
            'eps' => $d['eps'],
            'grupo_etnico' => $cual('grupo_etnico') ?? $d['grupo_etnico'],
            'discapacidad' => $d['discapacidad'] ?? null,

            'direccion' => $d['direccion'],
            'barrio' => $d['barrio'],
            'telefono_1' => $d['telefono_1'],
            'telefono_2' => $d['telefono_2'],
            'correo' => $minusculas($d['correo']),

            'acudiente_primer_nombre' => $d['acudiente_primer_nombre'],
            'acudiente_segundo_nombre' => $d['acudiente_segundo_nombre'] ?? null,
            'acudiente_primer_apellido' => $d['acudiente_primer_apellido'],
            'acudiente_segundo_apellido' => $d['acudiente_segundo_apellido'] ?? null,
            'acudiente_fecha_nacimiento' => $d['acudiente_fecha_nacimiento'],
            'acudiente_numero_documento' => $d['acudiente_numero_documento'],
            'acudiente_ciudad_expedicion' => $d['acudiente_ciudad_expedicion'],
            'acudiente_parentesco_id' => DB::table('parentescos')->where('nombre', $d['acudiente_parentesco'])->value('id'),
            'acudiente_parentesco_otro' => $cual('acudiente_parentesco'),
            'acudiente_telefono_1' => $d['acudiente_telefono_1'],
            'acudiente_telefono_2' => $d['acudiente_telefono_2'],
            'acudiente_correo' => $minusculas($d['acudiente_correo'] ?? null),

            'autorizo_datos_en' => now(),
            'ip' => $this->ip(),
            'navegador' => $this->userAgent() ? Str::limit($this->userAgent(), 255, '') : null,
        ];
    }
}
