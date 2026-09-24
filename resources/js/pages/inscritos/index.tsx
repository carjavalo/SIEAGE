import { VeloFicha } from '@/components/ficha';
import { FichaInscrito } from '@/components/inscritos/ficha-inscrito';
import { ListaInscritos } from '@/components/inscritos/lista-inscritos';
import { TableroGrados } from '@/components/inscritos/tablero-grados';
import { Lavado } from '@/components/lavado';
import { useListaConFicha } from '@/hooks/use-lista-con-ficha';
import PanelLayout from '@/layouts/panel-layout';
import { numero, palabras, plano } from '@/lib/estudiantes';
import { type EstadoSolicitud, type FichaInscrito as Ficha, type InscritoFila, nombreInscrito } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ClipboardList, ExternalLink, Search, X } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';

type Props = {
    estado: EstadoSolicitud | 'todas';
    conteos: Partial<Record<EstadoSolicitud, number | string>>;
    inscritos: InscritoFila[];
    detalle: Ficha | null;
};

const alto = '[@media(min-height:860px)]';

const pestañas = [
    { clave: 'pendiente', nombre: 'Pendientes', vacio: 'No hay inscripciones pendientes' },
    { clave: 'aprobada', nombre: 'Aprobadas', vacio: 'No hay inscripciones aprobadas' },
    { clave: 'rechazada', nombre: 'Rechazadas', vacio: 'No hay inscripciones rechazadas' },
    { clave: 'todas', nombre: 'Todas', vacio: 'Todavía no ha llegado ninguna inscripción' },
] as const;

/**
 * Solicitudes que llegaron por el formulario público y aún no son estudiantes:
 * pestañas por estado, los grados a los que entran y la lista con la ficha del
 * inscrito elegido. Cambiar de pestaña es una visita nueva y todo vuelve a empezar.
 */
