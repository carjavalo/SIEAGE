import {
    BotonPrincipal,
    BotonSecundario,
    Buscador,
    CampoArea,
    CampoTexto,
    Opciones,
    type OpcionVisual,
    Seccion,
} from '@/components/inscripcion/controles';
import { BarraMovil, PanelLateral } from '@/components/inscripcion/progreso';
import {
    type Campo,
    CAMPOS_COMPARTIDOS_ENTRE_HERMANOS,
    DATOS_VACIOS,
    type DatosInscripcion,
    type Errores,
    etiquetaDe,
    etiquetaParentesco,
    fechaLarga,
    type Grado,
    GRUPOS_ETNICOS,
    NIVELES_SISBEN,
    nombreCompleto,
    PAISES,
    pasoDelCampo,
    PASOS,
    SEXOS,
    TIPOS_DOCUMENTO,
    TIPOS_SANGRE,
    validarPaso,
} from '@/lib/inscripcion';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Clock, HeartPulse, IdCard, Pencil, UserPlus } from 'lucide-react';
import { type FormEvent, type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
    anioLectivo: number;
    grados: Grado[];
    parentescos: string[];
    barrios: string[];
    /** Hora de apertura cifrada por el servidor: ver InscripcionController::esRobot(). */
    sello: string;
};

const BIENVENIDA = -1;
const REVISION = PASOS.length - 1;
const ENVIADO = PASOS.length;

/** "3001234567" -> "300 123 4567"; "3852436" -> "385 2436". */
function telefono(t: string) {
    if (t.length === 10) return `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}`;
    if (t.length === 7) return `${t.slice(0, 3)} ${t.slice(3)}`;
    return t;
}

function hoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sinMovimiento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Lleva el foco al primer campo con error, en el orden en que aparecen en pantalla. */
function enfocarPrimerError(errs: Errores) {
    const claves = Object.keys(errs);
    if (!claves.length) return;
    const campo = PASOS[pasoDelCampo(claves[0])].campos.find((c) => errs[c]);
    const elemento = campo && document.getElementById(campo);
    if (!elemento) return;
    elemento.focus({ preventScroll: true });
    elemento.scrollIntoView({ behavior: sinMovimiento() ? 'auto' : 'smooth', block: 'center' });
}

/** Un envío que no llegó a validarse: se cayó la red (estado 0) o el servidor respondió 419, 429, 500… */
class EnvioFallido extends Error {
    constructor(public estado: number) {
        super(`envío fallido (${estado || 'sin respuesta'})`);
    }
}

/** Qué decirle a la familia según por qué falló el envío. En todos los casos lo escrito se conserva. */
function mensajeDeError(e: unknown) {
    if (!(e instanceof EnvioFallido)) return { title: 'Hay datos por corregir', description: 'Te llevamos al primero.' };
    if (e.estado === 429)
        return { title: 'Hay muchos envíos en este momento', description: 'Espera un minuto y vuelve a enviar. Tus datos siguen aquí.' };
    if (e.estado === 419) return { title: 'La página estuvo abierta mucho tiempo', description: 'Vuelve a enviar. Tus datos siguen aquí.' };
    return { title: 'No pudimos enviarla', description: 'Revisa tu conexión y vuelve a enviar. Tus datos siguen aquí.' };
}

/** Los campos de texto del formulario (todos menos la casilla de autorización). */
type CampoDeTexto = { [K in Campo]: DatosInscripcion[K] extends string ? K : never }[Campo];

/** Sileo, cuando haga falta (ver `aviso` en la página). */
const avisos = () => import('sileo').then((m) => m.sileo);

