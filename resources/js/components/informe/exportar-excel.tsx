import { panelDesplegable, useAlPulsarFuera } from '@/components/desplegable';
import { type SedeInforme, cifra } from '@/lib/informe';
import { cn } from '@/lib/utils';
import { ChevronDown, Download, FileSpreadsheet } from 'lucide-react';
import { type KeyboardEvent, useId, useRef, useState } from 'react';

/**
 * «Excel»: el libro de matrícula de una sede, con el formato del colegio
 * (una hoja por grupo, CONSOLIDADO…). Cada sede es un enlace normal: el servidor
 * responde con el archivo como adjunto, y si la sesión venció se llega al ingreso.
 */
export function ExportarExcel({ anio, sedes }: { anio: number; sedes: SedeInforme[] }) {
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef<HTMLDivElement>(null);
    const boton = useRef<HTMLButtonElement>(null);
    const id = useId();
    const conGrupos = sedes.filter((s) => s.grupos > 0);

    const cerrar = () => setAbierto(false);
    useAlPulsarFuera(contenedor, abierto, cerrar);

    const alTeclear = (e: KeyboardEvent) => {
        if (e.key !== 'Escape' || !abierto) return;
        e.stopPropagation();
        cerrar();
        boton.current?.focus();
    };

    return (
        <div ref={contenedor} className="relative" onKeyDown={alTeclear}>
            <button
                ref={boton}
                type="button"
                aria-expanded={abierto}
                aria-controls={`${id}-sedes`}
                aria-label="Exportar a Excel"
                disabled={conGrupos.length === 0}
                onClick={() => setAbierto((a) => !a)}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-[15px] font-semibold whitespace-nowrap text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none disabled:cursor-default disabled:opacity-60 aria-expanded:bg-[#EEF2FB] aria-expanded:ring-[#6E8BD6]"
            >
                <FileSpreadsheet aria-hidden className="size-[18px]" />
                <span className="hidden sm:inline">Excel</span>
                <ChevronDown aria-hidden className={cn('-mr-1 size-4 transition-transform duration-200 max-sm:hidden', abierto && 'rotate-180')} />
            </button>

            {abierto && (
                // En el celular el botón no está en el borde: el panel ocupa el ancho de la pantalla.
                <div
                    id={`${id}-sedes`}
                    className={cn(panelDesplegable, 'right-0 w-[300px] max-sm:fixed max-sm:inset-x-4 max-sm:top-[72px] max-sm:w-auto')}
                >
                    <p className="px-3 pt-2 pb-1.5 text-[12.5px] leading-snug text-[#56627F]">
                        Un libro por sede, con una hoja por grupo y el consolidado, como el del colegio.
                    </p>
                    <ul>
                        {conGrupos.map((s) => (
                            <li key={s.codigo}>
                                <a
                                    href={`/informes/matricula/excel?anio=${anio}&sede=${encodeURIComponent(s.codigo)}`}
                                    onClick={cerrar}
                                    className="group flex items-center gap-3 rounded-[12px] px-3 py-2 text-[#16223F] transition-colors outline-none hover:bg-[#EEF2FB] focus-visible:bg-[#EEF2FB]"
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[15px] font-medium group-hover:text-[#1E3A7B]">{s.nombre}</span>
                                        <span className="block text-[12.5px] text-[#56627F] tabular-nums">
                                            {s.grupos} {s.grupos === 1 ? 'grupo' : 'grupos'} · {cifra(s.activos)} estudiantes
                                        </span>
                                    </span>
                                    <Download
                                        aria-hidden
                                        className="size-[18px] shrink-0 text-[#8792AB] transition-colors group-hover:text-[#1E3A7B] group-focus-visible:text-[#1E3A7B]"
                                    />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
