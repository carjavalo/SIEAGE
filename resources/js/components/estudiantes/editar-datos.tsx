import { Desplegable, type Opcion } from '@/components/desplegable';
import { TarjetaContacto } from '@/components/ficha';
import { BotonGuardar, Campo, Interruptor, botonSecundario, claseCampo } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Acudiente, type DatosEstudiante, type Parentesco, type UltimaEdicion, fecha } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { router, useForm } from '@inertiajs/react';
import { ChevronDown, LoaderCircle, Pencil, Plus } from 'lucide-react';
import { type ComponentProps, type FormEventHandler, type ReactNode, type RefObject, useEffect, useId, useRef, useState } from 'react';
import { sileo } from 'sileo';

/**
 * Corregir desde la ficha, por bloques: un lápiz en el estudiante y en cada
 * acudiente abre un diálogo con solo esos datos. Sirve igual en la ficha
 * lateral y en la ficha completa. Quién puede: auth.puedeEditarDatos.
 */

const dialogo =
    'flex max-h-[calc(100dvh-24px)] max-w-[620px] flex-col gap-0 overflow-hidden rounded-[22px] border-[#E3E9F6] p-0 font-sans text-[#16223F] outline-none sm:rounded-[22px]';

const lista = cn(claseCampo, 'justify-between gap-2 text-left aria-expanded:border-[#6E8BD6] aria-expanded:ring-4 aria-expanded:ring-[#DCE5F8]');

const DOCUMENTOS_ESTUDIANTE: Opcion<string>[] = [
    { valor: 'R.C.', etiqueta: 'R.C.', detalle: 'Registro civil' },
    { valor: 'T.I.', etiqueta: 'T.I.', detalle: 'Tarjeta de identidad' },
    { valor: 'C.C.', etiqueta: 'C.C.', detalle: 'Cédula de ciudadanía' },
    { valor: 'C.E.', etiqueta: 'C.E.', detalle: 'Cédula de extranjería' },
    { valor: 'P.P.T.', etiqueta: 'P.P.T.', detalle: 'Permiso por protección temporal' },
    { valor: 'N.U.I.P.', etiqueta: 'N.U.I.P.', detalle: 'Número único de identificación' },
    { valor: 'N.E.S.', etiqueta: 'N.E.S.', detalle: 'Número de la Secretaría' },
    { valor: 'Otro', etiqueta: 'Otro' },
];

const DOCUMENTOS_ACUDIENTE: Opcion<string>[] = [
    { valor: 'C.C.', etiqueta: 'C.C.', detalle: 'Cédula de ciudadanía' },
    { valor: 'C.E.', etiqueta: 'C.E.', detalle: 'Cédula de extranjería' },
    { valor: 'P.P.T.', etiqueta: 'P.P.T.', detalle: 'Permiso por protección temporal' },
    { valor: 'PAS', etiqueta: 'PAS', detalle: 'Pasaporte' },
    { valor: 'N.I.T.', etiqueta: 'N.I.T.' },
];

const GENEROS: Opcion<string>[] = [
    { valor: 'F', etiqueta: 'Femenino' },
    { valor: 'M', etiqueta: 'Masculino' },
    { valor: 'O', etiqueta: 'Otro' },
];

const SANGRE: Opcion<string>[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((t) => ({ valor: t, etiqueta: t }));

const SISBEN: Opcion<string>[] = [
    { valor: 'ninguno', etiqueta: 'No tiene' },
    { valor: '1', etiqueta: 'Nivel 1' },
    { valor: '2', etiqueta: 'Nivel 2' },
    { valor: '3', etiqueta: 'Nivel 3' },
];

/** Del Excel el nombre viene en una sola pieza; del formulario de inscripción, en cuatro. */
const enPartes = (p: { primer_nombre: string | null; primer_apellido: string | null }) => p.primer_nombre !== null || p.primer_apellido !== null;

// ------------------------------------------------------------------ piezas

/** Lo que el diálogo necesita saber del formulario que lleva dentro, sin volver a pintarse. */
type Estado = { sucio: boolean; ocupado: boolean };

function useAvisar(estado: RefObject<Estado>, sucio: boolean, ocupado: boolean) {
    useEffect(() => {
        estado.current = { sucio, ocupado };
        return () => {
            estado.current = { sucio: false, ocupado: false };
        };
    }, [estado, sucio, ocupado]);
}

/**
 * El diálogo. El formulario va adentro como componente aparte: así nace limpio
 * cada vez que se abre. Con cambios sin guardar, pulsar fuera no lo cierra
 * (Esc y «Cancelar» sí); mientras guarda, no se cierra.
 *
 * Al abrir, el foco va al diálogo y no al primer campo: Radix lo enfocaría con
 * todo el texto seleccionado, y una tecla de más borraría el nombre. `enfocar`
 * señala el campo por el que sí conviene empezar (el documento, al agregar).
 */
function Marco({
    abierto,
    onCambio,
    enfocar,
    children,
}: {
    abierto: boolean;
    onCambio: (v: boolean) => void;
    enfocar?: string;
    children: (estado: RefObject<Estado>) => ReactNode;
}) {
    const estado = useRef<Estado>({ sucio: false, ocupado: false });

    return (
        <Dialog open={abierto} onOpenChange={(v) => (v || !estado.current.ocupado) && onCambio(v)}>
            <DialogContent
                className={dialogo}
                onInteractOutside={(e) => estado.current.sucio && e.preventDefault()}
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    const caja = e.currentTarget as HTMLElement;
                    ((enfocar && caja.querySelector<HTMLElement>(enfocar)) || caja).focus();
                }}
            >
                {children(estado)}
            </DialogContent>
        </Dialog>
    );
}

