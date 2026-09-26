import { PuntoSede, sedeInfo } from '@/components/estudiantes/etiquetas';
import { Barra } from '@/components/estudiantes/tablero-grupos';
import { EncabezadoInscrito } from '@/components/inscritos/encabezado';
import { Pasos } from '@/components/inscritos/pasos';
import PanelLayout from '@/layouts/panel-layout';
import { type Grupo, gradoCorto } from '@/lib/estudiantes';
import { type FichaInscrito, enlaceEstudiante, nombreInscrito, padresListos } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, CircleAlert, GraduationCap, LoaderCircle } from 'lucide-react';
import { useMemo } from 'react';
import { sileo } from 'sileo';

type Props = FichaInscrito & {
    anio: number | null;
    gradoNumero: number;
    grupos: Grupo[];
};

const tarjeta = 'rounded-[24px] border border-[#E3E9F6] bg-white shadow-[0_1px_2px_rgba(22,34,63,0.04),0_12px_32px_-20px_rgba(22,34,63,0.18)]';

/** Cómo va el cupo del grupo, en palabras. */
function cupo(libres: number) {
    if (libres < 0) return { texto: `${-libres} sobre el cupo`, color: 'text-[#B42318]' };
    if (libres === 0) return { texto: 'Lleno', color: 'text-[#8A5A0B]' };
    return { texto: `Quedan ${libres} cupo${libres === 1 ? '' : 's'}`, color: libres <= 2 ? 'text-[#8A5A0B]' : 'text-[#1C6B4A]' };
}

/**
 * Segundo paso para matricular a un inscrito: elegir el grupo, dentro del
 * grado que pidió la familia, viendo cuántos estudiantes tiene cada uno.
 */
