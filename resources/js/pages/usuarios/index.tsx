import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PanelLayout from '@/layouts/panel-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Check, Copy, Eye, EyeOff, KeyRound, LoaderCircle, Pencil, RefreshCw, UserPlus } from 'lucide-react';
import { type FormEventHandler, type ReactNode, useState } from 'react';
import { sileo } from 'sileo';

type Rol = { id: number; nombre: string; descripcion: string | null };
type Usuario = {
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

const NOMBRES_ROL: Record<string, string> = {
    administrador: 'Administrador',
    coordinacion: 'Coordinación',
    secretaria: 'Secretaría',
    docente: 'Docente',
};
const nombreRol = (r?: { nombre: string } | null) => (r ? (NOMBRES_ROL[r.nombre] ?? r.nombre) : 'Sin rol');

const TONO_ROL: Record<string, string> = {
    administrador: 'bg-[#1E3A7B] text-white',
    coordinacion: 'bg-[#DCE5F8] text-[#1E3A7B]',
    secretaria: 'bg-[#E3F4EC] text-[#1C6B4A]',
    docente: 'bg-[#FFF3DD] text-[#8A5A0B]',
};

/** Sin letras que se confunden al dictarlas o copiarlas a mano (0/O, 1/l/I). */
function claveAleatoria(largo = 10) {
    const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const azar = crypto.getRandomValues(new Uint32Array(largo));
    return Array.from(azar, (n) => letras[n % letras.length]).join('');
}

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

function hace(fecha: string | null) {
    if (!fecha) return 'Nunca';
    const d = new Date(fecha);
    const min = Math.floor((Date.now() - d.getTime()) / 60_000);
    if (min < 2) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    if (min < 60 * 24) return `Hace ${Math.floor(min / 60)} h`;
    const dias = Math.floor(min / (60 * 24));
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

const iniciales = (n: string) =>
    n
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();

const campo =
    'h-11 w-full rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-3.5 text-[15px] text-[#16223F] outline-none transition placeholder:text-[#8C97B3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] aria-invalid:border-[#E0897D]';

function Campo({ etiqueta, ayuda, error, children }: { etiqueta: string; ayuda?: string; error?: string; children: ReactNode }) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#3E4A68]">{etiqueta}</span>
            {children}
            {error ? (
                <span className="text-[13px] text-[#B42318]">{error}</span>
            ) : (
                ayuda && <span className="text-[12px] text-[#56627F]">{ayuda}</span>
            )}
        </label>
    );
}

/** Clave con botones para generarla, verla y copiarla. */
function CampoClave({ valor, onCambio, error }: { valor: string; onCambio: (v: string) => void; error?: string }) {
    const [ver, setVer] = useState(true);
    const [copiada, setCopiada] = useState(false);
    const boton = 'flex size-9 items-center justify-center rounded-[10px] text-[#56627F] transition hover:bg-[#EEF2FB] hover:text-[#1E3A7B]';

    return (
        <Campo etiqueta="Clave" ayuda="Mínimo 8 caracteres. Entrégasela al usuario; podrá cambiarla en su perfil." error={error}>
            <div className="relative flex items-center">
                <input
                    type={ver ? 'text' : 'password'}
                    value={valor}
                    onChange={(e) => onCambio(e.target.value)}
                    autoComplete="new-password"
                    spellCheck={false}
                    aria-invalid={!!error}
                    className={cn(campo, 'pr-32 font-mono tracking-wide')}
                />
                <div className="absolute right-1 flex">
                    <button
                        type="button"
                        onClick={() => onCambio(claveAleatoria())}
                        className={boton}
                        aria-label="Generar otra clave"
                        title="Generar otra"
                    >
                        <RefreshCw className="size-4" />
                    </button>
                    <button type="button" onClick={() => setVer((v) => !v)} className={boton} aria-label={ver ? 'Ocultar clave' : 'Mostrar clave'}>
                        {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard?.writeText(valor);
                            setCopiada(true);
                            setTimeout(() => setCopiada(false), 1500);
                        }}
                        className={boton}
                        aria-label="Copiar clave"
                    >
                        {copiada ? <Check className="size-4 text-[#1C6B4A]" /> : <Copy className="size-4" />}
                    </button>
                </div>
            </div>
        </Campo>
    );
}

