<?php

use App\Http\Controllers\DeshabilitacionController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\GrupoController;
use App\Http\Controllers\ImportacionController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\InscritoController;
use App\Http\Controllers\PromocionController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// La página principal es Estudiantes (sin sesión, el middleware lleva al login).
Route::redirect('/', '/estudiantes')->name('home');

// Formulario público: lo llena el acudiente sin iniciar sesión.
Route::get('inscripcion', [InscripcionController::class, 'create'])->name('inscripcion.create');
Route::post('inscripcion', [InscripcionController::class, 'store'])
    // 30/min por IP: en una jornada de inscripción en la sala de sistemas todos
    // los equipos salen por la misma IP; 6/min bloqueaba familias legítimas.
    ->middleware('throttle:30,1')
    ->name('inscripcion.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('importaciones', [ImportacionController::class, 'store'])->name('importaciones.store');

    Route::get('estudiantes', [EstudianteController::class, 'index'])->name('estudiantes.index');
    Route::get('estudiantes/{estudiante}', [EstudianteController::class, 'show'])->whereNumber('estudiante')->name('estudiantes.show');

    Route::get('inscritos', [InscritoController::class, 'index'])->name('inscritos.index');
    Route::get('inscritos/{solicitud}', [InscritoController::class, 'show'])->whereNumber('solicitud')->name('inscritos.show');
    Route::put('inscritos/{solicitud}/padres', [InscritoController::class, 'guardarPadres'])->whereNumber('solicitud')->name('inscritos.padres');
    Route::get('inscritos/{solicitud}/documentos', [InscritoController::class, 'documentos'])->whereNumber('solicitud')->name('inscritos.documentos');
    Route::put('inscritos/{solicitud}/documentos', [InscritoController::class, 'guardarDocumentos'])->whereNumber('solicitud')->name('inscritos.documentos.guardar');
    Route::get('inscritos/{solicitud}/grupo', [InscritoController::class, 'grupo'])->whereNumber('solicitud')->name('inscritos.grupo');
    Route::post('inscritos/{solicitud}/matricular', [InscritoController::class, 'matricular'])->whereNumber('solicitud')->name('inscritos.matricular');

    Route::middleware('can:gestionar-matriculas')->group(function () {
        Route::post('estudiantes/{estudiante}/deshabilitar', [DeshabilitacionController::class, 'deshabilitar'])->whereNumber('estudiante')->name('estudiantes.deshabilitar');
        Route::post('estudiantes/{estudiante}/habilitar', [DeshabilitacionController::class, 'habilitar'])->whereNumber('estudiante')->name('estudiantes.habilitar');
        Route::put('grupos/cupos', [GrupoController::class, 'cupos'])->name('grupos.cupos');
    });

    Route::post('promociones', [PromocionController::class, 'store'])->middleware('can:promover-estudiantes')->name('promociones.store');

    Route::middleware('can:gestionar-usuarios')->group(function () {
        Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
        Route::post('usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
        Route::put('usuarios/{usuario}', [UsuarioController::class, 'update'])->whereNumber('usuario')->name('usuarios.update');
        Route::put('usuarios/{usuario}/clave', [UsuarioController::class, 'clave'])->whereNumber('usuario')->name('usuarios.clave');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
