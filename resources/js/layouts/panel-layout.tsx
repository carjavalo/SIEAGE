import { AyudaOperador } from '@/components/ayuda-operador';
import { Lavado } from '@/components/lavado';
import { MenuUsuario } from '@/components/menu-usuario';
import { SaltarAlContenido } from '@/components/saltar-al-contenido';
import { usePulso } from '@/hooks/use-pulso';
import { type Permiso, puede } from '@/lib/permisos';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, ClipboardList, GraduationCap, NotebookPen, UploadCloud, UserCog } from 'lucide-react';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** El menú: cada entrada se ve solo con su permiso (Usuarios → Roles y permisos). */
const enlaces: { titulo: string; href: string; icono: typeof GraduationCap; permiso: Permiso }[] = [
    { titulo: 'Estudiantes', href: '/estudiantes', icono: GraduationCap, permiso: 'ver-estudiantes' },
    { titulo: 'Inscritos', href: '/inscritos', icono: ClipboardList, permiso: 'ver-inscritos' },
    // Las notas de transición: abre el primer grupo de transición de sus sedes.
    { titulo: 'Boletines', href: '/boletines', icono: NotebookPen, permiso: 'escribir-boletines' },
    { titulo: 'Importar datos', href: '/dashboard', icono: UploadCloud, permiso: 'importar-datos' },
    { titulo: 'Sedes', href: '/sedes', icono: Building2, permiso: 'ver-sedes' },
    { titulo: 'Usuarios', href: '/usuarios', icono: UserCog, permiso: 'gestionar-usuarios' },
];

/** La página que se mostró antes: para saber si se llega de otra (fundido) o es la misma con otros datos. */
let paginaAnterior: string | null = null;

/**
 * `completa`: en pantallas grandes la página ocupa exactamente el alto de la
 * ventana y no se desplaza; cada panel interno se desplaza por su cuenta. En
 * celular vuelve al flujo normal con scroll, porque ahí no cabe todo junto.
 */
