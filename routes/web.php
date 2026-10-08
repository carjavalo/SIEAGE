<?php

use App\Http\Controllers\AyudaController;
use App\Http\Controllers\BoletinController;
use App\Http\Controllers\ConstanciaController;
use App\Http\Controllers\DatosEstudianteController;
use App\Http\Controllers\DeshabilitacionController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\GrupoController;
use App\Http\Controllers\ImportacionController;
use App\Http\Controllers\InformeController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\InscritoController;
use App\Http\Controllers\PromocionController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\SedeController;
use App\Http\Controllers\UsuarioController;
use App\Support\Permisos;
use App\Support\Pulso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// La página principal: la primera que puede abrir según su rol (sin sesión, el login).
Route::get('/', fn (Request $request) => redirect($request->user() ? Permisos::inicio($request->user()) : route('login')))->name('home');

// Formulario público: lo llena el acudiente sin iniciar sesión.
Route::get('inscripcion', [InscripcionController::class, 'create'])->name('inscripcion.create');
Route::post('inscripcion', [InscripcionController::class, 'store'])
    // 30/min por IP: en una jornada de inscripción en la sala de sistemas todos
    // los equipos salen por la misma IP; 6/min bloqueaba familias legítimas.
    ->middleware('throttle:30,1')
    ->name('inscripcion.store');

// El video «Cómo inscribir a un estudiante» del login. Sin sesión ni cookies: el navegador lo pide por trozos.
Route::get('ayuda/inscripcion.mp4', [AyudaController::class, 'inscripcion'])->withoutMiddleware('web')->name('ayuda.inscripcion');

