import { AyudaInscripcion } from '@/components/ayuda-inscripcion';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    ChevronDown,
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
import { type CSSProperties, FormEventHandler, useEffect, useState } from 'react';

type LoginForm = {
    usuario: string;
    password: string;
    remember: boolean;
};

const modulos = [
    { nombre: 'Estudiantes', icono: User, color: 'text-[#1E3A7B]' },
    { nombre: 'Acudientes', icono: Users, color: 'text-[#5B7BD0]' },
    { nombre: 'Matrículas', icono: CalendarDays, color: 'text-[#1E3A7B]' },
    { nombre: 'Constancias', icono: FileText, color: 'text-[#5B7BD0]' },
];

/** Entrada escalonada: cada bloque aparece un poco después del anterior. */
const aparecer = 'animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 ease-out motion-reduce:animate-none';
const tras = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

const campo =
    'h-[52px] w-full rounded-[14px] border-[1.5px] border-[#D3DDF3] bg-white px-4 text-[15px] text-[#16223F] outline-none transition placeholder:text-[#6B7690] hover:border-[#B7C6EA] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8]';

export default function Login({ status }: { status?: string }) {
    const [verClave, setVerClave] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        usuario: '',
        password: '',
        remember: true,
    });
    // El acceso del personal va plegado debajo de la inscripción; se abre solo si hubo un intento fallido o un aviso.
    const [operativo, setOperativo] = useState(() => !!status || Object.keys(errors).length > 0);
    useEffect(() => {
        if (errors.usuario || errors.password) setOperativo(true);
    }, [errors.usuario, errors.password]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

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
                            <img src="/sieage-logo.webp" alt="" className="h-14 w-auto rounded-lg object-contain shadow-sm" />
                            <div className="leading-tight">
                                <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                                <p className="text-[13px] text-[#56627F]">Sistema de gestión académica</p>
                            </div>
                        </div>

                        {/* ---------------------------------------- 1.º inscripción: lo que buscan las familias */}
                        <div className={cn('flex flex-col gap-5', aparecer)} style={tras(100)}>
                            <div className="space-y-2">
                                <p className="flex items-center gap-2 text-sm font-semibold text-[#5B7BD0]">
                                    <UserPlus className="size-4" />
                                    Padres y acudientes
                                </p>
                                <h1 className="text-[32px] leading-tight font-bold tracking-[-0.02em]">Inscribe a tu hijo o hija</h1>
                                <p className="text-base text-[#56627F]">
                                    Llena el formulario de inscripción. No necesitas usuario ni clave · 5 minutos.
                                </p>
                            </div>

                            {/* En un celular angosto la ayuda baja a su propia fila. */}
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="group flex flex-1 items-center gap-2.5 max-[429px]:basis-full">
                                    {/* La mano señala el botón; al pasar el cursor se acerca y se queda quieta. */}
                                    <span
                                        aria-hidden
                                        className="animate-senalar shrink-0 text-[#5B7BD0] transition-transform duration-300 group-hover:translate-x-1.5 group-hover:animate-none motion-reduce:animate-none"
                                    >
                                        <Pointer className="size-7 rotate-90" strokeWidth={1.75} />
                                    </span>
                                    <Link
                                        href={route('inscripcion.create')}
                                        prefetch
                                        className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#1E3A7B] text-base font-semibold whitespace-nowrap text-white transition-all duration-200 hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.98]"
                                    >
                                        Inscribir estudiante
                                        <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </Link>
                                </div>

                                <AyudaInscripcion>
                                    <button
                                        type="button"
                                        title="Mira en un minuto cómo es la inscripción"
                                        className="flex h-14 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-white pr-4 pl-2.5 text-[15px] font-semibold whitespace-nowrap text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition-all duration-200 hover:bg-[#F5F7FC] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.98] max-[429px]:basis-full"
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

                        {/* ---------------------------------------- 2.º personal del colegio */}
                        <div className={cn('border-t border-[#E3E9F6] pt-6', aparecer)} style={tras(220)}>
                            <button
                                type="button"
                                onClick={() => setOperativo((v) => !v)}
                                aria-expanded={operativo}
                                aria-controls="acceso-operativo"
                                className="group flex w-full cursor-pointer items-center gap-3 rounded-[18px] text-left focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none"
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FB] text-[#1E3A7B]">
                                    <LogIn className="size-[18px]" />
                                </span>
                                <span className="flex-1 leading-snug">
                                    <span className="block text-[15px] font-semibold">¿Eres usuario operativo del colegio?</span>
                                    <span className="block text-[13px] text-[#56627F]">Secretaría, coordinación o docentes</span>
                                </span>
                                <span className="flex items-center gap-1 text-[15px] font-semibold text-[#1E3A7B]">
                                    Iniciar sesión
                                    <ChevronDown className={cn('size-[18px] transition-transform duration-200', operativo && 'rotate-180')} />
                                </span>
                            </button>

                            {operativo && (
                                <div id="acceso-operativo" className="animate-in fade-in slide-in-from-top-2 duration-300 motion-reduce:animate-none">
                                    <form onSubmit={submit} className="flex flex-col gap-6 pt-5">
                                        {status && <p className="rounded-[14px] bg-[#DCE5F8] px-4 py-3 text-sm text-[#172E63]">{status}</p>}

                                        <div className="flex flex-col gap-[18px]">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="usuario" className="text-sm font-medium">
                                                    Usuario
                                                </label>
                                                <input
                                                    id="usuario"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    autoComplete="username"
                                                    autoCapitalize="none"
                                                    spellCheck={false}
                                                    value={data.usuario}
                                                    onChange={(e) => setData('usuario', e.target.value)}
                                                    placeholder="Ej. jperez"
                                                    className={campo}
                                                    aria-invalid={!!errors.usuario}
                                                    aria-describedby={errors.usuario ? 'usuario-error' : undefined}
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
                                                        id="password"
                                                        type={verClave ? 'text' : 'password'}
                                                        required
                                                        autoComplete="current-password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        placeholder="••••••••"
                                                        className={`${campo} pr-13`}
                                                        aria-invalid={!!errors.password}
                                                        aria-describedby={errors.password ? 'password-error' : undefined}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setVerClave((v) => !v)}
                                                        aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'}
                                                        className="absolute right-1 flex size-11 items-center justify-center rounded-[10px] text-[#56627F] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none"
                                                    >
                                                        {verClave ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <p id="password-error" className="animate-in fade-in text-sm text-[#B42318] duration-200">
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-[#3E4A68]">
                                                <input
                                                    type="checkbox"
                                                    checked={data.remember}
                                                    onChange={(e) => setData('remember', e.target.checked)}
                                                    className="size-[18px] cursor-pointer accent-[#1E3A7B]"
                                                />
                                                Mantener la sesión iniciada
                                            </label>
                                        </div>

                                        <div className="space-y-3.5">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#1E3A7B] text-base font-semibold text-white transition-all duration-200 hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.98] disabled:opacity-70"
                                            >
                                                {processing && <LoaderCircle className="size-4 animate-spin" />}
                                                Ingresar
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
