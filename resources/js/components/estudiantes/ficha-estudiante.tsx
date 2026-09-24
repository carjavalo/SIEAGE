import { Marca, PuntoSede, iniciales, sedeInfo, textoSituacion } from '@/components/estudiantes/etiquetas';
import { type Acudiente, type FichaDetalle, edad, fecha, telefono } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp, CircleAlert, FileText, LoaderCircle, Mail, MapPin, Phone, Smartphone, StickyNote, X } from 'lucide-react';
import { type ReactNode, type RefObject } from 'react';

type Props = {
    ficha: FichaDetalle | null;
    abierta: boolean;
    /** Se está trayendo la ficha de otro estudiante: la actual se atenúa. */
    cargando: boolean;
    posicion: number;
    total: number;
    panel: RefObject<HTMLElement | null>;
    onCerrar: () => void;
    onMover: (paso: 1 | -1) => void;
};

const alto = '[@media(min-height:860px)]';
const Sep = () => (
    <span aria-hidden className="text-[#8C97B3]">
        ·
    </span>
);

/**
 * Ficha del estudiante elegido. Por debajo de 2xl flota sobre la lista, bajo la
 * primera franja (la búsqueda y los grados siguen a mano); en 2xl se acopla como
 * una columna más al lado de la tabla.
 */
export function FichaEstudiante({ ficha, abierta, cargando, posicion, total, panel, onCerrar, onMover }: Props) {
    return (
        <aside
            ref={panel}
            role="dialog"
            aria-modal={false}
            aria-label="Ficha del estudiante"
            tabIndex={-1}
            data-abierta={abierta}
            aria-hidden={!abierta}
            inert={!abierta}
            className={`fixed top-[65px] right-0 bottom-0 z-40 flex w-full translate-x-[110%] flex-col overflow-hidden bg-white shadow-[0_32px_64px_-24px_rgba(22,34,63,0.45),0_0_0_1px_rgba(22,34,63,0.05)] transition-[transform,width,margin] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] outline-none data-[abierta=true]:translate-x-0 sm:top-[125px] sm:right-3 sm:bottom-3 sm:w-[460px] sm:rounded-[24px] ${alto}:sm:top-[149px] 2xl:static 2xl:z-auto 2xl:w-0 2xl:translate-x-0 2xl:shadow-none 2xl:data-[abierta=true]:ml-3 2xl:data-[abierta=true]:w-[480px] 2xl:data-[abierta=true]:shadow-[0_1px_2px_rgba(22,34,63,0.04),0_12px_32px_-20px_rgba(22,34,63,0.18),0_0_0_1px_#E3E9F6] print:hidden`}
        >
            <div className="flex h-full w-full flex-col 2xl:w-[480px]">
                {ficha ? (
                    <Contenido ficha={ficha} cargando={cargando} posicion={posicion} total={total} onCerrar={onCerrar} onMover={onMover} />
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <LoaderCircle className="size-6 animate-spin text-[#8C97B3]" aria-label="Cargando ficha" />
                    </div>
                )}
            </div>
        </aside>
    );
}

