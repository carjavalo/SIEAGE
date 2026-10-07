import { Cabeza, Cuerpo, Marco, Pie, revisar, useAvisar } from '@/components/dialogo-formulario';
import { BotonGuardar, Campo, claseCampo, EstadoGuardado } from '@/components/formulario';
import PanelLayout from '@/layouts/panel-layout';
import { puntoRol } from '@/lib/usuarios';
import { cn } from '@/lib/utils';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CircleAlert, Copy, Lock, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { type FormEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { sileo } from 'sileo';

type Permiso = { clave: string; nombre: string; detalle: string };
type Area = { area: string; permisos: Permiso[] };
type RolFila = {
    id: number;
    nombre: string;
    etiqueta: string;
    descripcion: string | null;
    sistema: boolean;
    usuarios: number;
    inactivos: number;
    permisos: string[];
};
type Props = {
    roles: RolFila[];
    areas: Area[];
    /** Permiso → el que necesita para servir (corregir datos necesita ver estudiantes). */
    requiere: Record<string, string>;
    /** El rol recién creado: queda abierto. */
    elegido: number | null;
    puedeUsuarios: boolean;
};

const alto = '[@media(min-height:860px)]';
const boton =
    'flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none';

/**
 * Roles y permisos: a la izquierda los roles, a la derecha qué puede hacer el
 * elegido, con un interruptor por permiso agrupados por área. El administrador
 * se ve pero no se cambia: puede todo, siempre.
 */
export default function Roles({ roles, areas, requiere, elegido, puedeUsuarios }: Props) {
    const total = areas.reduce((s, a) => s + a.permisos.length, 0);
    const [id, setId] = useState<number | null>(() => elegido ?? roles.find((r) => !r.sistema)?.id ?? roles[0]?.id ?? null);
    const rol = roles.find((r) => r.id === id) ?? roles[0];
    // Crear uno (vacío o copiando otro): el id del que se copia, o 0 para empezar en blanco.
    const [nuevo, setNuevo] = useState<number | null>(null);
    const sucio = useRef(false);
    const marcarSucio = useCallback((v: boolean) => {
        sucio.current = v;
    }, []);

    // Al volver de crear uno, ese queda elegido.
    useEffect(() => {
        if (elegido) setId(elegido);
    }, [elegido]);

    const elegir = (otro: number) => {
        if (otro === rol?.id) return;
        if (sucio.current && !window.confirm(`Hay cambios sin guardar en «${rol.etiqueta}». ¿Descartarlos?`)) return;
        sucio.current = false;
        setId(otro);
    };

    return (
        <PanelLayout titulo="Roles y permisos" completa>
            <section className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3">
                {puedeUsuarios && (
                    <Link href="/usuarios" className={boton}>
                        <ArrowLeft className="size-4" />
                        Usuarios
                    </Link>
                )}
                <div className="min-w-0">
                    <h1 className={`text-[24px] leading-[26px] font-bold tracking-[-0.025em] ${alto}:text-[28px] ${alto}:leading-8`}>
                        Roles y permisos
                    </h1>
                    <p className="mt-0.5 text-[14px] text-[#56627F]">
                        Qué puede hacer cada rol en SIEAGE. Si un rol no ve todas las sedes, las de cada persona se marcan en Usuarios.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setNuevo(0)}
                    className="ml-auto flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
                >
                    <Plus className="size-[18px]" />
                    Nuevo rol
                </button>
            </section>

            <div className="mt-4 flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row">
                <nav aria-label="Roles" className="shrink-0 rounded-[28px] bg-[#F2F5FA] p-2 lg:w-[300px] lg:overflow-y-auto">
                    <ul className="space-y-1">
                        {roles.map((r) => {
                            const actual = r.id === rol?.id;
                            return (
                                <li key={r.id}>
                                    <button
                                        type="button"
                                        onClick={() => elegir(r.id)}
                                        aria-current={actual ? 'true' : undefined}
                                        className={cn(
                                            'flex w-full cursor-pointer items-start gap-3 rounded-[18px] px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none',
                                            actual ? 'bg-white shadow-[0_1px_3px_rgba(22,34,63,0.12)] ring-1 ring-[#C4D2F1]' : 'hover:bg-white/60',
                                        )}
                                    >
                                        <span aria-hidden className={cn('mt-[7px] size-2 shrink-0 rounded-full', puntoRol(r.nombre))} />
                                        <span className="min-w-0 flex-1">
                                            <span className={cn('flex items-center gap-1.5 text-[15px] font-semibold', actual && 'text-[#1E3A7B]')}>
                                                <span className="truncate">{r.etiqueta}</span>
                                                {r.sistema && <Lock aria-label="No se cambia" className="size-3.5 shrink-0 text-[#56627F]" />}
                                            </span>
                                            <span className="block text-[13px] text-[#56627F]">
                                                {r.usuarios === 1 ? '1 usuario' : `${r.usuarios} usuarios`} ·{' '}
                                                {r.sistema ? 'puede todo' : `${r.permisos.length} de ${total} permisos`}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {rol && (
                    <EditorRol key={rol.id} rol={rol} areas={areas} requiere={requiere} onSucio={marcarSucio} onDuplicar={() => setNuevo(rol.id)} />
                )}
            </div>

            <Marco abierto={nuevo !== null} onCambio={(v) => !v && setNuevo(null)} enfocar="#rol-etiqueta" className="max-w-[480px]">
                {(estado) => nuevo !== null && <FormularioNuevo roles={roles} copiarDe={nuevo} estado={estado} onListo={() => setNuevo(null)} />}
            </Marco>
        </PanelLayout>
    );
}

/** Lo que puede hacer un rol: nombre, descripción y un interruptor por permiso. */
function EditorRol({
    rol,
    areas,
    requiere,
    onSucio,
    onDuplicar,
}: {
    rol: RolFila;
    areas: Area[];
    requiere: Record<string, string>;
    onSucio: (sucio: boolean) => void;
    onDuplicar: () => void;
}) {
    const form = useForm({ etiqueta: rol.etiqueta, descripcion: rol.descripcion ?? '', permisos: rol.permisos });
    const orden = areas.flatMap((a) => a.permisos.map((p) => p.clave));
    const nombreDe = (clave: string) => areas.flatMap((a) => a.permisos).find((p) => p.clave === clave)?.nombre ?? clave;
    const tiene = (clave: string) => rol.sistema || form.data.permisos.includes(clave);

    useEffect(() => onSucio(form.isDirty), [form.isDirty, onSucio]);

    /** Prender uno prende el que necesita; apagar uno apaga los que dependen de él. */
    const cambiar = (claves: string[], si: boolean) => {
        const s = new Set(form.data.permisos);
        for (const c of claves) {
            if (si) {
                s.add(c);
                if (requiere[c]) s.add(requiere[c]);
            } else {
                s.delete(c);
                Object.entries(requiere).forEach(([dependiente, base]) => base === c && s.delete(dependiente));
            }
        }
        form.setData(
            'permisos',
            orden.filter((c) => s.has(c)),
        );
    };

    const guardar: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(`/roles/${rol.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                // Lo guardado pasa a ser el punto de partida (ya no hay cambios pendientes).
                form.setDefaults();
                sileo.success({ title: 'Rol guardado', description: `Quienes tienen «${form.data.etiqueta}» ven el cambio al abrir otra pantalla.` });
            },
            onError: revisar,
        });
    };

    const borrar = () => {
        const con = rol.usuarios + rol.inactivos;
        if (con > 0) {
            sileo.warning({
                title: 'Todavía lo tienen usuarios',
                description: `${con === 1 ? 'Lo tiene 1 usuario' : `Lo tienen ${con} usuarios`}${rol.inactivos ? ' (contando los desactivados)' : ''}: cámbiales el rol en Usuarios primero.`,
            });
            return;
        }
        if (!window.confirm(`¿Borrar el rol «${rol.etiqueta}»? No se puede deshacer.`)) return;
        router.delete(`/roles/${rol.id}`, {
            preserveScroll: true,
            onSuccess: () => sileo.success({ title: 'Rol borrado' }),
            onError: (errores) => sileo.error({ title: 'No se pudo borrar', description: errores.rol }),
        });
    };

    return (
        <form
            onSubmit={guardar}
            aria-label={`Rol ${rol.etiqueta}`}
            className="flex min-h-[420px] min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[#E6EBF4] bg-white lg:min-h-0"
        >
            <div className="flex shrink-0 flex-col gap-4 border-b border-[#EEF2F9] px-5 py-4 md:px-6">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="mr-auto flex items-center gap-2 text-[14px] text-[#56627F]">
                        <Users className="size-4" />
                        {rol.usuarios === 0
                            ? 'Nadie tiene este rol todavía'
                            : rol.usuarios === 1
                              ? 'Lo tiene 1 usuario'
                              : `Lo tienen ${rol.usuarios} usuarios`}
                        {rol.inactivos > 0 && ` (y ${rol.inactivos} desactivado${rol.inactivos === 1 ? '' : 's'})`}
                    </p>
                    <button type="button" onClick={onDuplicar} className={boton}>
                        <Copy className="size-4" />
                        Duplicar
                    </button>
                    {!rol.sistema && (
                        <button type="button" onClick={borrar} className={cn(boton, 'text-[#B42318] hover:bg-[#FDECEC]')}>
                            <Trash2 className="size-4" />
                            Borrar
                        </button>
                    )}
                </div>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                    <Campo id={`etiqueta-${rol.id}`} etiqueta="Nombre del rol" error={form.errors.etiqueta}>
                        <input
                            id={`etiqueta-${rol.id}`}
                            value={form.data.etiqueta}
                            onChange={(e) => form.setData('etiqueta', e.target.value)}
                            maxLength={60}
                            aria-invalid={form.errors.etiqueta ? true : undefined}
                            className={claseCampo}
                        />
                    </Campo>
                    <Campo id={`descripcion-${rol.id}`} etiqueta="Para quién es" error={form.errors.descripcion} opcional>
                        <input
                            id={`descripcion-${rol.id}`}
                            value={form.data.descripcion}
                            onChange={(e) => form.setData('descripcion', e.target.value)}
                            placeholder="Ej. Docentes de transición"
                            maxLength={255}
                            className={claseCampo}
                        />
                    </Campo>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin] md:px-6">
                {rol.sistema && (
                    <p className="mb-5 flex items-start gap-2.5 rounded-[16px] bg-[#EEF2FB] px-4 py-3 text-[14px] leading-snug text-[#1E3A7B]">
                        <ShieldCheck className="mt-0.5 size-[18px] shrink-0" />
                        El administrador puede todo, siempre: así nunca se pierde el acceso a SIEAGE. Se le puede cambiar el nombre, no los permisos.
                    </p>
                )}
                <div className="space-y-7">
                    {areas.map((a) => {
                        const claves = a.permisos.map((p) => p.clave);
                        const prendidos = claves.filter(tiene).length;
                        return (
                            <section key={a.area} aria-labelledby={`area-${a.area}`}>
                                <div className="mb-2.5 flex items-center gap-3">
                                    <h2 id={`area-${a.area}`} className="text-[16px] font-semibold tracking-[-0.01em]">
                                        {a.area}
                                    </h2>
                                    <span className="text-[13px] text-[#56627F] tabular-nums">
                                        {prendidos} de {claves.length}
                                    </span>
                                    {!rol.sistema && (
                                        <button
                                            type="button"
                                            onClick={() => cambiar(claves, prendidos < claves.length)}
                                            className="ml-auto cursor-pointer rounded-full px-2.5 py-1 text-[13px] font-semibold text-[#1E3A7B] transition hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                                        >
                                            {prendidos < claves.length ? 'Todos' : 'Ninguno'}
                                        </button>
                                    )}
                                </div>
                                {a.area === 'Administración' && !rol.sistema && (
                                    <p className="mb-2.5 flex items-start gap-2 text-[13px] leading-snug text-[#8A5A0B]">
                                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#B7862C]" />
                                        Con estos permisos se cambian los de los demás (y los propios): dalos solo a quien administra.
                                    </p>
                                )}
                                <div className="grid gap-2 xl:grid-cols-2">
                                    {a.permisos.map((p) => (
                                        <Interruptor
                                            key={p.clave}
                                            titulo={p.nombre}
                                            detalle={requiere[p.clave] ? `${p.detalle} Necesita «${nombreDe(requiere[p.clave])}».` : p.detalle}
                                            activo={tiene(p.clave)}
                                            bloqueado={rol.sistema}
                                            onCambio={(si) => cambiar([p.clave], si)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#EEF2F9] px-5 py-3 md:px-6">
                <span className="mr-auto">
                    <EstadoGuardado sucio={form.isDirty} />
                </span>
                <BotonGuardar cargando={form.processing} disabled={!form.isDirty} className="h-10">
                    Guardar cambios
                </BotonGuardar>
            </div>
        </form>
    );
}

/** Un permiso: su nombre, para qué sirve y el interruptor. */
function Interruptor({
    titulo,
    detalle,
    activo,
    bloqueado,
    onCambio,
}: {
    titulo: string;
    detalle: string;
    activo: boolean;
    bloqueado: boolean;
    onCambio: (si: boolean) => void;
}) {
    return (
        <label
            className={cn(
                'flex items-center justify-between gap-4 rounded-[16px] border-[1.5px] px-4 py-3 transition',
                bloqueado ? 'cursor-default border-[#E3E9F6] bg-[#FAFBFE]' : 'cursor-pointer hover:border-[#B9C8EC]',
                !bloqueado && (activo ? 'border-[#C4D2F1] bg-[#F7F9FF]' : 'border-[#E3E9F6]'),
            )}
        >
            <span className="min-w-0">
                <span className="block text-[15px] font-medium text-[#16223F]">{titulo}</span>
                <span className="block text-[13px] leading-snug text-[#56627F]">{detalle}</span>
            </span>
            <input
                type="checkbox"
                role="switch"
                checked={activo}
                disabled={bloqueado}
                onChange={(e) => onCambio(e.target.checked)}
                className="peer sr-only"
            />
            <span
                aria-hidden
                className="relative h-6 w-11 shrink-0 rounded-full bg-[#D3DDF3] transition peer-checked:bg-[#1E3A7B] peer-focus-visible:ring-4 peer-focus-visible:ring-[#DCE5F8] peer-disabled:opacity-60 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
            />
        </label>
    );
}

/** Crear un rol: nombre, para quién es y, si se quiere, empezar con los permisos de otro. */
function FormularioNuevo({
    roles,
    copiarDe,
    estado,
    onListo,
}: {
    roles: RolFila[];
    copiarDe: number;
    estado: Parameters<typeof useAvisar>[0];
    onListo: () => void;
}) {
    const origen = roles.find((r) => r.id === copiarDe);
    const form = useForm({ etiqueta: origen ? `${origen.etiqueta} (copia)` : '', descripcion: '', copiar_de: copiarDe });
    useAvisar(estado, form.isDirty, form.processing);

    const crear: FormEventHandler = (e) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, copiar_de: d.copiar_de || null }));
        form.post('/roles', {
            onSuccess: () => {
                sileo.success({ title: 'Rol creado', description: 'Ahora elige qué puede hacer y guarda.' });
                onListo();
            },
            onError: revisar,
        });
    };

    return (
        <form onSubmit={crear} className="flex min-h-0 flex-1 flex-col">
            <Cabeza titulo={origen ? `Duplicar «${origen.etiqueta}»` : 'Nuevo rol'}>
                Después eliges qué puede hacer. A cada usuario se le da el rol en Usuarios.
            </Cabeza>
            <Cuerpo>
                <div className="space-y-4">
                    <Campo id="rol-etiqueta" etiqueta="Nombre del rol" error={form.errors.etiqueta}>
                        <input
                            id="rol-etiqueta"
                            value={form.data.etiqueta}
                            onChange={(e) => form.setData('etiqueta', e.target.value)}
                            placeholder="Ej. Orientación escolar"
                            maxLength={60}
                            aria-invalid={form.errors.etiqueta ? true : undefined}
                            className={claseCampo}
                        />
                    </Campo>
                    <Campo id="rol-descripcion" etiqueta="Para quién es" error={form.errors.descripcion} opcional>
                        <input
                            id="rol-descripcion"
                            value={form.data.descripcion}
                            onChange={(e) => form.setData('descripcion', e.target.value)}
                            maxLength={255}
                            className={claseCampo}
                        />
                    </Campo>
                    <fieldset>
                        <legend className="mb-1.5 text-[13px] font-medium text-[#3E4A68]">Empezar con los permisos de</legend>
                        <div className="flex flex-wrap gap-1.5">
                            {[{ id: 0, etiqueta: 'Ninguno' }, ...roles].map((r) => {
                                const elegido = form.data.copiar_de === r.id;
                                return (
                                    <label
                                        key={r.id}
                                        className={cn(
                                            'flex h-9 cursor-pointer items-center rounded-full px-3.5 text-[14px] font-medium ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#6E8BD6]',
                                            elegido ? 'bg-[#1E3A7B] text-white ring-[#1E3A7B]' : 'text-[#3E4A68] ring-[#D3DDF3] hover:bg-[#EEF2FB]',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="copiar_de"
                                            checked={elegido}
                                            onChange={() => form.setData('copiar_de', r.id)}
                                            className="sr-only"
                                        />
                                        {r.etiqueta}
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                </div>
            </Cuerpo>
            <Pie sucio={false} cargando={form.processing} guardar="Crear rol" onCancelar={onListo} />
        </form>
    );
}