function Cabeza({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <DialogHeader className="shrink-0 px-6 pt-6 pr-14 pb-4">
            <DialogTitle className="text-xl font-semibold">{titulo}</DialogTitle>
            <DialogDescription className="text-[14px] leading-snug text-[#56627F]">{children}</DialogDescription>
        </DialogHeader>
    );
}

const Cuerpo = ({ children }: { children: ReactNode }) => (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-0.5 pb-5 [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]">
        {children}
    </div>
);

function Pie({
    sucio,
    ultima,
    cargando,
    desactivado,
    guardar = 'Guardar',
    onCancelar,
}: {
    sucio: boolean;
    ultima?: UltimaEdicion;
    cargando: boolean;
    desactivado?: boolean;
    guardar?: string;
    onCancelar: () => void;
}) {
    return (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#EEF2F9] px-6 py-4">
            <p className="mr-auto hidden min-w-0 items-center gap-2 text-[14px] text-[#56627F] sm:flex">
                {sucio ? (
                    <>
                        <span aria-hidden className="size-2 shrink-0 rounded-full bg-[#D99A2B]" />
                        Tienes cambios sin guardar
                    </>
                ) : (
                    ultima && (
                        <span className="truncate">
                            Última edición: {ultima.usuario ?? 'un usuario'} · {fecha(ultima.fecha)}
                        </span>
                    )
                )}
            </p>
            <button type="button" onClick={onCancelar} disabled={cargando} className={botonSecundario}>
                Cancelar
            </button>
            <BotonGuardar cargando={cargando} disabled={desactivado}>
                {guardar}
            </BotonGuardar>
        </div>
    );
}

/** El lápiz redondo que abre cada diálogo. */
function Lapiz({ etiqueta, onClick }: { etiqueta: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={etiqueta}
            title={etiqueta}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] hover:ring-[#6E8BD6] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none print:hidden"
        >
            <Pencil className="size-[15px]" />
        </button>
    );
}

const exito = (titulo: string) => (pagina: { props: unknown }) =>
    sileo.success({ title: titulo, description: (pagina.props as { flash?: { success?: string | null } }).flash?.success ?? undefined });

const revisar = () => sileo.warning({ title: 'Revisa los datos', description: 'Marcamos en rojo lo que falta o está mal.' });

/** Los otros estudiantes del acudiente: sus datos son los mismos en todas las fichas. */
function Compartido({ otros }: { otros: Acudiente['otros_estudiantes'] }) {
    const [a, b, ...mas] = otros;
    const uno = (e: (typeof otros)[number]) => (
        <>
            <b className="font-semibold text-[#16223F]">{e.nombre}</b>
            {e.grupo && ` (${e.grupo})`}
        </>
    );

    return (
        <>
            También es acudiente de {uno(a)}
            {b && (mas.length ? ', ' : ' y ')}
            {b && uno(b)}
            {mas.length > 0 && ` y ${mas.length} más`}: lo que cambies aquí vale para todos. El parentesco es solo con este estudiante.
        </>
    );
}

/** El nombre: en cuatro campos si así está guardado; si vino del Excel, en uno solo. */
function CamposNombre({
    partes,
    orden,
    unico,
    texto,
    errores,
    id,
}: {
    partes: boolean;
    orden: ('primer_nombre' | 'segundo_nombre' | 'primer_apellido' | 'segundo_apellido')[];
    unico: { etiqueta: string; ayuda?: string };
    texto: (campo: string, extra?: ComponentProps<'input'>) => ComponentProps<'input'>;
    errores: Partial<Record<string, string>>;
    id: (campo: string) => string;
}) {
    const etiquetas = {
        primer_nombre: 'Primer nombre',
        segundo_nombre: 'Segundo nombre',
        primer_apellido: 'Primer apellido',
        segundo_apellido: 'Segundo apellido',
    };

    if (!partes) {
        return (
            <div className="sm:col-span-2">
                <Campo id={id('nombre_completo')} etiqueta={unico.etiqueta} ayuda={unico.ayuda} error={errores.nombre_completo}>
                    <input {...texto('nombre_completo', { autoComplete: 'off' })} />
                </Campo>
            </div>
        );
    }

    return orden.map((c) => (
        <Campo key={c} id={id(c)} etiqueta={etiquetas[c]} opcional={c.startsWith('segundo')} error={errores[c]}>
            <input {...texto(c, { autoComplete: 'off' })} />
        </Campo>
    ));
}

