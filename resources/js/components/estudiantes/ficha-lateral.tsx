import { Condicion, Estado, Sede, iniciales } from '@/components/estudiantes/etiquetas';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { FileText, LoaderCircle, Mail, MapPin, MousePointerClick, Phone, X } from 'lucide-react';
import { type ReactNode } from 'react';

/** Los mismos datos que usa la página de ficha completa (EstudianteController::ficha). */
export type Matricula = {
    id: number;
    anio: number;
    grado_id: number;
    grado: string;
    grado_numero: number;
    grupo: string | null;
    sede: string;
    sede_codigo: string;
    jornada: string | null;
    modalidad: string | null;
    fecha_matricula: string | null;
    condicion: string;
    estado: string;
    es_historico: number;
    observaciones: string | null;
    fecha_retiro: string | null;
    motivo_retiro: string | null;
};

export type Acudiente = {
    nombre: string;
    tipo_documento: string;
    numero_documento: string;
    parentesco: string;
    direccion: string | null;
    barrio: string | null;
    telefono_fijo: string | null;
    telefono_celular: string | null;
    email: string | null;
    es_principal: number;
};

export type FichaDetalle = {
    estudiante: {
        id: number;
        tipo_documento: string;
        numero_documento: string;
        nombre_completo: string;
        fecha_nacimiento: string | null;
        genero: 'F' | 'M' | 'O' | null;
    };
    actual: Matricula | null;
    historia: Matricula[];
    acudientes: Acudiente[];
    boletines: { numero: number; valor: string }[];
};

