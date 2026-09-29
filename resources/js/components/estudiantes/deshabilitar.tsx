import { botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, RotateCcw, UserX } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import { sileo } from 'sileo';

const MOTIVOS = [
    { valor: 'perdio', titulo: 'Perdió el año', texto: 'No aprobó el grado. No se promueve.' },
    { valor: 'retiro', titulo: 'Se retiró del colegio', texto: 'Ya no estudiará aquí.' },
    { valor: 'traslado', titulo: 'Trasladado', texto: 'Se fue a otra institución.' },
    { valor: 'otro', titulo: 'Otro motivo', texto: 'Explícalo en la razón.' },
] as const;

export type Novedad = {
    id: number;
    tipo: 'deshabilitada' | 'habilitada';
    estado_nuevo: string;
    razon: string;
    fecha: string;
    created_at: string;
    usuario: string | null;
};

export const puedeDeshabilitar = (auth: SharedData['auth']) => !!(auth as { puedeDeshabilitar?: boolean }).puedeDeshabilitar;

const hoy = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const campo =
    'w-full rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-3.5 text-[15px] text-[#16223F] outline-none transition placeholder:text-[#6B7690] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] aria-invalid:border-[#E0897D]';
const dialogo = 'max-w-lg rounded-[22px] border-[#E3E9F6] p-6 font-sans text-[#16223F] sm:rounded-[22px]';

function Razon({ valor, onCambio, error, placeholder }: { valor: string; onCambio: (v: string) => void; error?: string; placeholder: string }) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="flex justify-between text-[13px] font-medium text-[#3E4A68]">
                Razón
                <span className={cn('font-normal tabular-nums', valor.length > 500 ? 'text-[#B42318]' : 'text-[#8C97B3]')}>{valor.length}/500</span>
            </span>
            <textarea
                value={valor}
                onChange={(e) => onCambio(e.target.value)}
                rows={3}
                maxLength={500}
                required
                autoFocus
                placeholder={placeholder}
                aria-invalid={!!error}
                className={cn(campo, 'resize-none py-2.5 leading-relaxed')}
            />
            {error && <span className="text-[13px] text-[#B42318]">{error}</span>}
        </label>
    );
}