// Con sesión. Cada grupo pide su permiso (ver App\Support\Permisos); qué permisos
// tiene cada rol se decide en Usuarios → Roles y permisos.
Route::middleware(['auth'])->group(function () {
    // El tutorial del panel (el «?» del encabezado), por trozos como el de inscripción.
    Route::get('ayuda/operador.mp4', [AyudaController::class, 'operador'])->name('ayuda.operador');

    // El navegador lo consulta cada pocos segundos para enterarse de lo que cambió (ver App\Support\Pulso).
    Route::get('pulso', fn () => response()->json(Pulso::firma())->header('Cache-Control', 'no-store'))->name('pulso');

    Route::middleware('can:importar-datos')->group(function () {
        Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');
        Route::post('importaciones', [ImportacionController::class, 'store'])->name('importaciones.store');
    });

    Route::middleware('can:ver-estudiantes')->group(function () {
        Route::get('estudiantes', [EstudianteController::class, 'index'])->name('estudiantes.index');
        Route::get('estudiantes/{estudiante}', [EstudianteController::class, 'show'])->whereNumber('estudiante')->name('estudiantes.show');
    });

    // Constancias de matrícula para imprimir: la de un estudiante o las de un grupo, grado, sede o todo el colegio.
    Route::middleware('can:constancias')->group(function () {
        Route::get('estudiantes/{estudiante}/constancia', [ConstanciaController::class, 'estudiante'])->whereNumber('estudiante')->name('constancias.estudiante');
        Route::get('constancias', [ConstanciaController::class, 'lote'])->name('constancias.lote');
    });

    // Boletines de transición: escribir el texto de cada estudiante e imprimirlos.
    Route::middleware('can:escribir-boletines')->group(function () {
        Route::get('boletines', [BoletinController::class, 'index'])->name('boletines.index');
        Route::get('boletines/imprimir', [BoletinController::class, 'imprimir'])->name('boletines.imprimir');
        Route::post('boletines/copiar', [BoletinController::class, 'copiar'])->name('boletines.copiar');
        Route::put('boletines/{matricula}/{periodo}', [BoletinController::class, 'guardar'])->whereNumber(['matricula', 'periodo'])->name('boletines.guardar');
        // Quién firma y la jornada del grupo; crear ahí mismo a alguien que firme es crear un usuario.
        Route::put('boletines/grupos/{grupo}', [BoletinController::class, 'configurar'])->whereNumber('grupo')->middleware('can:configurar-boletines')->name('boletines.grupo');
        Route::post('boletines/grupos/{grupo}/firmantes', [BoletinController::class, 'crearFirmante'])->whereNumber('grupo')->middleware(['can:configurar-boletines', 'can:gestionar-usuarios'])->name('boletines.firmantes');
    });

    // Informe de matrícula del año (vista previa para guardar como PDF).
    Route::middleware('can:informes')->group(function () {
        Route::get('informes/matricula', [InformeController::class, 'matricula'])->name('informes.matricula');
        Route::get('informes/matricula/excel', [InformeController::class, 'excel'])->name('informes.matricula.excel');
    });

    Route::middleware('can:ver-inscritos')->group(function () {
        Route::get('inscritos', [InscritoController::class, 'index'])->name('inscritos.index');
        Route::get('inscritos/{solicitud}', [InscritoController::class, 'show'])->whereNumber('solicitud')->name('inscritos.show');
    });
    Route::middleware('can:matricular')->group(function () {
        Route::put('inscritos/{solicitud}/padres', [InscritoController::class, 'guardarPadres'])->whereNumber('solicitud')->name('inscritos.padres');
        Route::get('inscritos/{solicitud}/documentos', [InscritoController::class, 'documentos'])->whereNumber('solicitud')->name('inscritos.documentos');
        Route::put('inscritos/{solicitud}/documentos', [InscritoController::class, 'guardarDocumentos'])->whereNumber('solicitud')->name('inscritos.documentos.guardar');
        Route::get('inscritos/{solicitud}/grupo', [InscritoController::class, 'grupo'])->whereNumber('solicitud')->name('inscritos.grupo');
        Route::post('inscritos/{solicitud}/matricular', [InscritoController::class, 'matricular'])->whereNumber('solicitud')->name('inscritos.matricular');
    });

    // Sedes y sus grupos: verlas, y crearlas y cambiarlas.
    Route::get('sedes', [SedeController::class, 'index'])->middleware('can:ver-sedes')->name('sedes.index');
    Route::middleware('can:gestionar-sedes')->group(function () {
        Route::post('sedes', [SedeController::class, 'store'])->name('sedes.store');
        Route::put('sedes/{sede}', [SedeController::class, 'update'])->whereNumber('sede')->name('sedes.update');
        Route::delete('sedes/{sede}', [SedeController::class, 'destroy'])->whereNumber('sede')->name('sedes.destroy');
        Route::post('sedes/{sede}/grupos', [GrupoController::class, 'store'])->whereNumber('sede')->name('sedes.grupos.store');
        Route::put('grupos/{grupo}', [GrupoController::class, 'update'])->whereNumber('grupo')->name('grupos.update');
        Route::delete('grupos/{grupo}', [GrupoController::class, 'destroy'])->whereNumber('grupo')->name('grupos.destroy');
    });
    Route::put('grupos/cupos', [GrupoController::class, 'cupos'])->middleware('can:cambiar-cupos')->name('grupos.cupos');

    Route::middleware('can:deshabilitar-matriculas')->group(function () {
        Route::post('estudiantes/{estudiante}/deshabilitar', [DeshabilitacionController::class, 'deshabilitar'])->whereNumber('estudiante')->name('estudiantes.deshabilitar');
        Route::post('estudiantes/{estudiante}/habilitar', [DeshabilitacionController::class, 'habilitar'])->whereNumber('estudiante')->name('estudiantes.habilitar');
    });

    // Corregir los datos del estudiante y de sus acudientes desde la ficha.
    Route::middleware('can:editar-estudiantes')->group(function () {
        Route::put('estudiantes/{estudiante}', [DatosEstudianteController::class, 'estudiante'])->whereNumber('estudiante')->name('estudiantes.actualizar');
        // Los documentos de matrícula que faltaban, marcados desde la ficha.
        Route::put('estudiantes/{estudiante}/documentos', [DatosEstudianteController::class, 'documentos'])->whereNumber('estudiante')->name('estudiantes.documentos');
        // POST y no GET: el documento no debe quedar en la dirección ni en los registros del servidor.
        Route::post('acudientes/buscar', [DatosEstudianteController::class, 'buscarAcudiente'])->name('acudientes.buscar');
        Route::post('estudiantes/{estudiante}/acudientes', [DatosEstudianteController::class, 'agregarAcudiente'])->whereNumber('estudiante')->name('estudiantes.acudientes.agregar');
        Route::put('estudiantes/{estudiante}/acudientes/{acudiente}', [DatosEstudianteController::class, 'acudiente'])->whereNumber(['estudiante', 'acudiente'])->name('estudiantes.acudientes.actualizar');
        Route::delete('estudiantes/{estudiante}/acudientes/{acudiente}', [DatosEstudianteController::class, 'quitarAcudiente'])->whereNumber(['estudiante', 'acudiente'])->name('estudiantes.acudientes.quitar');
    });

    Route::post('promociones', [PromocionController::class, 'store'])->middleware('can:promover-estudiantes')->name('promociones.store');

    Route::middleware('can:gestionar-usuarios')->group(function () {
        Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
        Route::post('usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
        Route::put('usuarios/{usuario}', [UsuarioController::class, 'update'])->whereNumber('usuario')->name('usuarios.update');
        Route::put('usuarios/{usuario}/clave', [UsuarioController::class, 'clave'])->whereNumber('usuario')->name('usuarios.clave');
    });

    // Roles y permisos: crear roles y decidir qué puede hacer cada uno.
    Route::middleware('can:gestionar-roles')->group(function () {
        Route::get('usuarios/roles', [RolController::class, 'index'])->name('roles.index');
        Route::post('roles', [RolController::class, 'store'])->name('roles.store');
        Route::put('roles/{rol}', [RolController::class, 'update'])->whereNumber('rol')->name('roles.update');
        Route::delete('roles/{rol}', [RolController::class, 'destroy'])->whereNumber('rol')->name('roles.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
