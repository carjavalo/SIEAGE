/**
 * El mismo degradado del login detrás de la parte alta de las páginas del
 * panel, sin caja. Va fijo; el contenido que lo sigue debe ser `relative`
 * para pintarse encima.
 */
export function Lavado() {
    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-[65px] h-[270px] overflow-hidden print:hidden [@media(min-height:860px)]:h-[350px]"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#E4EBFA] via-[#EEF2FB] to-[#F5F7FC]" />
            <div className="absolute -top-24 right-[8%] size-96 rounded-full bg-white/70 blur-3xl" />
            <div className="absolute -top-10 left-[-6%] size-80 rounded-full bg-[#C4D2F1]/60 blur-3xl" />
        </div>
    );
}