export default function ElegirGrupo({ solicitud: s, padres, matricula, anio, gradoNumero, grupos: gruposServidor }: Props) {
    const form = useForm<{ grupo_id: number | null }>({ grupo_id: null });
    const listos = padresListos(padres);
    const nombre = nombreInscrito(s);

    // activos, nuevos y cupos llegan como texto (son SUM en MySQL). Orden: por sede y luego por código.
    const grupos = useMemo(
        () =>
            gruposServidor
                .map((g) => ({ ...g, activos: Number(g.activos), nuevos: Number(g.nuevos), cupos: Number(g.cupos) }))
                .sort(
                    (a, b) =>
                        sedeInfo(a.sede_codigo).orden - sedeInfo(b.sede_codigo).orden || a.codigo.localeCompare(b.codigo, 'es', { numeric: true }),
                ),
        [gruposServidor],
    );
    const variasSedes = new Set(grupos.map((g) => g.sede_codigo)).size > 1;
    const variasJornadas = new Set(grupos.map((g) => g.jornada)).size > 1;
    // El que tiene más cupos libres lleva una marca, para decidir rápido.
    const masLibre = grupos.reduce<(typeof grupos)[number] | null>((m, g) => (g.cupos - g.activos > (m ? m.cupos - m.activos : 0) ? g : m), null);
    const elegido = grupos.find((g) => g.id === form.data.grupo_id);

    const matricular = () => {
        if (!elegido) return;
        form.post(`/inscritos/${s.id}/matricular`, {
            onSuccess: () =>
                sileo.success({
                    title: `${s.sexo === 'F' ? 'Matriculada' : 'Matriculado'} en ${elegido.codigo}`,
                    description: `${nombre} ya aparece en Estudiantes, ${s.grado}.`,
                }),
            onError: (e) => sileo.warning({ title: 'No se pudo matricular', description: e.grupo_id ?? 'Revisa los datos e inténtalo de nuevo.' }),
        });
    };

    return (
        <PanelLayout titulo={`Grupo · ${nombre}`}>
            <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={`/inscritos/${s.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/75 pr-3 pl-2 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" />
                        Madre y padre
                    </Link>
                    <Pasos solicitudId={s.id} actual={2} padresListos={listos} matriculado={!!matricula} />
                </div>

                <EncabezadoInscrito solicitud={s} matricula={matricula} />

                {matricula ? (
                    <div className={cn(tarjeta, 'mt-7 flex flex-col items-center gap-3 px-6 py-12 text-center')}>
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#E3F4EC] text-[#1C6B4A]">
                            <Check className="size-6" strokeWidth={2.5} />
                        </span>
                        <p className="text-[18px] font-semibold">
                            Ya quedó {s.sexo === 'F' ? 'matriculada' : 'matriculado'} en {matricula.grupo} · {matricula.anio}
                        </p>
                        <Link
                            href={enlaceEstudiante(matricula)}
                            className="mt-1 flex h-11 items-center gap-2 rounded-[13px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(30,58,123,0.6)] transition hover:bg-[#172E63]"
                        >
                            <GraduationCap className="size-[18px]" />
                            Verlo en Estudiantes
                        </Link>
                    </div>
                ) : (
                    <section aria-labelledby="titulo-grupos" className="mt-7">
                        <h2 id="titulo-grupos" className="text-[20px] font-semibold tracking-[-0.015em]">
                            ¿En qué grupo de {s.grado} queda?
                        </h2>
                        <p className="mt-1 text-[14px] text-[#56627F]">
                            La familia pidió {s.grado}. Estos son sus grupos{anio ? ` en ${anio}` : ''}: elige uno viendo cuántos estudiantes tiene
                            cada uno.
                        </p>

                        {!listos && (
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

                        {grupos.length === 0 ? (
                            <div className={cn(tarjeta, 'mt-5 px-6 py-12 text-center')}>
                                <p className="text-[16px] font-semibold">
                                    No hay grupos de {s.grado}
                                    {anio ? ` en ${anio}` : ''}
                                </p>
                                <p className="mt-1 text-sm text-[#56627F]">Hay que crear los grupos del grado antes de matricular.</p>
                            </div>
                        ) : (
                            <div
                                role="radiogroup"
                                aria-labelledby="titulo-grupos"
                                className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                            >
                                {grupos.map((g) => {
                                    const libres = g.cupos - g.activos;
                                    const estadoCupo = cupo(libres);
                                    const activo = g.id === form.data.grupo_id;
                                    return (
                                        <button
                                            key={g.id}
                                            type="button"
                                            role="radio"
                                            aria-checked={activo}
                                            onClick={() => form.setData('grupo_id', g.id)}
                                            className={cn(
                                                'relative flex cursor-pointer flex-col rounded-[22px] bg-white p-4 text-left shadow-[0_1px_2px_rgba(22,34,63,0.06),0_10px_24px_-18px_rgba(22,34,63,0.35)] transition duration-200 focus-visible:ring-4 focus-visible:ring-[#DCE5F8] focus-visible:outline-none',
                                                activo
                                                    ? 'bg-[#F7F9FF] ring-2 ring-[#1E3A7B]'
                                                    : 'ring-1 ring-[#E3E9F6] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(22,34,63,0.06),0_16px_28px_-16px_rgba(22,34,63,0.35)] hover:ring-[#C4D2F1]',
                                            )}
                                        >
                                            {activo && (
                                                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-[#1E3A7B] text-white shadow-sm">
                                                    <Check className="size-3.5" strokeWidth={3} />
                                                </span>
                                            )}
                                            <span className="flex items-start justify-between gap-3">
                                                <span className="min-w-0">
                                                    <span className="block text-[28px] leading-8 font-semibold tracking-[-0.02em]">{g.codigo}</span>
                                                    <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#56627F]">
                                                        {variasSedes && (
                                                            <>
                                                                <PuntoSede codigo={g.sede_codigo} />
                                                                <span className="truncate" title={g.sede}>
                                                                    {sedeInfo(g.sede_codigo).corto}
                                                                </span>
                                                                <span aria-hidden>·</span>
                                                            </>
                                                        )}
                                                        <span className={cn(variasJornadas && g.jornada === 'Tarde' && 'font-medium text-[#8A5A0B]')}>
                                                            {g.jornada}
                                                        </span>
                                                    </span>
                                                </span>
                                                <span className="shrink-0 text-right">
                                                    <span className="block leading-8 tabular-nums">
                                                        <b
                                                            className={cn(
                                                                'text-[28px] font-semibold tracking-[-0.02em]',
                                                                libres < 0 ? 'text-[#B42318]' : 'text-[#16223F]',
                                                            )}
                                                        >
                                                            {g.activos}
                                                        </b>
                                                        <span className="text-[16px] text-[#56627F]">/{g.cupos}</span>
                                                    </span>
                                                    <span className="block text-[12px] text-[#5E6983]">estudiantes</span>
                                                </span>
                                            </span>
                                            <Barra
                                                grupo={g}
                                                elegido={false}
                                                className="mt-3 h-2 [@media(min-height:860px)]:mt-3 [@media(min-height:860px)]:h-2"
                                            />
                                            <span className="mt-2.5 flex items-baseline justify-between gap-2 text-[14px]">
                                                <span className={cn('font-semibold', estadoCupo.color)}>{estadoCupo.texto}</span>
                                                <span className="text-[13px] text-[#56627F] tabular-nums">
                                                    {g.nuevos} nuevo{g.nuevos === 1 ? '' : 's'}
                                                </span>
                                            </span>
                                            <span className="mt-1 flex items-center justify-between gap-2 text-[13px] text-[#3E4A68]">
                                                <span className="min-w-0 truncate">
                                                    <span className="text-[#5E6983]">Dir.</span> {g.director ?? 'Sin director asignado'}
                                                </span>
                                                {masLibre?.id === g.id && grupos.length > 1 && (
                                                    <span className="shrink-0 rounded-full bg-[#E3F4EC] px-2 py-0.5 text-[12px] font-medium text-[#1C6B4A]">
                                                        Más cupos
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {grupos.length > 0 && (
                            <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-end gap-3 rounded-[18px] border border-[#E3E9F6] bg-white/90 p-2.5 pl-4 shadow-[0_12px_32px_-16px_rgba(22,34,63,0.35)] backdrop-blur">
                                <p className="mr-auto min-w-0 text-[14px] text-[#56627F]">
                                    {form.errors.grupo_id ? (
                                        <span className="font-medium text-[#B42318]">{form.errors.grupo_id}</span>
                                    ) : elegido ? (
                                        <>
                                            <b className="font-semibold text-[#16223F]">{nombre}</b> queda en{' '}
                                            <b className="font-semibold text-[#1E3A7B]">{elegido.codigo}</b>
                                            {' · '}
                                            {elegido.jornada} · el grupo pasa a{' '}
                                            <b
                                                className={cn(
                                                    'font-semibold tabular-nums',
                                                    elegido.activos + 1 > elegido.cupos ? 'text-[#B42318]' : 'text-[#16223F]',
                                                )}
                                            >
                                                {elegido.activos + 1}/{elegido.cupos}
                                            </b>
                                        </>
                                    ) : (
                                        `Elige un grupo de ${gradoCorto({ numero: gradoNumero })} para matricular.`
                                    )}
                                </p>
                                <button
                                    type="button"
                                    onClick={matricular}
                                    disabled={!elegido || !listos || form.processing}
                                    className="flex h-11 cursor-pointer items-center gap-2 rounded-[13px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(30,58,123,0.6)] transition hover:bg-[#172E63] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none active:scale-[0.99] disabled:cursor-default disabled:opacity-50 disabled:shadow-none"
                                >
                                    {form.processing ? <LoaderCircle className="size-4 animate-spin" /> : <GraduationCap className="size-[18px]" />}
                                    {elegido ? `Matricular en ${elegido.codigo}` : 'Matricular'}
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </PanelLayout>
    );
}
