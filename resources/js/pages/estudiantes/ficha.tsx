import { Condicion, Estado, Sede, iniciales } from '@/components/estudiantes/etiquetas';
import PanelLayout from '@/layouts/panel-layout';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Camera, Home, Mail, MessageSquareText, Phone, Printer, ShieldCheck } from 'lucide-react';
import { type ReactNode } from 'react';

type Estudiante = {
    id: number;
    tipo_documento: string;
    numero_documento: string;
    nombre_completo: string;
    fecha_nacimiento: string | null;
    genero: 'F' | 'M' | 'O' | null;
    tiene_foto: number;
};
type Matricula = {
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
type Acudiente = {
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
type Institucion = { nombre: string; nit: string | null; codigo_dane: string | null; resolucion: string | null; municipio: string | null };

type Props = {
    estudiante: Estudiante;
    actual: Matricula | null;
    historia: Matricula[];
    acudientes: Acudiente[];
    boletines: { numero: number; valor: string }[];
    institucion: Institucion | null;
};

const generos = { F: 'Femenino', M: 'Masculino', O: 'Otro' };

function fecha(valor: string | null) {
    if (!valor) return '—';
    return new Date(`${valor}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function edad(valor: string | null) {
    if (!valor) return null;
    const nacimiento = new Date(`${valor}T00:00:00`);
    const hoy = new Date();
    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())) anios--;
    return anios;
}

function Tarjeta({ titulo, icono, children, className }: { titulo: string; icono?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section
            className={cn(
                'rounded-2xl border border-[#E3E9F6] bg-white p-5 print:break-inside-avoid print:rounded-none print:border-[#9AA6C2] print:p-3',
                className,
            )}
        >
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-[#1E3A7B] uppercase print:mb-2 print:text-xs">
                {icono}
                {titulo}
            </h2>
            {children}
        </section>
    );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-[#56627F]">{etiqueta}</dt>
            <dd className="mt-0.5 truncate font-medium print:whitespace-normal">{children || '—'}</dd>
        </div>
    );
}

export default function Ficha({ estudiante, actual, historia, acudientes, boletines, institucion }: Props) {
    const anios = edad(estudiante.fecha_nacimiento);
    const cronologia = [...historia].reverse();
    const principal = acudientes.find((a) => a.es_principal) ?? acudientes[0];
    const volver = actual ? `/estudiantes?anio=${actual.anio}&grado=${actual.grado_id}` : '/estudiantes';

    return (
        <PanelLayout titulo={`Ficha · ${estudiante.nombre_completo}`}>
            {/* Encabezado institucional (solo impresión) */}
            <div className="mb-4 hidden items-center gap-4 border-b-2 border-[#1E3A7B] pb-3 print:flex">
                <img src="/sieage-logo.webp" alt="" className="h-16 w-auto" />
                <div className="flex-1 text-center text-xs leading-snug">
                    <p className="text-sm font-bold uppercase">{institucion?.nombre}</p>
                    <p>{institucion?.resolucion}</p>
                    <p>
                        NIT {institucion?.nit} · DANE {institucion?.codigo_dane}
                    </p>
                </div>
                <div className="text-right text-xs">
                    <p className="font-bold">CONSTANCIA DE MATRÍCULA</p>
                    <p>Año lectivo {actual?.anio}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <Link href={volver} className="flex items-center gap-2 text-sm font-medium text-[#56627F] hover:text-[#1E3A7B]">
                    <ArrowLeft className="size-4" />
                    {actual ? `${actual.grado} · ${actual.grupo ?? 'sin grupo'}` : 'Estudiantes'}
                </Link>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex h-10 items-center gap-2 rounded-xl bg-[#1E3A7B] px-4 text-sm font-semibold text-white transition hover:bg-[#172E63]"
                >
                    <Printer className="size-4" />
                    Imprimir ficha
                </button>
            </div>

            {/* Resumen del estudiante */}
            <div className="mt-4 flex flex-col gap-5 rounded-2xl bg-gradient-to-br from-[#EEF2FB] to-[#DCE5F8] p-6 sm:flex-row sm:items-center print:mt-0 print:rounded-none print:bg-none print:p-0 print:pb-3">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#1E3A7B] text-xl font-semibold text-white print:hidden">
                    {iniciales(estudiante.nombre_completo)}
                </span>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl print:text-xl">{estudiante.nombre_completo}</h1>
                    <p className="mt-1 text-sm text-[#3E4A68]">
                        {estudiante.tipo_documento} {estudiante.numero_documento}
                        {anios !== null && ` · ${anios} años`}
                    </p>
                </div>
                {actual && (
                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#1E3A7B]">
                            {actual.grupo ?? actual.grado} · {actual.anio}
                        </span>
                        <Condicion valor={actual.condicion} />
                        <Estado valor={actual.estado} />
                    </div>
                )}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3 print:mt-3 print:grid-cols-1 print:gap-3">
                <div className="space-y-5 lg:col-span-2 print:space-y-3">
                    <Tarjeta titulo={`Matrícula ${actual?.anio ?? ''}`} icono={<ShieldCheck className="size-4 print:hidden" />}>
                        {actual ? (
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 print:grid-cols-4 print:gap-y-2">
                                <Dato etiqueta="Grado">{actual.grado}</Dato>
                                <Dato etiqueta="Grupo">{actual.grupo}</Dato>
                                <Dato etiqueta="Sede">{actual.sede}</Dato>
                                <Dato etiqueta="Jornada">{actual.jornada}</Dato>
                                <Dato etiqueta="Modalidad">{actual.modalidad}</Dato>
                                <Dato etiqueta="Fecha de matrícula">{fecha(actual.fecha_matricula)}</Dato>
                                <Dato etiqueta="Condición">
                                    <span className="capitalize">{actual.condicion}</span>
                                </Dato>
                                <Dato etiqueta="Estado">
                                    <span className="capitalize">{actual.estado}</span>
                                </Dato>
                                {actual.fecha_retiro && <Dato etiqueta="Fecha de retiro">{fecha(actual.fecha_retiro)}</Dato>}
                                {actual.motivo_retiro && <Dato etiqueta="Motivo de retiro">{actual.motivo_retiro}</Dato>}
                            </dl>
                        ) : (
                            <p className="text-sm text-[#56627F]">El estudiante no tiene matrículas registradas.</p>
                        )}
                    </Tarjeta>

                    <Tarjeta titulo="Datos del acudiente" icono={<Home className="size-4 print:hidden" />}>
                        {acudientes.length === 0 ? (
                            <p className="text-sm text-[#56627F]">No hay acudiente registrado.</p>
                        ) : (
                            <div className="space-y-4">
                                {acudientes.map((a) => (
                                    <div key={a.numero_documento} className="grid gap-x-6 gap-y-4 sm:grid-cols-3 print:grid-cols-4 print:gap-y-2">
                                        <div className="sm:col-span-2 print:col-span-2">
                                            <p className="text-xs text-[#56627F]">
                                                {a.parentesco}
                                                {a.es_principal ? ' · principal' : ''}
                                            </p>
                                            <p className="mt-0.5 font-medium">{a.nombre}</p>
                                            <p className="text-sm text-[#3E4A68]">
                                                {a.tipo_documento} {a.numero_documento}
                                            </p>
                                        </div>
                                        <Dato etiqueta="Dirección">
                                            {a.direccion}
                                            {a.barrio ? ` · ${a.barrio}` : ''}
                                        </Dato>
                                        <div className="flex flex-wrap gap-2 sm:col-span-3 print:col-span-1 print:block">
                                            {[a.telefono_celular, a.telefono_fijo].filter(Boolean).map((t) => (
                                                <a
                                                    key={t}
                                                    href={`tel:${t!.replace(/\s/g, '')}`}
                                                    className="flex items-center gap-1.5 rounded-lg bg-[#EEF2FB] px-3 py-1.5 text-sm font-medium text-[#1E3A7B] hover:bg-[#DCE5F8] print:bg-transparent print:p-0 print:font-normal print:text-inherit"
                                                >
                                                    <Phone className="size-3.5 print:hidden" />
                                                    {t}
                                                </a>
                                            ))}
                                            {a.email && (
                                                <a
                                                    href={`mailto:${a.email}`}
                                                    className="flex items-center gap-1.5 rounded-lg bg-[#EEF2FB] px-3 py-1.5 text-sm font-medium text-[#1E3A7B] hover:bg-[#DCE5F8]"
                                                >
                                                    <Mail className="size-3.5" />
                                                    {a.email}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tarjeta>

                    <Tarjeta titulo="Precedentes años escolares">
                        {cronologia.length === 0 ? (
                            <p className="text-sm text-[#56627F]">Sin historial.</p>
                        ) : (
                            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-6">
                                {cronologia.map((m) => (
                                    <li
                                        key={m.id}
                                        className={cn(
                                            'rounded-xl border p-3 print:rounded-none print:p-1.5',
                                            m.id === actual?.id ? 'border-[#1E3A7B] bg-[#EEF2FB]' : 'border-[#E3E9F6]',
                                        )}
                                    >
                                        <p className="text-xs text-[#56627F] tabular-nums">{m.anio}</p>
                                        <p className="text-lg leading-tight font-semibold print:text-sm">{m.grupo ?? m.grado}</p>
                                        <div className="mt-1.5 print:hidden">
                                            <Sede codigo={m.sede_codigo} nombre={m.sede} />
                                        </div>
                                        <p className="hidden text-[10px] print:block">{m.sede}</p>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Tarjeta>
                </div>

                <div className="space-y-5 print:grid print:grid-cols-2 print:gap-3 print:space-y-0">
                    <Tarjeta titulo="Datos personales">
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-1 print:gap-y-2">
                            <Dato etiqueta="Fecha de nacimiento">{fecha(estudiante.fecha_nacimiento)}</Dato>
                            <Dato etiqueta="Edad">{anios !== null ? `${anios} años` : null}</Dato>
                            <Dato etiqueta="Género">{estudiante.genero ? generos[estudiante.genero] : null}</Dato>
                            <Dato etiqueta="Fotos">
                                <span className="inline-flex items-center gap-1.5">
                                    <Camera className="size-3.5 text-[#56627F] print:hidden" />
                                    {estudiante.tiene_foto ? 'Entregó fotos' : 'Pendiente'}
                                </span>
                            </Dato>
                        </dl>
                    </Tarjeta>

                    <Tarjeta titulo="Entrega de boletines">
                        {boletines.length === 0 ? (
                            <p className="text-sm text-[#56627F]">Sin registro de entregas en el Excel.</p>
                        ) : (
                            <ul className="grid grid-cols-5 gap-2">
                                {boletines.map((b) => (
                                    <li
                                        key={b.numero}
                                        title={b.valor}
                                        className={cn(
                                            'flex flex-col items-center rounded-lg py-2 text-xs',
                                            b.valor === 'S' ? 'bg-[#E3F4EC] text-[#1C6B4A]' : 'bg-[#F1F2F6] text-[#4E566B]',
                                        )}
                                    >
                                        <span className="font-semibold">{b.numero}º</span>
                                        <span>{b.valor === 'S' ? 'Sí' : b.valor === 'NO APLICA' ? 'N/A' : b.valor}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Tarjeta>

                    <Tarjeta titulo="Observaciones" icono={<MessageSquareText className="size-4 print:hidden" />}>
                        <p className="text-sm whitespace-pre-line text-[#3E4A68]">{actual?.observaciones?.trim() || 'Sin observaciones.'}</p>
                    </Tarjeta>
                </div>
            </div>

            {/* Compromiso y firmas (solo impresión) */}
            <div className="mt-4 hidden text-xs print:block">
                <p className="text-justify">
                    Al firmar esta ficha de matrícula se compromete a ser parte de las estrategias educativas que se implementan en la ley 2025 de
                    2020, asistir a todas las reuniones de entrega de informe y atender el llamado de los docentes.
                </p>
                <div className="mt-14 grid grid-cols-2 gap-16 text-center">
                    <div className="border-t border-black pt-1">
                        <p className="font-medium">{principal?.nombre}</p>
                        <p>Firma del acudiente</p>
                    </div>
                    <div className="border-t border-black pt-1">
                        <p>&nbsp;</p>
                        <p>Firma registro académico</p>
                    </div>
                </div>
            </div>
        </PanelLayout>
    );
}
