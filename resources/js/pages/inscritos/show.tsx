import { iniciales } from '@/components/estudiantes/etiquetas';
import PanelLayout from '@/layouts/panel-layout';
import { type DatosPadre, PADRE_VACIO, type Situacion, hace, nombreInscrito } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, HeartPulse, Home, LoaderCircle, UserRound, Users } from 'lucide-react';
import { type FormEventHandler, type ReactNode } from 'react';
import { sileo } from 'sileo';

type Solicitud = {
    id: number;
    estado: string;
    enviada: string;
    grado: string;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    sexo: 'F' | 'M';
    fecha_nacimiento: string;
    pais_nacimiento: string;
    ciudad_nacimiento: string;
    tipo_documento: string;
    tipo_documento_otro: string | null;
    numero_documento: string;
    ciudad_expedicion: string;
    tipo_sangre: string;
    sisben: string;
    eps: string;
    grupo_etnico: string;
    discapacidad: string | null;
    direccion: string;
    barrio: string;
    telefono_1: string;
    telefono_2: string;
    correo: string;
    acudiente_primer_nombre: string;
    acudiente_segundo_nombre: string | null;
    acudiente_primer_apellido: string;
    acudiente_segundo_apellido: string | null;
    acudiente_fecha_nacimiento: string;
    acudiente_numero_documento: string;
    acudiente_ciudad_expedicion: string;
    acudiente_parentesco: string;
    acudiente_parentesco_otro: string | null;
    acudiente_telefono_1: string;
    acudiente_telefono_2: string;
    acudiente_correo: string | null;
};

type Rol = 'madre' | 'padre';
type PadreGuardado = { [K in keyof DatosPadre]: DatosPadre[K] | null };

type Props = { solicitud: Solicitud; padres: Partial<Record<Rol, PadreGuardado>> };

const ROLES: { clave: Rol; titulo: string; parentesco: string; acudiente: string; fallecido: string; desconocido: string }[] = [
    { clave: 'madre', titulo: 'Madre', parentesco: 'Madre', acudiente: 'Es la acudiente', fallecido: 'Fallecida', desconocido: 'No registra' },
    { clave: 'padre', titulo: 'Padre', parentesco: 'Padre', acudiente: 'Es el acudiente', fallecido: 'Fallecido', desconocido: 'No registra' },
];

/** Los datos del acudiente, en la forma de un padre: se duplican a propósito. */
const datosDelAcudiente = (s: Solicitud): Partial<DatosPadre> => ({
    primer_nombre: s.acudiente_primer_nombre,
    segundo_nombre: s.acudiente_segundo_nombre ?? '',
    primer_apellido: s.acudiente_primer_apellido,
    segundo_apellido: s.acudiente_segundo_apellido ?? '',
    tipo_documento: 'C.C.',
    numero_documento: s.acudiente_numero_documento,
    fecha_nacimiento: s.acudiente_fecha_nacimiento ?? '',
    telefono: s.acudiente_telefono_1,
    correo: s.acudiente_correo ?? '',
});

/** Lo guardado; si no hay nada y el acudiente es esta persona, ya viene con sus datos. */
function inicial(rol: (typeof ROLES)[number], s: Solicitud, guardado?: PadreGuardado): DatosPadre {
    if (guardado) {
        const limpio = Object.fromEntries(Object.entries(guardado).map(([k, v]) => [k, v ?? ''])) as Record<string, unknown>;
        return {
            ...PADRE_VACIO,
            ...(limpio as Partial<DatosPadre>),
            es_acudiente: !!guardado.es_acudiente,
            situacion: guardado.situacion ?? 'registrado',
        };
    }
    if (s.acudiente_parentesco === rol.parentesco) return { ...PADRE_VACIO, ...datosDelAcudiente(s), es_acudiente: true };
    return { ...PADRE_VACIO };
}

