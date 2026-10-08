import { Desplegable } from '@/components/desplegable';
import { botonPrimario } from '@/components/formulario';
import { type Informe } from '@/lib/informe';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

const claseFiltro =
    'h-[26px] rounded-full bg-white pr-2 pl-2.5 text-[14px] font-semibold text-[#1E3A7B] tabular-nums ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] aria-expanded:ring-[#6E8BD6]';

/** Los informes del módulo: comparten filtros, y al cambiar de uno a otro se conservan. */
const INFORMES = [
    { ruta: '/informes/matricula', titulo: 'Matrícula' },
    { ruta: '/informes/documentos', titulo: 'Documentos pendientes' },
] as const;

export type RutaInforme = (typeof INFORMES)[number]['ruta'];

type Props = {
    ruta: RutaInforme;
    anio: number;
    anios: number[];
    filtro: Informe['filtro'];
    opciones: Informe['opciones'];
    /** La línea de abajo: cuántas hojas, cuántos estudiantes… */
    resumen: ReactNode;
    /** Botones antes de «Guardar PDF» (p. ej. el Excel). */
    acciones?: ReactNode;
};

/** Barra de arriba de los informes (no se imprime): cuál informe, año, sede, grado, grupo y «Guardar PDF». */
export function BarraInforme({ ruta, anio, anios, filtro, opciones, resumen, acciones }: Props) {
    // Los grados de la sede elegida; sin sede, los de todas las que ve el usuario.
    const grados = useMemo(() => {
        const de = filtro.sede ? opciones.filter((o) => o.codigo === filtro.sede) : opciones;
        const unicos = new Map(de.flatMap((o) => o.grados).map((g) => [g.id, g]));
        return [...unicos.values()].sort((a, b) => a.numero - b.numero);
    }, [opciones, filtro.sede]);
    const unaSede = opciones.length === 1;

    // Los grupos del grado elegido, en la sede elegida (o en todas las que ve).
    const grupos = useMemo(() => {
        if (!filtro.grado) return [];
        const de = filtro.sede ? opciones.filter((o) => o.codigo === filtro.sede) : opciones;
        return de.flatMap((o) => o.grados.filter((g) => g.id === filtro.grado).flatMap((g) => g.grupos.map((gr) => ({ ...gr, sede: o.nombre }))));
    }, [opciones, filtro.sede, filtro.grado]);

    /** Los filtros actuales como parámetros de la dirección. */
    const parametros = (f: { anio: number; sede: string | null; grado: number | null; grupo: number | null }) => ({
        anio: f.anio,
        ...(f.sede && { sede: f.sede }),
        ...(f.grado && { grado: f.grado }),
        ...(f.grupo && { grupo: f.grupo }),
    });

    /** Cambia año, sede, grado o grupo. Al cambiar la sede o el grado se quita el grupo; un grado que la sede nueva no tiene, también. */
    const filtrar = (cambios: { anio?: number; sede?: string | null; grado?: number | null; grupo?: number | null }) => {
        const sede = cambios.sede !== undefined ? cambios.sede : filtro.sede;
        let grado = cambios.grado !== undefined ? cambios.grado : filtro.grado;
        if (cambios.sede !== undefined && sede && grado && !opciones.find((o) => o.codigo === sede)?.grados.some((g) => g.id === grado)) grado = null;
        // Otro año tiene otros grupos: el grupo solo se conserva si no cambia nada más.
        const grupo = cambios.grupo !== undefined ? cambios.grupo : Object.keys(cambios).length ? null : filtro.grupo;
        router.get(ruta, parametros({ anio: cambios.anio ?? anio, sede, grado, grupo }));
    };

    const actuales = new URLSearchParams(
        Object.entries(parametros({ anio, sede: filtro.sede, grado: filtro.grado, grupo: filtro.grupo })).map(([k, v]) => [k, String(v)]),
    ).toString();

    return (
        <div className="sticky top-0 z-20 border-b border-[#E3E9F6] bg-white/90 backdrop-blur print:hidden">
            <div className="mx-auto flex min-h-16 max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:px-8">
                <Link
                    href={`/estudiantes?anio=${anio}`}
                    aria-label="Volver a Estudiantes"
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full pr-3.5 pl-2.5 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                >
                    <ArrowLeft className="size-4" />
                    <span className="hidden sm:inline">Estudiantes</span>
                </Link>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Cuál informe: los filtros viajan con el cambio. */}
                        <nav aria-label="Informes" className="flex gap-0.5 rounded-full bg-[#EEF2FB] p-[3px]">
                            {INFORMES.map((i) => (
                                <Link
                                    key={i.ruta}
                                    href={`${i.ruta}?${actuales}`}
                                    aria-current={i.ruta === ruta ? 'page' : undefined}
                                    className={cn(
                                        'flex h-[26px] items-center rounded-full px-3 text-[13.5px] font-semibold whitespace-nowrap transition',
                                        i.ruta === ruta ? 'bg-white text-[#1E3A7B] shadow-sm' : 'text-[#56627F] hover:text-[#1E3A7B]',
                                    )}
                                >
                                    {i.titulo}
                                </Link>
                            ))}
                        </nav>
                        <Desplegable
                            etiqueta="Año lectivo"
                            valor={anio}
                            opciones={anios.map((a) => ({ valor: a, etiqueta: String(a) }))}
                            onCambio={(a) => filtrar({ anio: a })}
                            claseBoton={claseFiltro}
                        />
                        {!unaSede && (
                            <Desplegable
                                etiqueta="Sede"
                                valor={filtro.sede ?? ''}
                                opciones={[
                                    { valor: '', etiqueta: 'Todas las sedes' },
                                    ...opciones.map((o) => ({ valor: o.codigo, etiqueta: o.nombre })),
                                ]}
                                onCambio={(s) => filtrar({ sede: s || null })}
                                claseBoton={cn(claseFiltro, 'max-w-[200px] truncate')}
                            />
                        )}
                        <Desplegable
                            etiqueta="Grado"
                            valor={filtro.grado ? String(filtro.grado) : ''}
                            opciones={[
                                { valor: '', etiqueta: 'Todos los grados' },
                                ...grados.map((g) => ({ valor: String(g.id), etiqueta: g.nombre })),
                            ]}
                            onCambio={(g) => filtrar({ grado: g ? Number(g) : null })}
                            claseBoton={claseFiltro}
                        />
                        {grupos.length > 0 && (
                            <Desplegable
                                etiqueta="Grupo"
                                valor={filtro.grupo ? String(filtro.grupo) : ''}
                                opciones={[
                                    { valor: '', etiqueta: 'Todos los grupos' },
                                    // Sin sede elegida, cada grupo dice de qué sede es.
                                    ...grupos.map((g) => ({
                                        valor: String(g.id),
                                        etiqueta: g.codigo,
                                        ...(!filtro.sede && !unaSede && { detalle: g.sede }),
                                    })),
                                ]}
                                onCambio={(g) => filtrar({ grupo: g ? Number(g) : null })}
                                claseBoton={claseFiltro}
                            />
                        )}
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] text-[#56627F]">{resumen}</p>
                </div>
                <p className="ml-auto hidden max-w-[260px] text-right text-[12.5px] leading-snug text-[#56627F] 2xl:block">
                    En el cuadro que se abre, elige <b className="font-semibold text-[#16223F]">«Guardar como PDF»</b> como destino.
                </p>
                <div className="ml-auto flex shrink-0 items-center gap-2 2xl:ml-0">
                    {acciones}
                    <button type="button" onClick={() => window.print()} className={botonPrimario}>
                        <Download className="size-[18px]" />
                        {/* En el celular, solo «PDF», para que quepa el título. */}
                        <span>
                            <span className="max-sm:sr-only">Guardar </span>PDF
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
