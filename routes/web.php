<?php

use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\ImportacionController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\InscritoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard')->name('home');

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
    Route::get('inscritos/{solicitud}/grupo', [InscritoController::class, 'grupo'])->whereNumber('solicitud')->name('inscritos.grupo');
    Route::post('inscritos/{solicitud}/matricular', [InscritoController::class, 'matricular'])->whereNumber('solicitud')->name('inscritos.matricular');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
