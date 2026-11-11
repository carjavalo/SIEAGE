import { AyudaInscripcion } from '@/components/ayuda-inscripcion';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowBigUp,
    ArrowRight,
    CalendarDays,
    ChevronDown,
    CircleAlert,
    Eye,
    EyeOff,
    FileText,
    LoaderCircle,
    LogIn,
    Play,
    Pointer,
    User,
    UserPlus,
    Users,
} from 'lucide-react';
import { type CSSProperties, FormEventHandler, type KeyboardEvent, useEffect, useRef, useState } from 'react';

type LoginForm = {
    usuario: string;
    password: string;
    remember: boolean;
};

/** Lo que dice el servidor tras un intento fallido: cuántos quedan antes de la pausa, o cuánto dura. */
type Acceso = { restantes?: number; espera?: number };

const modulos = [
    { nombre: 'Estudiantes', icono: User, color: 'text-[#1E3A7B]' },
    { nombre: 'Acudientes', icono: Users, color: 'text-[#5B7BD0]' },
    { nombre: 'Matrículas', icono: CalendarDays, color: 'text-[#1E3A7B]' },
    { nombre: 'Constancias', icono: FileText, color: 'text-[#5B7BD0]' },
];

/** Entrada escalonada: cada bloque aparece un poco después del anterior. */
const aparecer = 'animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 ease-out motion-reduce:animate-none';
const tras = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

// 16 px: con menos, el iPhone acerca la pantalla al tocar el campo.
const campo =
    'h-[52px] w-full rounded-[14px] border-[1.5px] border-borde-campo bg-white px-4 text-base text-[#16223F] outline-none transition-[border-color,box-shadow] placeholder:text-[#6B7690] hover:border-[#56627F] focus:border-foco focus:ring-4 focus:ring-[#DCE5F8]';
/** El foco del teclado en botones y enlaces: un contorno del azul de la marca, separado del control. */
const foco = 'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco';
/** Usuario y clave cuando no coinciden: no se sabe cuál de los dos está mal, así que se marcan los dos. */
const campoConError =
    'border-[#B42318] hover:border-[#B42318] focus:border-[#B42318] focus:ring-0 focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-[#B42318]';

/** Los dos íconos de mostrar/ocultar clave, superpuestos: uno entra mientras el otro sale. */
const icono =
    'absolute inset-0 size-[18px] transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none';
const iconoDentro = 'scale-100 opacity-100 blur-0';
const iconoFuera = 'scale-25 opacity-0 blur-[4px]';

/** Un error del ingreso, arriba del formulario. */
const aviso = 'flex items-start gap-2.5 rounded-[14px] bg-[#FDECEC] px-4 py-3 text-sm leading-snug text-pretty text-[#7A1F17]';

/** 272 s → «4:32». */
const reloj = (segundos: number) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;

