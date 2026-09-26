import { Resaltado } from '@/components/estudiantes/etiquetas';
import { Tecla, Vacio, td, th } from '@/components/estudiantes/lista-estudiantes';
import { VeloFicha } from '@/components/ficha';
import { botonPrimario } from '@/components/formulario';
import { MarcaActivo, PanelUsuario, type Usuario } from '@/components/usuarios/panel-usuario';
import PanelLayout from '@/layouts/panel-layout';
import { palabras, plano } from '@/lib/estudiantes';
import { type Rol, haceCuanto, inicialesPersona, nombreRol, puntoRol } from '@/lib/usuarios';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Search, UserPlus, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

type FiltroEstado = 'activos' | 'desactivados' | 'todos';

const alto = '[@media(min-height:860px)]';

/**
 * Quién puede ingresar a SIEAGE y con qué rol. Mismo marco que Estudiantes:
 * roles en segmentos, la lista y un panel lateral para crear o editar.
 */
export default function Usuarios({ usuarios, roles }: { usuarios: Usuario[]; roles: Rol[] }) {
    const { auth } = usePage<SharedData>().props;
    const [rolId, setRolId] = useState<number | null>(null);
    const [estado, setEstado] = useState<FiltroEstado>('todos');
    const [filtro, setFiltro] = useState('');
    const [abierto, setAbierto] = useState<'nuevo' | number | null>(null);
    const campoFiltro = useRef<HTMLInputElement>(null);
    const panel = useRef<HTMLElement>(null);
    const franjaRoles = useRef<HTMLElement>(null);

    const buscadas = useMemo(() => palabras(filtro), [filtro]);
    const delRol = useMemo(() => usuarios.filter((u) => rolId === null || u.rol_id === rolId), [usuarios, rolId]);
    const conTexto = useMemo(
        () => delRol.filter((u) => buscadas.every((p) => plano(`${u.name} ${u.usuario} ${u.email ?? ''}`).includes(p))),
        [delRol, buscadas],
    );
    const visibles = useMemo(() => conTexto.filter((u) => estado === 'todos' || (estado === 'activos' ? u.activo : !u.activo)), [conTexto, estado]);
    const activos = usuarios.filter((u) => u.activo).length;
    // El usuario abierto se busca en las props: después de guardar, el panel muestra lo nuevo.
    const elegido = typeof abierto === 'number' ? (usuarios.find((u) => u.id === abierto) ?? null) : null;

    // "/" lleva a la búsqueda. Esc cierra el panel; si se está escribiendo, primero sale del campo (lo escrito no se pierde).
    useEffect(() => {
        const alTeclear = (ev: KeyboardEvent) => {
            const t = ev.target;
            if (!(t instanceof HTMLElement) || ev.ctrlKey || ev.metaKey || ev.altKey) return;
            const enCampo = t.matches('input, select, textarea');
            if (ev.key === '/' && !enCampo) {
                ev.preventDefault();
                campoFiltro.current?.focus();
            } else if (ev.key === 'Escape' && abierto !== null) {
                if (enCampo) t.blur();
                else setAbierto(null);
            }
        };
        window.addEventListener('keydown', alTeclear);
        return () => window.removeEventListener('keydown', alTeclear);
    });

    const conteo = (id: number | null) => usuarios.filter((u) => id === null || u.rol_id === id).length;

    // En celular los roles no caben: la franja se desliza y se desvanece por el lado
    // en que queda algo más, para que se note que sigue.
    useLayoutEffect(() => {
        const f = franjaRoles.current;
        if (!f) return;
        const medir = () => {
            f.dataset.antes = String(f.scrollLeft > 1);
            f.dataset.despues = String(f.scrollLeft + f.clientWidth < f.scrollWidth - 1);
        };
        const observador = new ResizeObserver(medir);
        observador.observe(f);
        f.addEventListener('scroll', medir, { passive: true });
        medir();
        return () => {
            observador.disconnect();
            f.removeEventListener('scroll', medir);
        };
    }, []);

    return (
        <PanelLayout titulo="Usuarios" completa>
            {/* Primera franja: título y totales, roles en segmentos, búsqueda y "Nuevo usuario". */}
            <section className="relative flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 xl:flex-nowrap">
                <div className="shrink-0">
                    <h1 className={`text-[24px] leading-[26px] font-semibold tracking-[-0.025em] ${alto}:text-[28px] ${alto}:leading-8`}>Usuarios</h1>
                    <p className={`mt-0.5 text-[13px] leading-4 whitespace-nowrap text-[#56627F] ${alto}:mt-1 ${alto}:text-[14px] ${alto}:leading-5`}>
                        <b className="font-semibold text-[#16223F] tabular-nums">{activos}</b> activos
                        {usuarios.length > activos && (
                            <>
                                <span aria-hidden className="mx-1.5 text-[#8C97B3]">
                                    ·
                                </span>
                                <b className="font-semibold text-[#16223F] tabular-nums">{usuarios.length - activos}</b> desactivados
                            </>
                        )}
                    </p>
                </div>

                <nav
                    ref={franjaRoles}
                    aria-label="Roles"
                    data-antes="false"
                    data-despues="false"
                    className={`order-last flex h-11 w-full min-w-0 snap-x items-stretch gap-0.5 overflow-x-auto rounded-[16px] bg-[#D3DDF3]/45 p-1 ring-1 ring-white/70 [--antes:#000] [--despues:#000] [mask-image:linear-gradient(to_right,var(--antes),#000_40px,#000_calc(100%-40px),var(--despues))] [scrollbar-width:none] data-[antes=true]:[--antes:transparent] data-[despues=true]:[--despues:transparent] xl:order-none xl:w-auto xl:flex-1 ${alto}:h-[52px] ${alto}:rounded-[18px]`}
                >
                    {[{ id: null, nombre: null } as { id: number | null; nombre: string | null }, ...roles].map((r) => {
                        const actual = r.id === rolId;
                        return (
                            <button
                                key={r.id ?? 'todos'}
                                type="button"
                                onClick={(e) => {
                                    setRolId(r.id);
                                    // Si el rol quedó a medias fuera de la franja, se trae a la vista.
                                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                                }}
                                aria-pressed={actual}
                                className={cn(
                                    `flex min-w-fit flex-1 cursor-pointer snap-start items-center justify-center gap-2 rounded-[12px] px-3 transition duration-200 focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none ${alto}:rounded-[14px]`,
                                    actual
                                        ? 'bg-white text-[#1E3A7B] shadow-[0_1px_3px_rgba(22,34,63,0.14)] ring-1 ring-[#C4D2F1]'
                                        : 'text-[#16223F] hover:bg-white/60',
                                )}
                            >
                                {r.nombre && <span aria-hidden className={cn('size-2 rounded-full', puntoRol(r.nombre))} />}
                                <span className={`text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap ${alto}:text-[16px]`}>
                                    {r.nombre ? nombreRol(r.nombre) : 'Todos'}
                                </span>
                                <span className={cn('text-[13px] tabular-nums', actual ? 'text-[#4863B8]' : 'text-[#56627F]')}>{conteo(r.id)}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="ml-auto flex w-full items-center gap-3 sm:w-auto">
                    <div className="relative min-w-0 flex-1 sm:w-[260px] 2xl:w-[300px]">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[#5E6983]" />
                        <input
                            ref={campoFiltro}
                            type="search"
                            autoComplete="off"
                            spellCheck={false}
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            placeholder="Buscar nombre o usuario"
                            aria-label="Buscar usuario por nombre, usuario o correo"
                            className={`h-10 w-full rounded-[14px] border-[1.5px] border-[#D3DDF3] bg-white pr-10 pl-10 text-[15px] text-[#16223F] shadow-[0_1px_2px_rgba(22,34,63,0.05)] transition outline-none placeholder:text-[#6B7690] hover:border-[#B7C6EA] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] [&::-webkit-search-cancel-button]:hidden ${alto}:h-11`}
                        />
                        {filtro ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setFiltro('');
                                    campoFiltro.current?.focus();
                                }}
                                aria-label="Limpiar búsqueda"
                                className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#56627F] hover:bg-[#EEF2FB] hover:text-[#16223F]"
                            >
                                <X className="size-4" />
                            </button>
                        ) : (
                            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-md border border-[#D3DDF3] bg-[#F5F7FC] px-1.5 font-sans text-[12px] text-[#56627F] sm:flex">
                                /
                            </kbd>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setAbierto('nuevo')}
                        aria-label="Nuevo usuario"
                        className={cn(botonPrimario, `h-10 shrink-0 max-sm:px-4 ${alto}:h-11`)}
                    >
                        <UserPlus aria-hidden className="size-[18px]" />
                        <span className="sm:hidden">Nuevo</span>
                        <span className="hidden sm:inline">Nuevo usuario</span>
                    </button>
                </div>
            </section>

            <div className="relative mt-3 flex min-h-[420px] flex-col lg:min-h-0 lg:flex-1 lg:flex-row [@media(min-height:860px)]:mt-5">
                <section
                    aria-label="Lista de usuarios"
                    className="flex min-h-[420px] min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#E3E9F6] bg-white shadow-[0_1px_2px_rgba(22,34,63,0.04),0_12px_32px_-20px_rgba(22,34,63,0.18)] lg:min-h-0"
                >
                    <div
                        className={`flex shrink-0 flex-col gap-2.5 border-b border-[#EEF2F9] px-4 py-2.5 md:h-[42px] md:flex-row md:items-center md:gap-4 md:px-5 md:py-0 ${alto}:md:h-12`}
                    >
                        <h2 className="text-[16px] font-semibold tracking-[-0.01em] whitespace-nowrap">
                            {rolId === null ? 'Todos los usuarios' : nombreRol(roles.find((r) => r.id === rolId)?.nombre)}
                        </h2>
                        <div role="group" aria-label="Estado" className="flex shrink-0 gap-0.5 rounded-[11px] bg-[#F1F4FA] p-[3px]">
                            {(
                                [
                                    ['todos', 'Todos'],
                                    ['activos', 'Activos'],
                                    ['desactivados', 'Desactivados'],
                                ] as [FiltroEstado, string][]
                            ).map(([clave, nombre]) => {
                                const on = estado === clave;
                                const n = conTexto.filter((u) => clave === 'todos' || (clave === 'activos' ? u.activo : !u.activo)).length;
                                return (
                                    <button
                                        key={clave}
                                        type="button"
                                        aria-pressed={on}
                                        onClick={() => setEstado(clave)}
                                        className={cn(
                                            'flex h-[30px] cursor-pointer items-center gap-1.5 rounded-[9px] px-2.5 text-sm font-medium whitespace-nowrap transition',
                                            on
                                                ? 'bg-white text-[#1E3A7B] shadow-[0_1px_3px_rgba(22,34,63,0.12)]'
                                                : 'text-[#56627F] hover:text-[#16223F]',
                                        )}
                                    >
                                        {nombre}
                                        <span className={cn('tabular-nums', on ? 'text-[#4863B8]' : 'text-[#5E6983]')}>{n}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="ml-auto hidden shrink-0 items-center gap-1.5 text-[12px] text-[#5E6983] xl:flex">
                            <Tecla>/</Tecla>
                            <span>buscar</span>
                            <Tecla className="ml-1.5 px-1">Esc</Tecla>
                            <span>cerrar el panel</span>
                        </p>
                    </div>

                    <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]">
                        {visibles.length === 0 ? (
                            <Vacio
                                titulo="Nadie coincide con los filtros"
                                texto="Prueba con otro rol, estado o nombre."
                                onQuitar={() => {
                                    setFiltro('');
                                    setRolId(null);
                                    setEstado('todos');
                                }}
                            />
                        ) : (
                            <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                                <thead>
                                    <tr>
                                        <th scope="col" className={cn(th, 'pl-4 sm:pl-5')}>
                                            Persona
                                        </th>
                                        <th scope="col" className={cn(th, 'hidden w-[180px] md:table-cell')}>
                                            Usuario
                                        </th>
                                        <th scope="col" className={cn(th, 'hidden w-[150px] sm:table-cell')}>
                                            Rol
                                        </th>
                                        <th scope="col" className={cn(th, 'hidden lg:table-cell')}>
                                            Correo
                                        </th>
                                        <th scope="col" className={cn(th, 'hidden w-[150px] sm:table-cell')}>
                                            Último ingreso
                                        </th>
                                        <th scope="col" className={cn(th, 'w-[118px] pr-4 sm:w-[130px] sm:pr-5')}>
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibles.map((u) => {
                                        const elegida = u.id === abierto;
                                        const celda = cn(td, elegida ? 'bg-[#EEF2FB]' : 'group-hover:bg-[#F7F9FD]');
                                        return (
                                            <tr
                                                key={u.id}
                                                data-fila={u.id}
                                                tabIndex={0}
                                                aria-selected={elegida}
                                                onClick={() => setAbierto(u.id)}
                                                onKeyDown={(e) => e.key === 'Enter' && setAbierto(u.id)}
                                                className="group cursor-pointer outline-none"
                                            >
                                                <td
                                                    className={cn(
                                                        celda,
                                                        'h-[60px] pl-4 group-focus-visible:shadow-[inset_3px_0_0_#1E3A7B] sm:pl-5 md:h-12',
                                                        elegida && 'shadow-[inset_3px_0_0_#1E3A7B]',
                                                    )}
                                                >
                                                    <span className="flex min-w-0 items-center gap-3">
                                                        <span
                                                            aria-hidden
                                                            className={cn(
                                                                'flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
                                                                u.activo ? 'bg-[#EEF2FB] text-[#1E3A7B]' : 'bg-[#F1F2F6] text-[#8C97B3]',
                                                            )}
                                                        >
                                                            {inicialesPersona(u.name)}
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="flex min-w-0 items-center gap-2">
                                                                <span
                                                                    className={cn(
                                                                        'truncate font-medium',
                                                                        u.activo ? 'text-[#16223F]' : 'text-[#56627F]',
                                                                    )}
                                                                >
                                                                    <Resaltado texto={u.name} buscadas={buscadas} />
                                                                </span>
                                                                {u.id === auth.user.id && (
                                                                    <span className="shrink-0 rounded-full bg-[#EEF2FB] px-2 py-0.5 text-[12px] leading-4 font-medium text-[#1E3A7B]">
                                                                        tú
                                                                    </span>
                                                                )}
                                                            </span>
                                                            {/* Lo que en pantallas anchas va en sus columnas: el usuario (hasta md) y el rol (hasta sm). */}
                                                            <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] leading-[18px] text-[#56627F] md:hidden">
                                                                <span className="truncate">
                                                                    @<Resaltado texto={u.usuario} buscadas={buscadas} />
                                                                </span>
                                                                <span className="flex shrink-0 items-center gap-1.5 sm:hidden">
                                                                    <span aria-hidden className="text-[#8C97B3]">
                                                                        ·
                                                                    </span>
                                                                    <span
                                                                        aria-hidden
                                                                        className={cn(
                                                                            'size-1.5 rounded-full',
                                                                            u.activo ? puntoRol(u.rol?.nombre) : 'bg-[#AEB7CC]',
                                                                        )}
                                                                    />
                                                                    {nombreRol(u.rol?.nombre)}
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className={cn(celda, 'hidden truncate text-[#3E4A68] md:table-cell')}>
                                                    @<Resaltado texto={u.usuario} buscadas={buscadas} />
                                                </td>
                                                <td className={cn(celda, 'hidden sm:table-cell')}>
                                                    <span className="inline-flex items-center gap-2 text-[#16223F]">
                                                        <span
                                                            aria-hidden
                                                            className={cn('size-2 rounded-full', u.activo ? puntoRol(u.rol?.nombre) : 'bg-[#AEB7CC]')}
                                                        />
                                                        {nombreRol(u.rol?.nombre)}
                                                    </span>
                                                </td>
                                                <td className={cn(celda, 'hidden truncate text-[#3E4A68] lg:table-cell')}>
                                                    {u.email ? (
                                                        <Resaltado texto={u.email} buscadas={buscadas} />
                                                    ) : (
                                                        <span className="text-[#6B7690]">—</span>
                                                    )}
                                                </td>
                                                <td className={cn(celda, 'hidden text-[#56627F] sm:table-cell')}>{haceCuanto(u.ultimo_acceso)}</td>
                                                <td className={cn(celda, 'pr-4 sm:pr-5')}>
                                                    <MarcaActivo activo={u.activo} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                <PanelUsuario
                    abierto={abierto === 'nuevo' ? 'nuevo' : elegido}
                    esYo={elegido?.id === auth.user.id}
                    roles={roles}
                    panel={panel}
                    onCerrar={() => setAbierto(null)}
                />
            </div>

            <VeloFicha abierta={abierto !== null} />
        </PanelLayout>
    );
}
