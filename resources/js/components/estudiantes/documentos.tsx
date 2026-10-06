import { Documento } from '@/components/inscritos/documento';
import { type DocumentosEstudiante as Datos } from '@/lib/estudiantes';
import { type EstadoDocumento, hace } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { sileo } from 'sileo';

type Marcados = Partial<Record<string, EstadoDocumento>>;

/**
 * Los documentos de matrícula de un estudiante que entró por el formulario de
 * inscripción. Si al matricular faltaron algunos, aquí se ve cuáles y se marcan
 * cuando el acudiente los traiga (se guardan en su inscripción, como en Inscritos).
 */
export function DocumentosEstudiante({ documentos: d, editable }: { documentos: Datos; editable: boolean }) {
    const inicial = Object.fromEntries(d.lista.filter((r) => r.estado).map((r) => [r.clave, r.estado])) as Marcados;
    const form = useForm<{ documentos: Marcados }>({ documentos: inicial });

    const faltan = d.lista.filter((r) => !inicial[r.clave]);
    const poner = (clave: string, valor: EstadoDocumento | undefined) => {
        const siguiente = { ...form.data.documentos };
        if (valor) siguiente[clave] = valor;
        else delete siguiente[clave];
        form.setData('documentos', siguiente);
    };

    const guardar = () =>
        form.put(`/inscritos/${d.solicitud}/documentos`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                const quedan = d.lista.filter((r) => !form.data.documentos[r.clave]).length;
                form.setDefaults();
                sileo.success({
                    title: 'Documentos guardados',
                    description: quedan === 0 ? 'Ya están completos.' : `Falta${quedan === 1 ? '' : 'n'} ${quedan}.`,
                });
            },
            onError: () => sileo.warning({ title: 'No se pudieron guardar', description: 'Inténtalo de nuevo.' }),
        });

    return (
        <div>
            {faltan.length === 0 ? (
                <p className="flex items-center gap-2 text-[14px] font-medium text-[#1C6B4A]">
                    <Check className="size-4" strokeWidth={2.5} />
                    Completos ({d.lista.length})
                </p>
            ) : (
                <div className="flex items-start gap-3 rounded-[16px] bg-[#FFF7E8] px-4 py-3 text-[14px] text-[#6B4A0E]">
                    <CircleAlert className="mt-0.5 size-[18px] shrink-0 text-[#B7862C]" />
                    <div className="min-w-0">
                        <p className="font-semibold">
                            Falta{faltan.length === 1 ? '' : 'n'} {faltan.length} de {d.lista.length} documentos
                        </p>
                        {/* Sin permiso para marcarlos, al menos se sabe cuáles pedir. */}
                        {!editable && (
                            <ul className="mt-1 space-y-0.5">
                                {faltan.map((r) => (
                                    <li key={r.clave}>· {r.nombre}</li>
                                ))}
                            </ul>
                        )}
                        {editable && <p className="mt-0.5 text-[13px] text-[#8A5A0B]">Márcalos cuando el acudiente los traiga.</p>}
                    </div>
                </div>
            )}

            {editable && (
                <>
                    <ul aria-label="Documentos de matrícula" className="mt-2.5 flex flex-col gap-1 rounded-[20px] bg-[#F2F5FA] p-1.5">
                        {/* Primero los que faltan: son los que se vienen a marcar. */}
                        {[...faltan, ...d.lista.filter((r) => inicial[r.clave])].map((r) => (
                            <Documento key={r.clave} requisito={r} estado={form.data.documentos[r.clave]} onCambio={(v) => poner(r.clave, v)} />
                        ))}
                    </ul>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                        <p className="min-w-0 text-[13px] text-[#5E6983]">
                            {d.registro && `Actualizados${d.registro.por ? ` por ${d.registro.por}` : ''} · ${hace(d.registro.en).toLowerCase()}`}
                        </p>
                        <button
                            type="button"
                            onClick={guardar}
                            disabled={!form.isDirty || form.processing}
                            className={cn(
                                'flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none',
                                form.isDirty ? 'bg-[#1E3A7B] text-white hover:bg-[#172E63]' : 'cursor-default bg-[#EEF2FB] text-[#8C97B3]',
                            )}
                        >
                            {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                            Guardar documentos
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