export default function Login({ status, acceso }: { status?: string; acceso?: Acceso | null }) {
    const [verClave, setVerClave] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm & { acceso?: string }>({
        usuario: '',
        password: '',
        remember: false,
    });
    // El acceso del personal va plegado debajo de la inscripción; se abre solo si hubo un intento fallido o un aviso.
    const [operativo, setOperativo] = useState(() => !!status || Object.keys(errors).length > 0);
    useEffect(() => {
        if (errors.usuario || errors.password || errors.acceso) setOperativo(true);
    }, [errors.usuario, errors.password, errors.acceso]);

    const usuarioRef = useRef<HTMLInputElement>(null);
    const claveRef = useRef<HTMLInputElement>(null);
    // Cada intento fallido vuelve a montar el aviso: así el lector de pantalla lo lee aunque diga lo mismo.
    const [intento, setIntento] = useState(0);
    const [mayusculas, setMayusculas] = useState(false);
    const [sinConexion, setSinConexion] = useState(false);

    // La pausa por intentos fallidos, con su cuenta regresiva. Al terminar, se avisa que ya se puede.
    const [pausaHasta, setPausaHasta] = useState<number | null>(null);
    const [ahora, setAhora] = useState(() => Date.now());
    const [pausaTerminada, setPausaTerminada] = useState(false);
    useEffect(() => {
        if (acceso?.espera) {
            setPausaHasta(Date.now() + acceso.espera * 1000);
            setAhora(Date.now());
            setPausaTerminada(false);
        }
    }, [acceso]);
    useEffect(() => {
        if (pausaHasta === null) return;
        const id = window.setInterval(() => {
            setAhora(Date.now());
            if (Date.now() >= pausaHasta) {
                setPausaHasta(null);
                setPausaTerminada(true);
            }
        }, 1000);
        return () => window.clearInterval(id);
    }, [pausaHasta]);
    const faltan = pausaHasta === null ? 0 : Math.max(0, Math.ceil((pausaHasta - ahora) / 1000));
    const enPausa = faltan > 0;

    // Sin internet, o el servidor respondió algo que no es una página (un error 500): en vez de la
    // ventana de error de Inertia o de nada, un aviso aquí mismo. Solo mientras se envía este formulario.
    const enviando = useRef(false);
    useEffect(() => {
        const fallo = (evento: Event) => {
            if (!enviando.current) return;
            evento.preventDefault();
            setSinConexion(true);
        };
        const quitarExcepcion = router.on('exception', fallo);
        const quitarInvalida = router.on('invalid', fallo);
        return () => {
            quitarExcepcion();
            quitarInvalida();
        };
    }, []);

    const verMayusculas = (e: KeyboardEvent<HTMLInputElement>) => setMayusculas(e.getModifierState('CapsLock'));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Sin deshabilitar el botón mientras envía: deshabilitado, el foco se perdía. Se evita el doble envío aquí.
        if (processing || enPausa) return;
        enviando.current = true;
        setSinConexion(false);
        setPausaTerminada(false);
        post(route('login'), {
            onError: (errores) => {
                setIntento((n) => n + 1);
                // La clave se borra y el foco va a ella para volver a escribirla. Si falta el usuario, a él.
                // Si lo que falló fue la conexión, no hay error aquí y la clave se queda.
                reset('password');
                (errores.usuario ? usuarioRef : claveRef).current?.focus();
            },
            onFinish: () => {
                enviando.current = false;
            },
        });
    };

    // El error del intento anterior ya no aplica si este ni siquiera llegó al servidor.
    const accesoFallido = !!errors.acceso && !sinConexion;

    return (
        <>
            <Head title="Ingresar" />

            <main className="grid min-h-screen bg-white p-4 font-sans text-[#16223F] lg:grid-cols-2 lg:gap-4">
                {/* ------------------------------------------------ panel de marca */}
                <section className="relative hidden flex-col overflow-hidden rounded-[32px] bg-[#EEF2FB] p-12 lg:flex">
                    <div className={cn('relative flex items-baseline gap-2.5', aparecer)}>
                        <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                        <p className="text-[13px] text-[#56627F]">Sistema de gestión académica</p>
                    </div>

                    <div className="relative flex flex-1 items-center justify-center py-10 [@media(max-height:760px)]:py-5">
                        <div className={cn(aparecer, 'zoom-in-95')} style={tras(150)}>
                            <div className="relative">
                                {/* 188 px = alto real del archivo: se ve nítido, sin estirar. Quieto y derecho: solo entra con
                                    el resto de la página (flotar e inclinarse sin parar se veía a plantilla). */}
                                <img
                                    src="/sieage-logo.webp"
                                    alt="SIEAGE ADES versión 1.5, edición azul"
                                    className="relative h-[188px] w-auto rounded-[16px] shadow-[0_1px_2px_rgba(22,34,63,0.08),0_14px_28px_-14px_rgba(22,34,63,0.4)] ring-1 ring-white/70"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative space-y-6">
                        <p
                            className={cn('max-w-lg text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance xl:text-5xl', aparecer)}
                            style={tras(250)}
                        >
                            La información de tus estudiantes, en un solo lugar.
                        </p>
                        <div className={cn('flex flex-wrap gap-2.5', aparecer)} style={tras(350)}>
                            {modulos.map(({ nombre, icono: Icono, color }) => (
                                <span
                                    key={nombre}
                                    className="flex items-center gap-2 rounded-full bg-white/85 px-3.5 py-2 text-sm shadow-[0_1px_2px_rgba(22,34,63,0.06)] backdrop-blur"
                                >
                                    <Icono className={`size-4 ${color}`} />
                                    {nombre}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ------------------------------------------------ acceso */}
                <section className="flex items-center justify-center px-2 py-10 sm:px-12 lg:py-4">
                    <div className="flex w-full max-w-[400px] flex-col gap-7">
                        <div className={cn('flex items-center gap-3 lg:hidden', aparecer)}>
                            <img
                                src="/sieage-logo.webp"
                                alt=""
                                className="h-14 w-auto rounded-lg object-contain shadow-sm outline-1 -outline-offset-1 outline-black/10"
                            />
                            <div className="leading-tight">
                                <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                                <p className="text-[13px] text-[#56627F]">Sistema de gestión académica</p>
                            </div>
                        </div>

                        {/* ---------------------------------------- 1.º inscripción: lo que buscan las familias */}
                        <div className={cn('flex flex-col gap-5', aparecer)} style={tras(100)}>
                            <div className="space-y-2">
                                <p className="flex items-center gap-2 text-sm font-semibold text-[#4A67B8]">
                                    <UserPlus className="size-4" />
                                    Padres y acudientes
                                </p>
                                <h1 className="text-[32px] leading-tight font-bold tracking-[-0.02em] text-balance">Inscribe a tu hijo o hija</h1>
                                <p className="text-base text-pretty text-[#56627F]">
                                    Llena el formulario de inscripción. No necesitas usuario ni clave · 5 minutos.
                                </p>
                            </div>

                            {/* En un celular angosto la ayuda baja a su propia fila. */}
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="group flex flex-1 items-center gap-2.5 max-[429px]:basis-full">
                                    {/* La mano señala el botón tres veces; al pasar el cursor se acerca y se queda quieta. */}
                                    <span
                                        aria-hidden
                                        className="animate-senalar shrink-0 text-[#4A67B8] transition-transform duration-300 group-hover:translate-x-1.5 group-hover:animate-none motion-reduce:animate-none"
                                    >
                                        <Pointer className="size-7 rotate-90" strokeWidth={1.75} />
                                    </span>
                                    <Link
                                        href={route('inscripcion.create')}
                                        prefetch
                                        className={cn(
                                            'flex h-14 flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#1E3A7B] text-base font-semibold whitespace-nowrap text-white transition-[background-color,scale] duration-200 hover:bg-[#172E63] active:scale-[0.96]',
                                            foco,
                                        )}
                                    >
                                        Inscribir estudiante
                                        <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </Link>
                                </div>

                                <AyudaInscripcion>
                                    <button
                                        type="button"
                                        title="Mira en un minuto cómo es la inscripción"
                                        className={cn(
                                            'flex h-14 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-white pr-4 pl-2.5 text-[15px] font-semibold whitespace-nowrap text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition-[background-color,scale] duration-200 hover:bg-[#F5F7FC] active:scale-[0.96] max-[429px]:basis-full',
                                            foco,
                                        )}
                                    >
                                        <span className="flex size-7 items-center justify-center rounded-full bg-[#1E3A7B] text-white">
                                            <Play className="size-3 translate-x-px fill-current" />
                                        </span>
                                        {/* En pantallas anchas el botón dice solo «Ayuda»; el resto lo oye el lector de pantalla. */}
                                        <span>
                                            Ayuda<span className="min-[430px]:sr-only"> · video de 1 min</span>
                                        </span>
                                    </button>
                                </AyudaInscripcion>
                            </div>
                        </div>

                        {/* ---------------------------------------- 2.º personal de la institución */}
                        <div className={cn('border-t border-[#E3E9F6] pt-6', aparecer)} style={tras(220)}>
                            {/* Un encabezado para que el lector de pantalla pueda saltar a esta sección. El botón se
                                nombra con la pregunta y la acción; quiénes entran por aquí va como descripción. */}
                            <h2>
                                <button
                                    type="button"
                                    onClick={() => setOperativo((v) => !v)}
                                    aria-expanded={operativo}
                                    aria-controls="acceso-operativo"
                                    aria-labelledby="operativo-pregunta operativo-accion"
                                    aria-describedby="operativo-quienes"
                                    className={cn('group flex w-full cursor-pointer items-center gap-3 rounded-[18px] text-left', foco)}
                                >
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FB] text-[#1E3A7B]">
                                        <LogIn className="size-[18px]" />
                                    </span>
                                    <span className="flex-1 leading-snug">
                                        <span id="operativo-pregunta" className="block text-[15px] font-semibold">
                                            ¿Eres usuario operativo de la institución?
                                        </span>
                                        <span id="operativo-quienes" className="block text-[13px] text-[#56627F]">
                                            Secretaría, coordinación o docentes
                                        </span>
                                    </span>
                                    <span id="operativo-accion" className="flex items-center gap-1 text-[15px] font-semibold text-[#1E3A7B]">
                                        Iniciar sesión
                                        <ChevronDown className={cn('size-[18px] transition-transform duration-200', operativo && 'rotate-180')} />
                                    </span>
                                </button>
                            </h2>

                            {operativo && (
                                <div id="acceso-operativo" className="animate-in fade-in slide-in-from-top-2 duration-300 motion-reduce:animate-none">
                                    <form onSubmit={submit} className="flex flex-col gap-6 pt-5">
                                        {status && (
                                            <p role="status" className="rounded-[14px] bg-[#DCE5F8] px-4 py-3 text-sm text-[#172E63]">
                                                {status}
                                            </p>
                                        )}

                                        {enPausa ? (
                                            <div key={`pausa-${intento}`} id="acceso-aviso" role="alert" className={aviso}>
                                                <CircleAlert className="mt-px size-[18px] shrink-0 text-[#B42318]" />
                                                <div className="space-y-1">
                                                    <p className="font-semibold">El ingreso quedó en pausa</p>
                                                    <p>
                                                        Hubo varios intentos fallidos. Es solo una pausa por seguridad: podrás intentarlo de nuevo en{' '}
                                                        {/* El lector de pantalla oye «unos N minutos» una vez; el reloj se ve, pero no se lee cada segundo. */}
                                                        <span className="sr-only">unos {Math.ceil(faltan / 60)} minutos.</span>
                                                        <span aria-hidden className="font-semibold tabular-nums">
                                                            {reloj(faltan)}
                                                        </span>
                                                        <span aria-hidden>.</span>
                                                    </p>
                                                    <p>¿No recuerdas la clave? Pídele a coordinación académica que te la cambie.</p>
                                                </div>
                                            </div>
                                        ) : accesoFallido ? (
                                            <div key={`fallo-${intento}`} id="acceso-aviso" role="alert" className={aviso}>
                                                <CircleAlert className="mt-px size-[18px] shrink-0 text-[#B42318]" />
                                                <div className="space-y-1">
                                                    <p className="font-semibold">{errors.acceso}</p>
                                                    {acceso?.restantes !== undefined && acceso.restantes > 0 ? (
                                                        <p>
                                                            {acceso.restantes === 1 ? 'Te queda 1 intento' : `Te quedan ${acceso.restantes} intentos`}
                                                            ; después, el ingreso se pausa unos minutos.
                                                        </p>
                                                    ) : (
                                                        <p>Revisa los dos y vuelve a escribir la clave.</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}

                                        {pausaTerminada && !enPausa && (
                                            <p role="status" className="rounded-[14px] bg-[#DCE5F8] px-4 py-3 text-sm text-[#172E63]">
                                                Ya puedes volver a intentarlo.
                                            </p>
                                        )}

                                        {sinConexion && (
                                            <div key={`red-${intento}`} role="alert" className={aviso}>
                                                <CircleAlert className="mt-px size-[18px] shrink-0 text-[#B42318]" />
                                                <p>No pudimos comunicarnos con el servidor. Revisa la conexión a internet y vuelve a intentarlo.</p>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-[18px]">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="usuario" className="text-sm font-medium">
                                                    Usuario
                                                </label>
                                                <input
                                                    ref={usuarioRef}
                                                    id="usuario"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    maxLength={255}
                                                    autoComplete="username"
                                                    autoCapitalize="none"
                                                    spellCheck={false}
                                                    value={data.usuario}
                                                    onChange={(e) => setData('usuario', e.target.value)}
                                                    onKeyUp={verMayusculas}
                                                    placeholder="Ej. jperez"
                                                    className={cn(campo, (errors.usuario || accesoFallido) && campoConError)}
                                                    aria-invalid={!!errors.usuario || accesoFallido}
                                                    aria-describedby={
                                                        cn(errors.usuario && 'usuario-error', (accesoFallido || enPausa) && 'acceso-aviso') ||
                                                        undefined
                                                    }
                                                />
                                                {errors.usuario && (
                                                    <p id="usuario-error" className="animate-in fade-in text-sm text-[#B42318] duration-200">
                                                        {errors.usuario}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="password" className="text-sm font-medium">
                                                    Clave
                                                </label>
                                                <div className="relative flex items-center">
                                                    <input
                                                        ref={claveRef}
                                                        id="password"
                                                        type={verClave ? 'text' : 'password'}
                                                        required
                                                        maxLength={255}
                                                        autoComplete="current-password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        onKeyUp={verMayusculas}
                                                        onBlur={() => setMayusculas(false)}
                                                        className={cn(campo, 'pr-13', (errors.password || accesoFallido) && campoConError)}
                                                        aria-invalid={!!errors.password || accesoFallido}
                                                        aria-describedby={
                                                            cn(
                                                                errors.password && 'password-error',
                                                                (accesoFallido || enPausa) && 'acceso-aviso',
                                                                mayusculas && 'clave-mayusculas',
                                                            ) || undefined
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setVerClave((v) => !v)}
                                                        aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'}
                                                        className={cn(
                                                            'absolute right-1 flex size-11 items-center justify-center rounded-[10px] text-[#56627F] transition-colors hover:bg-[#EEF2FB]',
                                                            // Dentro del campo: el contorno va pegado al botón para no salirse del borde.
                                                            foco,
                                                            'focus-visible:outline-offset-0',
                                                        )}
                                                    >
                                                        <span className="relative size-[18px]">
                                                            <Eye className={cn(icono, verClave ? iconoFuera : iconoDentro)} />
                                                            <EyeOff className={cn(icono, verClave ? iconoDentro : iconoFuera)} />
                                                        </span>
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <p id="password-error" className="animate-in fade-in text-sm text-[#B42318] duration-200">
                                                        {errors.password}
                                                    </p>
                                                )}
                                                <p
                                                    id="clave-mayusculas"
                                                    aria-live="polite"
                                                    className="text-[13px] font-medium text-[#1E3A7B] empty:hidden"
                                                >
                                                    {mayusculas && (
                                                        <span className="flex items-center gap-1.5">
                                                            <ArrowBigUp className="size-4" />
                                                            Bloq Mayús está activado.
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* 40 px de alto para el dedo, sin mover lo de alrededor (-my-2.5). */}
                                            <label className="-my-2.5 flex w-fit cursor-pointer items-center gap-2.5 py-2.5 text-sm text-[#3E4A68]">
                                                <input
                                                    type="checkbox"
                                                    checked={data.remember}
                                                    onChange={(e) => setData('remember', e.target.checked)}
                                                    className={cn('size-[18px] cursor-pointer accent-[#1E3A7B]', foco)}
                                                />
                                                Mantener la sesión iniciada
                                            </label>
                                        </div>

                                        <div className="space-y-3.5">
                                            <button
                                                type="submit"
                                                disabled={enPausa}
                                                aria-disabled={processing || undefined}
                                                aria-busy={processing || undefined}
                                                className={cn(
                                                    'flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#1E3A7B] text-base font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-[#172E63] active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-[#56627F] disabled:active:scale-100 aria-disabled:opacity-80',
                                                    foco,
                                                )}
                                            >
                                                {processing && <LoaderCircle className="size-4 animate-spin" />}
                                                {enPausa ? (
                                                    <>
                                                        Disponible en <span className="tabular-nums">{reloj(faltan)}</span>
                                                    </>
                                                ) : (
                                                    'Ingresar'
                                                )}
                                            </button>
                                            <p className="text-center text-[13px] text-balance text-[#56627F]">
                                                ¿Sin usuario o sin clave? Pídelos a coordinación académica.
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
