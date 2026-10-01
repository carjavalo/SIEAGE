import { botonPrimario, botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Grado } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { ArrowUpRight, GraduationCap, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';

/** Lo que devuelve el servidor después de promover (PromocionController → flash.promocion). */
export type ResumenPromocion = {
    anio: number;
    promovidos: number;
    graduados: number;
    sobreCupo: number;
    reparto: { grupo: string; sede: string; n: number; libres: number }[];
};

type Alcance = { estudiante_id?: number; grado_id?: number; sede?: string };

/** Promueve y avisa con los toasts de Sileo: primero "Promoviendo…", luego el resultado. */
export function promover(anio: number, alcance: Alcance, { onFin }: { onFin?: () => void } = {}) {
    const envio = new Promise<ResumenPromocion>((resolver, rechazar) => {
        router.post(
            '/promociones',
            { anio, ...alcance },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (pagina) => {
                    const resumen = (pagina.props as unknown as { flash: { promocion?: ResumenPromocion } }).flash.promocion;
                    if (resumen) resolver(resumen);
                    else rechazar(new Error('Sin respuesta'));
                },
                onError: (errores) => rechazar(new Error(Object.values(errores)[0] ?? 'No se pudo promover.')),
                onFinish: onFin,
            },
        );
    });

    sileo.promise(envio, {
        loading: { title: alcance.estudiante_id ? 'Promoviendo…' : 'Promoviendo estudiantes…' },
        success: (r) => mensaje(r, !!alcance.estudiante_id),
        error: (e) => ({ title: 'No se pudo promover', description: e instanceof Error ? e.message : undefined }),
    });

    envio
        .then((r) => {
            if (r.sobreCupo > 0) {
                sileo.warning({
                    title: `${r.sobreCupo} ${r.sobreCupo === 1 ? 'quedó' : 'quedaron'} sobre el cupo`,
                    description: `Se promovieron igual. Revisa esos grupos de ${r.anio} y deshabilita a quienes no continúan.`,
                    duration: 8000,
                });
            }
        })
        .catch(() => {});
}

function mensaje(r: ResumenPromocion, uno: boolean) {
    if (r.promovidos === 0 && r.graduados === 0) {
        return { type: 'info' as const, title: 'No había a quién promover', description: 'Ya estaban promovidos o no están activos.' };
    }
    if (uno) {
        const g = r.reparto[0];
        return r.graduados
            ? { title: 'Graduado', description: 'Terminó undécimo: quedó como graduado.' }
            : {
                  title: `Promovido a ${g.grupo}`,
                  description: `${g.sede} · ${r.anio} · ${g.libres < 0 ? `el grupo queda ${-g.libres} sobre el cupo` : `${g.libres} cupos libres en el grupo`}`,
              };
    }
    const partes = [
        r.promovidos && `${r.promovidos} promovido${r.promovidos === 1 ? '' : 's'} a ${r.anio}`,
        r.graduados && `${r.graduados} graduado${r.graduados === 1 ? '' : 's'}`,
    ].filter(Boolean);
    const reparto = r.reparto.slice(0, 8).map((g) => `${g.grupo}: ${g.n}`);
    return {
        title: partes.join(' · '),
        description: reparto.length ? `${reparto.join(' · ')}${r.reparto.length > 8 ? ' …' : ''}` : undefined,
        duration: 8000,
    };
}

export const puedePromover = (auth: SharedData['auth']) => !!(auth as { puedePromover?: boolean }).puedePromover;

/**
 * Botón de la lista: promueve el grado a la vista o todo el colegio, después
 * de confirmar. Solo en el año en curso y para quien tiene permiso.
 */
