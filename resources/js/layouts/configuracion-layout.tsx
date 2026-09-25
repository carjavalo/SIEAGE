import { Lavado } from '@/components/lavado';
import PanelLayout from '@/layouts/panel-layout';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { KeyRound, UserRound } from 'lucide-react';
import { type ReactNode } from 'react';

const secciones = [
    { titulo: 'Mi perfil', href: '/settings/profile', icono: UserRound },
    { titulo: 'Mi clave', href: '/settings/password', icono: KeyRound },
];

/** Configuración de la propia cuenta: el mismo marco del panel, con sus pestañas. */
export default function ConfiguracionLayout({ titulo, children }: { titulo: string; children: ReactNode }) {
    const { url } = usePage();

    return (
        <PanelLayout titulo={titulo}>
            <Lavado />

            <div className="relative max-w-[880px]">
                <h1 className="text-[28px] leading-8 font-semibold tracking-[-0.025em]">Configuración</h1>
                <p className="mt-1 text-[15px] text-[#56627F]">Tu cuenta en SIEAGE: tus datos y tu clave para ingresar.</p>

                <nav
                    aria-label="Secciones de la configuración"
                    className="mt-5 flex h-11 w-full items-stretch gap-0.5 rounded-[16px] bg-[#D3DDF3]/45 p-1 ring-1 ring-white/70 sm:w-fit"
                >
                    {secciones.map(({ titulo: t, href, icono: Icono }) => {
                        const actual = url.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={actual ? 'page' : undefined}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-[15px] font-semibold tracking-[-0.01em] transition duration-200 focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none sm:flex-none',
                                    actual
                                        ? 'bg-white text-[#1E3A7B] shadow-[0_1px_3px_rgba(22,34,63,0.14)] ring-1 ring-[#C4D2F1]'
                                        : 'text-[#16223F] hover:bg-white/60',
                                )}
                            >
                                <Icono className="size-4" />
                                {t}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-5">{children}</div>
            </div>
        </PanelLayout>
    );
}
