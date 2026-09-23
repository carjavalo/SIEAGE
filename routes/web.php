<?php

use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\ImportacionController;
use App\Http\Controllers\InscripcionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard')->name('home');

// Formulario público: lo llena el acudiente sin iniciar sesión.
Route::get('inscripcion', [InscripcionController::class, 'create'])->name('inscripcion.create');
Route::post('inscripcion', [InscripcionController::class, 'store'])
    ->middleware('throttle:6,1')
    ->name('inscripcion.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('importaciones', [ImportacionController::class, 'store'])->name('importaciones.store');

    Route::get('estudiantes', [EstudianteController::class, 'index'])->name('estudiantes.index');
    Route::get('estudiantes/{estudiante}', [EstudianteController::class, 'show'])->whereNumber('estudiante')->name('estudiantes.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
