import { Bloque, EncabezadoFicha, PanelFicha } from '@/components/ficha';
import {
    BotonGuardar,
    Campo,
    CampoClaveNueva,
    EstadoGuardado,
    botonPrimario,
    botonSecundario,
    claseCampo,
    claveAleatoria,
} from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Rol, haceCuanto, inicialesPersona, nombreRol, puntoRol } from '@/lib/usuarios';
import { cn } from '@/lib/utils';
import { router, useForm, usePage } from '@inertiajs/react';
import { Check, KeyRound, LoaderCircle, Trash2, UserCheck, UserPlus, UserX } from 'lucide-react';
import { type FormEventHandler, type RefObject, useState } from 'react';
import { sileo } from 'sileo';

export type Usuario = {
    id: number;
    name: string;
    usuario: string;
    email: string | null;
    rol_id: number | null;
    rol: { id: number; nombre: string; etiqueta: string | null } | null;
    activo: boolean;
    /** Ve todas las sedes (incluidas las que se creen). Los administradores siempre. */
    todas_las_sedes: boolean;
    /** Ids de las sedes asignadas, si no ve todas. */
    sedes: number[];
    /** En una sede, solo estos grados: {sede_id: [grado_id, …]}. Sin entrada, todos. */
    grados: Record<string, number[]>;
    /** En esos grados, solo estos grupos (por número): {sede_id: {grado_id: [número, …]}}. Sin entrada, todos. */
    grupos: Record<string, Record<string, number[]>>;
    ultimo_acceso: string | null;
    /** Usando el panel en este momento. */
    en_linea: boolean;
    /** La última vez que lo usó (o, si es de antes de anotarlo, cuándo ingresó). */
    ultima_vez: string | null;
    created_at: string;
};

/** `grados`: los que tiene la sede (los de sus grupos). `grupos`: {grado_id: [{numero, codigo}, …]}, para elegir grupos. */
export type SedeOpcion = {
    id: number;
    codigo: string;
    nombre: string;
    grados?: number[];
    grupos?: Record<string, { numero: number; codigo: string }[]>;
};
type GradoOpcion = { id: number; numero: number; nombre: string };

type Props = {
    /** 'nuevo' para crear; un usuario para verlo y editarlo; null, cerrado. */
    abierto: 'nuevo' | Usuario | null;
    esYo: boolean;
    roles: Rol[];
    sedes: SedeOpcion[];
    panel: RefObject<HTMLElement | null>;
    onCerrar: () => void;
};

/** "Juan Pérez Gómez" → "jperez". */
function sugerirUsuario(nombre: string) {
    const partes = nombre
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);
    return partes.length >= 2 ? `${partes[0][0]}${partes[1]}` : (partes[0] ?? '');
}

/**
 * Panel lateral de Usuarios, como la ficha de Estudiantes: flota sobre la
 * lista o, en pantallas anchas, se acopla a su lado. La `key` del contenido
 * reinicia el formulario al cambiar de usuario.
 */
export function PanelUsuario({ abierto, esYo, roles, sedes, panel, onCerrar }: Props) {
    // Al cerrar, lo último que se mostró se queda mientras el panel sale (si no,
    // desaparecería de golpe). Cada apertura, o cambio de usuario, empieza con el
    // formulario limpio; si solo llegan datos nuevos del mismo usuario, no.
    const [mostrado, setMostrado] = useState(abierto);
    const [anterior, setAnterior] = useState(abierto);
    const [vez, setVez] = useState(0);
    const clave = (x: Props['abierto']) => (x === 'nuevo' ? 'nuevo' : (x?.id ?? null));
    if (abierto !== anterior) {
        setAnterior(abierto);
        if (abierto !== null) {
            setMostrado(abierto);
            if (clave(abierto) !== clave(anterior)) setVez((v) => v + 1);
        }
    }

    return (
        <PanelFicha abierta={abierto !== null} panel={panel} etiqueta={mostrado === 'nuevo' ? 'Nuevo usuario' : 'Usuario'}>
            {mostrado === 'nuevo' ? (
                <FormularioUsuario key={vez} roles={roles} sedes={sedes} esYo={false} onCerrar={onCerrar} />
            ) : mostrado ? (
                <FormularioUsuario key={vez} usuario={mostrado} roles={roles} sedes={sedes} esYo={esYo} onCerrar={onCerrar} />
            ) : null}
        </PanelFicha>
    );
}

