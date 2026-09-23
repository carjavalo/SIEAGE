<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ImportacionController extends Controller
{
    /**
     * Recibe el libro de Excel y lo deja en storage/app/private/importaciones
     * a la espera de ser procesado.
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
        $nombre = now()->format('Ymd-His').'-'.Str::slug(pathinfo($archivo->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$archivo->getClientOriginalExtension();

        $archivo->storeAs('importaciones', $nombre);

        return back()->with('success', "Archivo «{$archivo->getClientOriginalName()}» recibido correctamente.");
    }
}