function Contenido({ ficha, cargando, posicion, total, onCerrar, onMover }: Omit<Props, 'ficha' | 'abierta' | 'panel'> & { ficha: FichaDetalle }) {
    const { estudiante: e, actual: m, historia, acudientes } = ficha;
    const anios = edad(e.fecha_nacimiento);
    const retirado = m && m.estado !== 'activo';
    // La sede solo se repite en la historia si el estudiante ha pasado por más de una.
    const variasSedes = new Set(historia.map((h) => h.sede_codigo)).size > 1;

    return (
        <div className={cn('flex min-h-0 flex-1 flex-col transition-opacity duration-150', cargando && 'opacity-60')} aria-busy={cargando}>
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#EEF2FB] to-[#DCE5F8] px-5 pt-3.5 pb-3.5">
                <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-white/70 blur-3xl" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {cargando && <LoaderCircle className="size-4 animate-spin text-[#5B7BD0]" aria-label="Cargando ficha" />}
                    <button
                        type="button"
                        onClick={onCerrar}
                        aria-label="Cerrar ficha (Esc)"
                        title="Cerrar (Esc)"
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/70 text-[#3E4A68] transition hover:bg-white hover:text-[#16223F]"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="relative flex items-start gap-3.5 pr-8">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-[#1E3A7B] text-[16px] font-semibold text-white shadow-[0_10px_20px_-10px_rgba(30,58,123,0.7)]">
                        {iniciales(e.nombre_completo)}
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-[19px] leading-[1.2] font-semibold tracking-[-0.02em] text-balance">{e.nombre_completo}</h2>
                        <p className="mt-0.5 text-[14px] text-[#3E4A68] tabular-nums">
                            {e.tipo_documento} {e.numero_documento}
                            {anios !== null && ` · ${anios} años`}
                        </p>
                        {m && (
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                                <span className="font-semibold text-[#1E3A7B] tabular-nums">
                                    {m.grupo ?? m.grado} · {m.anio}
                                </span>
                                <Marca valor={m.condicion} />
                                <Marca valor={m.estado} />
                            </p>
                        )}
                    </div>
                </div>

                <div className="relative mt-3 flex items-center gap-2">
                    <Link
                        href={`/estudiantes/${e.id}`}
                        className="group/btn flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-[13px] bg-[#1E3A7B] px-3 text-[14px] font-semibold whitespace-nowrap text-white shadow-[0_12px_24px_-12px_rgba(30,58,123,0.6)] transition hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.99]"
                    >
                        <FileText className="size-[18px] shrink-0 transition-transform group-hover/btn:-translate-y-px" />
                        <span className="truncate">Ficha completa e impresión</span>
                    </Link>
                    <span className="shrink-0 px-1 text-[13px] whitespace-nowrap text-[#56627F] tabular-nums" title="Posición en la lista">
                        {posicion >= 0 ? `${posicion + 1} de ${total}` : '—'}
                    </span>
                    <BotonMover etiqueta="Estudiante anterior (↑)" desactivado={posicion <= 0} onClick={() => onMover(-1)}>
                        <ChevronUp className="size-5" />
                    </BotonMover>
                    <BotonMover etiqueta="Estudiante siguiente (↓)" desactivado={posicion < 0 || posicion >= total - 1} onClick={() => onMover(1)}>
                        <ChevronDown className="size-5" />
                    </BotonMover>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]">
                {retirado && (m.fecha_retiro || m.motivo_retiro) && (
                    <div className="mx-5 mt-3.5 flex items-start gap-3 rounded-[16px] bg-[#FDECEC] px-4 py-3 text-[14px] text-[#8E2323]">
                        <CircleAlert className="mt-0.5 size-[18px] shrink-0" />
                        <p>
                            <b className="font-semibold">
                                {textoSituacion(m.estado)}
                                {m.fecha_retiro && ` el ${fecha(m.fecha_retiro)}`}
                            </b>
                            {m.motivo_retiro && (
                                <>
                                    <br />
                                    <span className="text-[#A12B2B]">{m.motivo_retiro}</span>
                                </>
                            )}
                        </p>
                    </div>
                )}

                <div>
                    <Bloque titulo={acudientes.length > 1 ? `Acudientes · ${acudientes.length}` : 'Acudiente'}>
                        {acudientes.length === 0 ? (
                            <p className="text-sm text-[#56627F]">Sin acudiente registrado</p>
                        ) : (
                            <div className="space-y-2">
                                {[...acudientes]
                                    .sort((a, b) => b.es_principal - a.es_principal)
                                    .map((a) => (
                                        <TarjetaAcudiente key={`${a.numero_documento}-${a.parentesco}`} acudiente={a} />
                                    ))}
                            </div>
                        )}
                    </Bloque>

                    {m && (
                        <Bloque titulo={`Matrícula ${m.anio}`}>
                            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-[#16223F]">
                                <span>{m.grado}</span>
                                <Sep />
                                <b className="font-semibold">{m.grupo ?? '—'}</b>
                                <Sep />
                                <span className="inline-flex items-center gap-1.5">
                                    <PuntoSede codigo={m.sede_codigo} />
                                    {m.sede}
                                </span>
                                {m.jornada && (
                                    <>
                                        <Sep />
                                        <span>{m.jornada}</span>
                                    </>
                                )}
                                {m.modalidad && (
                                    <>
                                        <Sep />
                                        <span>{m.modalidad}</span>
                                    </>
                                )}
                            </p>
                            <p className="mt-1 text-[14px] text-[#56627F]">
                                Matriculado el {fecha(m.fecha_matricula) ?? '—'} <Sep /> Nació el {fecha(e.fecha_nacimiento) ?? '—'}
                            </p>
                        </Bloque>
                    )}

                    {historia.length > 0 && (
                        <Bloque titulo="Historia en el colegio">
                            {!variasSedes && (
                                <p className="-mt-1 mb-2.5 flex items-center gap-1.5 text-[13px] text-[#56627F]">
                                    <PuntoSede codigo={historia[0].sede_codigo} />
                                    Siempre en la sede {historia[0].sede}
                                </p>
                            )}
                            <ol className="relative">
                                {historia.map((h, i) => {
                                    const ultimo = i === historia.length - 1;
                                    const notas = [
                                        h.condicion === 'repitente' && (
                                            <span key="r" className="text-[#8A5A0B]">
                                                repitió
                                            </span>
                                        ),
                                        h.estado !== 'activo' && (
                                            <span key="e" className="text-[#A12B2B]">
                                                {textoSituacion(h.estado).toLowerCase()}
                                            </span>
                                        ),
                                    ].filter(Boolean);
                                    return (
                                        <li key={h.id} className={cn('relative flex gap-3.5', !ultimo && 'pb-2.5')}>
                                            {!ultimo && (
                                                <span aria-hidden className="absolute top-[18px] bottom-0.5 left-1 w-0.5 rounded-full bg-[#DCE5F8]" />
                                            )}
                                            <span
                                                aria-hidden
                                                className={cn(
                                                    'relative mt-[5px] size-2.5 shrink-0 rounded-full',
                                                    i === 0 ? 'bg-[#1E3A7B]' : 'bg-white ring-2 ring-[#B7C6EA] ring-inset',
                                                )}
                                            />
                                            <div className="flex min-w-0 flex-1 items-baseline gap-3 text-[14px]">
                                                <span
                                                    className={cn(
                                                        'w-10 shrink-0 font-semibold tabular-nums',
                                                        i === 0 ? 'text-[#1E3A7B]' : 'text-[#16223F]',
                                                    )}
                                                >
                                                    {h.anio}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate text-[#3E4A68]">
                                                    {h.grado} · <b className="font-semibold text-[#16223F]">{h.grupo ?? '—'}</b>
                                                    {notas.map((n, k) => (
                                                        <span key={k}> · {n}</span>
                                                    ))}
                                                </span>
                                                {variasSedes && (
                                                    <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#56627F]" title={h.sede}>
                                                        <PuntoSede codigo={h.sede_codigo} />
                                                        {sedeInfo(h.sede_codigo).corto}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </Bloque>
                    )}

                    {m?.observaciones && (
                        <Bloque titulo="Observaciones">
                            <p className="flex items-start gap-2.5 rounded-[16px] bg-[#FFF7E8] px-4 py-3 text-[14px] leading-relaxed text-[#6B4A0E]">
                                <StickyNote className="mt-0.5 size-4 shrink-0 text-[#B7862C]" />
                                <span className="whitespace-pre-line">{m.observaciones}</span>
                            </p>
                        </Bloque>
                    )}
                </div>

                <p className="px-5 pt-1 pb-5 text-[12px] text-[#6B7690]">
                    Con <Tecla>↑</Tecla> <Tecla>↓</Tecla> recorres la lista sin cerrar la ficha · <Tecla>Esc</Tecla> la cierra
                </p>
            </div>
        </div>
    );
}

function TarjetaAcudiente({ acudiente: a }: { acudiente: Acudiente }) {
    const telefonos = [
        { numero: a.telefono_celular, Icono: Smartphone, titulo: 'Celular' },
        { numero: a.telefono_fijo, Icono: Phone, titulo: 'Fijo' },
    ].filter((t) => t.numero);

    return (
        <div className="rounded-[16px] bg-[#F5F7FC] px-3.5 py-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[15px] leading-snug font-semibold text-[#16223F]">{a.nombre}</p>
                    <p className="text-[13px] text-[#56627F]">
                        {a.parentesco} · {a.tipo_documento} {a.numero_documento}
                    </p>
                </div>
                {a.es_principal ? (
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[12px] font-medium text-[#1E3A7B] ring-1 ring-[#D3DDF3]">
                        Principal
                    </span>
                ) : null}
            </div>
            {telefonos.length || a.email ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {telefonos.map(({ numero, Icono, titulo }) => (
                        <a
                            key={titulo}
                            href={`tel:${numero}`}
                            title={titulo}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[14px] font-semibold text-[#1E3A7B] tabular-nums ring-1 ring-[#DCE5F8] transition hover:ring-[#1E3A7B]"
                        >
                            <Icono className="size-3.5" />
                            {telefono(numero!)}
                        </a>
                    ))}
                    {a.email && (
                        <a
                            href={`mailto:${a.email}`}
                            className="inline-flex h-8 max-w-full min-w-0 items-center gap-1.5 rounded-full bg-white px-3 text-[13px] font-medium text-[#1E3A7B] ring-1 ring-[#DCE5F8] transition hover:ring-[#1E3A7B]"
                        >
                            <Mail className="size-3.5 shrink-0" />
                            <span className="truncate">{a.email}</span>
                        </a>
                    )}
                </div>
            ) : (
                <p className="mt-1.5 text-[13px] text-[#56627F]">Sin teléfono ni correo</p>
            )}
            {(a.direccion || a.barrio) && (
                <p className="mt-2 flex items-start gap-1.5 text-[13px] text-[#56627F]">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    {[a.direccion, a.barrio].filter(Boolean).join(' · ')}
                </p>
            )}
        </div>
    );
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <section className={`border-t border-[#EEF2F9] px-5 py-3.5 first:border-t-0 ${alto}:py-4`}>
            <h3 className="mb-2.5 text-[12px] font-semibold tracking-[0.08em] text-[#6B7690] uppercase">{titulo}</h3>
            {children}
        </section>
    );
}

function BotonMover({
    etiqueta,
    desactivado,
    onClick,
    children,
}: {
    etiqueta: string;
    desactivado: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={desactivado}
            aria-label={etiqueta}
            title={etiqueta}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[13px] bg-white/85 text-[#1E3A7B] shadow-[0_1px_2px_rgba(22,34,63,0.06)] transition hover:bg-white disabled:cursor-default disabled:opacity-40"
        >
            {children}
        </button>
    );
}

const Tecla = ({ children }: { children: ReactNode }) => (
    <kbd className="rounded border border-[#E3E9F6] bg-[#F5F7FC] px-1 font-sans">{children}</kbd>
);
