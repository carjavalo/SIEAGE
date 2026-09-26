/**
 * Lo primero que se alcanza con Tab: lleva el foco al contenido sin recorrer el
 * menú o los pasos. Invisible hasta que recibe el foco. El destino necesita
 * tabIndex={-1} (y el relleno va con focus: porque not-sr-only lo pone en 0).
 * Se enfoca a mano en vez de seguir el #ancla: así Inertia no
 * toca la dirección ni el historial.
 */
export function SaltarAlContenido({ destino = 'contenido' }: { destino?: string }) {
    return (
        <a
            href={`#${destino}`}
            onClick={(e) => {
                e.preventDefault();
                document.getElementById(destino)?.focus();
            }}
            className="sr-only rounded-full bg-[#1E3A7B] text-sm font-semibold whitespace-nowrap text-white shadow-[0_12px_24px_-12px_rgba(30,58,123,0.6)] focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B7C6EA]"
        >
            Saltar al contenido
        </a>
    );
}
