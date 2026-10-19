<?php

namespace App\Http\Controllers;

use App\Models\SolicitudInscripcion;
use App\Support\ImportarInscripciones;
use App\Support\ImportarLibroMatricula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Importar datos, con tres formatos (una pestaña cada uno en la pantalla):
 *  - matricula:  el libro de matrícula de una sede (una hoja por grupo).
 *  - formulario: las respuestas del formulario de inscripción de Google.
 *  - ciclos:     el libro de los ciclos sabatinos (una hoja por ciclo).
 * El archivo queda guardado en storage/app/private/importaciones y se carga; si no
 * es del formato de la pestaña elegida, no se carga nada y se avisa.
 */
class ImportacionController extends Controller
{
    public const TIPOS = ['matricula', 'formulario', 'ciclos'];

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'archivo' => ['required', 'file', 'mimes:xlsx,xls', 'max:20480'],
            'tipo' => ['required', Rule::in(self::TIPOS)],
        ], [
            'archivo.required' => 'Selecciona un archivo de Excel.',
            'archivo.mimes' => 'El archivo debe ser .xlsx o .xls.',
            'archivo.max' => 'El archivo no puede superar los 20 MB.',
            'tipo.*' => 'Elige qué formato vas a importar.',
        ]);

        $archivo = $request->file('archivo');
        $original = $archivo->getClientOriginalName();
        $nombre = now()->format('Ymd-His').'-'.$datos['tipo'].'-'.Str::slug(pathinfo($original, PATHINFO_FILENAME)).'.'.$archivo->getClientOriginalExtension();
        $ruta = Storage::path($archivo->storeAs('importaciones', $nombre));

        if ($datos['tipo'] === 'formulario') {
            if (! ImportarInscripciones::reconoce($ruta)) {
                throw ValidationException::withMessages(['archivo' => 'Este archivo no es la descarga del formulario de inscripción (faltan columnas como «Primer Nombre» o «Grado al que ingresará»).']);
            }
            $anioId = SolicitudInscripcion::anioLectivoActivoId() ?? abort(422, 'No hay un año lectivo activo.');

            return back()->with('importacion', [
                ...ImportarInscripciones::importar($ruta, $anioId, $original),
                'tipo' => 'formulario',
                'archivo' => $original,
                'anio' => DB::table('anios_lectivos')->where('id', $anioId)->value('anio'),
            ]);
        }

        if (! ImportarLibroMatricula::reconoce($ruta)) {
            throw ValidationException::withMessages(['archivo' => $datos['tipo'] === 'ciclos'
                ? 'Este archivo no tiene el formato del libro de ciclos (hojas «CICLO III 2026»… con «APELLIDOS Y NOMBRES», «NUMERO», «GRUPO 2026»).'
                : 'Este archivo no tiene el formato del libro de matrícula (una hoja por grupo con «APELLIDOS Y NOMBRES», «NUMERO», «GRUPO 2026»).']);
        }

        return back()->with('importacion', [
            ...ImportarLibroMatricula::importar($ruta, $datos['tipo'] === 'ciclos'),
            'tipo' => $datos['tipo'],
            'archivo' => $original,
        ]);
    }
}
