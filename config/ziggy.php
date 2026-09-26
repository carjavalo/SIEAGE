<?php

/*
| Qué rutas conoce el navegador (route() en el frontend, vía @routes en
| resources/views/app.blade.php).
*/

return [

    // Nunca se piden desde el frontend.
    'except' => ['storage.*', 'appearance'],

    // Sin sesión solo se publican las de las páginas públicas: el formulario de
    // inscripción y el login no tienen por qué anunciar las rutas del panel.
    'groups' => [
        'publico' => ['home', 'login', 'inscripcion.*'],
    ],

];