const fecha = (v: string | null) =>
    v ? new Date(`${v}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const campoClase =
    'h-11 w-full rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-3.5 text-[15px] text-[#16223F] outline-none transition placeholder:text-[#8C97B3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] disabled:border-[#E3E9F6] disabled:bg-[#F5F7FC] disabled:text-[#3E4A68] aria-invalid:border-[#E0897D]';

function Campo({ etiqueta, error, children, opcional }: { etiqueta: string; error?: string; children: ReactNode; opcional?: boolean }) {
    return (
        <label className="flex min-w-0 flex-col gap-1.5">
            <span className="flex justify-between text-[13px] font-medium text-[#3E4A68]">
                {etiqueta}
                {opcional && <span className="font-normal text-[#8C97B3]">Opcional</span>}
            </span>
            {children}
            {error && <span className="text-[13px] text-[#B42318]">{error}</span>}
        </label>
    );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-[#56627F]">{etiqueta}</dt>
            <dd className="mt-0.5 text-[14px] font-medium break-words">{children || '—'}</dd>
        </div>
    );
}

function Resumen({ titulo, icono, children }: { titulo: string; icono: ReactNode; children: ReactNode }) {
    return (
        <section className="rounded-[18px] border border-[#E3E9F6] bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1E3A7B]">
                {icono}
                {titulo}
            </h2>
            <dl className="grid grid-cols-2 gap-x-5 gap-y-3.5">{children}</dl>
        </section>
    );
}

/** Revisión de un inscrito y registro de los datos de la madre y el padre. */
export default function Inscrito({ solicitud: s, padres }: Props) {
    const form = useForm<Record<Rol, DatosPadre>>({
        madre: inicial(ROLES[0], s, padres.madre),
        padre: inicial(ROLES[1], s, padres.padre),
    });
    const errores = form.errors as Record<string, string>;
    const nombre = nombreInscrito(s);

    const cambiar = (rol: Rol, cambios: Partial<DatosPadre>) => form.setData(rol, { ...form.data[rol], ...cambios });

    const marcarAcudiente = (rol: Rol, si: boolean) => {
        const otro: Rol = rol === 'madre' ? 'padre' : 'madre';
        form.setData((d) => ({
            ...d,
            [rol]: si ? { ...d[rol], ...datosDelAcudiente(s), es_acudiente: true } : { ...d[rol], es_acudiente: false },
            // Solo uno de los dos puede ser el acudiente.
            ...(si && d[otro].es_acudiente ? { [otro]: { ...d[otro], es_acudiente: false } } : {}),
        }));
    };

    const guardar: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(`/inscritos/${s.id}/padres`, {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults();
                sileo.success({ title: 'Datos guardados', description: 'La madre y el padre quedaron registrados.' });
            },
            onError: () => sileo.warning({ title: 'Revisa los datos', description: 'Marcamos en rojo lo que falta o está mal.' }),
        });
    };

    return (
        <PanelLayout titulo={`Inscrito · ${nombre}`}>
            <Link href="/inscritos" className="inline-flex items-center gap-2 text-sm font-medium text-[#56627F] hover:text-[#1E3A7B]">
                <ArrowLeft className="size-4" />
                Inscritos
            </Link>

            <div className="mt-4 flex flex-col gap-5 rounded-[20px] bg-gradient-to-br from-[#EEF2FB] to-[#DCE5F8] p-6 sm:flex-row sm:items-center">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#1E3A7B] text-xl font-semibold text-white">
                    {iniciales(nombre)}
                </span>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{nombre}</h1>
                    <p className="mt-1 text-sm text-[#3E4A68] tabular-nums">
                        {s.tipo_documento === 'Otro' ? s.tipo_documento_otro : s.tipo_documento} {s.numero_documento} · Ingresa a {s.grado}
                    </p>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#1E3A7B] capitalize">{s.estado}</span>
                    <span className="text-xs text-[#56627F]">Enviada {hace(s.enviada).toLowerCase()}</span>
                </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
                {/* Datos de los padres */}
                <form onSubmit={guardar} className="flex flex-col gap-5">
                    <div>
                        <h2 className="text-xl font-semibold">Madre y padre</h2>
                        <p className="mt-1 text-sm text-[#56627F]">
                            El acudiente es{' '}
                            {s.acudiente_parentesco === 'Otro'
                                ? (s.acudiente_parentesco_otro ?? 'otro familiar')
                                : s.acudiente_parentesco.toLowerCase()}{' '}
                            del estudiante. Si la madre o el padre son el acudiente, marca la casilla y sus datos se copian solos.
                        </p>
                    </div>

                    {ROLES.map((rol) => {
                        const d = form.data[rol.clave];
                        const err = (c: keyof DatosPadre) => errores[`${rol.clave}.${c}`];
                        const bloqueado = d.es_acudiente;
                        const texto = (c: keyof DatosPadre, extra: Record<string, unknown> = {}) => ({
                            value: d[c] as string,
                            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => cambiar(rol.clave, { [c]: e.target.value }),
                            'aria-invalid': !!err(c),
                            className: campoClase,
                            ...extra,
                        });

                        return (
                            <section
                                key={rol.clave}
                                aria-labelledby={`titulo-${rol.clave}`}
                                className="rounded-[18px] border border-[#E3E9F6] bg-white p-5 md:p-6"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 id={`titulo-${rol.clave}`} className="text-lg font-semibold">
                                        {rol.titulo}
                                    </h3>
                                    <div
                                        role="radiogroup"
                                        aria-label={`Situación de ${rol.titulo.toLowerCase()}`}
                                        className="flex gap-1 rounded-[12px] bg-[#EEF2FB] p-1"
                                    >
                                        {(
                                            [
                                                ['registrado', 'Con datos'],
                                                ['fallecido', rol.fallecido],
                                                ['desconocido', rol.desconocido],
                                            ] as [Situacion, string][]
                                        ).map(([valor, etiqueta]) => (
                                            <button
                                                key={valor}
                                                type="button"
                                                role="radio"
                                                aria-checked={d.situacion === valor}
                                                onClick={() =>
                                                    cambiar(rol.clave, {
                                                        situacion: valor,
                                                        ...(valor !== 'registrado' ? { es_acudiente: false } : {}),
                                                    })
                                                }
                                                className={cn(
                                                    'rounded-[9px] px-3 py-1.5 text-[13px] font-medium transition',
                                                    d.situacion === valor
                                                        ? 'bg-white text-[#1E3A7B] shadow-sm'
                                                        : 'text-[#56627F] hover:text-[#16223F]',
                                                )}
                                            >
                                                {etiqueta}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {d.situacion === 'registrado' ? (
                                    <>
                                        <label
                                            className={cn(
                                                'mt-4 flex cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] px-4 py-3 transition',
                                                d.es_acudiente ? 'border-[#6E8BD6] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={d.es_acudiente}
                                                onChange={(e) => marcarAcudiente(rol.clave, e.target.checked)}
                                                className="size-[18px] accent-[#1E3A7B]"
                                            />
                                            <span className="text-[15px]">
                                                <span className="font-medium">{rol.acudiente}</span>
                                                <span className="block text-[13px] text-[#56627F]">
                                                    {d.es_acudiente
                                                        ? 'Datos copiados del acudiente. Desmarca para editarlos.'
                                                        : `${s.acudiente_primer_nombre} ${s.acudiente_primer_apellido} · ${s.acudiente_parentesco}`}
                                                </span>
                                            </span>
                                        </label>

                                        <div className="mt-4 grid gap-x-4 gap-y-4 sm:grid-cols-2">
                                            <Campo etiqueta="Primer nombre" error={err('primer_nombre')}>
                                                <input {...texto('primer_nombre', { disabled: bloqueado, autoComplete: 'off' })} />
                                            </Campo>
                                            <Campo etiqueta="Segundo nombre" opcional error={err('segundo_nombre')}>
                                                <input {...texto('segundo_nombre', { disabled: bloqueado, autoComplete: 'off' })} />
                                            </Campo>
                                            <Campo etiqueta="Primer apellido" error={err('primer_apellido')}>
                                                <input {...texto('primer_apellido', { disabled: bloqueado, autoComplete: 'off' })} />
                                            </Campo>
                                            <Campo etiqueta="Segundo apellido" opcional error={err('segundo_apellido')}>
                                                <input {...texto('segundo_apellido', { disabled: bloqueado, autoComplete: 'off' })} />
                                            </Campo>
                                            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                                                <Campo etiqueta="Documento" error={err('tipo_documento')}>
                                                    <select {...texto('tipo_documento', { disabled: bloqueado })}>
                                                        <option value="">—</option>
                                                        {['C.C.', 'C.E.', 'P.P.T.', 'PAS', 'Otro'].map((t) => (
                                                            <option key={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </Campo>
                                                <Campo etiqueta="Número" error={err('numero_documento')}>
                                                    <input {...texto('numero_documento', { disabled: bloqueado, inputMode: 'numeric' })} />
                                                </Campo>
                                            </div>
                                            <Campo etiqueta="Fecha de nacimiento" opcional error={err('fecha_nacimiento')}>
                                                <input {...texto('fecha_nacimiento', { disabled: bloqueado, type: 'date' })} />
                                            </Campo>
                                            <Campo etiqueta="Teléfono" error={err('telefono')}>
                                                <input {...texto('telefono', { disabled: bloqueado, inputMode: 'tel' })} />
                                            </Campo>
                                            <Campo etiqueta="Correo" opcional error={err('correo')}>
                                                <input {...texto('correo', { disabled: bloqueado, type: 'email' })} />
                                            </Campo>
                                            <Campo etiqueta="Ocupación" opcional error={err('ocupacion')}>
                                                <input {...texto('ocupacion', { placeholder: 'Ej. Comerciante' })} />
                                            </Campo>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mt-4 rounded-[14px] bg-[#F5F7FC] px-4 py-3 text-sm text-[#56627F]">
                                        Se registrará como «{d.situacion === 'fallecido' ? rol.fallecido : rol.desconocido}», sin nombre ni documento.
                                    </p>
                                )}
                            </section>
                        );
                    })}

                    <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-[16px] border border-[#E3E9F6] bg-white/90 p-3 shadow-[0_12px_32px_-16px_rgba(22,34,63,0.35)] backdrop-blur">
                        {form.isDirty && <span className="mr-auto pl-2 text-sm text-[#56627F]">Tienes cambios sin guardar.</span>}
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex h-11 items-center gap-2 rounded-[14px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#172E63] disabled:opacity-70"
                        >
                            {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                            Guardar madre y padre
                        </button>
                    </div>
                </form>

                {/* Lo que llenó la familia en el formulario */}
                <aside className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
                    <Resumen titulo="Acudiente" icono={<Users className="size-4" />}>
                        <div className="col-span-2">
                            <Dato etiqueta={s.acudiente_parentesco === 'Otro' ? (s.acudiente_parentesco_otro ?? 'Otro') : s.acudiente_parentesco}>
                                {[s.acudiente_primer_nombre, s.acudiente_segundo_nombre, s.acudiente_primer_apellido, s.acudiente_segundo_apellido]
                                    .filter(Boolean)
                                    .join(' ')}
                            </Dato>
                        </div>
                        <Dato etiqueta="Documento">{s.acudiente_numero_documento}</Dato>
                        <Dato etiqueta="Expedido en">{s.acudiente_ciudad_expedicion}</Dato>
                        <Dato etiqueta="Teléfonos">
                            {s.acudiente_telefono_1}
                            {s.acudiente_telefono_2 && s.acudiente_telefono_2 !== s.acudiente_telefono_1 ? ` · ${s.acudiente_telefono_2}` : ''}
                        </Dato>
                        <Dato etiqueta="Correo">{s.acudiente_correo}</Dato>
                    </Resumen>

                    <Resumen titulo="Estudiante" icono={<UserRound className="size-4" />}>
                        <Dato etiqueta="Nacimiento">{fecha(s.fecha_nacimiento)}</Dato>
                        <Dato etiqueta="Sexo">{s.sexo === 'F' ? 'Femenino' : 'Masculino'}</Dato>
                        <Dato etiqueta="Nació en">
                            {s.ciudad_nacimiento}, {s.pais_nacimiento}
                        </Dato>
                        <Dato etiqueta="Documento expedido en">{s.ciudad_expedicion}</Dato>
                    </Resumen>

                    <Resumen titulo="Salud" icono={<HeartPulse className="size-4" />}>
                        <Dato etiqueta="EPS">{s.eps}</Dato>
                        <Dato etiqueta="Tipo de sangre">{s.tipo_sangre}</Dato>
                        <Dato etiqueta="SISBÉN">{s.sisben === 'ninguno' ? 'No tiene' : `Nivel ${s.sisben}`}</Dato>
                        <Dato etiqueta="Grupo étnico">{s.grupo_etnico}</Dato>
                        <div className="col-span-2">
                            <Dato etiqueta="Discapacidad">{s.discapacidad || 'Ninguna'}</Dato>
                        </div>
                    </Resumen>

                    <Resumen titulo="Residencia" icono={<Home className="size-4" />}>
                        <div className="col-span-2">
                            <Dato etiqueta="Dirección">
                                {s.direccion} · {s.barrio}
                            </Dato>
                        </div>
                        <Dato etiqueta="Teléfonos">
                            {s.telefono_1}
                            {s.telefono_2 && s.telefono_2 !== s.telefono_1 ? ` · ${s.telefono_2}` : ''}
                        </Dato>
                        <Dato etiqueta="Correo">{s.correo}</Dato>
                    </Resumen>
                </aside>
            </div>
        </PanelLayout>
    );
}