/** Parentesco con el estudiante; «Otro» pide cuál. */
function CamposParentesco({
    id,
    parentescos,
    valor,
    otro,
    errores,
    onCambio,
}: {
    id: (campo: string) => string;
    parentescos: Parentesco[];
    valor: number;
    otro: string;
    errores: Partial<Record<string, string>>;
    onCambio: (cambios: { parentesco_id?: number; parentesco_otro?: string }) => void;
}) {
    const esOtro = parentescos.find((p) => p.id === valor)?.nombre === 'Otro';

    return (
        <>
            <Campo id={id('parentesco_id')} etiqueta="Parentesco" error={errores.parentesco_id}>
                <Desplegable
                    id={id('parentesco_id')}
                    etiqueta="Parentesco"
                    placeholder="Elige"
                    valor={valor}
                    opciones={parentescos.map((p) => ({ valor: p.id, etiqueta: p.nombre.replace(/^Tia\(o\)$/, 'Tía(o)') }))}
                    onCambio={(v) => onCambio({ parentesco_id: v })}
                    invalido={!!errores.parentesco_id}
                    claseBoton={lista}
                />
            </Campo>
            {esOtro && (
                <Campo id={id('parentesco_otro')} etiqueta="¿Cuál parentesco?" error={errores.parentesco_otro}>
                    <input
                        id={id('parentesco_otro')}
                        value={otro}
                        onChange={(e) => onCambio({ parentesco_otro: e.target.value })}
                        aria-invalid={!!errores.parentesco_otro}
                        placeholder="Ej. Madrina"
                        className={claseCampo}
                    />
                </Campo>
            )}
        </>
    );
}

// ------------------------------------------------------------------ estudiante

type FormEstudiante = {
    nombre_completo: string;
    primer_apellido: string;
    segundo_apellido: string;
    primer_nombre: string;
    segundo_nombre: string;
    tipo_documento: string;
    tipo_documento_otro: string;
    numero_documento: string;
    fecha_nacimiento: string;
    genero: string;
    tiene_foto: boolean;
    ciudad_expedicion: string;
    pais_nacimiento: string;
    ciudad_nacimiento: string;
    tipo_sangre: string;
    sisben: string;
    eps: string;
    grupo_etnico: string;
    discapacidad: string;
    direccion: string;
    barrio: string;
    telefono_1: string;
    telefono_2: string;
    correo: string;
};

/** Lo que casi nunca viene del Excel: va plegado si está vacío. */
const MAS_DATOS = [
    'ciudad_expedicion',
    'pais_nacimiento',
    'ciudad_nacimiento',
    'tipo_sangre',
    'sisben',
    'eps',
    'grupo_etnico',
    'discapacidad',
    'direccion',
    'barrio',
    'telefono_1',
    'telefono_2',
    'correo',
] as const;

export function EditarEstudiante({ estudiante, variante = 'lapiz' }: { estudiante: DatosEstudiante; variante?: 'lapiz' | 'boton' }) {
    const [abierto, setAbierto] = useState(false);

    return (
        <>
            {variante === 'lapiz' ? (
                <Lapiz etiqueta="Editar los datos del estudiante" onClick={() => setAbierto(true)} />
            ) : (
                <button
                    type="button"
                    onClick={() => setAbierto(true)}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                >
                    <Pencil className="size-4" />
                    Editar datos
                </button>
            )}
            <Marco abierto={abierto} onCambio={setAbierto}>
                {(estado) => <FormularioEstudiante estudiante={estudiante} estado={estado} onCerrar={() => setAbierto(false)} />}
            </Marco>
        </>
    );
}

