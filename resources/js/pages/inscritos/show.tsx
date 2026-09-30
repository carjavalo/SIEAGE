import { Desplegable } from '@/components/desplegable';
import { ConDescripcion, describir } from '@/components/formulario';
import { EncabezadoInscrito } from '@/components/inscritos/encabezado';
import { BloquesSolicitud } from '@/components/inscritos/ficha-inscrito';
import { Pasos } from '@/components/inscritos/pasos';
import PanelLayout from '@/layouts/panel-layout';
import {
    type DatosPadre,
    type FichaInscrito,
    PADRE_VACIO,
    type PadreGuardado,
    type Rol,
    type Situacion,
    type Solicitud,
    documentosListos,
    hace,
    nombreInscrito,
    padresListos,
    parentescoAcudiente,
} from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { type ChangeEvent, type FormEventHandler, Fragment, type ReactNode, useState } from 'react';
import { sileo } from 'sileo';

const ROLES: { clave: Rol; titulo: string; parentesco: string; acudiente: string; fallecido: string; desconocido: string }[] = [
    { clave: 'madre', titulo: 'Madre', parentesco: 'Madre', acudiente: 'Es la acudiente', fallecido: 'Fallecida', desconocido: 'No registra' },
    { clave: 'padre', titulo: 'Padre', parentesco: 'Padre', acudiente: 'Es el acudiente', fallecido: 'Fallecido', desconocido: 'No registra' },
];

