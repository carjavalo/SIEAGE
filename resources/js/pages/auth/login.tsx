import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, Eye, EyeOff, FileText, LoaderCircle, User, UserPlus, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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

    const campo =
        'h-[52px] w-full rounded-[14px] border-[1.5px] border-[#D3DDF3] bg-white px-4 text-[15px] text-[#16223F] outline-none transition placeholder:text-[#8C97B3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8]';

    return (
        <>
            <Head title="Ingresar">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=outfit:400,500,600" rel="stylesheet" />
            </Head>

            <div className="grid min-h-screen bg-white p-4 font-['Outfit',ui-sans-serif,system-ui,sans-serif] text-[#16223F] lg:grid-cols-2">
                <section className="hidden flex-col justify-between rounded-[32px] bg-gradient-to-b from-[#EEF2FB] to-[#DCE5F8] p-12 lg:flex">
                    <div className="flex items-center gap-3">
                        <img src="/sieage-logo.png" alt="SIEAGE" className="h-20 w-auto rounded-lg object-contain shadow-md" />
                        <div className="leading-tight">
                            <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                          
                        </div>
                    </div>

                    <div className="space-y-7">
                        <h1 className="max-w-lg text-5xl leading-[1.08] font-semibold tracking-[-0.03em]">
                            La información de tus estudiantes, en un solo lugar.
                        </h1>
                        <div className="flex flex-wrap gap-2.5">
                            {modulos.map(({ nombre, icono: Icono, color }) => (
                                <span key={nombre} className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm">
                                    <Icono className={`size-4 ${color}`} />
                                    {nombre}
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="text-[13px] text-[#56627F]">Sistema de gestión académica</p>
                </section>

                <section className="flex items-center justify-center px-2 py-12 sm:px-12">
                    <form onSubmit={submit} className="flex w-full max-w-[400px] flex-col gap-7">
                        <div className="flex items-center gap-3 lg:hidden">
                            <img src="/sieage-logo.png" alt="SIEAGE" className="h-14 w-auto rounded-lg object-contain shadow-sm" />
                            <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-[34px] font-semibold tracking-[-0.02em]">Bienvenido de nuevo</h2>
                            <p className="text-base text-[#56627F]">Ingresa con el usuario y la clave que te asignaron.</p>
                        </div>

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
                                />
                                {errors.usuario && <p className="text-sm text-[#B42318]">{errors.usuario}</p>}
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
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setVerClave((v) => !v)}
                                        aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'}
                                        className="absolute right-1 flex size-11 items-center justify-center rounded-[10px] text-[#56627F] transition hover:bg-[#EEF2FB]"
                                    >
                                        {verClave ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-[#B42318]">{errors.password}</p>}
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#3E4A68]">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="size-[18px] accent-[#1E3A7B]"
                                />
                                Mantener la sesión iniciada
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[#1E3A7B] text-base font-semibold text-white transition hover:bg-[#172E63] disabled:opacity-70"
                        >
                            {processing && <LoaderCircle className="size-4 animate-spin" />}
                            Ingresar
                        </button>

                        <p className="text-center text-sm text-[#56627F]">
                            ¿No tienes usuario u olvidaste tu clave? Pídelos a la coordinación académica.
                        </p>

                        <div className="flex flex-col gap-3 border-t border-[#D3DDF3] pt-6">
                            <p className="text-center text-[13px] text-[#56627F]">Si deseas inscribir a un estudiante, puedes hacerlo por aquí:</p>
                            <a
                                href="/inscripcion"
                                className="flex h-12 items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-[#6E8BD6] bg-[#EEF2FB] text-[15px] font-semibold text-[#1E3A7B] transition hover:bg-[#DCE5F8]"
                            >
                                <UserPlus className="size-[18px]" />
                                Inscribir estudiante
                            </a>
                        </div>
                    </form>
                </section>
            </div>
        </>
    );
}