export default function PanelLayout({
    titulo,
    completa,
    tema = 'claro',
    children,
}: {
    titulo: string;
    completa?: boolean;
    /** `sieage`: el fondo con el mosaico del logo, como la interfaz anterior. Hoy solo lo usa Boletines. */
    tema?: 'claro' | 'sieage';
    children: ReactNode;
}) {
    // El encabezado es azul en todas las páginas del panel; el tema solo cambia el fondo del contenido.
    const mosaico = tema === 'sieage';
    const pagina = usePage<SharedData>();
    // Lo que cambien otros (una inscripción nueva, una matrícula) llega sin recargar.
    usePulso();

    // Antes de pintar: ver html.panel en app.css (la barra de desplazamiento no corre nada).
    useLayoutEffect(() => {
        document.documentElement.classList.add('panel');
        return () => document.documentElement.classList.remove('panel');
    }, []);
    // Al llegar desde otra página el contenido aparece con un fundido; el encabezado y el
    // degradado se quedan quietos. Cambiar de grado o de pestaña (la misma página) no parpadea.
    const [entrar] = useState(() => paginaAnterior !== null && paginaAnterior !== pagina.component);
    useEffect(() => {
        paginaAnterior = pagina.component;
    }, [pagina.component]);

    // Si el menú se desplaza de lado (celular angosto), la página en que se está queda a la vista.
    const nav = useRef<HTMLElement>(null);
    useLayoutEffect(() => {
        const activo = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
        if (nav.current && activo && nav.current.scrollWidth > nav.current.clientWidth) {
            nav.current.scrollLeft = activo.offsetLeft - (nav.current.clientWidth - activo.offsetWidth) / 2;
        }
    }, [pagina.url]);

    const { auth } = pagina.props;
    const pendientes = pagina.props.inscritosPendientes;
    // «Usuarios» también lo ve quien solo maneja roles: entra directo a Roles y permisos.
    const menu = enlaces
        .map((e) =>
            e.href === '/usuarios' && !puede(auth, e.permiso) && puede(auth, 'gestionar-roles')
                ? { ...e, href: '/usuarios/roles', permiso: 'gestionar-roles' as const }
                : e,
        )
        .filter((e) => puede(auth, e.permiso));

    return (
        <>
            <Head title={titulo} />

            <div
                className="min-h-screen bg-white font-sans text-[#16223F] print:bg-white"
                style={
                    mosaico
                        ? {
                              // Fondo del contenido: el mismo mosaico del logotipo que usa Sieage
                              // (public/fondo-sieage.png, tomado de su interfaz). Va fijo para que
                              // no se arrastre al desplazar la página.
                              backgroundImage: 'url(/fondo-sieage.png)',
                              backgroundRepeat: 'repeat',
                              backgroundAttachment: 'fixed',
                          }
                        : undefined
                }
            >
                <SaltarAlContenido />
                <header className="sticky top-0 z-30 border-b border-[#16284F] bg-[#1E3A7B] text-white print:hidden">
                    {/* El mismo ancho que <main> en todas las páginas: el logo y el menú nunca se corren al cambiar de página. */}
                    <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 md:gap-6 md:px-8 2xl:max-w-[1760px]">
                        <Link
                            href="/"
                            className="flex shrink-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
                        >
                            {/* Con su tamaño, el espacio queda reservado antes de que cargue: el menú no se corre. */}
                            <img src="/sieage-logo.webp" alt="SIEAGE" width={150} height={188} className="h-10 w-auto rounded-md object-contain" />
                            {/* Solo en pantallas anchas: antes, el espacio es para el menú. */}
                            <div className="hidden leading-tight xl:block">
                                <p className="text-[15px] font-semibold tracking-tight">SIEAGE</p>
                                <p className="text-xs text-white/75">I.E. Alfonso López Pumarejo</p>
                            </div>
                        </Link>

                        {/* Si en un celular angosto no caben todos, el menú se desplaza de lado en vez de correr la página. */}
                        <nav
                            ref={nav}
                            aria-label="Principal"
                            className="relative flex min-w-0 items-center gap-1 overflow-x-auto rounded-full bg-white/10 p-1 [scrollbar-width:none]"
                        >
                            {menu.map(({ titulo: t, href, icono: Icono }) => {
                                const activo = pagina.url.startsWith(href.replace('/roles', ''));
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-current={activo ? 'page' : undefined}
                                        title={t}
                                        className={cn(
                                            'relative flex shrink-0 items-center gap-2 rounded-full px-2.5 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none sm:px-3 lg:px-3.5',
                                            activo ? 'bg-white text-[#1E3A7B] shadow-sm' : 'text-white hover:bg-white/15',
                                        )}
                                    >
                                        <Icono aria-hidden className="size-4" />
                                        {/* Hasta lg solo se ve el ícono (con los nombres no cabe), pero el lector de pantalla sigue leyendo el nombre. */}
                                        <span className="sr-only lg:not-sr-only">{t}</span>
                                        {href === '/inscritos' && pendientes > 0 && (
                                            <>
                                                <span
                                                    aria-hidden
                                                    className="min-w-5 rounded-full bg-white px-1.5 text-center text-[11px] leading-5 font-semibold text-[#1E3A7B] tabular-nums"
                                                >
                                                    {pendientes}
                                                </span>
                                                <span className="sr-only">, {pendientes} pendientes</span>
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="ml-auto flex items-center gap-2">
                            <AyudaOperador tono="azul" />
                            {auth.user && <MenuUsuario user={auth.user} tono="azul" />}
                        </div>
                    </div>
                </header>

                <Lavado />

                <main
                    id="contenido"
                    tabIndex={-1}
                    className={cn(
                        'outline-none',
                        // Ancho y margen de arriba iguales en todas las páginas: el título queda
                        // siempre en el mismo sitio. En pantallas bajas (portátiles) el margen se
                        // recorta para que quepa más.
                        'relative mx-auto max-w-[1400px] px-4 pt-1.5 md:px-8 2xl:max-w-[1760px] print:max-w-none print:p-0 [@media(min-height:860px)]:pt-4',
                        // Solo opacidad: un transform aquí movería lo que va fijo (la ficha, el velo).
                        entrar && 'animate-in fade-in-0 duration-300 ease-out motion-reduce:animate-none',
                        // 4rem del encabezado + 1px de su borde inferior.
                        completa ? 'pb-2 lg:flex lg:h-[calc(100dvh-4rem-1px)] lg:flex-col [@media(min-height:860px)]:pb-4' : 'pb-10',
                    )}
                >
                    {children}
                </main>
            </div>
        </>
    );
}