export default function Inscritos({ estado, conteos, inscritos, detalle }: Props) {
    const [gradoId, setGradoId] = useState<number | null>(null);
    const [filtro, setFiltro] = useState('');
    const campoFiltro = useRef<HTMLInputElement>(null);

    const cuenta = (clave: EstadoSolicitud) => Number(conteos[clave] ?? 0);
    const total = cuenta('pendiente') + cuenta('aprobada') + cuenta('rechazada');
    const pestaña = pestañas.find((p) => p.clave === estado) ?? pestañas[0];

    const buscadas = useMemo(() => palabras(filtro), [filtro]);
    const alcance = useMemo(() => inscritos.filter((i) => gradoId === null || i.grado_id === gradoId), [inscritos, gradoId]);
    const visibles = useMemo(
        () =>
            alcance.filter((i) => {
                const texto = plano(`${nombreInscrito(i)} ${i.acudiente_primer_nombre} ${i.acudiente_primer_apellido}`);
                return buscadas.every((p) => texto.includes(p) || i.numero_documento.includes(p));
            }),
        [alcance, buscadas],
    );
    const ids = useMemo(() => visibles.map((i) => i.id), [visibles]);
    const grado = inscritos.find((i) => i.grado_id === gradoId);

    const ficha = useListaConFicha({
        visibles: ids,
        detalleId: detalle?.solicitud.id ?? null,
        inicial: detalle && inscritos.some((i) => i.id === detalle.solicitud.id) ? detalle.solicitud.id : null,
        datosRecarga: { estado },
        campoFiltro,
        filtro,
        limpiarFiltro: () => setFiltro(''),
        campoAtajo: campoFiltro,
    });

    const filtrar = (texto: string) => {
        setFiltro(texto);
        ficha.alInicio();
    };

    return (
        <PanelLayout titulo="Inscritos" completa>
            <Lavado />

            {/* Primera franja: título y totales, estados en segmentos y búsqueda. */}
            <section className="relative flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 xl:flex-nowrap">
                <div className="shrink-0">
                    <div className="flex items-center gap-2">
                        <h1 className={`text-[24px] leading-[26px] font-semibold tracking-[-0.025em] ${alto}:text-[28px] ${alto}:leading-8`}>
                            Inscritos
                        </h1>
                        <a
                            href="/inscripcion"
                            target="_blank"
                            rel="noreferrer"
                            title="Abrir el formulario público de inscripción"
                            className={`flex h-[26px] items-center gap-1.5 rounded-full bg-white/75 px-2.5 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none ${alto}:h-8`}
                        >
                            Formulario
                            <ExternalLink className="size-3.5" />
                        </a>
                    </div>
                    <dl
                        className={`mt-0.5 flex items-baseline gap-1.5 text-[13px] leading-4 whitespace-nowrap text-[#56627F] ${alto}:mt-1 ${alto}:text-[14px] ${alto}:leading-5`}
                    >
                        {(
                            [
                                ['pendiente', 'pendiente', 'pendientes'],
                                ['aprobada', 'aprobada', 'aprobadas'],
                                ['rechazada', 'rechazada', 'rechazadas'],
                            ] as const
                        ).map(([clave, uno, varios], i) => (
                            <Fragment key={clave}>
                                {i > 0 && (
                                    <span aria-hidden className="text-[#8C97B3]">
                                        ·
                                    </span>
                                )}
                                <div className="flex items-baseline gap-1">
                                    <dt className="sr-only">{varios}</dt>
                                    <dd className="font-semibold text-[#16223F] tabular-nums">{numero(cuenta(clave))}</dd>
                                    <span aria-hidden>{cuenta(clave) === 1 ? uno : varios}</span>
                                </div>
                            </Fragment>
                        ))}
                    </dl>
                </div>

                <nav
                    aria-label="Estado de la solicitud"
                    className={`order-last flex h-11 w-full min-w-0 items-stretch gap-0.5 rounded-[16px] bg-[#D3DDF3]/45 p-1 ring-1 ring-white/70 xl:order-none xl:w-auto xl:flex-1 ${alto}:h-[52px] ${alto}:rounded-[18px]`}
                >
                    {pestañas.map((p) => {
                        const actual = p.clave === estado;
                        return (
                            <Link
                                key={p.clave}
                                href="/inscritos"
                                data={{ estado: p.clave }}
                                aria-current={actual ? 'page' : undefined}
                                className={cn(
                                    `flex flex-1 items-center justify-center gap-2 rounded-[12px] transition duration-200 focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none ${alto}:rounded-[14px]`,
                                    actual
                                        ? 'bg-white text-[#1E3A7B] shadow-[0_1px_3px_rgba(22,34,63,0.14)] ring-1 ring-[#C4D2F1]'
                                        : 'text-[#16223F] hover:bg-white/60',
                                )}
                            >
                                <span className={`text-[15px] font-semibold tracking-[-0.01em] ${alto}:text-[16px]`}>{p.nombre}</span>
                                <span className={cn('text-[13px] tabular-nums', actual ? 'text-[#5B7BD0]' : 'text-[#56627F]')}>
                                    {p.clave === 'todas' ? total : cuenta(p.clave)}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="relative ml-auto w-full sm:w-[300px] xl:ml-0 xl:w-[280px] 2xl:w-[340px]" data-busqueda>
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[#6B7690]" />
                    <input
                        ref={campoFiltro}
                        type="search"
                        autoComplete="off"
                        spellCheck={false}
                        value={filtro}
                        onChange={(e) => filtrar(e.target.value)}
                        placeholder="Buscar nombre o documento"
                        aria-label="Buscar inscrito por nombre, documento o acudiente"
                        aria-describedby="inscritos-cuenta"
                        className={cn(
                            `h-10 w-full rounded-[14px] border-[1.5px] border-[#D3DDF3] bg-white pl-10 text-[15px] text-[#16223F] shadow-[0_1px_2px_rgba(22,34,63,0.05)] transition outline-none placeholder:text-[#8C97B3] hover:border-[#B7C6EA] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] [&::-webkit-search-cancel-button]:hidden ${alto}:h-11`,
                            buscadas.length ? 'pr-[92px]' : 'pr-10',
                        )}
                    />
                    <span
                        id="inscritos-cuenta"
                        aria-live="polite"
                        className="pointer-events-none absolute top-1/2 right-10 -translate-y-1/2 text-[13px] whitespace-nowrap text-[#56627F] tabular-nums"
                    >
                        {buscadas.length > 0 && `${visibles.length} de ${alcance.length}`}
                    </span>
                    {filtro ? (
                        <button
                            type="button"
                            onClick={() => {
                                filtrar('');
                                campoFiltro.current?.focus();
                            }}
                            aria-label="Limpiar búsqueda"
                            className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#56627F] hover:bg-[#EEF2FB] hover:text-[#16223F]"
                        >
                            <X className="size-4" />
                        </button>
                    ) : (
                        <kbd
                            title="Atajo: /"
                            className="pointer-events-none absolute top-1/2 right-3 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-md border border-[#D3DDF3] bg-[#F5F7FC] px-1.5 font-sans text-[12px] text-[#56627F]"
                        >
                            /
                        </kbd>
                    )}
                </div>
            </section>

            <TableroGrados
                inscritos={inscritos}
                gradoId={gradoId}
                onElegir={(id) => {
                    setGradoId(id);
                    ficha.alInicio();
                }}
            />

            <div className="relative mt-1.5 flex min-h-[420px] flex-col lg:min-h-0 lg:flex-1 lg:flex-row [@media(min-height:860px)]:mt-3">
                <ListaInscritos
                    titulo={pestaña.nombre}
                    grado={grado && { id: grado.grado_id, numero: grado.grado_numero, nombre: grado.grado }}
                    filas={visibles}
                    alcance={alcance}
                    buscadas={buscadas}
                    conSituacion={estado === 'todas'}
                    seleccion={ficha.seleccion}
                    lista={ficha.lista}
                    vacio={
                        <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EEF2FB] text-[#5B7BD0]">
                                <ClipboardList className="size-5" />
                            </span>
                            <p className="mt-1 text-[16px] font-semibold">{pestaña.vacio}</p>
                            <p className="max-w-md text-sm text-[#56627F]">
                                Las familias se inscriben en el{' '}
                                <a
                                    href="/inscripcion"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-[#1E3A7B] underline underline-offset-4"
                                >
                                    formulario de inscripción
                                </a>
                                ; cada envío llega aquí como pendiente.
                            </p>
                        </div>
                    }
                    onQuitarGrado={() => setGradoId(null)}
                    onQuitarFiltros={() => {
                        setFiltro('');
                        setGradoId(null);
                    }}
                    onFila={ficha.abrirFila}
                />

                <FichaInscrito
                    ficha={detalle}
                    abierta={ficha.abierta}
                    cargando={ficha.cargando}
                    posicion={ficha.posicion}
                    total={visibles.length}
                    panel={ficha.panel}
                    onCerrar={ficha.cerrar}
                    onMover={ficha.mover}
                />
            </div>

            <VeloFicha abierta={ficha.abierta} />
        </PanelLayout>
    );
}