export default function Inscripcion({ anioLectivo, grados, parentescos, barrios, sello }: Props) {
    const form = useForm<DatosInscripcion>({ ...DATOS_VACIOS, sello });
    const { data, errors, processing } = form;

    const [paso, setPaso] = useState(BIENVENIDA);
    const [alcanzado, setAlcanzado] = useState(0);
    const [hacia, setHacia] = useState<'adelante' | 'atras'>('adelante');
    const [enviado, setEnviado] = useState<{ estudiante: string; telefono: string; correo: string } | null>(null);

    const titulo = useRef<HTMLHeadingElement>(null);
    const erroresPorEnfocar = useRef<Errores | null>(null);
    const montado = useRef(false);
    // Los avisos (Sileo) no van en la carga de esta página, la primera que ven las
    // familias: se piden al mostrarlos (app.tsx ya los está trayendo). Por eso el
    // id del aviso abierto es una promesa.
    const aviso = useRef<Promise<string> | null>(null);
    const enviando = useRef(false);

    /** Retira el toast de "faltan datos" en cuanto deja de ser cierto. */
    const quitarAviso = () => {
        aviso.current?.then((id) => avisos().then((s) => s.dismiss(id)));
        aviso.current = null;
    };

    const opcionesGrado = useMemo<OpcionVisual[]>(
        () => grados.map((g) => ({ valor: String(g.id), etiqueta: g.nombre, detalle: g.numero === 0 ? 'Preescolar' : `${g.numero}º` })),
        [grados],
    );
    const opcionesParentesco = useMemo<OpcionVisual[]>(() => parentescos.map((p) => ({ valor: p, etiqueta: etiquetaParentesco(p) })), [parentescos]);

    // ------------------------------------------------------------ edición --

    /** Lo que todo control necesita de un campo: id, valor, cambio y error. */
    const props = (campo: CampoDeTexto) => ({
        id: campo,
        valor: data[campo],
        onCambio: (valor: string) => {
            form.setData(campo, valor);
            if (errors[campo]) form.clearErrors(campo);
        },
        error: errors[campo],
    });

    /** Elegir una opción distinta de "Otro" deja sin sentido el error de "¿cuál?". */
    const elegir = (campo: CampoDeTexto, otro: CampoDeTexto) => (valor: string) => {
        form.setData(campo, valor);
        form.clearErrors(campo, otro);
    };

    const autorizar = (valor: boolean) => {
        form.setData('autorizacion_datos', valor);
        if (valor) form.clearErrors('autorizacion_datos');
    };

    // --------------------------------------------------------- navegación --

    const irA = (destino: number) => {
        setHacia(destino >= paso ? 'adelante' : 'atras');
        setPaso(destino);
        setAlcanzado((a) => Math.max(a, Math.min(destino, REVISION)));
    };

    // Al cambiar de paso: arriba, y el foco al título (o al primer error si venimos del servidor).
    useEffect(() => {
        if (!montado.current) {
            montado.current = true;
            return;
        }
        const pendientes = erroresPorEnfocar.current;
        erroresPorEnfocar.current = null;
        // El efecto corre después de pintar el paso nuevo: sus campos ya existen.
        if (pendientes) return enfocarPrimerError(pendientes);
        window.scrollTo({ top: 0, behavior: sinMovimiento() ? 'auto' : 'smooth' });
        titulo.current?.focus({ preventScroll: true });
    }, [paso]);

    // Si cierra la pestaña a mitad de camino, que el navegador pregunte.
    useEffect(() => {
        if (!form.isDirty || paso === ENVIADO) return;
        const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener('beforeunload', avisar);
        return () => window.removeEventListener('beforeunload', avisar);
    }, [form.isDirty, paso]);

    // El botón "Volver" navega sin recargar la página, así que "beforeunload"
    // no se entera: se pregunta aquí antes de ir a otra página y perder lo escrito.
    useEffect(() => {
        if (!form.isDirty || paso === ENVIADO) return;
        return router.on('before', (evento) => {
            const { method, url } = evento.detail.visit;
            if (method !== 'get' || url.pathname === window.location.pathname) return; // el envío o esta misma página
            if (!window.confirm('Si sales ahora, se perderán los datos que escribiste. ¿Quieres salir de la inscripción?')) {
                evento.preventDefault();
            }
        });
    }, [form.isDirty, paso]);

    const marcarErrores = (errs: Errores) => {
        form.clearErrors(...PASOS[paso].campos);
        form.setError(errs as Record<Campo, string>);
        // Sin requestAnimationFrame: los campos ya están en pantalla, y rAF se
        // pausa si la pestaña queda en segundo plano.
        enfocarPrimerError(errs);
        const n = Object.keys(errs).length;
        quitarAviso();
        aviso.current = avisos().then((s) =>
            s.warning({
                title: n === 1 ? 'Falta un dato' : `Faltan ${n} datos`,
                description: 'Los marcamos en rojo para que los revises.',
            }),
        );
    };

    const avanzar = () => {
        const errs = validarPaso(paso, data);
        if (Object.keys(errs).length) return marcarErrores(errs);
        form.clearErrors(...PASOS[paso].campos);
        quitarAviso();
        irA(paso + 1);
    };

    // ------------------------------------------------------------- envío --

    const enviar = async () => {
        // Un doble clic no debe dejar dos solicitudes (el servidor ya no rechaza
        // documentos repetidos, para no revelar si un niño tiene una en curso).
        if (enviando.current) return;
        const errs = validarPaso(REVISION, data);
        if (Object.keys(errs).length) return marcarErrores(errs);
        quitarAviso();
        enviando.current = true;

        const envio = (async () => {
            // La familia pudo dejar la página abierta más de lo que dura la sesión
            // (120 min) mientras buscaba documentos: Laravel respondería 419 y
            // recargar borraría todo. Una visita rápida renueva la sesión y su
            // cookie de seguridad justo antes de enviar.
            await fetch(route('inscripcion.create'), { credentials: 'same-origin' }).catch(() => undefined);

            return new Promise<void>((resolver, rechazar) => {
                let respondio = false;
                let estado = 0;
                // Respuesta que no es de Inertia (419, 429, 500…): se cancela el
                // modal de error de Laravel, que sale en inglés, y lo explica el toast.
                const dejarDeEscuchar = router.on('invalid', (evento) => {
                    evento.preventDefault();
                    estado = evento.detail.response.status;
                });
                form.post(route('inscripcion.store'), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        respondio = true;
                        resolver();
                    },
                    onError: (errores) => {
                        respondio = true;
                        rechazar(errores);
                    },
                    // Ni éxito ni errores de validación: se cayó la red o el servidor.
                    onFinish: () => {
                        dejarDeEscuchar();
                        enviando.current = false;
                        if (!respondio) rechazar(new EnvioFallido(estado));
                    },
                });
            });
        })();

        avisos().then((s) =>
            s.promise(envio, {
                loading: { title: 'Enviando inscripción…' },
                success: { title: 'Inscripción enviada', description: 'La secretaría la revisará pronto.' },
                error: mensajeDeError,
            }),
        );

        envio
            .then(() => {
                setEnviado({
                    estudiante: nombreCompleto(data.primer_nombre, data.primer_apellido),
                    telefono: telefono(data.acudiente_telefono_1),
                    correo: data.correo,
                });
                irA(ENVIADO);
            })
            .catch((e: unknown) => {
                if (e instanceof Error) return;
                // El servidor rechazó algo que el navegador dejó pasar: al paso del primer error.
                const errs = e as Errores;
                if (!Object.keys(errs).length) return;
                const destino = Math.min(...Object.keys(errs).map(pasoDelCampo));
                if (destino === paso) enfocarPrimerError(errs);
                else {
                    erroresPorEnfocar.current = errs;
                    irA(destino);
                }
            });
    };

    /** Otro estudiante de la misma familia: se conservan acudiente y residencia. */
    const empezarDeNuevo = (conservarFamilia: boolean) => {
        const base = { ...DATOS_VACIOS, sello };
        if (conservarFamilia) {
            for (const c of CAMPOS_COMPARTIDOS_ENTRE_HERMANOS) (base as Record<Campo, unknown>)[c] = data[c];
        }
        form.setData(base);
        form.clearErrors();
        setEnviado(null);
        setAlcanzado(0);
        irA(conservarFamilia ? 0 : BIENVENIDA);
    };

    const alEnviar = (e: FormEvent) => {
        e.preventDefault();
        if (paso >= 0 && paso < REVISION) avanzar();
        else if (paso === REVISION) void enviar();
    };

    // ------------------------------------------------------------ pantalla --

    const enPasos = paso >= 0 && paso <= REVISION;

    return (
        <>
            <Head title="Inscripción" />

            <div className="grid min-h-screen bg-white p-4 font-['Outfit',ui-sans-serif,system-ui,sans-serif] text-[#16223F] lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[460px_minmax(0,1fr)]">
                <PanelLateral anio={anioLectivo} actual={paso} alcanzado={alcanzado} onIr={irA} />

                <main className="flex min-w-0 flex-col">
                    <BarraMovil actual={paso} />

                    <div className={cn('flex flex-1 justify-center px-1 py-10 sm:px-8 lg:py-16', !enPasos && 'lg:items-center')}>
                        <form noValidate onSubmit={alEnviar} className="relative w-full max-w-[620px]">
                            <div
                                key={paso}
                                className={cn(
                                    'animate-in fade-in-0 duration-300 ease-out motion-reduce:animate-none',
                                    paso === BIENVENIDA || paso === ENVIADO
                                        ? 'slide-in-from-bottom-2'
                                        : hacia === 'adelante'
                                          ? 'slide-in-from-right-4'
                                          : 'slide-in-from-left-4',
                                )}
                            >
                                {paso === BIENVENIDA && <Bienvenida anio={anioLectivo} titulo={titulo} onComenzar={() => irA(0)} />}

                                {enPasos && (
                                    <>
                                        <header className="mb-9 space-y-2">
                                            <p className="text-[13px] font-medium text-[#1E3A7B]">
                                                Paso {paso + 1} de {PASOS.length}
                                            </p>
                                            <h2
                                                ref={titulo}
                                                tabIndex={-1}
                                                className="text-[30px] leading-tight font-semibold tracking-[-0.02em] outline-none sm:text-[34px]"
                                            >
                                                {PASOS[paso].titulo}
                                            </h2>
                                            <p className="text-base text-[#56627F]">{PASOS[paso].descripcion}</p>
                                        </header>

                                        <div className="space-y-10">
                                            {paso === 0 && (
                                                <>
                                                    <Seccion titulo="Nombre completo">
                                                        <CampoTexto {...props('primer_nombre')} etiqueta="Primer nombre" autoComplete="off" />
                                                        <CampoTexto
                                                            {...props('segundo_nombre')}
                                                            etiqueta="Segundo nombre"
                                                            opcional
                                                            autoComplete="off"
                                                        />
                                                        <CampoTexto {...props('primer_apellido')} etiqueta="Primer apellido" autoComplete="off" />
                                                        <CampoTexto
                                                            {...props('segundo_apellido')}
                                                            etiqueta="Segundo apellido"
                                                            opcional
                                                            autoComplete="off"
                                                        />
                                                        <Opciones {...props('sexo')} etiqueta="Sexo" opciones={SEXOS} />
                                                    </Seccion>

                                                    <Seccion titulo="Nacimiento">
                                                        <Opciones
                                                            {...props('pais_nacimiento')}
                                                            onCambio={elegir('pais_nacimiento', 'pais_nacimiento_otro')}
                                                            etiqueta="País de nacimiento"
                                                            opciones={PAISES}
                                                        />
                                                        {data.pais_nacimiento === 'Otro' && (
                                                            <CampoTexto
                                                                {...props('pais_nacimiento_otro')}
                                                                etiqueta="¿En qué país?"
                                                                ancho="completo"
                                                                autoFocus
                                                            />
                                                        )}
                                                        <CampoTexto
                                                            {...props('ciudad_nacimiento')}
                                                            etiqueta="Ciudad de nacimiento"
                                                            placeholder="Ej. Cali, Valle"
                                                        />
                                                        <CampoTexto
                                                            {...props('fecha_nacimiento')}
                                                            etiqueta="Fecha de nacimiento"
                                                            type="date"
                                                            max={hoy()}
                                                        />
                                                    </Seccion>

                                                    <Seccion titulo="Documento de identidad">
                                                        <Opciones
                                                            {...props('tipo_documento')}
                                                            onCambio={elegir('tipo_documento', 'tipo_documento_otro')}
                                                            etiqueta="Tipo de documento"
                                                            opciones={TIPOS_DOCUMENTO}
                                                            columnas="grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3"
                                                        />
                                                        {data.tipo_documento === 'Otro' && (
                                                            <CampoTexto
                                                                {...props('tipo_documento_otro')}
                                                                etiqueta="¿Qué documento es?"
                                                                ancho="completo"
                                                                autoFocus
                                                            />
                                                        )}
                                                        <CampoTexto
                                                            {...props('numero_documento')}
                                                            etiqueta="Número de documento"
                                                            numerico
                                                            maxLength={15}
                                                            autoComplete="off"
                                                            ayuda="Solo números, sin puntos ni espacios."
                                                        />
                                                        <CampoTexto
                                                            {...props('ciudad_expedicion')}
                                                            etiqueta="Ciudad de expedición"
                                                            placeholder="Ej. Cali, Valle"
                                                        />
                                                    </Seccion>
                                                </>
                                            )}

                                            {paso === 1 && (
                                                <>
                                                    <Seccion titulo="Grado">
                                                        <Opciones
                                                            {...props('grado_id')}
                                                            etiqueta="Grado al que ingresa"
                                                            opciones={opcionesGrado}
                                                            columnas="grid-cols-2 sm:grid-cols-3"
                                                        />
                                                    </Seccion>

                                                    <Seccion titulo="Salud">
                                                        <Opciones
                                                            {...props('tipo_sangre')}
                                                            etiqueta="Tipo de sangre y RH"
                                                            opciones={TIPOS_SANGRE}
                                                            columnas="grid-cols-4"
                                                        />
                                                        <CampoTexto
                                                            {...props('eps')}
                                                            etiqueta="EPS a la que está afiliado"
                                                            placeholder="Nombre de la EPS"
                                                            ancho="completo"
                                                        />
                                                        <Opciones
                                                            {...props('sisben')}
                                                            etiqueta="Nivel del SISBÉN"
                                                            opciones={NIVELES_SISBEN}
                                                            columnas="grid-cols-2 sm:grid-cols-4"
                                                        />
                                                        <CampoArea
                                                            {...props('discapacidad')}
                                                            etiqueta="Discapacidad"
                                                            opcional
                                                            maxLength={300}
                                                            placeholder="Si tiene alguna, descríbela brevemente."
                                                            ayuda="Nos ayuda a acompañarlo mejor desde el primer día."
                                                        />
                                                    </Seccion>

                                                    <Seccion titulo="Grupo étnico">
                                                        <Opciones
                                                            {...props('grupo_etnico')}
                                                            onCambio={elegir('grupo_etnico', 'grupo_etnico_otro')}
                                                            etiqueta="Grupo étnico al que pertenece"
                                                            opciones={GRUPOS_ETNICOS}
                                                            columnas="grid-cols-2 sm:grid-cols-3"
                                                        />
                                                        {data.grupo_etnico === 'Otro' && (
                                                            <CampoTexto
                                                                {...props('grupo_etnico_otro')}
                                                                etiqueta="¿Cuál?"
                                                                ancho="completo"
                                                                autoFocus
                                                            />
                                                        )}
                                                    </Seccion>
                                                </>
                                            )}

                                            {paso === 2 && (
                                                <>
                                                    <Seccion titulo="Residencia">
                                                        <CampoTexto
                                                            {...props('direccion')}
                                                            etiqueta="Dirección de residencia"
                                                            placeholder="Ej. Calle 73 # 7M-18"
                                                            autoComplete="street-address"
                                                            ancho="completo"
                                                        />
                                                        <Buscador
                                                            {...props('barrio')}
                                                            etiqueta="Barrio"
                                                            sugerencias={barrios}
                                                            placeholder="Escribe el nombre de tu barrio"
                                                            ayuda="Te sugerimos los barrios de Cali. Si el tuyo no aparece, escríbelo completo y sigue."
                                                            ancho="completo"
                                                        />
                                                    </Seccion>

                                                    <Seccion titulo="Contacto">
                                                        <CampoTexto
                                                            {...props('telefono_1')}
                                                            etiqueta="Teléfono principal"
                                                            type="tel"
                                                            numerico
                                                            maxLength={10}
                                                            autoComplete="tel"
                                                            placeholder="Ej. 3001234567"
                                                        />
                                                        <CampoTexto
                                                            {...props('telefono_2')}
                                                            etiqueta="Otro teléfono"
                                                            type="tel"
                                                            numerico
                                                            maxLength={10}
                                                            ayuda="Puede ser el de otro familiar."
                                                        />
                                                        <CampoTexto
                                                            {...props('correo')}
                                                            etiqueta="Correo electrónico"
                                                            type="email"
                                                            autoComplete="email"
                                                            placeholder="nombre@correo.com"
                                                            ayuda="Puede ser el del padre, la madre o un familiar."
                                                            ancho="completo"
                                                        />
                                                    </Seccion>
                                                </>
                                            )}

                                            {paso === 3 && (
                                                <>
                                                    <Seccion titulo="Nombre completo">
                                                        <CampoTexto
                                                            {...props('acudiente_primer_nombre')}
                                                            etiqueta="Primer nombre"
                                                            autoComplete="given-name"
                                                        />
                                                        <CampoTexto
                                                            {...props('acudiente_segundo_nombre')}
                                                            etiqueta="Segundo nombre"
                                                            opcional
                                                            autoComplete="additional-name"
                                                        />
                                                        <CampoTexto
                                                            {...props('acudiente_primer_apellido')}
                                                            etiqueta="Primer apellido"
                                                            autoComplete="family-name"
                                                        />
                                                        <CampoTexto
                                                            {...props('acudiente_segundo_apellido')}
                                                            etiqueta="Segundo apellido"
                                                            opcional
                                                            autoComplete="off"
                                                        />
                                                        <Opciones
                                                            {...props('acudiente_parentesco')}
                                                            onCambio={elegir('acudiente_parentesco', 'acudiente_parentesco_otro')}
                                                            etiqueta="Parentesco con el estudiante"
                                                            opciones={opcionesParentesco}
                                                            columnas="grid-cols-2 sm:grid-cols-3"
                                                        />
                                                        {data.acudiente_parentesco === 'Otro' && (
                                                            <CampoTexto
                                                                {...props('acudiente_parentesco_otro')}
                                                                etiqueta="¿Cuál?"
                                                                ancho="completo"
                                                                autoFocus
                                                            />
                                                        )}
                                                    </Seccion>

                                                    <Seccion titulo="Identificación">
                                                        <CampoTexto
                                                            {...props('acudiente_numero_documento')}
                                                            etiqueta="Número de documento"
                                                            numerico
                                                            maxLength={15}
                                                            ayuda="Solo números, sin puntos ni espacios."
                                                        />
                                                        <CampoTexto
                                                            {...props('acudiente_ciudad_expedicion')}
                                                            etiqueta="Ciudad de expedición"
                                                            placeholder="Ej. Cali, Valle"
                                                        />
                                                        <CampoTexto
                                                            {...props('acudiente_fecha_nacimiento')}
                                                            etiqueta="Fecha de nacimiento"
                                                            type="date"
                                                            max={hoy()}
                                                        />
                                                    </Seccion>

                                                    <Seccion titulo="Contacto">
                                                        <CampoTexto
                                                            {...props('acudiente_telefono_1')}
                                                            etiqueta="Teléfono principal"
                                                            type="tel"
                                                            numerico
                                                            maxLength={10}
                                                            autoComplete="tel"
                                                            placeholder="Ej. 3001234567"
                                                        />
                                                        <CampoTexto
                                                            {...props('acudiente_telefono_2')}
                                                            etiqueta="Otro teléfono"
                                                            type="tel"
                                                            numerico
                                                            maxLength={10}
                                                        />
                                                        <CampoTexto
                                                            {...props('acudiente_correo')}
                                                            etiqueta="Correo electrónico"
                                                            type="email"
                                                            autoComplete="email"
                                                            opcional
                                                            placeholder="nombre@correo.com"
                                                            ancho="completo"
                                                        />
                                                    </Seccion>
                                                </>
                                            )}

                                            {paso === REVISION && (
                                                <Revision
                                                    data={data}
                                                    grados={grados}
                                                    error={errors.autorizacion_datos}
                                                    onEditar={irA}
                                                    onAutorizar={autorizar}
                                                />
                                            )}
                                        </div>

                                        <div className="mt-12 flex items-center justify-between gap-3 border-t border-[#E3E9F6] pt-6">
                                            <BotonSecundario type="button" onClick={() => irA(paso - 1)} disabled={processing}>
                                                <ArrowLeft className="size-[18px]" />
                                                Atrás
                                            </BotonSecundario>
                                            <BotonPrincipal type="submit" cargando={processing} className="flex-1 sm:min-w-[220px] sm:flex-none">
                                                {paso === REVISION ? 'Enviar inscripción' : 'Continuar'}
                                                {paso !== REVISION && <ArrowRight className="size-[18px]" />}
                                            </BotonPrincipal>
                                        </div>
                                    </>
                                )}

                                {paso === ENVIADO && enviado && (
                                    <Enviado
                                        {...enviado}
                                        titulo={titulo}
                                        onHermano={() => empezarDeNuevo(true)}
                                        onTerminar={() => empezarDeNuevo(false)}
                                    />
                                )}
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

// --------------------------------------------------------------- pantallas --

type ConTitulo = { titulo: RefObject<HTMLHeadingElement | null> };

function Bienvenida({ anio, titulo, onComenzar }: ConTitulo & { anio: number; onComenzar: () => void }) {
    const tenerAMano = [
        { icono: IdCard, texto: 'El documento de identidad del estudiante' },
        { icono: IdCard, texto: 'Tu documento de identidad, como acudiente' },
        { icono: HeartPulse, texto: 'El nombre de la EPS y el tipo de sangre' },
    ];

    return (
        <div>
            <span className="inline-flex rounded-full bg-[#DCE5F8] px-3 py-1 text-[13px] font-medium text-[#172E63]">Año lectivo {anio}</span>
            <h1 ref={titulo} tabIndex={-1} className="mt-5 text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] outline-none sm:text-[46px]">
                Inscripción de estudiantes
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-[#56627F]">
                Gracias por elegir la Institución Educativa Alfonso López Pumarejo. Completa este formulario para inscribir al estudiante; la
                secretaría revisará los datos y se pondrá en contacto contigo.
            </p>

            <div className="mt-9 rounded-[24px] border-[1.5px] border-[#E3E9F6] p-6">
                <p className="text-sm font-semibold">Antes de empezar, ten a mano</p>
                <ul className="mt-4 space-y-3.5">
                    {tenerAMano.map(({ icono: Icono, texto }) => (
                        <li key={texto} className="flex items-center gap-3.5 text-[15px]">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FB] text-[#1E3A7B]">
                                <Icono className="size-[18px]" />
                            </span>
                            {texto}
                        </li>
                    ))}
                </ul>
                <p className="mt-5 flex items-center gap-2 border-t border-[#E3E9F6] pt-4 text-[13px] text-[#56627F]">
                    <Clock className="size-4" />
                    Toma unos 5 minutos · {PASOS.length} pasos
                </p>
            </div>

            <BotonPrincipal type="button" onClick={onComenzar} className="mt-8 w-full sm:w-auto sm:min-w-[220px]">
                Comenzar
                <ArrowRight className="size-[18px]" />
            </BotonPrincipal>

            <p className="mt-6 rounded-[14px] bg-[#EEF2FB] px-4 py-3.5 text-sm leading-relaxed text-[#1E3A7B]">
                ¿Vas a inscribir a varios hijos? Al terminar podrás inscribir al siguiente sin volver a escribir tus datos.
            </p>
        </div>
    );
}

type EnviadoProps = ConTitulo & { estudiante: string; telefono: string; correo: string; onHermano: () => void; onTerminar: () => void };

function Enviado({ titulo, estudiante, telefono, correo, onHermano, onTerminar }: EnviadoProps) {
    return (
        <div>
            <div className="flex size-16 items-center justify-center rounded-full bg-[#DCE5F8]">
                <Check strokeWidth={2.5} className="animate-in zoom-in-50 size-8 text-[#1E3A7B] duration-500 motion-reduce:animate-none" />
            </div>
            <h1 ref={titulo} tabIndex={-1} className="mt-7 text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] outline-none sm:text-[44px]">
                ¡Inscripción enviada!
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-[#56627F]">
                Recibimos los datos de <span className="font-medium text-[#16223F]">{estudiante}</span>. La secretaría los revisará y te contactará al{' '}
                <span className="font-medium text-[#16223F]">{telefono}</span> o al correo{' '}
                <span className="font-medium break-all text-[#16223F]">{correo}</span>.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <BotonPrincipal type="button" onClick={onHermano}>
                    <UserPlus className="size-[18px]" />
                    Inscribir a un hermano o hermana
                </BotonPrincipal>
                <BotonSecundario type="button" onClick={onTerminar}>
                    Terminar
                </BotonSecundario>
            </div>
            <p className="mt-5 text-[13px] text-[#56627F]">Tus datos como acudiente y los de la residencia quedan llenos para el siguiente.</p>
        </div>
    );
}

// ---------------------------------------------------------------- revisión --

type Fila = [string, ReactNode];

function Revision({
    data,
    grados,
    error,
    onEditar,
    onAutorizar,
}: {
    data: DatosInscripcion;
    grados: Grado[];
    error?: string;
    onEditar: (paso: number) => void;
    onAutorizar: (valor: boolean) => void;
}) {
    const otro = (valor: string, cual: string) => (valor === 'Otro' ? cual : valor);
    const grado = grados.find((g) => String(g.id) === data.grado_id)?.nombre ?? '';

    const bloques: { paso: number; filas: Fila[] }[] = [
        {
            paso: 0,
            filas: [
                ['Nombre', nombreCompleto(data.primer_nombre, data.segundo_nombre, data.primer_apellido, data.segundo_apellido)],
                ['Sexo', etiquetaDe(SEXOS, data.sexo)],
                ['Nació en', `${data.ciudad_nacimiento}, ${otro(data.pais_nacimiento, data.pais_nacimiento_otro)}`],
                ['Fecha de nacimiento', fechaLarga(data.fecha_nacimiento)],
                [
                    'Documento',
                    `${data.tipo_documento === 'Otro' ? data.tipo_documento_otro : etiquetaDe(TIPOS_DOCUMENTO, data.tipo_documento)} ${data.numero_documento}`,
                ],
                ['Expedido en', data.ciudad_expedicion],
            ],
        },
        {
            paso: 1,
            filas: [
                ['Grado', grado],
                ['Tipo de sangre', data.tipo_sangre],
                ['EPS', data.eps],
                ['SISBÉN', etiquetaDe(NIVELES_SISBEN, data.sisben)],
                ['Grupo étnico', otro(data.grupo_etnico, data.grupo_etnico_otro)],
                ['Discapacidad', data.discapacidad.trim() || 'Ninguna registrada'],
            ],
        },
        {
            paso: 2,
            filas: [
                ['Dirección', data.direccion],
                ['Barrio', data.barrio],
                ['Teléfonos', `${telefono(data.telefono_1)} · ${telefono(data.telefono_2)}`],
                ['Correo', data.correo],
            ],
        },
        {
            paso: 3,
            filas: [
                [
                    'Nombre',
                    nombreCompleto(
                        data.acudiente_primer_nombre,
                        data.acudiente_segundo_nombre,
                        data.acudiente_primer_apellido,
                        data.acudiente_segundo_apellido,
                    ),
                ],
                ['Parentesco', data.acudiente_parentesco === 'Otro' ? data.acudiente_parentesco_otro : etiquetaParentesco(data.acudiente_parentesco)],
                ['Documento', `${data.acudiente_numero_documento} · ${data.acudiente_ciudad_expedicion}`],
                ['Fecha de nacimiento', fechaLarga(data.acudiente_fecha_nacimiento)],
                ['Teléfonos', `${telefono(data.acudiente_telefono_1)} · ${telefono(data.acudiente_telefono_2)}`],
                ['Correo', data.acudiente_correo || 'No registrado'],
            ],
        },
    ];

    return (
        <div className="space-y-4">
            {bloques.map(({ paso, filas }) => {
                const { corto, icono: Icono } = PASOS[paso];
                return (
                    <section key={paso} aria-label={corto} className="rounded-[22px] border-[1.5px] border-[#E3E9F6] p-5 sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="flex items-center gap-2.5 text-base font-semibold">
                                <Icono className="size-[18px] text-[#1E3A7B]" />
                                {corto}
                            </h3>
                            <button
                                type="button"
                                onClick={() => onEditar(paso)}
                                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-[#1E3A7B] transition-colors hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none"
                            >
                                <Pencil className="size-3.5" />
                                Editar
                            </button>
                        </div>
                        <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
                            {filas.map(([dt, dd]) => (
                                <div key={dt} className="min-w-0">
                                    <dt className="text-[13px] text-[#56627F]">{dt}</dt>
                                    <dd className="text-[15px] font-medium break-words">{dd}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                );
            })}

            <label
                className={cn(
                    'flex cursor-pointer gap-3.5 rounded-[22px] border-[1.5px] p-5 transition-colors duration-200',
                    data.autorizacion_datos
                        ? 'border-[#6E8BD6] bg-[#EEF2FB]'
                        : error
                          ? 'border-[#F0B4AB] bg-[#FFF8F6]'
                          : 'border-transparent bg-[#EEF2FB]',
                )}
            >
                <input
                    id="autorizacion_datos"
                    type="checkbox"
                    checked={data.autorizacion_datos}
                    onChange={(e) => onAutorizar(e.target.checked)}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'autorizacion_datos-error' : undefined}
                    className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-[#1E3A7B]"
                />
                <span className="text-sm leading-relaxed text-[#3E4A68]">
                    Autorizo a la Institución Educativa Alfonso López Pumarejo a usar estos datos únicamente para el proceso de matrícula, conforme a
                    la Ley 1581 de 2012 de protección de datos personales.
                </span>
            </label>
            {error && (
                <p id="autorizacion_datos-error" className="animate-in fade-in-0 text-sm text-[#B42318] duration-200">
                    {error}
                </p>
            )}
        </div>
    );
}
