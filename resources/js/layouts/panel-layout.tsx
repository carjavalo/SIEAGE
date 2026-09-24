import { MenuUsuario } from '@/components/menu-usuario';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { GraduationCap, UploadCloud } from 'lucide-react';
import { type ReactNode } from 'react';

const enlaces = [
    { titulo: 'Estudiantes', href: '/estudiantes', icono: GraduationCap },
    { titulo: 'Importar datos', href: '/dashboard', icono: UploadCloud },
];

/**
 * `completa`: en pantallas grandes la página ocupa exactamente el alto de la
 * ventana y no se desplaza; cada panel interno se desplaza por su cuenta. En
 * celular vuelve al flujo normal con scroll, porque ahí no cabe todo junto.
 */
export default function PanelLayout({ titulo, completa, children }: { titulo: string; completa?: boolean; children: ReactNode }) {
    const pagina = usePage<SharedData>();
    const { auth } = pagina.props;

    return (
        <>
            <Head title={titulo}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=outfit:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#F5F7FC] font-['Outfit',ui-sans-serif,system-ui,sans-serif] text-[#16223F] print:bg-white">
                <header className="sticky top-0 z-30 border-b border-[#E3E9F6] bg-white/90 backdrop-blur print:hidden">
                    <div className={cn('mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 md:px-8', completa && '2xl:max-w-[1760px]')}>
                        <Link href="/estudiantes" className="flex shrink-0 items-center gap-3">
                            <img src="/sieage-logo.png" alt="SIEAGE" className="h-10 w-auto rounded-md object-contain" />
                            <div className="hidden leading-tight sm:block">
                                <p className="text-[15px] font-semibold tracking-tight">SIEAGE</p>
                                <p className="text-xs text-[#56627F]">I.E. Alfonso López Pumarejo</p>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-1 rounded-full bg-[#EEF2FB] p-1">
                            {enlaces.map(({ titulo: t, href, icono: Icono }) => {
                                const activo = pagina.url.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cn(
                                            'flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition',
                                            activo ? 'bg-white text-[#1E3A7B] shadow-sm' : 'text-[#56627F] hover:text-[#1E3A7B]',
                                        )}
                                    >
                                        <Icono className="size-4" />
                                        <span className="hidden md:inline">{t}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="ml-auto">{auth.user && <MenuUsuario user={auth.user} />}</div>
                    </div>
                </header>

                <main
                    className={cn(
                        'mx-auto max-w-[1400px] px-4 md:px-8 print:max-w-none print:p-0',
                        // 4rem del encabezado + 1px de su borde inferior. En pantallas bajas
                        // (portátiles) el margen vertical se recorta para que quepa más lista.
                        completa
                            ? 'pt-1.5 pb-2 lg:flex lg:h-[calc(100dvh-4rem-1px)] lg:flex-col 2xl:max-w-[1760px] [@media(min-height:860px)]:pt-4 [@media(min-height:860px)]:pb-4'
                            : 'py-8',
                    )}
                >
                    {children}
                </main>
            </div>
        </>
    );
}
