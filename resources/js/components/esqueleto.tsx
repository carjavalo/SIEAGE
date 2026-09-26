import { rotuloBase, tarjetaBase } from '@/components/estudiantes/tablero-grupos';
import { cn } from '@/lib/utils';

/**
 * Esqueletos de carga: la forma de lo que viene, con un brillo que la recorre,
 * en lugar de un spinner suelto o de datos viejos que no cambian. Calcan las
 * medidas de lo real para que, al llegar los datos, nada salte.
 */

const alto = '[@media(min-height:860px)]';

/** Tonos del brillo: sobre blanco (por defecto) y sobre el degradado azul de la ficha. */
const sobreAzul = 'bg-[linear-gradient(90deg,#CCD8F2_25%,#E2E9F9_45%,#CCD8F2_65%)]';

export function Esqueleto({ className }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                'animate-brillo block rounded-md bg-[linear-gradient(90deg,#E9EEF8_25%,#F6F8FD_45%,#E9EEF8_65%)] bg-[length:200%_100%] motion-reduce:animate-none',
                className,
            )}
        />
    );
}

/** Anchos que varían de fila a fila, para que no parezca una rejilla. */
const anchos = ['w-3/4', 'w-3/5', 'w-4/5', 'w-1/2', 'w-2/3', 'w-[70%]'];

/**
 * Filas de una tabla mientras llegan. `celdas`: la clase de cada <td> real (así
 * se respetan anchos, rellenos y columnas ocultas por tamaño) y el ancho de su
 * barra; `null` deja la celda vacía y sin ancho dice "variable".
 */
export function FilasEsqueleto({ celdas, filas = 14 }: { celdas: { clase: string; barra?: string | null }[]; filas?: number }) {
    return (
        <tbody aria-hidden>
            {Array.from({ length: filas }, (_, f) => (
                // Se desvanecen hacia abajo: se lee como "hay más", no como una lista de 14.
                <tr key={f} style={{ opacity: Math.max(0.25, 1 - f * 0.06) }}>
                    {celdas.map((c, i) => (
                        <td key={i} className={c.clase}>
                            {c.barra !== null && <Esqueleto className={cn('h-3', c.barra ?? anchos[(f * 3 + i) % anchos.length])} />}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}

/** Tarjetas del tablero (grupos o grados) mientras llegan; mismas medidas que las reales. */
export function TarjetasEsqueleto({ n, claseTarjeta }: { n: number; claseTarjeta?: string }) {
    return (
        <div aria-hidden className={`relative mt-1.5 flex shrink-0 flex-col gap-1.5 ${alto}:mt-4 ${alto}:gap-2`}>
            <span className={rotuloBase}>
                <Esqueleto className="h-3 w-64 max-w-full" />
            </span>
            <div className={`flex gap-2.5 overflow-hidden pb-1 ${alto}:gap-3`}>
                {Array.from({ length: Math.max(1, n) }, (_, i) => (
                    <div key={i} className={cn(tarjetaBase, 'cursor-default bg-white ring-1 ring-[#E3E9F6]', claseTarjeta)}>
                        <span className="flex h-6 items-center justify-between gap-3">
                            <Esqueleto className="h-4 w-11" />
                            <Esqueleto className="h-3 w-10" />
                        </span>
                        <Esqueleto className={`mt-1 h-[5px] w-full rounded-full ${alto}:mt-2 ${alto}:h-1.5`} />
                        <span className={`mt-1 flex h-[18px] items-center ${alto}:mt-2`}>
                            <Esqueleto className={cn('h-3', i % 2 ? 'w-3/5' : 'w-3/4')} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** La ficha lateral mientras llega: la misma forma que EncabezadoFicha y sus bloques. */
export function FichaEsqueleto() {
    return (
        <div role="status" aria-label="Cargando la ficha…" className="flex min-h-0 flex-1 flex-col">
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#EEF2FB] to-[#DCE5F8] px-5 pt-3.5 pb-3.5">
                <span aria-hidden className="absolute top-3 right-3 size-8 rounded-full bg-white/70" />
                <div className="flex items-start gap-3.5 pr-8">
                    <Esqueleto className={cn('size-12 shrink-0 rounded-[15px]', sobreAzul)} />
                    <div className="flex-1 space-y-2.5 pt-1">
                        <Esqueleto className={cn('h-4 w-4/5', sobreAzul)} />
                        <Esqueleto className={cn('h-3 w-1/2', sobreAzul)} />
                        <Esqueleto className={cn('h-3 w-2/5', sobreAzul)} />
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <Esqueleto className={cn('h-10 flex-1 rounded-[13px]', sobreAzul)} />
                    <Esqueleto className={cn('mx-1 h-3 w-12', sobreAzul)} />
                    <Esqueleto className={cn('size-10 rounded-[13px]', sobreAzul)} />
                    <Esqueleto className={cn('size-10 rounded-[13px]', sobreAzul)} />
                </div>
            </div>
            {[3, 2, 2].map((lineas, i) => (
                <div key={i} className={cn(`px-5 py-3.5 ${alto}:py-4`, i > 0 && 'border-t border-[#EEF2F9]')}>
                    <Esqueleto className="mb-3 h-2.5 w-24" />
                    <div className="space-y-2.5 rounded-[16px] bg-[#F5F7FC] px-3.5 py-3">
                        <Esqueleto className="h-3.5 w-2/3" />
                        {Array.from({ length: lineas }, (_, k) => (
                            <Esqueleto key={k} className={cn('h-3', k % 2 ? 'w-2/5' : 'w-3/5')} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Resultados de la búsqueda mientras llegan; misma forma que un resultado. */
export function ResultadosEsqueleto({ n = 3 }: { n?: number }) {
    return (
        <div role="status" aria-label="Buscando…" className="p-1.5">
            {Array.from({ length: n }, (_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[12px] px-3 py-2" style={{ opacity: 1 - i * 0.2 }}>
                    <Esqueleto className="size-9 shrink-0 rounded-full" />
                    <span className="min-w-0 flex-1 space-y-2">
                        <Esqueleto className={cn('h-3.5', anchos[i % anchos.length])} />
                        <Esqueleto className="h-3 w-1/3" />
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-2">
                        <Esqueleto className="h-3.5 w-9" />
                        <Esqueleto className="h-3 w-14" />
                    </span>
                </div>
            ))}
        </div>
    );
}