export function BotonPromover({
    anio,
    grado,
    siguiente,
    pendientes,
    sede,
}: {
    anio: number;
    grado: Grado;
    siguiente?: Grado;
    pendientes: number;
    /** Con filtro de sede, "este grado" es solo el de esa sede. */
    sede?: { codigo: string; nombre: string };
}) {
    const { auth } = usePage<SharedData>().props;
    const todoElColegio = auth.todasLasSedes !== false;
    const misSedes = (auth.sedes ?? []).map((s) => s.nombre).join(', ');
    const [abierto, setAbierto] = useState(false);
    const [alcance, setAlcance] = useState<'grado' | 'todos'>('grado');
    const [enviando, setEnviando] = useState(false);
    const gradua = !siguiente;

    const confirmar = () => {
        setEnviando(true);
        promover(anio, alcance === 'grado' ? { grado_id: grado.id, ...(sede ? { sede: sede.codigo } : {}) } : {}, {
            onFin: () => {
                setEnviando(false);
                setAbierto(false);
            },
        });
    };

    const opcion = (valor: 'grado' | 'todos', titulo: string, texto: string) => (
        <label
            className={cn(
                'flex cursor-pointer gap-3 rounded-[14px] border-[1.5px] p-3.5 transition',
                alcance === valor ? 'border-[#1E3A7B] bg-[#EEF2FB]' : 'border-[#E3E9F6] hover:border-[#B9C8EC]',
            )}
        >
            <input
                type="radio"
                name="alcance"
                checked={alcance === valor}
                onChange={() => setAlcance(valor)}
                className="mt-0.5 size-4 accent-[#1E3A7B]"
            />
            <span>
                <span className="block text-[15px] font-medium">{titulo}</span>
                <span className="block text-[13px] leading-snug text-[#56627F]">{texto}</span>
            </span>
        </label>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setAlcance('grado');
                    setAbierto(true);
                }}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[12px] bg-[#1E3A7B] px-3.5 text-sm font-semibold text-white transition hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
            >
                {gradua ? <GraduationCap className="size-4" /> : <ArrowUpRight className="size-4" />}
                Promover
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !enviando && setAbierto(v)}>
                <DialogContent className="max-w-md rounded-[22px] border-[#E3E9F6] p-6 font-sans text-[#16223F] sm:rounded-[22px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Promover al año {anio + 1}</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            Todos los estudiantes activos pasan al mismo grupo del grado siguiente (9-1 → 10-1), aunque quede sobre el cupo; si ese
                            grupo no existe, van al de menos estudiantes. Los de undécimo quedan graduados. Después revisa los grupos con alerta de
                            cupo y deshabilita a quienes no continúan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        {opcion(
                            'grado',
                            `${gradua ? `Graduar ${grado.nombre}` : `${grado.nombre} → ${siguiente.nombre}`}${sede ? ` · solo ${sede.nombre}` : ''}`,
                            pendientes === 0
                                ? 'Ya están todos promovidos.'
                                : `${pendientes} estudiante${pendientes === 1 ? '' : 's'} activo${pendientes === 1 ? '' : 's'} por promover.`,
                        )}
                        {opcion(
                            'todos',
                            todoElColegio ? 'Todo el colegio' : 'Todas mis sedes',
                            todoElColegio ? `Todos los grados de ${anio}, de transición a undécimo.` : `Todos los grados de ${anio} en ${misSedes}.`,
                        )}
                    </div>

                    <div className="mt-1 flex justify-end gap-2">
                        <button type="button" onClick={() => setAbierto(false)} disabled={enviando} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={enviando || (alcance === 'grado' && pendientes === 0)}
                            className={botonPrimario}
                        >
                            {enviando && <LoaderCircle className="size-4 animate-spin" />}
                            {alcance === 'todos'
                                ? todoElColegio
                                    ? 'Promover todo el colegio'
                                    : 'Promover mis sedes'
                                : gradua
                                  ? 'Graduar'
                                  : 'Promover'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

/** Acción de la ficha lateral: promover a este estudiante, o a dónde quedó. */
export function PromocionEstudiante({
    anio,
    estudianteId,
    siguiente,
    promocion,
}: {
    anio: number;
    estudianteId: number;
    siguiente?: Grado;
    promocion: { anio: number; grado: string; grupo: string | null; sede: string } | null;
}) {
    const { auth } = usePage<SharedData>().props;
    const [enviando, setEnviando] = useState(false);

    if (promocion) {
        return (
            <p className="flex items-center gap-2 rounded-[14px] bg-[#EEF2FB] px-4 py-3 text-[14px] text-[#1E3A7B]">
                <ArrowUpRight className="size-4 shrink-0" />
                <span>
                    Promovido a <b className="font-semibold">{promocion.grupo ?? promocion.grado}</b> · {promocion.sede} · {promocion.anio}
                </span>
            </p>
        );
    }
    if (!puedePromover(auth)) return null;

    return (
        <button
            type="button"
            disabled={enviando}
            onClick={() => {
                setEnviando(true);
                promover(anio, { estudiante_id: estudianteId }, { onFin: () => setEnviando(false) });
            }}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#6E8BD6] bg-[#EEF2FB] text-[14px] font-semibold text-[#1E3A7B] transition hover:bg-[#DCE5F8] disabled:opacity-60"
        >
            {enviando ? (
                <LoaderCircle className="size-4 animate-spin" />
            ) : siguiente ? (
                <ArrowUpRight className="size-4" />
            ) : (
                <GraduationCap className="size-4" />
            )}
            {siguiente ? `Promover a ${siguiente.nombre} ${anio + 1}` : 'Graduar'}
        </button>
    );
}