const dialogo = "max-w-lg rounded-[22px] border-[#E3E9F6] p-6 font-['Outfit',ui-sans-serif,system-ui,sans-serif] text-[#16223F] sm:rounded-[22px]";
const botonPrimario =
    'flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#172E63] disabled:opacity-70';
const botonSecundario = 'h-11 rounded-[14px] px-4 text-[15px] font-medium text-[#56627F] transition hover:bg-[#EEF2FB] hover:text-[#16223F]';

/** Crear (sin `usuario`) o editar un usuario. */
function FormularioUsuario({ usuario, roles, esYo, onListo }: { usuario?: Usuario; roles: Rol[]; esYo: boolean; onListo: () => void }) {
    const nuevo = !usuario;
    const [usuarioTocado, setUsuarioTocado] = useState(!nuevo);
    const form = useForm({
        name: usuario?.name ?? '',
        usuario: usuario?.usuario ?? '',
        email: usuario?.email ?? '',
        rol_id: usuario?.rol_id ?? roles.find((r) => r.nombre === 'secretaria')?.id ?? roles[0]?.id ?? 0,
        activo: usuario?.activo ?? true,
        password: nuevo ? claveAleatoria() : '',
    });

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        const opciones = {
            preserveScroll: true,
            onSuccess: () => {
                sileo.success({ title: nuevo ? 'Usuario creado' : 'Usuario actualizado', description: `@${form.data.usuario.trim().toLowerCase()}` });
                onListo();
            },
        };
        if (nuevo) form.post('/usuarios', opciones);
        // Al editar, `password` va vacío y el servidor lo ignora: la clave se cambia aparte.
        else form.put(`/usuarios/${usuario.id}`, opciones);
    };

    return (
        <form onSubmit={enviar} className="flex flex-col gap-4">
            <Campo etiqueta="Nombre completo" error={form.errors.name}>
                <input
                    value={form.data.name}
                    onChange={(e) => {
                        form.setData((d) => ({ ...d, name: e.target.value, ...(usuarioTocado ? {} : { usuario: sugerirUsuario(e.target.value) }) }));
                    }}
                    autoFocus
                    autoComplete="off"
                    placeholder="Ej. Juan Pérez"
                    aria-invalid={!!form.errors.name}
                    className={campo}
                />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Usuario" ayuda="Con este nombre ingresa." error={form.errors.usuario}>
                    <input
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
                        className={campo}
                    />
                </Campo>
                <Campo etiqueta="Correo (opcional)" error={form.errors.email}>
                    <input
                        type="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        autoComplete="off"
                        placeholder="nombre@correo.com"
                        aria-invalid={!!form.errors.email}
                        className={campo}
                    />
                </Campo>
            </div>

            <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-[13px] font-medium text-[#3E4A68]">Rol</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                    {roles.map((r) => {
                        const elegido = form.data.rol_id === r.id;
                        return (
                            <label
                                key={r.id}
                                className={cn(
                                    'flex cursor-pointer gap-3 rounded-[14px] border-[1.5px] p-3 transition',
                                    elegido ? 'border-[#1E3A7B] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="rol"
                                    checked={elegido}
                                    onChange={() => form.setData('rol_id', r.id)}
                                    className="mt-0.5 size-4 accent-[#1E3A7B]"
                                />
                                <span className="min-w-0">
                                    <span className="block text-[14px] font-medium">{nombreRol(r)}</span>
                                    {r.descripcion && <span className="block text-[12px] leading-snug text-[#56627F]">{r.descripcion}</span>}
                                </span>
                            </label>
                        );
                    })}
                </div>
                {form.errors.rol_id && <span className="text-[13px] text-[#B42318]">{form.errors.rol_id}</span>}
            </fieldset>

            {nuevo ? (
                <CampoClave valor={form.data.password} onCambio={(v) => form.setData('password', v)} error={form.errors.password} />
            ) : (
                <div className="flex flex-col gap-1.5">
                    <label
                        className={cn(
                            'flex items-center justify-between gap-3 rounded-[14px] border-[1.5px] border-[#E3E9F6] px-4 py-3',
                            esYo ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                        )}
                    >
                        <span>
                            <span className="block text-[14px] font-medium">Puede ingresar</span>
                            <span className="block text-[12px] text-[#56627F]">
                                {esYo
                                    ? 'No puedes desactivar tu propio usuario.'
                                    : 'Si lo desactivas, se cierra su sesión y no podrá volver a entrar.'}
                            </span>
                        </span>
                        <input
                            type="checkbox"
                            role="switch"
                            checked={form.data.activo}
                            disabled={esYo}
                            onChange={(e) => form.setData('activo', e.target.checked)}
                            className="peer sr-only"
                        />
                        <span
                            aria-hidden
                            className="relative h-6 w-11 shrink-0 rounded-full bg-[#D3DDF3] transition peer-checked:bg-[#1E3A7B] peer-focus-visible:ring-4 peer-focus-visible:ring-[#DCE5F8] after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                        />
                    </label>
                    {form.errors.activo && <span className="text-[13px] text-[#B42318]">{form.errors.activo}</span>}
                </div>
            )}

            <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={onListo} className={botonSecundario}>
                    Cancelar
                </button>
                <button type="submit" disabled={form.processing} className={botonPrimario}>
                    {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                    {nuevo ? 'Crear usuario' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
}

function FormularioClave({ usuario, onListo }: { usuario: Usuario; onListo: () => void }) {
    const form = useForm({ password: claveAleatoria() });

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(`/usuarios/${usuario.id}/clave`, {
            preserveScroll: true,
            onSuccess: () => {
                sileo.success({ title: 'Clave cambiada', description: `@${usuario.usuario} ya puede ingresar con la nueva.` });
                onListo();
            },
        });
    };

    return (
        <form onSubmit={enviar} className="flex flex-col gap-4">
            <CampoClave valor={form.data.password} onCambio={(v) => form.setData('password', v)} error={form.errors.password} />
            <p className="rounded-[14px] bg-[#EEF2FB] px-4 py-3 text-[13px] leading-relaxed text-[#1E3A7B]">
                La clave anterior deja de funcionar y se cierran las sesiones que tenga abiertas.
            </p>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onListo} className={botonSecundario}>
                    Cancelar
                </button>
                <button type="submit" disabled={form.processing} className={botonPrimario}>
                    {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                    Cambiar clave
                </button>
            </div>
        </form>
    );
}

type Abierto = { tipo: 'nuevo' } | { tipo: 'editar' | 'clave'; usuario: Usuario } | null;

/** Gestor básico de usuarios: crear, editar rol y estado, y cambiar la clave. */
export default function Usuarios({ usuarios, roles }: { usuarios: Usuario[]; roles: Rol[] }) {
    const { auth } = usePage<SharedData>().props;
    const [abierto, setAbierto] = useState<Abierto>(null);
    const cerrar = () => setAbierto(null);
    const activos = usuarios.filter((u) => u.activo).length;

    return (
        <PanelLayout titulo="Usuarios">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Usuarios</h1>
                    <p className="mt-1 text-[15px] text-[#56627F]">
                        Quién puede ingresar a SIEAGE y con qué rol · <b className="font-semibold text-[#16223F]">{activos}</b> activos
                        {usuarios.length > activos && `, ${usuarios.length - activos} desactivados`}
                    </p>
                </div>
                <button type="button" onClick={() => setAbierto({ tipo: 'nuevo' })} className={botonPrimario}>
                    <UserPlus className="size-[18px]" />
                    Nuevo usuario
                </button>
            </div>

            <section className="mt-6 overflow-hidden rounded-[18px] border border-[#E3E9F6] bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead>
                            <tr className="bg-[#F9FAFD] text-left text-xs font-medium tracking-wide text-[#56627F] uppercase">
                                <th className="py-3 pl-5">Usuario</th>
                                <th className="py-3 pr-3">Rol</th>
                                <th className="py-3 pr-3">Correo</th>
                                <th className="py-3 pr-3">Último ingreso</th>
                                <th className="py-3 pr-3">Estado</th>
                                <th className="py-3 pr-5 text-right">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EEF2F9]">
                            {usuarios.map((u) => (
                                <tr key={u.id} className={cn('transition hover:bg-[#F9FAFD]', !u.activo && 'text-[#8C97B3]')}>
                                    <td className="py-3 pl-5">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                                    u.activo ? 'bg-[#EEF2FB] text-[#1E3A7B]' : 'bg-[#F1F2F6] text-[#8C97B3]',
                                                )}
                                            >
                                                {iniciales(u.name)}
                                            </span>
                                            <div className="min-w-0">
                                                <p className={cn('font-medium', u.activo && 'text-[#16223F]')}>
                                                    {u.name}
                                                    {u.id === auth.user.id && <span className="ml-1.5 text-xs font-normal text-[#5B7BD0]">(tú)</span>}
                                                </p>
                                                <p className="text-xs text-[#56627F]">@{u.usuario}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-3">
                                        <span
                                            className={cn(
                                                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                u.activo
                                                    ? (TONO_ROL[u.rol?.nombre ?? ''] ?? 'bg-[#F1F2F6] text-[#4E566B]')
                                                    : 'bg-[#F1F2F6] text-[#8C97B3]',
                                            )}
                                        >
                                            {nombreRol(u.rol)}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-3">{u.email ?? <span className="text-[#8C97B3]">—</span>}</td>
                                    <td className="py-3 pr-3">{hace(u.ultimo_acceso)}</td>
                                    <td className="py-3 pr-3">
                                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
                                            <span aria-hidden className={cn('size-1.5 rounded-full', u.activo ? 'bg-[#3BA67A]' : 'bg-[#AEB7CC]')} />
                                            <span className={u.activo ? 'text-[#1C6B4A]' : ''}>{u.activo ? 'Activo' : 'Desactivado'}</span>
                                        </span>
                                    </td>
                                    <td className="py-3 pr-5">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setAbierto({ tipo: 'editar', usuario: u })}
                                                className="flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium text-[#1E3A7B] transition hover:bg-[#EEF2FB]"
                                            >
                                                <Pencil className="size-3.5" />
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAbierto({ tipo: 'clave', usuario: u })}
                                                className="flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium text-[#1E3A7B] transition hover:bg-[#EEF2FB]"
                                            >
                                                <KeyRound className="size-3.5" />
                                                Clave
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <Dialog open={abierto !== null} onOpenChange={(abrir) => !abrir && cerrar()}>
                <DialogContent className={dialogo}>
                    {abierto?.tipo === 'nuevo' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">Nuevo usuario</DialogTitle>
                                <DialogDescription className="text-[#56627F]">
                                    Podrá ingresar con el usuario y la clave que definas aquí.
                                </DialogDescription>
                            </DialogHeader>
                            <FormularioUsuario roles={roles} esYo={false} onListo={cerrar} />
                        </>
                    )}
                    {abierto?.tipo === 'editar' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">Editar usuario</DialogTitle>
                                <DialogDescription className="text-[#56627F]">@{abierto.usuario.usuario}</DialogDescription>
                            </DialogHeader>
                            <FormularioUsuario usuario={abierto.usuario} roles={roles} esYo={abierto.usuario.id === auth.user.id} onListo={cerrar} />
                        </>
                    )}
                    {abierto?.tipo === 'clave' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">Cambiar clave</DialogTitle>
                                <DialogDescription className="text-[#56627F]">
                                    {abierto.usuario.name} · @{abierto.usuario.usuario}
                                </DialogDescription>
                            </DialogHeader>
                            <FormularioClave usuario={abierto.usuario} onListo={cerrar} />
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </PanelLayout>
    );
}
