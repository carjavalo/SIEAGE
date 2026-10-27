/**
 * Botones de la barra de la lista de estudiantes (Informe, Constancias, Boletines, Cupos…).
 * Con su nombre solo si la lista es muy ancha (1640 px, ver @container/lista en
 * ListaEstudiantes): con la ficha abierta o en pantallas comunes no caben todos, así que
 * queda el ícono; el nombre sale al pasar el mouse (title) y lo sigue leyendo el lector de pantalla.
 */
export const botonBarra =
    'relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none @min-[1640px]/lista:w-auto @min-[1640px]/lista:px-3.5';

/** El nombre del botón: oculto (pero leído) mientras no quepa. */
export const nombreBarra = 'sr-only @min-[1640px]/lista:not-sr-only';
