<?php

namespace App\Http\Controllers;

use App\Http\Requests\InscripcionRequest;
use App\Models\SolicitudInscripcion;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionController extends Controller
{
    /**
     * Formulario público de inscripción. Los catálogos salen de la base para
     * que el acudiente elija entre valores válidos en vez de escribirlos.
     */
    public function create(): Response
    {
        $anio = DB::table('anios_lectivos')->where('estado', 'activo')->value('anio') ?? (int) date('Y');

        return Inertia::render('inscripcion/create', [
            'anioLectivo' => $anio,
            'grados' => DB::table('grados')->orderBy('numero')->get(['id', 'numero', 'nombre']),
            'parentescos' => DB::table('parentescos')->orderBy('id')->pluck('nombre'),
            'barrios' => DB::table('barrios')->orderBy('nombre')->pluck('nombre'),
            // Hora en que se abrió el formulario, cifrada: ver esRobot().
            'sello' => Crypt::encryptString((string) now()->getTimestamp()),
        ])->withViewData(['meta' => [
            // Lo que se ve al compartir el enlace (WhatsApp, correo) y en un buscador.
            'titulo' => "Inscripciones {$anio} · I.E. Alfonso López Pumarejo",
            'descripcion' => 'Inscribe a tu hijo o hija en la I.E. Alfonso López Pumarejo (Cali). Son cinco pasos: datos del estudiante, grado, residencia, acudiente y revisión.',
            'indexar' => true,
        ]]);
    }

    /**
     * Guarda la inscripción como solicitud pendiente. No toca las tablas
     * oficiales: el estudiante, el acudiente y la matrícula se crean cuando
     * la secretaría la apruebe.
     */
    public function store(InscripcionRequest $request): RedirectResponse
    {
        // Al robot se le responde igual que a un envío correcto para no darle
        // pistas, pero no se guarda nada. Queda anotado (sin los datos).
        if ($this->esRobot($request)) {
            Log::warning('Inscripción descartada: la envió un robot', ['ip' => $request->ip(), 'navegador' => $request->userAgent()]);

            return back();
        }

        SolicitudInscripcion::create($request->datosParaGuardar());

        return back();
    }

    /**
     * Un robot envía segundos después de abrir la página; una familia tarda
     * minutos en llenar los cuatro pasos. El sello es la hora de apertura
     * cifrada por el servidor, así que no se puede inventar.
     *
     * Antes había un campo invisible que "solo llenaban los robots", pero el
     * autocompletado de Chrome también lo llenaba y se perdían inscripciones
     * reales mostrando "enviada". Por eso, ante la duda, se guarda: sin sello
     * (una pestaña abierta antes de este cambio) la inscripción sí se guarda.
     */
    private function esRobot(Request $request): bool
    {
        $sello = $request->input('sello');
        if (! is_string($sello) || $sello === '') {
            return false;
        }

        try {
            $abierto = (int) Crypt::decryptString($sello);
        } catch (DecryptException) {
            return true; // alterado: solo lo haría un robot
        }

        return now()->getTimestamp() - $abierto < 3;
    }
}
