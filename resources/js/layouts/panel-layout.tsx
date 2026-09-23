import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { GraduationCap, UploadCloud } from 'lucide-react';
import { type ReactNode } from 'react';

const enlaces = [
    { titulo: 'Estudiantes', href: '/estudiantes', icono: GraduationCap },
    { titulo: 'Importar datos', href: '/dashboard', icono: UploadCloud },
];

export default function PanelLayout({ titulo, children }: { titulo: string; children: ReactNode }) {
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
                    <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 md:px-8">
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

                        <div className="ml-auto">
                            {auth.user && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 rounded-full p-1 pr-3 text-sm transition-colors hover:bg-[#EEF2FB]">
                                            <UserInfo user={auth.user} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 print:max-w-none print:p-0">{children}</main>
            </div>
        </>
    );
}