function fecha(valor: string | null) {
    if (!valor) return null;
    return new Date(`${valor}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function edad(valor: string | null) {
    if (!valor) return null;
    const nacimiento = new Date(`${valor}T00:00:00`);
    const hoy = new Date();
    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())) anios--;
    return anios;
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <section className="border-t border-[#EEF2F9] px-5 py-4">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-[#8C97B3] uppercase">{titulo}</h3>
            {children}
        </section>
    );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-[#8C97B3]">{etiqueta}</dt>
            <dd className="mt-0.5 truncate text-sm font-medium">{children || '—'}</dd>
        </div>
    );
}

type Props = {
    ficha: FichaDetalle | null;
    /** Se está trayendo la ficha de otro estudiante: la actual se atenúa. */
    cargando: boolean;
    /** En pantallas medianas la ficha es un panel flotante que se puede cerrar. */
    onCerrar?: () => void;
};

/** Resumen del estudiante seleccionado, al lado de la lista, sin salir de la página. */
export function FichaLateral({ ficha, cargando, onCerrar }: Props) {
    if (!ficha) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-16 text-center">
                {cargando ? (
                    <LoaderCircle className="size-6 animate-spin text-[#8C97B3]" />
                ) : (
                    <>
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EEF2FB] text-[#5B7BD0]">
                            <MousePointerClick className="size-5" />
                        </span>
                        <p className="text-[15px] font-semibold">Selecciona un estudiante</p>
                        <p className="text-sm leading-relaxed text-[#56627F]">
                            Su ficha aparece aquí, sin salir de la lista. Con las flechas <kbd className="font-sans">↑</kbd>{' '}
                            <kbd className="font-sans">↓</kbd> recorres la lista.
                        </p>
                    </>
                )}
            </div>
        );
    }

    const { estudiante, actual, historia, acudientes } = ficha;
    const anios = edad(estudiante.fecha_nacimiento);

    return (
        <div className={cn('flex min-h-0 flex-1 flex-col transition-opacity duration-150', cargando && 'opacity-60')} aria-busy={cargando}>
            {/* Encabezado */}
            <div className="relative bg-gradient-to-br from-[#EEF2FB] to-[#DCE5F8] px-5 pt-5 pb-4">
                <div className="flex items-start gap-3.5 pr-8">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#1E3A7B] text-base font-semibold text-white">
                        {iniciales(estudiante.nombre_completo)}
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-[17px] leading-snug font-semibold tracking-[-0.01em]">{estudiante.nombre_completo}</h2>
                        <p className="mt-0.5 text-[13px] text-[#3E4A68]">
                            {estudiante.tipo_documento} {estudiante.numero_documento}
                            {anios !== null && ` · ${anios} años`}
                        </p>
                    </div>
                </div>
                {actual && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-[#1E3A7B]">
                            {actual.grupo ?? actual.grado} · {actual.anio}
                        </span>
                        <Condicion valor={actual.condicion} />
                        <Estado valor={actual.estado} />
                    </div>
                )}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                    {cargando && <LoaderCircle className="size-4 animate-spin text-[#5B7BD0]" aria-label="Cargando ficha" />}
                    {onCerrar && (
                        <button
                            type="button"
                            onClick={onCerrar}
                            aria-label="Cerrar ficha"
                            className="rounded-full p-1.5 text-[#56627F] transition hover:bg-white/70 hover:text-[#16223F]"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
                <div className="px-5 py-3">
                    <Link
                        href={`/estudiantes/${estudiante.id}`}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D3DDF3] text-sm font-semibold text-[#1E3A7B] transition hover:border-[#1E3A7B] hover:bg-[#F5F7FC]"
                    >
                        <FileText className="size-4" />
                        Ficha completa e impresión
                    </Link>
                </div>

                {actual && (
                    <Bloque titulo={`Matrícula ${actual.anio}`}>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <Dato etiqueta="Grado">{actual.grado}</Dato>
                            <Dato etiqueta="Grupo">{actual.grupo}</Dato>
                            <Dato etiqueta="Sede">
                                <Sede codigo={actual.sede_codigo} nombre={actual.sede} />
                            </Dato>
                            <Dato etiqueta="Jornada">{actual.jornada}</Dato>
                            {actual.modalidad && <Dato etiqueta="Modalidad">{actual.modalidad}</Dato>}
                            <Dato etiqueta="Matriculado">{fecha(actual.fecha_matricula)}</Dato>
                            <Dato etiqueta="Nacimiento">{fecha(estudiante.fecha_nacimiento)}</Dato>
                        </dl>
                        {actual.estado !== 'activo' && (actual.fecha_retiro || actual.motivo_retiro) && (
                            <p className="mt-3 rounded-xl bg-[#FDECEC] px-3 py-2 text-[13px] text-[#A12B2B]">
                                Retiro {fecha(actual.fecha_retiro) ?? ''}
                                {actual.motivo_retiro && ` · ${actual.motivo_retiro}`}
                            </p>
                        )}
                    </Bloque>
                )}

                <Bloque titulo={acudientes.length > 1 ? 'Acudientes' : 'Acudiente'}>
                    {acudientes.length === 0 && <p className="text-sm text-[#8C97B3]">Sin registrar</p>}
                    <div className="space-y-3.5">
                        {acudientes.map((a) => (
                            <div key={a.numero_documento} className="space-y-1.5">
                                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                    {a.nombre}
                                    <span className="rounded-full bg-[#F1F2F6] px-2 py-0.5 text-[11px] font-medium text-[#4E566B]">{a.parentesco}</span>
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                                    {[a.telefono_celular, a.telefono_fijo].filter(Boolean).map((t) => (
                                        <a key={t} href={`tel:${t}`} className="flex items-center gap-1.5 font-medium text-[#1E3A7B] hover:underline">
                                            <Phone className="size-3.5" />
                                            {t}
                                        </a>
                                    ))}
                                    {a.email && (
                                        <a href={`mailto:${a.email}`} className="flex min-w-0 items-center gap-1.5 text-[#1E3A7B] hover:underline">
                                            <Mail className="size-3.5 shrink-0" />
                                            <span className="truncate">{a.email}</span>
                                        </a>
                                    )}
                                </div>
                                {(a.direccion || a.barrio) && (
                                    <p className="flex items-start gap-1.5 text-[13px] text-[#56627F]">
                                        <MapPin className="mt-0.5 size-3.5 shrink-0" />
                                        {[a.direccion, a.barrio].filter(Boolean).join(' · ')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </Bloque>

                {historia.length > 0 && (
                    <Bloque titulo="Historia en el colegio">
                        <ol className="space-y-1.5">
                            {historia.map((m) => (
                                <li key={m.id} className="flex items-center gap-3 text-[13px]">
                                    <span className="w-9 shrink-0 font-semibold tabular-nums">{m.anio}</span>
                                    <span className="min-w-0 flex-1 truncate">
                                        {m.grupo ?? m.grado}
                                        {m.condicion === 'repitente' && <span className="text-[#8A5A0B]"> · repitió</span>}
                                    </span>
                                    <Sede codigo={m.sede_codigo} />
                                    <span
                                        title={m.estado}
                                        className={cn('size-2 shrink-0 rounded-full', m.estado === 'activo' ? 'bg-[#3BA67A]' : 'bg-[#D05454]')}
                                    />
                                </li>
                            ))}
                        </ol>
                    </Bloque>
                )}

                {actual?.observaciones && (
                    <Bloque titulo="Observaciones">
                        <p className="text-[13px] leading-relaxed whitespace-pre-line text-[#3E4A68]">{actual.observaciones}</p>
                    </Bloque>
                )}
            </div>
        </div>
    );
}
