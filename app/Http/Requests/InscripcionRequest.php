<?php

namespace App\Http\Requests;

use App\Models\SolicitudInscripcion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Normalizer;

class InscripcionRequest extends FormRequest
{
    /**
     * El formulario es público: lo llena el acudiente sin iniciar sesión.
     */
    public function authorize(): bool
    {
        return true;
    }

    private const NUMERICOS = [
        'numero_documento', 'telefono_1', 'telefono_2',
        'acudiente_numero_documento', 'acudiente_telefono_1', 'acudiente_telefono_2',
    ];

    private const NOMBRES = [
        'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
        'acudiente_primer_nombre', 'acudiente_segundo_nombre', 'acudiente_primer_apellido', 'acudiente_segundo_apellido',
    ];

    /**
     * Deja los datos en la forma en que se validan y se guardan, para que la
     * validación mida exactamente lo mismo que llegará a la base.
     */
    protected function prepareForValidation(): void
    {
        $limpios = [];

        // Documentos y teléfonos llegan con puntos, guiones o espacios
        // ("1.109.684.010", "318 718 4003"): se dejan solo los dígitos.
        foreach (self::NUMERICOS as $campo) {
            if (is_string($valor = $this->input($campo))) {
                $limpios[$campo] = preg_replace('/\D/', '', $valor);
            }
        }

        // El iPhone cambia ' por ’, hay teclados que escriben ´, y un nombre
        // pegado puede traer la tilde separada de su letra (e + ◌́). Sin esto,
        // "D’Costa" o un "José" pegado se rechazaban con "Usa solo letras".
        foreach (self::NOMBRES as $campo) {
            if (is_string($valor = $this->input($campo))) {
                $valor = Normalizer::normalize($valor, Normalizer::FORM_C) ?: $valor;
                $limpios[$campo] = str_replace(['’', '‘', '´', '`'], "'", $valor);
            }
        }

        // Minúsculas ANTES de validar el largo: hacerlo después podía alargar
        // el correo (la "İ" turca pasa a dos caracteres) y la base lo rechazaba.
        foreach (['correo', 'acudiente_correo'] as $campo) {
            if (is_string($valor = $this->input($campo))) {
                $limpios[$campo] = Str::lower($valor);
            }
        }

        $this->merge($limpios);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Letras (con sus tildes), espacios, apóstrofo, punto y guion, y al
        // menos una letra: "." o "-" solos no son un nombre.
        $nombre = ['string', 'max:40', 'regex:/^(?=.*\pL)[\pL\pM\s\'.-]+$/u'];

        // El "¿cuál?" de una opción "Otro" solo cuenta si la opción sigue siendo
        // "Otro". Si el padre escribió y luego cambió de opción, el texto queda
        // oculto en el formulario: no debe validarse (daba un error invisible).
        $cual = fn (string $opcion, int $max) => ["exclude_unless:{$opcion},Otro", 'required', 'string', "max:{$max}"];
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
            'pais_nacimiento_otro' => $cual('pais_nacimiento', 60),
            'ciudad_nacimiento' => ['required', 'string', 'max:80'],
            'fecha_nacimiento' => $fechaPasada,
            'tipo_documento' => ['required', Rule::in(['R.C.', 'T.I.', 'C.C.', 'C.E.', 'P.P.T.', 'Otro'])],
            'tipo_documento_otro' => $cual('tipo_documento', 40),
            // Sin regla de "ya hay una solicitud con este documento": el
            // formulario es público y ese aviso le diría a cualquiera que sepa
            // el documento de un niño si se está inscribiendo, y le permitiría
            // bloquear a la familia real enviando primero. Se guardan todas; la
            // secretaría ve los envíos del mismo documento agrupados al revisar.
            'numero_documento' => [...$documento, 'different:acudiente_numero_documento'],
            'ciudad_expedicion' => ['required', 'string', 'max:80'],

            // 2. Grado y salud
            'grado_id' => ['required', 'integer', 'exists:grados,id'],
            'tipo_sangre' => ['required', Rule::in(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])],
            // 'string' obligatorio: si llegara el número 2 en vez del texto '2',
            // MariaDB lo tomaría como posición del ENUM y guardaría '1' sin avisar.
            'sisben' => ['required', 'string', Rule::in(['ninguno', '1', '2', '3'])],
            'eps' => ['required', 'string', 'max:80'],
            'grupo_etnico' => ['required', Rule::in(['Mestizo', 'Caucásico', 'Indígena', 'Afrocolombiano', 'Otro'])],
            'grupo_etnico_otro' => $cual('grupo_etnico', 60),
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
            'acudiente_parentesco_otro' => $cual('acudiente_parentesco', 40),
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
            'sisben' => (string) $d['sisben'],
            'eps' => $d['eps'],
            'grupo_etnico' => $cual('grupo_etnico') ?? $d['grupo_etnico'],
            'discapacidad' => $d['discapacidad'] ?? null,

            'direccion' => $d['direccion'],
            'barrio' => $d['barrio'],
            'telefono_1' => $d['telefono_1'],
            'telefono_2' => $d['telefono_2'],
            'correo' => $d['correo'], // ya viene en minúsculas (prepareForValidation)

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
            'acudiente_correo' => $d['acudiente_correo'] ?? null,

            'autorizo_datos_en' => now(),
            'ip' => $this->ip(),
            'navegador' => $this->userAgent() ? Str::limit($this->userAgent(), 255, '') : null,
        ];
    }
}
