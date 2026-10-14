<?php

namespace App\Support;

use RuntimeException;

/** Una respuesta del formulario que no se puede importar; el mensaje se le muestra a quien importa. */
final class ErrorDeFila extends RuntimeException {}
