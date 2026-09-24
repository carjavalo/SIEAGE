import { Marca, PuntoSede, iniciales, sedeInfo, textoSituacion } from '@/components/estudiantes/etiquetas';
import { Bloque, ContenidoFicha, PanelFicha, Sep, TarjetaContacto } from '@/components/ficha';
import { type FichaDetalle, edad, fecha } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { CircleAlert, FileText, StickyNote } from 'lucide-react';
import { type RefObject } from 'react';

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

/** Ficha del estudiante elegido, al lado de la lista. */
export function FichaEstudiante({ ficha, abierta, panel, ...resto }: Props) {
    return (
        <PanelFicha abierta={abierta} panel={panel} etiqueta="Ficha del estudiante">
            {ficha && <Contenido ficha={ficha} {...resto} />}
        </PanelFicha>
    );
}

function Contenido({ ficha, ...resto }: Omit<Props, 'ficha' | 'abierta' | 'panel'> & { ficha: FichaDetalle }) {
    const { estudiante: e, actual: m, historia, acudientes } = ficha;
    const anios = edad(e.fecha_nacimiento);
    const retirado = m && m.estado !== 'activo';
    // La sede solo se repite en la historia si el estudiante ha pasado por más de una.
    const variasSedes = new Set(historia.map((h) => h.sede_codigo)).size > 1;

    return (
        <ContenidoFicha
            {...resto}
            iniciales={iniciales(e.nombre_completo)}
            titulo={e.nombre_completo}
            detalle={
                <>
                    {e.tipo_documento} {e.numero_documento}
                    {anios !== null && ` · ${anios} años`}
                </>
            }
            marcas={
                m && (
                    <>
                        <span className="font-semibold text-[#1E3A7B] tabular-nums">
                            {m.grupo ?? m.grado} · {m.anio}
                        </span>
                        <Marca valor={m.condicion} />
                        <Marca valor={m.estado} />
                    </>
                )
            }
            accion={{ href: `/estudiantes/${e.id}`, texto: 'Ficha completa e impresión', icono: FileText }}
        >
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
                                    <TarjetaContacto
                                        key={`${a.numero_documento}-${a.parentesco}`}
                                        nombre={a.nombre}
                                        detalle={`${a.parentesco} · ${a.tipo_documento} ${a.numero_documento}`}
                                        insignia={a.es_principal ? 'Principal' : undefined}
                                        celular={a.telefono_celular}
                                        fijo={a.telefono_fijo}
                                        correo={a.email}
                                        direccion={[a.direccion, a.barrio].filter(Boolean).join(' · ') || null}
                                    />
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
        </ContenidoFicha>
    );
}
