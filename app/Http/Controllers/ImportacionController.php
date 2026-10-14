<?php

namespace App\Http\Controllers;

use App\Models\SolicitudInscripcion;
use App\Support\ImportarInscripciones;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportacionController extends Controller
{
    /**
     * Recibe el libro de Excel y lo deja en storage/app/private/importaciones. Si es
     * la descarga del formulario de inscripción del colegio (Google), además crea
     * las inscripciones pendientes del año lectivo activo (como el formulario de
     * SIEAGE) y devuelve el resumen.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'archivo' => ['required', 'file', 'mimes:xlsx,xls', 'max:20480'],
        ], [
            'archivo.required' => 'Selecciona un archivo de Excel.',
            'archivo.mimes' => 'El archivo debe ser .xlsx o .xls.',
            'archivo.max' => 'El archivo no puede superar los 20 MB.',
        ]);

        $archivo = $request->file('archivo');
        $original = $archivo->getClientOriginalName();
        $nombre = now()->format('Ymd-His').'-'.Str::slug(pathinfo($original, PATHINFO_FILENAME)).'.'.$archivo->getClientOriginalExtension();
        $guardado = $archivo->storeAs('importaciones', $nombre);

        $ruta = Storage::path($guardado);
        if (! ImportarInscripciones::reconoce($ruta)) {
            return back()->with('success', "Archivo «{$original}» recibido correctamente.");
        }

        $anioId = SolicitudInscripcion::anioLectivoActivoId() ?? abort(422, 'No hay un año lectivo activo.');
        $resumen = ImportarInscripciones::importar($ruta, $anioId, $original);

        return back()->with('importacion', [
            ...$resumen,
            'archivo' => $original,
            'anio' => DB::table('anios_lectivos')->where('id', $anioId)->value('anio'),
        ]);
    }
}
