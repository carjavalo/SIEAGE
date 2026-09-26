import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Eye, EyeOff, FileText, LoaderCircle, Pointer, User, UserPlus, Users } from 'lucide-react';
import { type CSSProperties, FormEventHandler, useState } from 'react';

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Ingresar" />

            <div className="grid min-h-screen bg-white p-4 font-['Outfit',ui-sans-serif,system-ui,sans-serif] text-[#16223F] lg:grid-cols-2 lg:gap-4">
                {/* ------------------------------------------------ panel de marca */}
                <section className="relative hidden flex-col overflow-hidden rounded-[32px] bg-gradient-to-b from-[#EEF2FB] to-[#DCE5F8] p-12 lg:flex">
                    <div aria-hidden className="pointer-events-none absolute -top-28 -right-24 size-80 rounded-full bg-white/60 blur-3xl" />
                    <div aria-hidden className="pointer-events-none absolute -bottom-36 -left-24 size-96 rounded-full bg-[#C4D2F1]/70 blur-3xl" />

                    <div className={cn('relative flex items-baseline gap-2.5', aparecer)}>
                        <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                        <p className="text-[13px] text-[#56627F]">Sistema de gestión académica</p>
                    </div>

                    <div className="relative flex flex-1 items-center justify-center py-10 [@media(max-height:760px)]:py-5">
                        <div className={cn(aparecer, 'zoom-in-95')} style={tras(150)}>
                            <div className="relative">
                                <div aria-hidden className="absolute inset-x-4 top-10 bottom-0 rounded-[28px] bg-[#1E3A7B]/30 blur-2xl" />
                                {/* 188 px = alto real del archivo: se ve nítido, sin estirar. */}
                                <img
                                    src="/sieage-logo.png"
                                    alt="SIEAGE ADES versión 1.5, edición azul"
                                    className="animate-flotar relative h-[188px] w-auto rounded-[16px] shadow-[0_30px_60px_-24px_rgba(22,34,63,0.55)] ring-1 ring-white/70 motion-reduce:animate-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative space-y-6">
                        <h1
                            className={cn('max-w-lg text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance xl:text-5xl', aparecer)}
                            style={tras(250)}
                        >
                            La información de tus estudiantes, en un solo lugar.
                        </h1>
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
                            <img src="/sieage-logo.png" alt="" className="h-14 w-auto rounded-lg object-contain shadow-sm" />
                            <div className="leading-tight">
                                <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                                <p className="text-[13px] text-[#56627F]">Sistema de gestión académica</p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className={cn('space-y-2', aparecer)} style={tras(100)}>
                                <h2 className="text-[32px] leading-tight font-semibold tracking-[-0.02em]">Bienvenido de nuevo</h2>
                                <p className="text-base text-[#56627F]">Ingresa con el usuario y la clave que te asignaron.</p>
                            </div>

                            {status && <p className="rounded-[14px] bg-[#DCE5F8] px-4 py-3 text-sm text-[#172E63]">{status}</p>}

                            <div className={cn('flex flex-col gap-[18px]', aparecer)} style={tras(180)}>
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

                            <div className={cn('space-y-3.5', aparecer)} style={tras(260)}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#1E3A7B] text-base font-semibold text-white shadow-[0_12px_24px_-12px_rgba(30,58,123,0.6)] transition-all duration-200 hover:bg-[#172E63] hover:shadow-[0_16px_28px_-12px_rgba(30,58,123,0.7)] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.98] disabled:opacity-70"
                                >
                                    {processing && <LoaderCircle className="size-4 animate-spin" />}
                                    Ingresar
                                </button>
                                <p className="text-center text-[13px] text-balance text-[#56627F]">
                                    ¿Sin usuario o sin clave? Pídelos a coordinación académica.
                                </p>
                            </div>
                        </form>

                        {/* ---------------------------------------- inscripción (familias) */}
                        <div className={aparecer} style={tras(360)}>
                            <div className="rounded-[24px] bg-[#EEF2FB] p-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1E3A7B] shadow-[0_1px_2px_rgba(22,34,63,0.08)]">
                                        <UserPlus className="size-[18px]" />
                                    </span>
                                    <div className="leading-snug">
                                        <p className="text-[15px] font-semibold">¿Vas a inscribir a un estudiante?</p>
                                        <p className="text-[13px] text-[#56627F]">No necesitas usuario ni clave · 5 minutos</p>
                                    </div>
                                </div>

                                <div className="group mt-3.5 flex items-center gap-2.5">
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
                                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-[#6E8BD6] bg-white text-[15px] font-semibold text-[#1E3A7B] transition-all duration-200 hover:border-[#1E3A7B] hover:bg-[#1E3A7B] hover:text-white hover:shadow-[0_12px_24px_-12px_rgba(30,58,123,0.6)] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.98]"
                                    >
                                        Inscribir estudiante
                                        <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
