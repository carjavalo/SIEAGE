import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, Eye, EyeOff, FileText, LoaderCircle, User, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type LoginForm = {
    usuario: string;
    password: string;
    remember: boolean;
};

const modulos = [
    { nombre: 'Estudiantes', icono: User, color: 'text-[#1F7A5C]' },
    { nombre: 'Acudientes', icono: Users, color: 'text-[#9A4A26]' },
    { nombre: 'Matrículas', icono: CalendarDays, color: 'text-[#1F7A5C]' },
    { nombre: 'Constancias', icono: FileText, color: 'text-[#9A4A26]' },
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
        'h-[52px] w-full rounded-[14px] border-[1.5px] border-[#D5E8E0] bg-white px-4 text-[15px] text-[#17302A] outline-none transition placeholder:text-[#8AA39C] focus:border-[#9ADBC3] focus:ring-4 focus:ring-[#DDF4EA]';

    return (
        <>
            <Head title="Ingresar">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=outfit:400,500,600" rel="stylesheet" />
            </Head>

            <div className="grid min-h-screen bg-white p-4 font-['Outfit',ui-sans-serif,system-ui,sans-serif] text-[#17302A] lg:grid-cols-2">
                <section className="hidden flex-col justify-between rounded-[32px] bg-[#F2FBF7] p-12 lg:flex">
                    <div className="flex items-center gap-3">
                        <img src="/logo-escuela.jpg" alt="" className="size-11 rounded-xl object-cover" />
                        <div className="leading-tight">
                            <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                            <p className="text-[13px] text-[#55706A]">I.E. Alfonso López Pumarejo · Cali</p>
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

                    <p className="text-[13px] text-[#55706A]">Sistema de gestión académica</p>
                </section>

                <section className="flex items-center justify-center px-2 py-12 sm:px-12">
                    <form onSubmit={submit} className="flex w-full max-w-[400px] flex-col gap-7">
                        <div className="flex items-center gap-3 lg:hidden">
                            <img src="/logo-escuela.jpg" alt="" className="size-11 rounded-xl object-cover" />
                            <p className="text-xl font-semibold tracking-tight">SIEAGE</p>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-[34px] font-semibold tracking-[-0.02em]">Bienvenido de nuevo</h2>
                            <p className="text-base text-[#55706A]">Ingresa con el usuario y la clave que te asignaron.</p>
                        </div>

                        {status && <p className="rounded-[14px] bg-[#DDF4EA] px-4 py-3 text-sm text-[#165C45]">{status}</p>}

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
                                        className="absolute right-1 flex size-11 items-center justify-center rounded-[10px] text-[#55706A] transition hover:bg-[#F2FBF7]"
                                    >
                                        {verClave ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-[#B42318]">{errors.password}</p>}
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#3C564F]">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="size-[18px] accent-[#1F7A5C]"
                                />
                                Mantener la sesión iniciada
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[#1F7A5C] text-base font-semibold text-white transition hover:bg-[#165C45] disabled:opacity-70"
                        >
                            {processing && <LoaderCircle className="size-4 animate-spin" />}
                            Ingresar
                        </button>

                        <p className="rounded-[14px] bg-[#FFF4EE] px-4 py-3.5 text-sm leading-relaxed text-[#7A3E22]">
                            ¿No tienes usuario u olvidaste tu clave? Pídelos a la coordinación académica.
                        </p>
                    </form>
                </section>
            </div>
        </>
    );
}