function FormularioEstudiante({ estudiante: e, estado, onCerrar }: { estudiante: DatosEstudiante; estado: RefObject<Estado>; onCerrar: () => void }) {
    const partes = enPartes(e);
    const form = useForm<FormEstudiante>({
        nombre_completo: e.nombre_completo,
        primer_apellido: e.primer_apellido ?? '',
        segundo_apellido: e.segundo_apellido ?? '',
        primer_nombre: e.primer_nombre ?? '',
        segundo_nombre: e.segundo_nombre ?? '',
        tipo_documento: e.tipo_documento,
        tipo_documento_otro: e.tipo_documento_otro ?? '',
        numero_documento: e.numero_documento,
        fecha_nacimiento: e.fecha_nacimiento ?? '',
        genero: e.genero ?? '',
        tiene_foto: !!e.tiene_foto,
        ciudad_expedicion: e.ciudad_expedicion ?? '',
        pais_nacimiento: e.pais_nacimiento ?? '',
        ciudad_nacimiento: e.ciudad_nacimiento ?? '',
        tipo_sangre: e.tipo_sangre ?? '',
        sisben: e.sisben ?? '',
        eps: e.eps ?? '',
        grupo_etnico: e.grupo_etnico ?? '',
        discapacidad: e.discapacidad ?? '',
        direccion: e.direccion ?? '',
        barrio: e.barrio ?? '',
        telefono_1: e.telefono_1 ?? '',
        telefono_2: e.telefono_2 ?? '',
        correo: e.correo ?? '',
    });
    const errores = form.errors as Partial<Record<string, string>>;
    const d = form.data;
    const prefijo = useId();
    const id = (campo: string) => `${prefijo}-${campo}`;
    const poner = (cambios: Partial<FormEstudiante>) => form.setData((antes) => ({ ...antes, ...cambios }));
    const [masDatos, setMasDatos] = useState(() => MAS_DATOS.some((c) => !!e[c]));
    useAvisar(estado, form.isDirty, form.processing);

    const texto = (campo: string, extra: ComponentProps<'input'> = {}) => ({
        id: id(campo),
        value: d[campo as keyof FormEstudiante] as string,
        onChange: (ev: { target: { value: string } }) => poner({ [campo]: ev.target.value }),
        'aria-invalid': !!errores[campo],
        className: claseCampo,
        ...extra,
    });

    const guardar: FormEventHandler = (ev) => {
        ev.preventDefault();
        form.put(`/estudiantes/${e.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (pagina) => {
                onCerrar();
                exito('Datos del estudiante')(pagina);
            },
            onError: (fallos) => {
                if (MAS_DATOS.some((c) => c in fallos)) setMasDatos(true);
                revisar();
            },
        });
    };

    return (
        <form onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
            <Cabeza titulo="Editar estudiante">Corrige lo que haga falta. El cambio queda registrado con tu usuario.</Cabeza>

            <Cuerpo>
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                    <CamposNombre
                        partes={partes}
                        orden={['primer_apellido', 'segundo_apellido', 'primer_nombre', 'segundo_nombre']}
                        unico={{ etiqueta: 'Apellidos y nombres', ayuda: 'Como en el libro de matrícula: primero los apellidos.' }}
                        texto={texto}
                        errores={errores}
                        id={id}
                    />
                    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                        <Campo id={id('tipo_documento')} etiqueta="Documento" error={errores.tipo_documento}>
                            <Desplegable
                                id={id('tipo_documento')}
                                etiqueta="Tipo de documento"
                                valor={d.tipo_documento}
                                opciones={DOCUMENTOS_ESTUDIANTE}
                                onCambio={(v) => poner({ tipo_documento: v })}
                                invalido={!!errores.tipo_documento}
                                claseBoton={lista}
                            />
                        </Campo>
                        <Campo id={id('numero_documento')} etiqueta="Número" error={errores.numero_documento}>
                            <input {...texto('numero_documento', { inputMode: 'numeric', autoComplete: 'off' })} />
                        </Campo>
                    </div>
                    {d.tipo_documento === 'Otro' ? (
                        <Campo id={id('tipo_documento_otro')} etiqueta="¿Cuál documento?" error={errores.tipo_documento_otro}>
                            <input {...texto('tipo_documento_otro')} />
                        </Campo>
                    ) : (
                        <span className="hidden sm:block" />
                    )}
                    <Campo id={id('fecha_nacimiento')} etiqueta="Fecha de nacimiento" error={errores.fecha_nacimiento}>
                        <input {...texto('fecha_nacimiento', { type: 'date' })} />
                    </Campo>
                    <Campo id={id('genero')} etiqueta="Género" error={errores.genero}>
                        <Desplegable
                            id={id('genero')}
                            etiqueta="Género"
                            placeholder="Sin registrar"
                            valor={d.genero}
                            opciones={GENEROS}
                            onCambio={(v) => poner({ genero: v })}
                            invalido={!!errores.genero}
                            claseBoton={lista}
                        />
                    </Campo>
                    <div className="sm:col-span-2">
                        <Interruptor
                            titulo="Entregó las fotos"
                            detalle="Las fotografías que se piden con la matrícula."
                            activo={d.tiene_foto}
                            onCambio={(v) => poner({ tiene_foto: v })}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    aria-expanded={masDatos}
                    aria-controls={id('mas')}
                    onClick={() => setMasDatos((v) => !v)}
                    className="mt-5 flex w-full cursor-pointer items-center justify-between gap-3 rounded-[14px] bg-[#F5F7FC] px-4 py-3 text-left transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none"
                >
                    <span>
                        <span className="block text-[15px] font-medium">Salud, residencia y contacto</span>
                        <span className="block text-[13px] text-[#56627F]">EPS, tipo de sangre, dirección, teléfonos y lugar de nacimiento.</span>
                    </span>
                    <ChevronDown
                        aria-hidden
                        className={cn('size-5 shrink-0 text-[#56627F] transition-transform duration-200', masDatos && 'rotate-180')}
                    />
                </button>

                {masDatos && (
                    <div id={id('mas')} className="mt-4 grid gap-x-4 gap-y-4 sm:grid-cols-2">
                        <Campo id={id('eps')} etiqueta="EPS" opcional error={errores.eps}>
                            <input {...texto('eps', { placeholder: 'Ej. Emssanar' })} />
                        </Campo>
                        <Campo id={id('tipo_sangre')} etiqueta="Tipo de sangre" opcional error={errores.tipo_sangre}>
                            <Desplegable
                                id={id('tipo_sangre')}
                                etiqueta="Tipo de sangre"
                                placeholder="Sin registrar"
                                valor={d.tipo_sangre}
                                opciones={SANGRE}
                                onCambio={(v) => poner({ tipo_sangre: v })}
                                invalido={!!errores.tipo_sangre}
                                claseBoton={lista}
                            />
                        </Campo>
                        <Campo id={id('sisben')} etiqueta="SISBÉN" opcional error={errores.sisben}>
                            <Desplegable
                                id={id('sisben')}
                                etiqueta="SISBÉN"
                                placeholder="Sin registrar"
                                valor={d.sisben}
                                opciones={SISBEN}
                                onCambio={(v) => poner({ sisben: v })}
                                invalido={!!errores.sisben}
                                claseBoton={lista}
                            />
                        </Campo>
                        <Campo id={id('grupo_etnico')} etiqueta="Grupo étnico" opcional error={errores.grupo_etnico}>
                            <input {...texto('grupo_etnico', { placeholder: 'Ej. Afrocolombiano' })} />
                        </Campo>
                        <div className="sm:col-span-2">
                            <Campo id={id('discapacidad')} etiqueta="Discapacidad o condición de salud" opcional error={errores.discapacidad}>
                                <input {...texto('discapacidad', { placeholder: 'Ninguna' })} />
                            </Campo>
                        </div>
                        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_220px]">
                            <Campo id={id('direccion')} etiqueta="Dirección" error={errores.direccion}>
                                <input {...texto('direccion', { placeholder: 'Ej. Calle 73 # 7M-18', autoComplete: 'off' })} />
                            </Campo>
                            <Campo id={id('barrio')} etiqueta="Barrio" opcional error={errores.barrio}>
                                <input {...texto('barrio', { autoComplete: 'off' })} />
                            </Campo>
                        </div>
                        <Campo id={id('telefono_1')} etiqueta="Teléfono" opcional error={errores.telefono_1}>
                            <input {...texto('telefono_1', { inputMode: 'tel' })} />
                        </Campo>
                        <Campo id={id('telefono_2')} etiqueta="Otro teléfono" opcional error={errores.telefono_2}>
                            <input {...texto('telefono_2', { inputMode: 'tel' })} />
                        </Campo>
                        <div className="sm:col-span-2">
                            <Campo id={id('correo')} etiqueta="Correo" opcional error={errores.correo}>
                                <input {...texto('correo', { type: 'email' })} />
                            </Campo>
                        </div>
                        <Campo id={id('ciudad_nacimiento')} etiqueta="Nació en" opcional error={errores.ciudad_nacimiento}>
                            <input {...texto('ciudad_nacimiento', { placeholder: 'Ciudad' })} />
                        </Campo>
                        <Campo id={id('pais_nacimiento')} etiqueta="País de nacimiento" opcional error={errores.pais_nacimiento}>
                            <input {...texto('pais_nacimiento', { placeholder: 'Colombia' })} />
                        </Campo>
                        <Campo id={id('ciudad_expedicion')} etiqueta="Documento expedido en" opcional error={errores.ciudad_expedicion}>
                            <input {...texto('ciudad_expedicion', { placeholder: 'Ciudad' })} />
                        </Campo>
                    </div>
                )}
            </Cuerpo>

            <Pie sucio={form.isDirty} ultima={e.ultima_edicion} cargando={form.processing} desactivado={!form.isDirty} onCancelar={onCerrar} />
        </form>
    );
}

// ------------------------------------------------------------------ acudiente

type FormAcudiente = {
    nombre_completo: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    tipo_documento: string;
    numero_documento: string;
    parentesco_id: number;
    parentesco_otro: string;
    telefono_celular: string;
    telefono_fijo: string;
    email: string;
    direccion: string;
    barrio: string;
    es_principal: boolean;
};

type PropsAcudiente = {
    estudianteId: number;
    acudiente: Acudiente;
    /** Cuántos acudientes tiene el estudiante: el único no se puede quitar. */
    total: number;
    parentescos: Parentesco[];
};

export function EditarAcudiente(props: PropsAcudiente) {
    const [abierto, setAbierto] = useState(false);

    return (
        <>
            <Lapiz etiqueta={`Editar a ${props.acudiente.nombre}`} onClick={() => setAbierto(true)} />
            <Marco abierto={abierto} onCambio={setAbierto}>
                {(estado) => <FormularioAcudiente {...props} estado={estado} onCerrar={() => setAbierto(false)} />}
            </Marco>
        </>
    );
}

/** Los campos de contacto, iguales al editar y al agregar. */
function CamposContacto({
    texto,
    errores,
    id,
}: {
    texto: (campo: string, extra?: ComponentProps<'input'>) => ComponentProps<'input'>;
    errores: Partial<Record<string, string>>;
    id: (campo: string) => string;
}) {
    return (
        <>
            <Campo id={id('telefono_celular')} etiqueta="Celular" error={errores.telefono_celular}>
                <input {...texto('telefono_celular', { inputMode: 'tel' })} />
            </Campo>
            <Campo id={id('telefono_fijo')} etiqueta="Otro teléfono" opcional error={errores.telefono_fijo}>
                <input {...texto('telefono_fijo', { inputMode: 'tel' })} />
            </Campo>
            <div className="sm:col-span-2">
                <Campo id={id('email')} etiqueta="Correo" opcional error={errores.email}>
                    <input {...texto('email', { type: 'email' })} />
                </Campo>
            </div>
            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_220px]">
                <Campo id={id('direccion')} etiqueta="Dirección" error={errores.direccion}>
                    <input {...texto('direccion', { placeholder: 'Ej. Calle 73 # 7M-18', autoComplete: 'off' })} />
                </Campo>
                <Campo id={id('barrio')} etiqueta="Barrio" opcional error={errores.barrio}>
                    <input {...texto('barrio', { autoComplete: 'off' })} />
                </Campo>
            </div>
        </>
    );
}

function FormularioAcudiente({
    estudianteId,
    acudiente: a,
    total,
    parentescos,
    estado,
    onCerrar,
}: PropsAcudiente & { estado: RefObject<Estado>; onCerrar: () => void }) {
    const partes = enPartes(a);
    const form = useForm<FormAcudiente>({
        nombre_completo: a.nombre,
        primer_nombre: a.primer_nombre ?? '',
        segundo_nombre: a.segundo_nombre ?? '',
        primer_apellido: a.primer_apellido ?? '',
        segundo_apellido: a.segundo_apellido ?? '',
        tipo_documento: a.tipo_documento,
        numero_documento: a.numero_documento,
        parentesco_id: a.parentesco_id,
        parentesco_otro: a.parentesco_otro ?? '',
        telefono_celular: a.telefono_celular ?? '',
        telefono_fijo: a.telefono_fijo ?? '',
        email: a.email ?? '',
        direccion: a.direccion ?? '',
        barrio: a.barrio ?? '',
        es_principal: !!a.es_principal,
    });
    const errores = form.errors as Partial<Record<string, string>>;
    const d = form.data;
    const prefijo = useId();
    const id = (campo: string) => `${prefijo}-${campo}`;
    const poner = (cambios: Partial<FormAcudiente>) => form.setData((antes) => ({ ...antes, ...cambios }));
    const [confirmando, setConfirmando] = useState(false);
    const [quitando, setQuitando] = useState(false);
    useAvisar(estado, form.isDirty, form.processing || quitando);

    const texto = (campo: string, extra: ComponentProps<'input'> = {}) => ({
        id: id(campo),
        value: d[campo as keyof FormAcudiente] as string,
        onChange: (ev: { target: { value: string } }) => poner({ [campo]: ev.target.value }),
        'aria-invalid': !!errores[campo],
        className: claseCampo,
        ...extra,
    });

    const guardar: FormEventHandler = (ev) => {
        ev.preventDefault();
        form.put(`/estudiantes/${estudianteId}/acudientes/${a.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (pagina) => {
                onCerrar();
                exito('Datos del acudiente')(pagina);
            },
            onError: revisar,
        });
    };

    const quitar = () =>
        router.delete(`/estudiantes/${estudianteId}/acudientes/${a.id}`, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setQuitando(true),
            onFinish: () => setQuitando(false),
            onSuccess: (pagina) => {
                onCerrar();
                exito('Acudiente quitado')(pagina);
            },
            onError: (fallos) => sileo.warning({ title: 'No se pudo quitar', description: fallos.quitar ?? 'Inténtalo de nuevo.' }),
        });

    return (
        <form onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
            <Cabeza titulo="Editar acudiente">
                {a.otros_estudiantes.length > 0 ? (
                    <Compartido otros={a.otros_estudiantes} />
                ) : (
                    'Sus datos de contacto y su parentesco con el estudiante.'
                )}
            </Cabeza>

            <Cuerpo>
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                    <CamposNombre
                        partes={partes}
                        orden={['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']}
                        unico={{ etiqueta: 'Nombre completo' }}
                        texto={texto}
                        errores={errores}
                        id={id}
                    />
                    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                        <Campo id={id('tipo_documento')} etiqueta="Documento" error={errores.tipo_documento}>
                            <Desplegable
                                id={id('tipo_documento')}
                                etiqueta="Tipo de documento"
                                valor={d.tipo_documento}
                                opciones={DOCUMENTOS_ACUDIENTE}
                                onCambio={(v) => poner({ tipo_documento: v })}
                                invalido={!!errores.tipo_documento}
                                claseBoton={lista}
                            />
                        </Campo>
                        <Campo id={id('numero_documento')} etiqueta="Número" error={errores.numero_documento}>
                            <input {...texto('numero_documento', { inputMode: 'numeric', autoComplete: 'off' })} />
                        </Campo>
                    </div>
                    <CamposParentesco
                        id={id}
                        parentescos={parentescos}
                        valor={d.parentesco_id}
                        otro={d.parentesco_otro}
                        errores={errores}
                        onCambio={poner}
                    />
                    <CamposContacto texto={texto} errores={errores} id={id} />
                    <div className="sm:col-span-2">
                        <Interruptor
                            titulo="Acudiente principal"
                            detalle={
                                a.es_principal
                                    ? total > 1
                                        ? 'Para cambiarlo, marca como principal a otro acudiente.'
                                        : 'Es el único acudiente del estudiante.'
                                    : 'A quien se llama primero y quien firma la matrícula. El actual dejará de serlo.'
                            }
                            activo={d.es_principal}
                            desactivado={!!a.es_principal}
                            onCambio={(v) => poner({ es_principal: v })}
                        />
                    </div>
                </div>

                {total > 1 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[14px] bg-[#F5F7FC] px-4 py-3 text-[14px]">
                        {confirmando ? (
                            <>
                                <p>
                                    ¿Quitar a <b className="font-semibold">{a.nombre}</b> como acudiente de este estudiante?
                                </p>
                                <div className="flex shrink-0 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmando(false)}
                                        disabled={quitando}
                                        className="flex h-9 cursor-pointer items-center rounded-full px-3.5 font-medium text-[#56627F] transition hover:bg-white hover:text-[#16223F]"
                                    >
                                        No
                                    </button>
                                    <button
                                        type="button"
                                        onClick={quitar}
                                        disabled={quitando}
                                        className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-[#A12B2B] px-4 font-semibold text-white transition hover:bg-[#8E2323] disabled:cursor-default disabled:opacity-60"
                                    >
                                        {quitando && <LoaderCircle className="size-4 animate-spin" />}
                                        Sí, quitar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-[#56627F]">¿Ya no es su acudiente?</p>
                                <button
                                    type="button"
                                    onClick={() => setConfirmando(true)}
                                    className="-my-0.5 flex h-7 cursor-pointer items-center rounded-full font-semibold text-[#A12B2B] underline-offset-4 hover:underline focus-visible:ring-4 focus-visible:ring-[#F6D5D2] focus-visible:outline-none"
                                >
                                    Quitar de este estudiante
                                </button>
                            </>
                        )}
                    </div>
                )}
            </Cuerpo>

            <Pie
                sucio={form.isDirty}
                ultima={a.ultima_edicion}
                cargando={form.processing}
                desactivado={!form.isDirty || quitando}
                onCancelar={onCerrar}
            />
        </form>
    );
}

// ------------------------------------------------------------------ agregar acudiente

/** Lo que responde /acudientes/buscar cuando el documento ya está registrado. */
type Existente = {
    id: number;
    nombre: string;
    tipo_documento: string;
    numero_documento: string;
    telefono: string | null;
    estudiantes: Acudiente['otros_estudiantes'];
    ya_vinculado: boolean;
};

const xsrf = () => decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '');

