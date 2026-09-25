import { Bloque, EncabezadoFicha, PanelFicha } from '@/components/ficha';
import {
    BotonGuardar,
    Campo,
    CampoClaveNueva,
    EstadoGuardado,
    Interruptor,
    botonSecundario,
    claseCampo,
    claveAleatoria,
} from '@/components/formulario';
import { type Rol, haceCuanto, inicialesPersona, nombreRol, puntoRol } from '@/lib/usuarios';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Check, KeyRound, UserPlus } from 'lucide-react';
import { type FormEventHandler, type RefObject, useState } from 'react';
import { sileo } from 'sileo';

export type Usuario = {
    id: number;
    name: string;
    usuario: string;
    email: string | null;
    rol_id: number | null;
    rol: { id: number; nombre: string } | null;
    activo: boolean;
    ultimo_acceso: string | null;
    created_at: string;
};

type Props = {
    /** 'nuevo' para crear; un usuario para verlo y editarlo; null, cerrado. */
    abierto: 'nuevo' | Usuario | null;
    esYo: boolean;
    roles: Rol[];
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
export function PanelUsuario({ abierto, esYo, roles, panel, onCerrar }: Props) {
    return (
        <PanelFicha abierta={abierto !== null} panel={panel} etiqueta={abierto === 'nuevo' ? 'Nuevo usuario' : 'Usuario'}>
            {abierto === 'nuevo' ? (
                <FormularioUsuario key="nuevo" roles={roles} esYo={false} onCerrar={onCerrar} />
            ) : abierto ? (
                <FormularioUsuario key={abierto.id} usuario={abierto} roles={roles} esYo={esYo} onCerrar={onCerrar} />
            ) : null}
        </PanelFicha>
    );
}

function FormularioUsuario({ usuario, roles, esYo, onCerrar }: { usuario?: Usuario; roles: Rol[]; esYo: boolean; onCerrar: () => void }) {
    const nuevo = !usuario;
    // Mientras no se toque, el usuario se sugiere a partir del nombre.
    const [usuarioTocado, setUsuarioTocado] = useState(!nuevo);
    const form = useForm({
        name: usuario?.name ?? '',
        usuario: usuario?.usuario ?? '',
        email: usuario?.email ?? '',
        rol_id: usuario?.rol_id ?? roles.find((r) => r.nombre === 'secretaria')?.id ?? roles[0]?.id ?? 0,
        activo: usuario?.activo ?? true,
        password: nuevo ? claveAleatoria() : '',
    });

    const guardar: FormEventHandler = (e) => {
        e.preventDefault();
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
        <div className="flex min-h-0 flex-1 flex-col">
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
                                <span aria-hidden className={cn('size-2 rounded-full', puntoRol(usuario.rol?.nombre))} />
                                {nombreRol(usuario.rol?.nombre)}
                            </span>
                            <MarcaActivo activo={usuario.activo} />
                            <span className="text-[#56627F]">Último ingreso: {haceCuanto(usuario.ultimo_acceso).toLowerCase()}</span>
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
                                                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#DCE5F8]',
                                                elegido ? 'bg-[#1E3A7B] text-white' : 'border-[1.5px] border-[#B7C6EA] bg-white',
                                            )}
                                        >
                                            {elegido && <Check className="size-3" strokeWidth={3} />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-2 text-[15px] font-medium text-[#16223F]">
                                                <span aria-hidden className={cn('size-2 rounded-full', puntoRol(r.nombre))} />
                                                {nombreRol(r.nombre)}
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

                    {nuevo ? (
                        <Bloque titulo="Clave">
                            <CampoClaveNueva
                                id="u-clave"
                                valor={form.data.password}
                                onCambio={(v) => form.setData('password', v)}
                                error={form.errors.password}
                                ayuda="Mínimo 8 caracteres. Entrégasela; podrá cambiarla en su perfil."
                            />
                        </Bloque>
                    ) : (
                        <Bloque titulo="Acceso">
                            <Interruptor
                                titulo="Puede ingresar"
                                detalle={
                                    esYo
                                        ? 'No puedes desactivar tu propio usuario.'
                                        : 'Si lo desactivas, se cierra su sesión y no podrá volver a entrar.'
                                }
                                activo={form.data.activo}
                                onCambio={(v) => form.setData('activo', v)}
                                desactivado={esYo}
                            />
                            {form.errors.activo && <p className="mt-2 text-[13px] text-[#B42318]">{form.errors.activo}</p>}
                        </Bloque>
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
                            <BotonGuardar cargando={form.processing} disabled={!form.isDirty}>
                                Guardar cambios
                            </BotonGuardar>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

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
                <div className="grid gap-3">
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
