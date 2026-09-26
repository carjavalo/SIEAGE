<!DOCTYPE html>
{{-- Toda la interfaz está en español: sin esto, Chrome cree que la página está en inglés (APP_LOCALE=en) y ofrece traducirla. --}}
<html lang="es-CO">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Outfit es la letra de toda la app. Se pide aquí, antes que el JS, y los tres pesos que más
             se usan se precargan: así el texto aparece ya con su letra y no salta al cambiarla. --}}
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="preload" href="https://fonts.bunny.net/outfit/files/outfit-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="https://fonts.bunny.net/outfit/files/outfit-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="https://fonts.bunny.net/outfit/files/outfit-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
        <link href="https://fonts.bunny.net/css?family=outfit:400,500,600,700&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
