<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    // Con tope: quien encuentre una sesión abierta no puede probar claves sin fin.
    Route::put('settings/password', [PasswordController::class, 'update'])->middleware('throttle:6,1')->name('password.update');

    // SIEAGE tiene un solo diseño (claro): la antigua página de apariencia lleva al perfil.
    Route::redirect('settings/appearance', '/settings/profile')->name('appearance');
});