/** Botón y modal para deshabilitar al estudiante en el año en curso: motivo, razón y fecha. */
export function DeshabilitarEstudiante({ estudianteId, nombre }: { estudianteId: number; nombre: string }) {
    const [abierto, setAbierto] = useState(false);
    const form = useForm({ motivo: '' as (typeof MOTIVOS)[number]['valor'] | '', razon: '', fecha: hoy() });

    const abrir = () => {
        form.reset();
        form.clearErrors();
        setAbierto(true);
    };

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(`/estudiantes/${estudianteId}/deshabilitar`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (pagina) => {
                setAbierto(false);
                const mensaje = (pagina.props as unknown as { flash: { success?: string } }).flash.success;
                sileo.success({ title: 'Estudiante deshabilitado', description: mensaje ?? nombre });
            },
            onError: () => sileo.warning({ title: 'Revisa el formulario', description: 'Falta el motivo o la razón.' }),
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={abrir}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#F0C4C0] bg-white text-[14px] font-semibold text-[#A12B2B] transition hover:bg-[#FDECEC]"
            >
                <UserX className="size-4" />
                Deshabilitar estudiante
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !form.processing && setAbierto(v)}>
                <DialogContent className={dialogo}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Deshabilitar estudiante</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            {nombre} dejará de estar activo este año y no se promoverá. Puedes volver a habilitarlo si fue un error.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={enviar} className="flex flex-col gap-4">
                        <fieldset>
                            <legend className="mb-1.5 text-[13px] font-medium text-[#3E4A68]">Motivo</legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {MOTIVOS.map((m) => (
                                    <label
                                        key={m.valor}
                                        className={cn(
                                            'flex cursor-pointer gap-2.5 rounded-[14px] border-[1.5px] p-3 transition',
                                            form.data.motivo === m.valor
                                                ? 'border-[#A12B2B] bg-[#FDF3F2]'
                                                : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="motivo"
                                            checked={form.data.motivo === m.valor}
                                            onChange={() => form.setData('motivo', m.valor)}
                                            className="mt-0.5 size-4 accent-[#A12B2B]"
                                        />
                                        <span>
                                            <span className="block text-[14px] font-medium">{m.titulo}</span>
                                            <span className="block text-[12px] leading-snug text-[#56627F]">{m.texto}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {form.errors.motivo && <span className="mt-1 block text-[13px] text-[#B42318]">{form.errors.motivo}</span>}
                        </fieldset>

                        <Razon
                            valor={form.data.razon}
                            onCambio={(v) => form.setData('razon', v)}
                            error={form.errors.razon}
                            placeholder="Ej. La familia se muda a Jamundí y lo matriculó en otro colegio."
                        />

                        <label className="flex flex-col gap-1.5 sm:w-1/2">
                            <span className="text-[13px] font-medium text-[#3E4A68]">Fecha</span>
                            <input
                                type="date"
                                value={form.data.fecha}
                                max={hoy()}
                                onChange={(e) => form.setData('fecha', e.target.value)}
                                aria-invalid={!!form.errors.fecha}
                                className={cn(campo, 'h-11')}
                            />
                            {form.errors.fecha && <span className="text-[13px] text-[#B42318]">{form.errors.fecha}</span>}
                        </label>

                        <div className="mt-1 flex justify-end gap-2">
                            <button type="button" onClick={() => setAbierto(false)} disabled={form.processing} className={botonSecundario}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing || !form.data.motivo || form.data.razon.trim().length < 5}
                                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#A12B2B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#8E2323] disabled:cursor-default disabled:opacity-50"
                            >
                                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                                Deshabilitar
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

/** Volver a activar a un estudiante deshabilitado por error; también pide la razón. */
export function HabilitarEstudiante({ estudianteId, nombre }: { estudianteId: number; nombre: string }) {
    const [abierto, setAbierto] = useState(false);
    const form = useForm({ razon: '' });

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(`/estudiantes/${estudianteId}/habilitar`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setAbierto(false);
                sileo.success({ title: 'Estudiante habilitado', description: `${nombre} vuelve a estar activo.` });
            },
            onError: (errores) => sileo.error({ title: 'No se pudo habilitar', description: errores.razon }),
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    form.reset();
                    form.clearErrors();
                    setAbierto(true);
                }}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#6E8BD6] bg-[#EEF2FB] text-[14px] font-semibold text-[#1E3A7B] transition hover:bg-[#DCE5F8]"
            >
                <RotateCcw className="size-4" />
                Habilitar de nuevo
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !form.processing && setAbierto(v)}>
                <DialogContent className={dialogo}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Habilitar de nuevo</DialogTitle>
                        <DialogDescription className="text-[#56627F]">{nombre} volverá a estar activo este año.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={enviar} className="flex flex-col gap-4">
                        <Razon
                            valor={form.data.razon}
                            onCambio={(v) => form.setData('razon', v)}
                            error={form.errors.razon}
                            placeholder="Ej. Se deshabilitó por error; sigue asistiendo."
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setAbierto(false)} disabled={form.processing} className={botonSecundario}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing || form.data.razon.trim().length < 5}
                                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#172E63] disabled:cursor-default disabled:opacity-50"
                            >
                                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                                Habilitar
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

/** Historial de la matrícula: cada deshabilitación y habilitación, con quién y por qué. */
export function Novedades({ novedades }: { novedades: Novedad[] }) {
    if (!novedades.length) return null;
    return (
        <ol className="mt-3 space-y-2">
            {novedades.map((n) => (
                <li key={n.id} className="rounded-[12px] bg-[#F5F7FC] px-3.5 py-2.5 text-[13px]">
                    <p className="font-medium text-[#16223F]">
                        {n.tipo === 'habilitada' ? 'Habilitado de nuevo' : 'Deshabilitado'}
                        <span className="font-normal text-[#56627F]">
                            {' '}
                            ·{' '}
                            {new Date(n.created_at.replace(' ', 'T')).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                            {n.usuario && ` · ${n.usuario}`}
                        </span>
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-[#3E4A68]">{n.razon}</p>
                </li>
            ))}
        </ol>
    );
}

/** Acciones de estado en la ficha: deshabilitar o habilitar, según cómo esté. */
export function EstadoMatricula({
    estudianteId,
    nombre,
    estado,
    novedades,
}: {
    estudianteId: number;
    nombre: string;
    estado: string;
    novedades: Novedad[];
}) {
    const { auth } = usePage<SharedData>().props;
    const puede = puedeDeshabilitar(auth);
    return (
        <>
            {puede && estado === 'activo' && <DeshabilitarEstudiante estudianteId={estudianteId} nombre={nombre} />}
            {puede && !['activo', 'graduado'].includes(estado) && <HabilitarEstudiante estudianteId={estudianteId} nombre={nombre} />}
            <Novedades novedades={novedades} />
        </>
    );
}
