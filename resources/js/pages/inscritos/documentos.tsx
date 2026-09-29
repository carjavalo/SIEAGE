import { botonPrimario } from '@/components/formulario';
import { EncabezadoInscrito } from '@/components/inscritos/encabezado';
import { Pasos } from '@/components/inscritos/pasos';
import PanelLayout from '@/layouts/panel-layout';
import {
    type EstadoDocumento,
    type FichaInscrito,
    type Requisito,
    documentosListos,
    hace,
    nombreAcudiente,
    nombreInscrito,
    padresListos,
} from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, Minus } from 'lucide-react';
import { type FormEventHandler } from 'react';
import { sileo } from 'sileo';

type Marcados = Partial<Record<string, EstadoDocumento>>;

type Props = FichaInscrito & {
    requisitos: Requisito[];
    nivel: 'primaria' | 'bachillerato';
    marcados: Marcados;
    registro: { por: string | null; en: string } | null;
};

const tarjeta = 'rounded-[28px] bg-[#F2F5FA]';

/**
 * Segundo paso para matricular a un inscrito: marcar con un chulo los
 * documentos que trajo el acudiente. Se puede seguir aunque falten: quedan
 * anotados en la ficha para pedirlos después.
 */
export default function Documentos({ solicitud: s, padres, documentos, matricula, requisitos, nivel, marcados, registro }: Props) {
    const form = useForm<{ documentos: Marcados }>({ documentos: { ...marcados } });
    const nombre = nombreInscrito(s);
    const pendiente = s.estado === 'pendiente';
    const listosPadres = padresListos(padres);

    const estado = (clave: string) => form.data.documentos[clave];
    const poner = (clave: string, valor: EstadoDocumento | undefined) => {
        const siguiente = { ...form.data.documentos };
        if (valor) siguiente[clave] = valor;
        else delete siguiente[clave];
        form.setData('documentos', siguiente);
    };
    const listos = requisitos.filter((r) => estado(r.clave)).length;
    const faltan = requisitos.length - listos;
    const marcarTodos = () =>
        form.setData('documentos', Object.fromEntries(requisitos.map((r) => [r.clave, estado(r.clave) ?? 'entregado'])) as Marcados);

    const guardar: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(`/inscritos/${s.id}/documentos`, {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults();
                sileo.success({
                    title: 'Documentos guardados',
                    description: !pendiente
                        ? 'Quedaron actualizados.'
                        : faltan > 0
                          ? `Falta${faltan === 1 ? '' : 'n'} ${faltan}: quedan anotados para pedirlos después. Ahora elige el grupo.`
                          : 'Están completos. Ahora elige el grupo.',
                });
            },
            onError: () => sileo.warning({ title: 'No se pudieron guardar', description: 'Revisa la lista e inténtalo de nuevo.' }),
        });
    };

    return (
        <PanelLayout titulo={`Documentos · ${nombre}`}>
            <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={`/inscritos/${s.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/75 pr-3 pl-2 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" />
                        Madre y padre
                    </Link>
                    <Pasos
                        solicitudId={s.id}
                        actual={2}
                        padresListos={listosPadres}
                        documentosListos={documentosListos(documentos)}
                        matriculado={!!matricula}
                    />
                </div>

                <EncabezadoInscrito solicitud={s} matricula={matricula} />

                <form onSubmit={guardar} className="mt-7 max-w-[860px]">
                    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                        <div className="min-w-0">
                            <h2 className="text-[20px] font-semibold tracking-[-0.015em]">¿Qué documentos trajo?</h2>
                            <p className="mt-1 text-[14px] text-[#56627F]">
                                Marca con un chulo lo que entregó {nombreAcudiente(s)}. Es la lista de {nivel} del procedimiento de matrícula.
                            </p>
                            {registro && (
                                <p className="mt-1 text-[13px] text-[#5E6983]">
                                    Registrados {registro.por ? `por ${registro.por} ` : ''}· {hace(registro.en).toLowerCase()}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={marcarTodos}
                            disabled={faltan === 0}
                            className="h-9 shrink-0 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold text-[#1E3A7B] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none disabled:cursor-default disabled:text-[#5E6983] disabled:hover:bg-transparent"
                        >
                            Trajo todo
                        </button>
                    </div>

                    {!listosPadres && !matricula && (
                        <p className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#FFF7E8] px-4 py-3 text-[14px] text-[#6B4A0E]">
                            <CircleAlert className="mt-0.5 size-[18px] shrink-0 text-[#B7862C]" />
                            <span>
                                Faltan los datos de la madre o el padre.{' '}
                                <Link href={`/inscritos/${s.id}`} className="font-semibold underline underline-offset-4">
                                    Complétalos
                                </Link>{' '}
                                antes de matricular.
                            </span>
                        </p>
                    )}

                    <ul aria-label="Documentos para la matrícula" className={cn(tarjeta, 'mt-4 flex flex-col gap-1.5 p-2')}>
                        {requisitos.map((r) => (
                            <Documento key={r.clave} requisito={r} estado={estado(r.clave)} onCambio={(v) => poner(r.clave, v)} />
                        ))}
                    </ul>

                    <div className="sticky bottom-4 z-10 mt-5 flex flex-wrap items-center justify-end gap-3 rounded-[18px] border border-[#E3E9F6] bg-white/90 p-2.5 pl-4 backdrop-blur">
                        <div className="mr-auto flex min-w-0 items-center gap-3 text-[14px]">
                            <span
                                aria-hidden
                                className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-[#E9EEF8]"
                                title={`${listos} de ${requisitos.length}`}
                            >
                                <span
                                    className={cn(
                                        'block h-full rounded-full transition-[width] duration-300',
                                        faltan ? 'bg-[#4F6FC6]' : 'bg-[#3BA67A]',
                                    )}
                                    style={{ width: `${(listos / Math.max(requisitos.length, 1)) * 100}%` }}
                                />
                            </span>
                            <span className="min-w-0 text-[#56627F]" aria-live="polite">
                                {faltan === 0 ? (
                                    <b className="font-semibold text-[#1C6B4A]">Documentos completos</b>
                                ) : (
                                    <>
                                        <b className="font-semibold text-[#16223F] tabular-nums">
                                            {listos} de {requisitos.length}
                                        </b>{' '}
                                        · falta{faltan === 1 ? '' : 'n'} {faltan}, se pueden entregar después
                                    </>
                                )}
                                {form.isDirty && <span className="text-[#8A5A0B]"> · sin guardar</span>}
                            </span>
                        </div>
                        <button type="submit" disabled={form.processing} className={cn(botonPrimario, 'rounded-[13px]')}>
                            {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                            {pendiente ? 'Guardar y elegir grupo' : 'Guardar documentos'}
                            {pendiente && !form.processing && <ArrowRight className="size-[18px]" />}
                        </button>
                    </div>
                </form>
            </div>
        </PanelLayout>
    );
}

/** Un documento: la fila entera marca el chulo; los que pueden no corresponder traen "No aplica". */
function Documento({
    requisito: r,
    estado,
    onCambio,
}: {
    requisito: Requisito;
    estado: EstadoDocumento | undefined;
    onCambio: (v: EstadoDocumento | undefined) => void;
}) {
    const entregado = estado === 'entregado';
    const noAplica = estado === 'no_aplica';

    return (
        <li
            className={cn(
                'flex items-center gap-2 rounded-[20px] pr-2 transition-colors duration-200',
                entregado ? 'bg-white shadow-[0_1px_2px_rgba(22,34,63,0.05)]' : 'hover:bg-white/60',
            )}
        >
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 py-3.5 pl-4">
                <input
                    type="checkbox"
                    checked={entregado}
                    onChange={(e) => onCambio(e.target.checked ? 'entregado' : undefined)}
                    className="peer sr-only"
                />
                <span
                    aria-hidden
                    className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-[9px] transition duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-[#B7C6EA]',
                        entregado
                            ? 'bg-[#1E3A7B] text-white'
                            : noAplica
                              ? 'bg-[#E3E9F6] text-[#5E6983]'
                              : 'bg-white ring-[1.5px] ring-[#C4D2F1] ring-inset',
                    )}
                >
                    {entregado && <Check className="animate-in zoom-in-50 size-4 duration-200 motion-reduce:animate-none" strokeWidth={3} />}
                    {noAplica && <Minus className="size-4" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                    <span className={cn('block text-[15px] leading-snug font-medium', noAplica ? 'text-[#56627F]' : 'text-[#16223F]')}>
                        {r.nombre}
                    </span>
                    {(r.ayuda || noAplica) && (
                        <span className="mt-0.5 block text-[13px] leading-snug text-[#5E6983]">
                            {noAplica ? 'No aplica para este estudiante.' : r.ayuda}
                        </span>
                    )}
                </span>
            </label>
            {r.noAplica && (
                <button
                    type="button"
                    aria-pressed={noAplica}
                    onClick={() => onCambio(noAplica ? undefined : 'no_aplica')}
                    className={cn(
                        'h-8 shrink-0 cursor-pointer rounded-full px-3 text-[13px] font-medium transition focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none',
                        noAplica ? 'bg-[#1E3A7B] text-white hover:bg-[#172E63]' : 'text-[#56627F] ring-1 ring-[#D3DDF3] ring-inset hover:bg-white',
                    )}
                >
                    No aplica
                </button>
            )}
        </li>
    );
}
