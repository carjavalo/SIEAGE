import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

/**
 * Una hoja A4 del informe. En pantalla, una hoja blanca con sombra; al imprimir,
 * la página exacta (ver @page informe en app.css). Todo va en px: al imprimir,
 * 1 px = 1/96 de pulgada, así que 794 × 1123 px son justo 210 × 297 mm.
 */
export function Hoja({
    numero,
    total,
    encabezado,
    pie,
    sinMarco,
    className,
    children,
}: {
    numero: number;
    total: number;
    /** Lo de arriba a la izquierda y a la derecha (el informe y la fecha de corte). */
    encabezado: [ReactNode, ReactNode];
    pie: ReactNode;
    /** La portada va sin encabezado ni número. */
    sinMarco?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section
            aria-label={`Hoja ${numero} de ${total}`}
            className={cn(
                'hoja relative h-[297mm] w-[210mm] shrink-0 overflow-hidden bg-white text-[#16223F] shadow-[0_10px_30px_-12px_rgba(22,34,63,0.35)] [print-color-adjust:exact] print:shadow-none',
                className,
            )}
        >
            {sinMarco ? (
                children
            ) : (
                <>
                    <div className="px-[56px] pt-[48px]">
                        <header className="mb-[24px] flex items-center justify-between border-b border-[#E9EEF8] pb-[12px] text-[10.5px] text-[#6B7690]">
                            <span>{encabezado[0]}</span>
                            <span>{encabezado[1]}</span>
                        </header>
                        {children}
                    </div>
                    <footer className="absolute right-[56px] bottom-[26px] left-[56px] flex items-center text-[10px] text-[#8C97B3]">
                        <span>{pie}</span>
                        <span className="ml-auto font-semibold text-[#16223F] tabular-nums">
                            {numero} / {total}
                        </span>
                    </footer>
                </>
            )}
        </section>
    );
}

/** Abre una sección: número y nombre, un titular con el dato principal y una línea que lo explica. */
export function Titular({ seccion, titulo, children }: { seccion: string; titulo: ReactNode; children?: ReactNode }) {
    return (
        <div className="mb-[6px]">
            <p className="text-[11px] font-semibold tracking-[0.2px] text-[#4863B8]">{seccion}</p>
            <h2 className="mt-[4px] max-w-[640px] text-[27px] leading-[1.14] font-bold tracking-[-0.7px] text-balance">{titulo}</h2>
            {children && <p className="mt-[8px] max-w-[600px] text-[12.5px] leading-[1.55] text-[#56627F]">{children}</p>}
        </div>
    );
}

/** Título de un bloque dentro de la sección, con una nota a la derecha. */
export function Bloque({ titulo, nota, className, children }: { titulo: string; nota?: ReactNode; className?: string; children: ReactNode }) {
    return (
        <div className={cn('mt-[22px]', className)}>
            <h3 className="mb-[10px] flex items-baseline justify-between gap-4 text-[13px] font-bold">
                {titulo}
                {nota && <small className="text-[10.5px] font-normal text-[#6B7690]">{nota}</small>}
            </h3>
            {children}
        </div>
    );
}

/** Cifras en columnas separadas por líneas finas. */
export function Cifras({ items, className }: { items: { valor: ReactNode; texto: ReactNode }[]; className?: string }) {
    return (
        <div className={cn('grid', className)} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
            {items.map((c, i) => (
                <div key={i} className="border-l border-[#E9EEF8] px-[14px]">
                    <b className="block text-[21px] leading-tight font-bold tracking-[-0.5px] tabular-nums">{c.valor}</b>
                    <span className="mt-[2px] block text-[10.5px] leading-[1.35] text-[#56627F]">{c.texto}</span>
                </div>
            ))}
        </div>
    );
}

/** Tablas del informe: encabezado en versalitas sobre una línea fuerte, filas con líneas finas. */
export const tabla = 'w-full table-fixed border-collapse text-[10.5px]';
export const th =
    'h-[24px] border-b-[1.5px] border-[#16223F] px-[6px] pb-[6px] text-left align-bottom text-[9px] font-semibold tracking-[0.6px] text-[#6B7690] uppercase';
export const td = 'h-[22px] border-b border-[#F1F4FA] px-[6px] align-middle';
export const num = 'text-right tabular-nums';
export const filaTotal = 'border-t-[1.5px] border-[#16223F] font-bold [&>td]:h-[26px] [&>td]:border-b-0';