function FormularioUsuario({
    usuario,
    roles,
    sedes,
    esYo,
    onCerrar,
}: {
    usuario?: Usuario;
    roles: Rol[];
    sedes: SedeOpcion[];
    esYo: boolean;
    onCerrar: () => void;
}) {
    const nuevo = !usuario;
    // Mientras no se toque, el usuario se sugiere a partir del nombre.
    const [usuarioTocado, setUsuarioTocado] = useState(!nuevo);
    const form = useForm({
        name: usuario?.name ?? '',
        usuario: usuario?.usuario ?? '',
        email: usuario?.email ?? '',
        rol_id: usuario?.rol_id ?? roles.find((r) => r.nombre === 'secretaria')?.id ?? roles[0]?.id ?? 0,
        todas_las_sedes: usuario?.todas_las_sedes ?? false,
        sedes: usuario?.sedes ?? ([] as number[]),
        grados: usuario?.grados ?? ({} as Record<string, number[]>),
        grupos: usuario?.grupos ?? ({} as Record<string, Record<string, number[]>>),
        password: nuevo ? claveAleatoria() : '',
    });
    const catalogo = usePage<{ grados?: GradoOpcion[] }>().props.grados ?? [];
    // Los de grados y grupos (p. ej. «grupos.2.1.0») van con los de sedes: si no, no se verían.
    const errores = form.errors as Record<string, string | undefined>;
    const errorSedes = errores.sedes ?? Object.entries(errores).find(([k]) => /^(grados|grupos)\./.test(k))?.[1];
    const rolElegido = roles.find((r) => r.id === form.data.rol_id);
    const esAdministrador = rolElegido?.nombre === 'administrador' || rolElegido?.nombre === 'superadministrador';
    const marcarSede = (id: number, si: boolean) => {
        // Al quitar una sede se olvidan sus grados y sus grupos.
        form.setData({
            ...form.data,
            sedes: si ? [...form.data.sedes, id] : form.data.sedes.filter((s) => s !== id),
            grados: si ? form.data.grados : sinSede(form.data.grados, id),
            grupos: si ? form.data.grupos : sinSede(form.data.grupos, id),
        });
    };
    const marcarGrados = (sede: number, grados: number[], grupos: Record<string, number[]>) => {
        // Solo los grupos de los grados que quedan marcados.
        const deEsos = Object.fromEntries(Object.entries(grupos).filter(([g, n]) => grados.includes(Number(g)) && n.length));
        form.setData({
            ...form.data,
            grados: grados.length ? { ...sinSede(form.data.grados, sede), [sede]: grados } : sinSede(form.data.grados, sede),
            grupos: Object.keys(deEsos).length ? { ...sinSede(form.data.grupos, sede), [sede]: deEsos } : sinSede(form.data.grupos, sede),
        });
    };

    const guardar: FormEventHandler = (e) => {
        e.preventDefault();
        // El botón no se apaga (parecía dañado): sin cambios, solo se avisa.
        if (!nuevo && !form.isDirty) {
            sileo.info({ title: 'No hay cambios por guardar', description: 'Cambia el rol, las sedes o los datos y vuelve a guardar.' });
            return;
        }
        const opciones = {
            preserveScroll: true,
            onSuccess: () => {
                sileo.success({ title: nuevo ? 'Usuario creado' : 'Usuario actualizado', description: `@${form.data.usuario.trim().toLowerCase()}` });
                if (nuevo) onCerrar();
                else form.setDefaults();
            },
            onError: () => sileo.warning({ title: 'Revisa los datos', description: 'Marcamos en rojo lo que falta o está mal.' }),
        };
        if (nuevo) form.post('/usuarios', opciones);
        // Al editar, `password` va vacío y el servidor lo ignora: la clave se cambia aparte.
        else form.put(`/usuarios/${usuario.id}`, opciones);
    };

    return (
        <div className="animate-in fade-in-0 flex min-h-0 flex-1 flex-col duration-200 motion-reduce:animate-none">
            {nuevo ? (
                <EncabezadoFicha
                    avatar={<UserPlus className="size-5" />}
                    titulo="Nuevo usuario"
                    detalle="Podrá ingresar con el usuario y la clave que definas aquí."
                    onCerrar={onCerrar}
                />
            ) : (
                <EncabezadoFicha
                    avatar={inicialesPersona(usuario.name)}
                    titulo={usuario.name}
                    detalle={
                        <>
                            @{usuario.usuario}
                            {esYo && ' · tú'}
                        </>
                    }
                    marcas={
                        <>
                            <span className="inline-flex items-center gap-1.5 font-medium text-[#1E3A7B]">
                                <span aria-hidden className={cn('size-2 rounded-full', puntoRol(usuario.rol))} />
                                {nombreRol(usuario.rol)}
                            </span>
                            <MarcaActivo activo={usuario.activo} />
                            {usuario.en_linea ? (
                                <EnLinea />
                            ) : (
                                <span className="text-[#56627F]">Última vez: {haceCuanto(usuario.ultima_vez).toLowerCase()}</span>
                            )}
                        </>
                    }
                    onCerrar={onCerrar}
                />
            )}

            <form onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]">
                    <Bloque titulo="Datos">
                        <div className="grid gap-3.5">
                            <Campo id="u-nombre" etiqueta="Nombre completo" error={form.errors.name}>
                                <input
                                    id="u-nombre"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData((d) => ({
                                            ...d,
                                            name: e.target.value,
                                            ...(usuarioTocado ? {} : { usuario: sugerirUsuario(e.target.value) }),
                                        }))
                                    }
                                    autoFocus={nuevo}
                                    autoComplete="off"
                                    placeholder="Ej. Juan Pérez"
                                    aria-invalid={!!form.errors.name}
                                    className={claseCampo}
                                />
                            </Campo>
                            <Campo id="u-usuario" etiqueta="Usuario para ingresar" ayuda="Minúsculas, sin espacios." error={form.errors.usuario}>
                                <input
                                    id="u-usuario"
                                    value={form.data.usuario}
                                    onChange={(e) => {
                                        setUsuarioTocado(true);
                                        form.setData('usuario', e.target.value.toLowerCase().replace(/\s/g, ''));
                                    }}
                                    autoComplete="off"
                                    spellCheck={false}
                                    autoCapitalize="none"
                                    placeholder="jperez"
                                    aria-invalid={!!form.errors.usuario}
                                    className={claseCampo}
                                />
                            </Campo>
                            <Campo id="u-correo" etiqueta="Correo" opcional error={form.errors.email}>
                                <input
                                    id="u-correo"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    autoComplete="off"
                                    placeholder="nombre@correo.com"
                                    aria-invalid={!!form.errors.email}
                                    className={claseCampo}
                                />
                            </Campo>
                        </div>
                    </Bloque>

                    <Bloque titulo="Rol">
                        <div role="radiogroup" aria-label="Rol" className="grid gap-2">
                            {roles.map((r) => {
                                const elegido = form.data.rol_id === r.id;
                                return (
                                    <label
                                        key={r.id}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-[16px] border-[1.5px] px-3.5 py-3 transition',
                                            elegido ? 'border-[#1E3A7B] bg-[#F7F9FF]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="rol"
                                            checked={elegido}
                                            onChange={() => form.setData('rol_id', r.id)}
                                            className="peer sr-only"
                                        />
                                        <span
                                            aria-hidden
                                            className={cn(
                                                'peer-focus-visible:outline-foco mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-solid',
                                                elegido ? 'bg-[#1E3A7B] text-white' : 'border-[1.5px] border-[#B7C6EA] bg-white',
                                            )}
                                        >
                                            {elegido && <Check className="size-3" strokeWidth={3} />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-2 text-[15px] font-medium text-[#16223F]">
                                                <span aria-hidden className={cn('size-2 rounded-full', puntoRol(r))} />
                                                {nombreRol(r)}
                                            </span>
                                            {r.descripcion && (
                                                <span className="mt-0.5 block text-[13px] leading-snug text-[#56627F]">{r.descripcion}</span>
                                            )}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {form.errors.rol_id && <p className="mt-2 text-[13px] text-[#B42318]">{form.errors.rol_id}</p>}
                    </Bloque>

                    <Bloque titulo="Sedes">
                        {esAdministrador ? (
                            <p className="rounded-[14px] bg-[#F5F7FC] px-3.5 py-3 text-[14px] text-[#56627F]">
                                Los administradores ven y gestionan todas las sedes.
                            </p>
                        ) : rolElegido?.ve_todas ? (
                            <p className="rounded-[14px] bg-[#F5F7FC] px-3.5 py-3 text-[14px] text-[#56627F]">
                                Con el rol «{nombreRol(rolElegido)}» se ven todas las sedes. Se cambia en Roles y permisos.
                            </p>
                        ) : (
                            <>
                                <p className="mb-2.5 text-[13px] text-[#56627F]">
                                    Solo verá y modificará los estudiantes, grupos e informes de estas sedes.
                                </p>
                                <div className="grid gap-2">
                                    <CasillaSede
                                        marcada={form.data.todas_las_sedes}
                                        onCambio={(si) => form.setData('todas_las_sedes', si)}
                                        titulo="Todas las sedes"
                                        detalle="Incluye las que se creen después."
                                    />
                                    {sedes.map((s) => (
                                        <div key={s.id}>
                                            <CasillaSede
                                                marcada={form.data.todas_las_sedes || form.data.sedes.includes(s.id)}
                                                desactivada={form.data.todas_las_sedes}
                                                onCambio={(si) => marcarSede(s.id, si)}
                                                titulo={s.nombre}
                                                detalle={s.codigo}
                                            />
                                            {/* Sede y grado juntos: en esta sede, todos los grados o solo algunos. */}
                                            {!form.data.todas_las_sedes && form.data.sedes.includes(s.id) && (
                                                <GradosDeSede
                                                    sede={s}
                                                    catalogo={catalogo}
                                                    marcados={form.data.grados[s.id] ?? []}
                                                    grupos={form.data.grupos[s.id] ?? {}}
                                                    onCambio={(g, n) => marcarGrados(s.id, g, n)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errorSedes && <p className="mt-2 text-[13px] text-[#B42318]">{errorSedes}</p>}
                            </>
                        )}
                    </Bloque>

                    {nuevo ? (
                        <Bloque titulo="Clave">
                            <CampoClaveNueva
                                id="u-clave"
                                valor={form.data.password}
                                onCambio={(v) => form.setData('password', v)}
                                error={form.errors.password}
                                ayuda="Sirve cualquiera, por ejemplo su número de cédula. Entrégasela; podrá cambiarla en su perfil."
                            />
                        </Bloque>
                    ) : (
                        <Acceso usuario={usuario} esYo={esYo} onEliminado={onCerrar} />
                    )}

                    {/* La clave se cambia aparte, con su propio botón: no se mezcla con "Guardar cambios". */}
                    {!nuevo && <CambiarClave usuario={usuario} />}
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[#EEF2F9] px-5 py-3">
                    {nuevo ? (
                        <>
                            <button type="button" onClick={onCerrar} className={cn(botonSecundario, 'mr-auto')}>
                                Cancelar
                            </button>
                            <BotonGuardar cargando={form.processing}>
                                <UserPlus className="size-[18px]" />
                                Crear usuario
                            </BotonGuardar>
                        </>
                    ) : (
                        <>
                            <span className="mr-auto">
                                <EstadoGuardado sucio={form.isDirty} />
                            </span>
                            <BotonGuardar cargando={form.processing}>Guardar cambios</BotonGuardar>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

/**
 * Desactivar (no entra, pero sigue constando lo que hizo) o eliminar. Las dos con su
 * confirmación; las reglas (no a uno mismo, siempre un administrador activo…) las pone el servidor.
 */
function Acceso({ usuario, esYo, onEliminado }: { usuario: Usuario; esYo: boolean; onEliminado: () => void }) {
    const [pregunta, setPregunta] = useState<'desactivar' | 'eliminar' | null>(null);
    const [enviando, setEnviando] = useState(false);
    const nombre = `@${usuario.usuario}`;

    const hacer = (accion: 'desactivar' | 'reactivar' | 'eliminar') => {
        setEnviando(true);
        const opciones = {
            preserveScroll: true,
            onSuccess: () => {
                setPregunta(null);
                if (accion === 'eliminar') {
                    sileo.success({ title: 'Usuario eliminado', description: `${nombre} ya no aparece en Usuarios.` });
                    onEliminado();
                } else {
                    sileo.success({
                        title: accion === 'desactivar' ? 'Usuario desactivado' : 'Usuario activo otra vez',
                        description: accion === 'desactivar' ? `${nombre} ya no puede ingresar.` : `${nombre} puede volver a ingresar.`,
                    });
                }
            },
            onError: (errores: Record<string, string>) =>
                sileo.warning({ title: 'No se pudo', description: Object.values(errores)[0] ?? 'Inténtalo de nuevo.' }),
            onFinish: () => setEnviando(false),
        };
        if (accion === 'eliminar') router.delete(`/usuarios/${usuario.id}`, opciones);
        else router.put(`/usuarios/${usuario.id}/estado`, { activo: accion === 'reactivar' }, opciones);
    };

    if (esYo) {
        return (
            <Bloque titulo="Acceso">
                <p className="text-[14px] text-[#56627F]">Es tu usuario: no puedes desactivarlo ni eliminarlo.</p>
            </Bloque>
        );
    }

    return (
        <Bloque titulo="Acceso">
            <p className="text-[14px] text-[#56627F]">
                {usuario.activo ? 'Puede ingresar a SIEAGE.' : 'Desactivado: no puede ingresar. Lo que registró sigue constando a su nombre.'}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
                {usuario.activo ? (
                    <button type="button" onClick={() => setPregunta('desactivar')} className={claseAccion}>
                        <UserX className="size-4" />
                        Desactivar
                    </button>
                ) : (
                    <button type="button" onClick={() => hacer('reactivar')} disabled={enviando} className={claseAccion}>
                        {enviando ? <LoaderCircle className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
                        Reactivar
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setPregunta('eliminar')}
                    className={cn(claseAccion, 'text-[#B42318] hover:border-[#B42318] hover:bg-[#FDECEC]')}
                >
                    <Trash2 className="size-4" />
                    Eliminar
                </button>
            </div>

            <Dialog open={pregunta !== null} onOpenChange={(v) => !enviando && !v && setPregunta(null)}>
                <DialogContent className="max-w-md rounded-[22px] border-[#E3E9F6] p-6 font-sans text-[#16223F] sm:rounded-[22px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            {pregunta === 'eliminar' ? `¿Eliminar a ${usuario.name}?` : `¿Desactivar a ${usuario.name}?`}
                        </DialogTitle>
                        <DialogDescription className="text-[15px] leading-relaxed text-[#56627F]">
                            {pregunta === 'eliminar'
                                ? `${nombre} desaparece de Usuarios y no podrá ingresar. Lo que registró (matrículas, boletines, documentos…) se queda, pero ya no dirá quién lo hizo. No se puede deshacer: si solo quieres que no entre, mejor desactívalo.`
                                : `${nombre} no podrá ingresar y se cierran las sesiones que tenga abiertas. Lo que registró sigue a su nombre, y puedes reactivarlo cuando quieras.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setPregunta(null)} disabled={enviando} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() => pregunta && hacer(pregunta)}
                            disabled={enviando}
                            className={cn(botonPrimario, pregunta === 'eliminar' && 'bg-[#B42318] hover:bg-[#912018]')}
                        >
                            {enviando && <LoaderCircle className="size-4 animate-spin" />}
                            {pregunta === 'eliminar' ? 'Eliminar usuario' : 'Desactivar'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </Bloque>
    );
}

const claseAccion =
    'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] border-[1.5px] border-[#D3DDF3] text-[15px] font-semibold text-[#1E3A7B] transition hover:border-[#1E3A7B] hover:bg-[#F7F9FF] disabled:cursor-default disabled:opacity-60';

/** Nueva clave para otro usuario (o para uno mismo): la anterior deja de servir y se cierran sus sesiones. */
function CambiarClave({ usuario }: { usuario: Usuario }) {
    const [abierta, setAbierta] = useState(false);
    const form = useForm({ password: '' });

    const cambiar = () =>
        form.put(`/usuarios/${usuario.id}/clave`, {
            preserveScroll: true,
            onSuccess: () => {
                sileo.success({ title: 'Clave cambiada', description: `@${usuario.usuario} ya puede ingresar con la nueva.` });
                setAbierta(false);
                form.reset();
            },
        });

    return (
        <Bloque titulo="Clave">
            {abierta ? (
                // Está dentro del formulario del usuario: Enter aquí cambiaba sus datos, no la clave.
                <div
                    className="grid gap-3"
                    onKeyDown={(e) => {
                        if (e.key !== 'Enter' || !(e.target instanceof HTMLInputElement)) return;
                        e.preventDefault();
                        if (!form.processing) cambiar();
                    }}
                >
                    <CampoClaveNueva
                        id="u-clave-nueva"
                        valor={form.data.password}
                        onCambio={(v) => form.setData('password', v)}
                        error={form.errors.password}
                        ayuda="La anterior deja de funcionar y se cierran las sesiones que tenga abiertas."
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAbierta(false)} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={cambiar}
                            disabled={form.processing}
                            className={cn(botonSecundario, 'bg-[#EEF2FB] text-[#1E3A7B]')}
                        >
                            <KeyRound className="size-4" />
                            Cambiar clave
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => {
                        form.setData('password', claveAleatoria());
                        setAbierta(true);
                    }}
                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] border-[1.5px] border-[#D3DDF3] text-[15px] font-semibold text-[#1E3A7B] transition hover:border-[#1E3A7B] hover:bg-[#F7F9FF]"
                >
                    <KeyRound className="size-4" />
                    Darle una clave nueva
                </button>
            )}
        </Bloque>
    );
}

export function MarcaActivo({ activo }: { activo: boolean }) {
    return (
        <span
            className={cn('inline-flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap', activo ? 'text-[#1C6B4A]' : 'text-[#56627F]')}
        >
            <span aria-hidden className={cn('size-1.5 rounded-full', activo ? 'bg-[#3BA67A]' : 'bg-[#AEB7CC]')} />
            {activo ? 'Activo' : 'Desactivado'}
        </span>
    );
}

/** Una casilla de la lista de sedes, con el mismo aspecto que la elección de rol. */
/** Lo marcado (grados o grupos), sin lo de esa sede. */
const sinSede = <T,>(marcado: Record<string, T>, sede: number) => Object.fromEntries(Object.entries(marcado).filter(([s]) => Number(s) !== sede));

const gradoCorto = (g: GradoOpcion) => (g.numero <= 0 ? g.nombre : `${g.numero}°`);

/**
 * Los grados de una sede asignada: «Todos» o los que se marquen (solo verá esos en esa
 * sede), por grupos (0-1, 6-2…): marcar todos los grupos de un grado es todo el grado.
 * Un grado sin grupos en la sede se marca entero.
 */
function GradosDeSede({
    sede,
    catalogo,
    marcados,
    grupos,
    onCambio,
}: {
    sede: SedeOpcion;
    catalogo: GradoOpcion[];
    marcados: number[];
    grupos: Record<string, number[]>;
    onCambio: (grados: number[], grupos: Record<string, number[]>) => void;
}) {
    const deLaSede = catalogo.filter((g) => !sede.grados?.length || sede.grados.includes(g.id) || marcados.includes(g.id));
    const codigoDe = (g: GradoOpcion, n: number) => sede.grupos?.[g.id]?.find((x) => x.numero === n)?.codigo ?? `${g.numero}-${n}`;
    // Los de la sede y los que ya tenía marcados (aunque ese grupo ya no exista).
    const numerosDe = (g: GradoOpcion) =>
        [...new Set([...(sede.grupos?.[g.id] ?? []).map((x) => x.numero), ...(grupos[g.id] ?? [])])].sort((a, b) => a - b);
    const marcarGrupo = (g: GradoOpcion, numero: number) => {
        const todos = numerosDe(g);
        const elegido = marcados.includes(g.id);
        // Marcado sin grupos = todos sus grupos.
        const activos = elegido ? (grupos[g.id]?.length ? grupos[g.id] : todos) : [];
        const nuevos = activos.includes(numero) ? activos.filter((n) => n !== numero) : [...activos, numero].sort((a, b) => a - b);
        const resto = Object.fromEntries(Object.entries(grupos).filter(([id]) => Number(id) !== g.id));
        if (!nuevos.length)
            return onCambio(
                marcados.filter((x) => x !== g.id),
                resto,
            );
        const grados = elegido ? marcados : [...marcados, g.id];
        onCambio(grados, nuevos.length === todos.length ? resto : { ...resto, [g.id]: nuevos });
    };
    const chip = (activo: boolean) =>
        cn(
            'focus-visible:outline-foco h-7 cursor-pointer rounded-full px-2.5 text-[12.5px] font-semibold ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
            activo ? 'bg-[#1E3A7B] text-white ring-[#1E3A7B]' : 'text-[#3E4A68] ring-[#D3DDF3] hover:bg-[#EEF2FB]',
        );
    return (
        <div
            role="group"
            aria-label={`Grados que ve en ${sede.nombre}`}
            className="mt-1.5 mb-1 ml-3 flex flex-wrap items-center gap-1 border-l-2 border-[#E3E9F6] pl-3"
        >
            <span className="mr-0.5 text-[12.5px] text-[#56627F]">Grados:</span>
            <button type="button" aria-pressed={marcados.length === 0} onClick={() => onCambio([], {})} className={chip(marcados.length === 0)}>
                Todos
            </button>
            {deLaSede.map((g) => {
                const si = marcados.includes(g.id);
                const numeros = numerosDe(g);
                if (numeros.length) {
                    const activos = si ? (grupos[g.id]?.length ? grupos[g.id] : numeros) : [];
                    return numeros.map((n) => (
                        <button
                            key={`${g.id}-${n}`}
                            type="button"
                            aria-pressed={activos.includes(n)}
                            title={`${g.nombre}, grupo ${codigoDe(g, n)}`}
                            onClick={() => marcarGrupo(g, n)}
                            className={chip(activos.includes(n))}
                        >
                            {codigoDe(g, n)}
                        </button>
                    ));
                }
                return (
                    <button
                        key={g.id}
                        type="button"
                        aria-pressed={si}
                        title={g.nombre}
                        onClick={() => onCambio(si ? marcados.filter((x) => x !== g.id) : [...marcados, g.id], grupos)}
                        className={chip(si)}
                    >
                        {gradoCorto(g)}
                    </button>
                );
            })}
        </div>
    );
}

function CasillaSede({
    marcada,
    desactivada,
    onCambio,
    titulo,
    detalle,
}: {
    marcada: boolean;
    desactivada?: boolean;
    onCambio: (si: boolean) => void;
    titulo: string;
    detalle?: string;
}) {
    return (
        <label
            className={cn(
                'relative flex items-center gap-3 rounded-[16px] border-[1.5px] px-3.5 py-2.5 transition',
                desactivada ? 'cursor-default opacity-60' : 'cursor-pointer',
                marcada ? 'border-[#1E3A7B] bg-[#F7F9FF]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
            )}
        >
            <input type="checkbox" checked={marcada} disabled={desactivada} onChange={(e) => onCambio(e.target.checked)} className="peer sr-only" />
            <span
                aria-hidden
                className={cn(
                    'peer-focus-visible:outline-foco flex size-5 shrink-0 items-center justify-center rounded-[6px] transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-solid',
                    marcada ? 'bg-[#1E3A7B] text-white' : 'border-[1.5px] border-[#B7C6EA] bg-white',
                )}
            >
                {marcada && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                <span className="text-[15px] font-medium text-[#16223F]">{titulo}</span>
                {detalle && <span className="text-[13px] text-[#56627F]">{detalle}</span>}
            </span>
        </label>
    );
}

/** Usando SIEAGE en este momento: un punto verde que late (la cuenta «Activa» es otra cosa, ver MarcaActivo). */
export function EnLinea() {
    return (
        <span className="inline-flex items-center gap-2 font-medium whitespace-nowrap text-[#1C6B4A]">
            <span aria-hidden className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#3BA67A] opacity-60 motion-reduce:animate-none" />
                <span className="relative size-2 rounded-full bg-[#3BA67A]" />
            </span>
            En línea
        </span>
    );
}
