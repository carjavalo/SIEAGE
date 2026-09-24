import { panelDesplegable, useAlPulsarFuera } from '@/components/desplegable';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

const opcion =
    'flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[15px] text-[#16223F] transition-colors outline-none hover:bg-[#EEF2FB] hover:text-[#1E3A7B] focus-visible:bg-[#EEF2FB] focus-visible:text-[#1E3A7B]';

/** Menú del usuario del encabezado: sus datos, la configuración y cerrar sesión. */
export function MenuUsuario({ user }: { user: User }) {
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef<HTMLDivElement>(null);
    const boton = useRef<HTMLButtonElement>(null);
    const menu = useRef<HTMLDivElement>(null);
    const iniciales = useInitials()(user.name);

    const cerrar = useCallback(() => setAbierto(false), []);
    useAlPulsarFuera(contenedor, abierto, cerrar);

    // Al abrir, el foco pasa a la primera opción para usarlo con el teclado.
    useEffect(() => {
        if (abierto) menu.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus();
    }, [abierto]);

    const alTeclear = (e: KeyboardEvent) => {
        const opciones = [...(menu.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [])];
        const i = opciones.indexOf(document.activeElement as HTMLElement);
        if (e.key === 'Escape') {
            cerrar();
            boton.current?.focus();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            opciones[(i + (e.key === 'ArrowDown' ? 1 : -1) + opciones.length) % opciones.length]?.focus();
        } else if (e.key === 'Tab') {
            return cerrar();
        } else return;
        e.preventDefault();
        e.stopPropagation(); // en la página, ↑ ↓ y Esc tienen otros usos
    };

    return (
        <div ref={contenedor} className="relative" onKeyDown={abierto ? alTeclear : undefined}>
            <button
                ref={boton}
                type="button"
                aria-haspopup="menu"
                aria-expanded={abierto}
                onClick={() => setAbierto((a) => !a)}
                className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-full p-1 pr-3 text-sm transition-colors outline-none hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6]',
                    abierto && 'bg-[#EEF2FB]',
                )}
            >
                <Avatar iniciales={iniciales} />
                <span className="hidden max-w-[160px] truncate font-medium sm:inline">{user.name}</span>
                <ChevronDown aria-hidden className={cn('size-4 text-[#56627F] transition-transform duration-200', abierto && 'rotate-180')} />
            </button>

            {abierto && (
                <div ref={menu} role="menu" aria-label="Menú del usuario" className={cn(panelDesplegable, 'right-0 w-64')}>
                    <div className="flex items-center gap-3 px-3 pt-2 pb-3">
                        <Avatar iniciales={iniciales} grande />
                        <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold text-[#16223F]">{user.name}</p>
                            <p className="truncate text-[13px] text-[#56627F]">{user.usuario}</p>
                        </div>
                    </div>
                    <div aria-hidden className="mx-1.5 mb-1.5 h-px bg-[#EEF2F9]" />
                    <Link href={route('profile.edit')} role="menuitem" prefetch onClick={cerrar} className={opcion}>
                        <Settings className="size-4 text-[#56627F]" />
                        Configuración
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        role="menuitem"
                        onClick={cerrar}
                        className={cn(
                            opcion,
                            'text-[#A12B2B] hover:bg-[#FDECEC] hover:text-[#A12B2B] focus-visible:bg-[#FDECEC] focus-visible:text-[#A12B2B]',
                        )}
                    >
                        <LogOut className="size-4" />
                        Cerrar sesión
                    </Link>
                </div>
            )}
        </div>
    );
}

function Avatar({ iniciales, grande }: { iniciales: string; grande?: boolean }) {
    return (
        <span
            aria-hidden
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full bg-[#1E3A7B] font-semibold text-white',
                grande ? 'size-10 text-[15px]' : 'size-8 text-[13px]',
            )}
        >
            {iniciales}
        </span>
    );
}