const TIPOS_DOCUMENTO = [
    { valor: 'C.C.', etiqueta: 'C.C.', detalle: 'Cédula de ciudadanía' },
    { valor: 'C.E.', etiqueta: 'C.E.', detalle: 'Cédula de extranjería' },
    { valor: 'P.P.T.', etiqueta: 'P.P.T.', detalle: 'Permiso por protección temporal' },
    { valor: 'PAS', etiqueta: 'PAS', detalle: 'Pasaporte' },
    { valor: 'Otro', etiqueta: 'Otro' },
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

/** Con quien vive el estudiante: si la madre o el padre es el acudiente, su dirección suele ser esta. */
const direccionDeLaFamilia = (s: Solicitud) => ({
    direccion: s.acudiente_direccion ?? s.direccion ?? '',
    barrio: s.acudiente_barrio ?? s.barrio ?? '',
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
    if (s.acudiente_parentesco === rol.parentesco) return { ...PADRE_VACIO, ...datosDelAcudiente(s), ...direccionDeLaFamilia(s), es_acudiente: true };
    return { ...PADRE_VACIO };
}

const tarjeta = 'rounded-[28px] bg-[#F2F5FA]';

const campoClase =
    'h-11 w-full rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-3.5 text-[15px] text-[#16223F] outline-none transition placeholder:text-[#6B7690] hover:border-[#B7C6EA] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] disabled:cursor-default disabled:border-[#E3E9F6] disabled:bg-[#F5F7FC] disabled:text-[#3E4A68] aria-invalid:border-[#E0897D]';

function Campo({
    id,
    etiqueta,
    error,
    opcional,
    children,
}: {
    id: string;
    etiqueta: string;
    error?: string;
    opcional?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={id} className="flex justify-between text-[13px] font-medium text-[#3E4A68]">
                {etiqueta}
                {opcional && <span className="font-normal text-[#6B7690]">Opcional</span>}
            </label>
            <ConDescripcion id={id} descripcion={describir(id, error)}>
                {children}
            </ConDescripcion>
            {error && (
                <span id={`${id}-error`} className="text-[13px] text-[#B42318]">
                    {error}
                </span>
            )}
        </div>
    );
}

/** Revisión de un inscrito y registro de los datos de la madre y el padre. */
export default function Inscrito({ solicitud: s, padres, documentos, matricula }: FichaInscrito) {
    const form = useForm<Record<Rol, DatosPadre>>({
        madre: inicial(ROLES[0], s, padres.madre),
        padre: inicial(ROLES[1], s, padres.padre),
    });
    const errores = form.errors as Record<string, string>;
    const nombre = nombreInscrito(s);
    const ambosConDatos = form.data.madre.situacion === 'registrado' && form.data.padre.situacion === 'registrado';
    // "Viven juntos": el padre toma la dirección de la madre y la sigue mientras esté marcada.
    const [vivenJuntos, setVivenJuntos] = useState(
        () =>
            !!padres.madre?.direccion &&
            padres.madre.direccion === padres.padre?.direccion &&
            (padres.madre.barrio ?? '') === (padres.padre?.barrio ?? ''),
    );
    const juntos = vivenJuntos && ambosConDatos;

    const marcarJuntos = (si: boolean) => {
        setVivenJuntos(si);
        if (si) form.setData('padre', { ...form.data.padre, direccion: form.data.madre.direccion, barrio: form.data.madre.barrio });
    };
    // Mientras esté pendiente, guardar lleva al segundo paso: los documentos.
    const pendiente = s.estado === 'pendiente';

    const cambiar = (rol: Rol, cambios: Partial<DatosPadre>) => {
        const deDireccion = 'direccion' in cambios || 'barrio' in cambios;
        if (rol === 'madre' && juntos && deDireccion) {
            // Viven juntos: lo que se escribe en la madre queda también en el padre.
            form.setData((d) => ({ ...d, madre: { ...d.madre, ...cambios }, padre: { ...d.padre, ...cambios } }));
        } else form.setData(rol, { ...form.data[rol], ...cambios });
    };

    const marcarAcudiente = (rol: Rol, si: boolean) => {
        const otro: Rol = rol === 'madre' ? 'padre' : 'madre';
        form.setData((d) => ({
            ...d,
            [rol]: si
                ? {
                      ...d[rol],
                      ...datosDelAcudiente(s),
                      // La dirección se sugiere (la de la residencia) solo si aún no tiene una.
                      ...(d[rol].direccion ? {} : direccionDeLaFamilia(s)),
                      es_acudiente: true,
                  }
                : { ...d[rol], es_acudiente: false },
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
                sileo.success({
                    title: 'Madre y padre guardados',
                    description: pendiente ? 'Ahora marca los documentos que trajo.' : 'Los datos quedaron actualizados.',
                });
            },
            onError: () => sileo.warning({ title: 'Revisa los datos', description: 'Marcamos en rojo lo que falta o está mal.' }),
        });
    };

    return (
        <PanelLayout titulo={`Inscrito · ${nombre}`}>
            <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/inscritos"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/75 pr-3 pl-2 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" />
                        Inscritos
                    </Link>
                    <Pasos
                        solicitudId={s.id}
                        actual={1}
                        padresListos={padresListos(padres)}
                        documentosListos={documentosListos(documentos)}
                        matriculado={!!matricula}
                    />
                </div>

                <EncabezadoInscrito solicitud={s} matricula={matricula} />

                <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <form onSubmit={guardar} className="flex min-w-0 flex-col gap-4">
                        <div>
                            <h2 className="text-[20px] font-semibold tracking-[-0.015em]">Madre y padre</h2>
                            <p className="mt-1 text-[14px] text-[#56627F]">
                                El acudiente es {parentescoAcudiente(s).toLowerCase()} del estudiante. Si la madre o el padre son el acudiente, marca
                                la casilla y sus datos se copian solos.
                            </p>
                        </div>

                        {ROLES.map((rol) => {
                            const d = form.data[rol.clave];
                            const err = (c: keyof DatosPadre) => errores[`${rol.clave}.${c}`];
                            const id = (c: keyof DatosPadre) => `${rol.clave}-${c}`;
                            const bloqueado = d.es_acudiente;
                            const texto = (c: keyof DatosPadre, extra: Record<string, unknown> = {}) => ({
                                id: id(c),
                                value: d[c] as string,
                                onChange: (e: ChangeEvent<HTMLInputElement>) => cambiar(rol.clave, { [c]: e.target.value }),
                                'aria-invalid': !!err(c),
                                className: campoClase,
                                ...extra,
                            });

                            return (
                                <Fragment key={rol.clave}>
                                    {rol.clave === 'padre' && ambosConDatos && (
                                        <label
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 rounded-[16px] border-[1.5px] px-4 py-3 transition',
                                                juntos ? 'border-[#6E8BD6] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={juntos}
                                                onChange={(e) => marcarJuntos(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <span
                                                aria-hidden
                                                className={cn(
                                                    'flex size-5 shrink-0 items-center justify-center rounded-[6px] transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#DCE5F8]',
                                                    juntos ? 'bg-[#1E3A7B] text-white' : 'border-[1.5px] border-[#B7C6EA] bg-white',
                                                )}
                                            >
                                                {juntos && <Check className="size-3.5" strokeWidth={3} />}
                                            </span>
                                            <span className="text-[15px]">
                                                <span className="font-medium">Viven juntos</span>
                                                <span className="block text-[13px] text-[#56627F]">
                                                    {juntos
                                                        ? 'El padre queda con la misma dirección de la madre.'
                                                        : 'Marca si la madre y el padre comparten la dirección.'}
                                                </span>
                                            </span>
                                        </label>
                                    )}
                                    <section aria-labelledby={`titulo-${rol.clave}`} className={cn(tarjeta, 'p-5 md:p-6')}>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <h3 id={`titulo-${rol.clave}`} className="text-[18px] font-semibold tracking-[-0.01em]">
                                                {rol.titulo}
                                            </h3>
                                            <div
                                                role="radiogroup"
                                                aria-label={`Situación de ${rol.titulo.toLowerCase()}`}
                                                className="flex gap-0.5 rounded-[11px] bg-[#F1F4FA] p-[3px]"
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
                                                            'flex h-[30px] cursor-pointer items-center rounded-[9px] px-2.5 text-sm font-medium whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none',
                                                            d.situacion === valor
                                                                ? 'bg-white text-[#1E3A7B] shadow-[0_1px_3px_rgba(22,34,63,0.12)]'
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
                                                {/* Casilla propia: el input real queda oculto pero sigue siendo el que recibe el foco y el teclado. */}
                                                <label
                                                    className={cn(
                                                        'mt-4 flex cursor-pointer items-center gap-3 rounded-[16px] border-[1.5px] px-4 py-3 transition',
                                                        d.es_acudiente ? 'border-[#6E8BD6] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={d.es_acudiente}
                                                        onChange={(e) => marcarAcudiente(rol.clave, e.target.checked)}
                                                        className="peer sr-only"
                                                    />
                                                    <span
                                                        aria-hidden
                                                        className={cn(
                                                            'flex size-5 shrink-0 items-center justify-center rounded-[6px] transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#DCE5F8]',
                                                            d.es_acudiente ? 'bg-[#1E3A7B] text-white' : 'border-[1.5px] border-[#B7C6EA] bg-white',
                                                        )}
                                                    >
                                                        {d.es_acudiente && <Check className="size-3.5" strokeWidth={3} />}
                                                    </span>
                                                    <span className="text-[15px]">
                                                        <span className="font-medium">{rol.acudiente}</span>
                                                        <span className="block text-[13px] text-[#56627F]">
                                                            {d.es_acudiente
                                                                ? 'Datos copiados del acudiente. Desmarca para editarlos.'
                                                                : `${s.acudiente_primer_nombre} ${s.acudiente_primer_apellido} · ${parentescoAcudiente(s)}`}
                                                        </span>
                                                    </span>
                                                </label>

                                                <div className="mt-4 grid gap-x-4 gap-y-4 sm:grid-cols-2">
                                                    <Campo id={id('primer_nombre')} etiqueta="Primer nombre" error={err('primer_nombre')}>
                                                        <input {...texto('primer_nombre', { disabled: bloqueado, autoComplete: 'off' })} />
                                                    </Campo>
                                                    <Campo id={id('segundo_nombre')} etiqueta="Segundo nombre" opcional error={err('segundo_nombre')}>
                                                        <input {...texto('segundo_nombre', { disabled: bloqueado, autoComplete: 'off' })} />
                                                    </Campo>
                                                    <Campo id={id('primer_apellido')} etiqueta="Primer apellido" error={err('primer_apellido')}>
                                                        <input {...texto('primer_apellido', { disabled: bloqueado, autoComplete: 'off' })} />
                                                    </Campo>
                                                    <Campo
                                                        id={id('segundo_apellido')}
                                                        etiqueta="Segundo apellido"
                                                        opcional
                                                        error={err('segundo_apellido')}
                                                    >
                                                        <input {...texto('segundo_apellido', { disabled: bloqueado, autoComplete: 'off' })} />
                                                    </Campo>
                                                    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                                                        <Campo id={id('tipo_documento')} etiqueta="Documento" error={err('tipo_documento')}>
                                                            <Desplegable
                                                                id={id('tipo_documento')}
                                                                etiqueta="Tipo de documento"
                                                                placeholder="Tipo"
                                                                valor={d.tipo_documento}
                                                                opciones={TIPOS_DOCUMENTO}
                                                                onCambio={(v) => cambiar(rol.clave, { tipo_documento: v })}
                                                                desactivado={bloqueado}
                                                                invalido={!!err('tipo_documento')}
                                                                claseBoton={cn(
                                                                    campoClase,
                                                                    'justify-between gap-2 text-left aria-expanded:border-[#6E8BD6] aria-expanded:ring-4 aria-expanded:ring-[#DCE5F8]',
                                                                )}
                                                            />
                                                        </Campo>
                                                        <Campo id={id('numero_documento')} etiqueta="Número" error={err('numero_documento')}>
                                                            <input {...texto('numero_documento', { disabled: bloqueado, inputMode: 'numeric' })} />
                                                        </Campo>
                                                    </div>
                                                    <Campo
                                                        id={id('fecha_nacimiento')}
                                                        etiqueta="Fecha de nacimiento"
                                                        opcional
                                                        error={err('fecha_nacimiento')}
                                                    >
                                                        <input {...texto('fecha_nacimiento', { disabled: bloqueado, type: 'date' })} />
                                                    </Campo>
                                                    <Campo id={id('telefono')} etiqueta="Teléfono" error={err('telefono')}>
                                                        <input {...texto('telefono', { disabled: bloqueado, inputMode: 'tel' })} />
                                                    </Campo>
                                                    <Campo id={id('correo')} etiqueta="Correo" opcional error={err('correo')}>
                                                        <input {...texto('correo', { disabled: bloqueado, type: 'email' })} />
                                                    </Campo>
                                                    <Campo id={id('ocupacion')} etiqueta="Ocupación" opcional error={err('ocupacion')}>
                                                        <input {...texto('ocupacion', { placeholder: 'Ej. Comerciante' })} />
                                                    </Campo>
                                                    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_220px]">
                                                        <Campo id={id('direccion')} etiqueta="Dirección" error={err('direccion')}>
                                                            <input
                                                                {...texto('direccion', {
                                                                    disabled: rol.clave === 'padre' && juntos,
                                                                    placeholder: 'Ej. Calle 73 # 7M-18',
                                                                    autoComplete: 'off',
                                                                })}
                                                            />
                                                        </Campo>
                                                        <Campo id={id('barrio')} etiqueta="Barrio" opcional error={err('barrio')}>
                                                            <input
                                                                {...texto('barrio', {
                                                                    disabled: rol.clave === 'padre' && juntos,
                                                                    autoComplete: 'off',
                                                                })}
                                                            />
                                                        </Campo>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="mt-4 rounded-[16px] bg-[#F5F7FC] px-4 py-3 text-[14px] text-[#56627F]">
                                                Se registrará como «{d.situacion === 'fallecido' ? rol.fallecido : rol.desconocido}», sin nombre ni
                                                documento.
                                            </p>
                                        )}
                                    </section>
                                </Fragment>
                            );
                        })}

                        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-[18px] border border-[#E3E9F6] bg-white/90 p-2.5 pl-4 backdrop-blur">
                            <span className="mr-auto flex items-center gap-2 text-[14px] text-[#56627F]">
                                <span aria-hidden className={cn('size-2 rounded-full', form.isDirty ? 'bg-[#D99A2B]' : 'bg-[#3BA67A]')} />
                                {form.isDirty ? 'Tienes cambios sin guardar' : 'Todo guardado'}
                            </span>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex h-11 cursor-pointer items-center gap-2 rounded-[13px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.99] disabled:cursor-default disabled:opacity-70"
                            >
                                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                                {pendiente ? 'Guardar y seguir a documentos' : 'Guardar madre y padre'}
                                {pendiente && !form.processing && <ArrowRight className="size-[18px]" />}
                            </button>
                        </div>
                    </form>

                    {/* Lo que llenó la familia en el formulario, con los mismos bloques de la ficha lateral. */}
                    <aside className={cn(tarjeta, 'overflow-hidden xl:sticky xl:top-[85px] xl:self-start')}>
                        <div className="border-b border-[#EEF2F9] px-5 py-3.5">
                            <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Lo que llenó la familia</h2>
                            <p className="text-[13px] text-[#56627F]">Formulario de inscripción · {hace(s.enviada).toLowerCase()}</p>
                        </div>
                        <BloquesSolicitud solicitud={s} />
                    </aside>
                </div>
            </div>
        </PanelLayout>
    );
}