type PropsAgregar = { estudianteId: number; parentescos: Parentesco[]; primero: boolean };

export function AgregarAcudiente(props: PropsAgregar) {
    const [abierto, setAbierto] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setAbierto(true)}
                className="-my-1.5 flex h-7 cursor-pointer items-center gap-1 rounded-full px-1 text-[13px] font-semibold text-[#1E3A7B] underline-offset-4 hover:underline focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none print:hidden"
            >
                <Plus className="size-3.5" strokeWidth={2.5} />
                Agregar
            </button>
            <Marco abierto={abierto} onCambio={setAbierto} enfocar="[data-primero]">
                {(estado) => <FormularioAgregar {...props} estado={estado} onCerrar={() => setAbierto(false)} />}
            </Marco>
        </>
    );
}

function FormularioAgregar({
    estudianteId,
    parentescos,
    primero,
    estado,
    onCerrar,
}: PropsAgregar & { estado: RefObject<Estado>; onCerrar: () => void }) {
    const form = useForm<FormAcudiente>({
        nombre_completo: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        tipo_documento: 'C.C.',
        numero_documento: '',
        parentesco_id: 0,
        parentesco_otro: '',
        telefono_celular: '',
        telefono_fijo: '',
        email: '',
        direccion: '',
        barrio: '',
        es_principal: primero,
    });
    const errores = form.errors as Partial<Record<string, string>>;
    const d = form.data;
    const prefijo = useId();
    const id = (campo: string) => `${prefijo}-${campo}`;
    const poner = (cambios: Partial<FormAcudiente>) => form.setData((antes) => ({ ...antes, ...cambios }));
    useAvisar(estado, form.isDirty, form.processing);

    // ¿Ese documento ya está registrado? Pasa con los hermanos: se vincula a la misma persona.
    const documento = d.numero_documento.replace(/[\s.]/g, '');
    const [hallado, setHallado] = useState<{ documento: string; acudiente: Existente | null } | null>(null);
    useEffect(() => {
        if (documento.length < 5) return;
        const control = new AbortController();
        const espera = setTimeout(async () => {
            let acudiente: Existente | null = null;
            try {
                const r = await fetch('/acudientes/buscar', {
                    method: 'POST',
                    signal: control.signal,
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': xsrf(),
                    },
                    body: JSON.stringify({ documento, estudiante: estudianteId }),
                });
                if (r.ok) acudiente = ((await r.json()) as { acudiente: Existente | null }).acudiente;
            } catch {
                // Sin red: se sigue como si fuera nuevo; el servidor vuelve a revisar el documento al guardar.
            }
            if (!control.signal.aborted) setHallado({ documento, acudiente });
        }, 350);
        return () => {
            clearTimeout(espera);
            control.abort();
        };
    }, [documento, estudianteId]);
    const buscando = documento.length >= 5 && hallado?.documento !== documento;
    const existente = hallado?.documento === documento ? hallado.acudiente : null;

    const texto = (campo: string, extra: ComponentProps<'input'> = {}) => ({
        id: id(campo),
        value: d[campo as keyof FormAcudiente] as string,
        onChange: (ev: { target: { value: string } }) => poner({ [campo]: ev.target.value }),
        'aria-invalid': !!errores[campo],
        className: claseCampo,
        ...extra,
    });

    const guardar: FormEventHandler = (ev) => {
        ev.preventDefault();
        // De quien ya está registrado solo viajan el parentesco y si es el principal.
        form.transform((datos) =>
            existente
                ? {
                      acudiente_id: existente.id,
                      parentesco_id: datos.parentesco_id,
                      parentesco_otro: datos.parentesco_otro,
                      es_principal: datos.es_principal,
                  }
                : datos,
        );
        form.post(`/estudiantes/${estudianteId}/acudientes`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (pagina) => {
                onCerrar();
                exito('Acudiente agregado')(pagina);
            },
            onError: revisar,
        });
    };

    return (
        <form onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
            <Cabeza titulo="Agregar acudiente">
                Empieza por el documento: si ya está registrado (por un hermano, por ejemplo), no hay que volver a escribir sus datos.
            </Cabeza>

            <Cuerpo>
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                        <Campo id={id('tipo_documento')} etiqueta="Documento" error={errores.tipo_documento}>
                            <Desplegable
                                id={id('tipo_documento')}
                                etiqueta="Tipo de documento"
                                valor={d.tipo_documento}
                                opciones={DOCUMENTOS_ACUDIENTE}
                                onCambio={(v) => poner({ tipo_documento: v })}
                                desactivado={!!existente}
                                invalido={!!errores.tipo_documento}
                                claseBoton={lista}
                            />
                        </Campo>
                        <Campo id={id('numero_documento')} etiqueta="Número" error={errores.numero_documento}>
                            <div className="relative">
                                <input
                                    {...texto('numero_documento', {
                                        inputMode: 'numeric',
                                        autoComplete: 'off',
                                        'data-primero': '',
                                    } as ComponentProps<'input'>)}
                                />
                                {buscando && (
                                    <LoaderCircle
                                        aria-label="Buscando"
                                        className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-[#5B7BD0]"
                                    />
                                )}
                            </div>
                        </Campo>
                    </div>
                    <CamposParentesco
                        id={id}
                        parentescos={parentescos}
                        valor={d.parentesco_id}
                        otro={d.parentesco_otro}
                        errores={errores}
                        onCambio={poner}
                    />

                    {existente ? (
                        <div className="sm:col-span-2" aria-live="polite">
                            <p className="mb-1.5 text-[13px] font-medium text-[#3E4A68]">
                                {existente.ya_vinculado
                                    ? 'Ya es acudiente de este estudiante'
                                    : 'Ya está registrado: se agrega con los datos que tiene'}
                            </p>
                            <TarjetaContacto
                                nombre={existente.nombre}
                                detalle={[
                                    `${existente.tipo_documento} ${existente.numero_documento}`,
                                    existente.estudiantes.length > 0 &&
                                        `acudiente de ${existente.estudiantes
                                            .slice(0, 2)
                                            .map((e) => e.nombre + (e.grupo ? ` (${e.grupo})` : ''))
                                            .join(' y ')}${existente.estudiantes.length > 2 ? ` y ${existente.estudiantes.length - 2} más` : ''}`,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                                celular={existente.telefono}
                            />
                        </div>
                    ) : (
                        <>
                            <CamposNombre
                                partes
                                orden={['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']}
                                unico={{ etiqueta: 'Nombre completo' }}
                                texto={texto}
                                errores={errores}
                                id={id}
                            />
                            <CamposContacto texto={texto} errores={errores} id={id} />
                        </>
                    )}

                    {!existente?.ya_vinculado && (
                        <div className="sm:col-span-2">
                            <Interruptor
                                titulo="Acudiente principal"
                                detalle={
                                    primero
                                        ? 'Es el primero que se le registra: queda como principal.'
                                        : 'A quien se llama primero y quien firma la matrícula. El actual dejará de serlo.'
                                }
                                activo={d.es_principal}
                                desactivado={primero}
                                onCambio={(v) => poner({ es_principal: v })}
                            />
                        </div>
                    )}
                </div>
            </Cuerpo>

            <Pie
                sucio={form.isDirty}
                cargando={form.processing}
                desactivado={!form.isDirty || buscando || !!existente?.ya_vinculado}
                guardar={existente ? 'Agregar a este estudiante' : 'Agregar acudiente'}
                onCancelar={onCerrar}
            />
        </form>
    );
}
