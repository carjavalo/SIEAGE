<!DOCTYPE html>
{{-- Toda la interfaz está en español: sin esto, Chrome cree que la página está en inglés y ofrece traducirla. --}}
<html lang="es-CO">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $meta['titulo'] ?? config('app.name', 'SIEAGE') }}</title>

        {{-- Solo las páginas públicas traen $meta (desde su controlador): descripción y vista previa
             al compartir el enlace (WhatsApp, correo). El resto pide sesión: que no se indexe. --}}
        @isset($meta)
            <meta name="description" content="{{ $meta['descripcion'] }}">
            @if ($meta['indexar'] ?? false)
                <meta property="og:type" content="website">
                <meta property="og:locale" content="es_CO">
                <meta property="og:site_name" content="SIEAGE · I.E. Alfonso López Pumarejo">
                <meta property="og:title" content="{{ $meta['titulo'] }}">
                <meta property="og:description" content="{{ $meta['descripcion'] }}">
                <meta property="og:image" content="{{ url('/sieage-logo.png') }}">
            @else
                <meta name="robots" content="noindex">
            @endif
        @else
            <meta name="robots" content="noindex">
        @endisset

        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
        <link rel="icon" href="/icono-192.png" type="image/png" sizes="192x192">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- Roboto es la letra de toda la app. Se pide aquí, antes que el JS, para que el
             texto aparezca ya con su letra y no salte al cambiarla. --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

        {{-- Sin sesión, el navegador solo conoce las rutas de las páginas públicas (config/ziggy.php).
             Al ingresar se recarga la página completa y ya llegan todas. --}}
        @routes(auth()->check() ? null : 'publico')
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
