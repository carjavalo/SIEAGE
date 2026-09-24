import { iniciales } from '@/components/estudiantes/etiquetas';
import PanelLayout from '@/layouts/panel-layout';
import { hace, nombreInscrito } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { Check, ChevronRight, Minus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type Inscrito = {
    id: number;
    estado: string;
    created_at: string;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    tipo_documento: string;
    numero_documento: string;
    grado: string;
    acudiente_primer_nombre: string;
    acudiente_primer_apellido: string;
    parentesco: string;
    acudiente_telefono_1: string;
    padres: ('madre' | 'padre')[];
};

type Props = {
    estado: 'pendiente' | 'aprobada' | 'rechazada' | 'todas';
    conteos: Record<string, number>;
    inscritos: Inscrito[];
};

const pestañas = [
    { clave: 'pendiente', nombre: 'Pendientes' },
    { clave: 'aprobada', nombre: 'Aprobadas' },
    { clave: 'rechazada', nombre: 'Rechazadas' },
    { clave: 'todas', nombre: 'Todas' },
] as const;

const plano = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function Padre({ nombre, listo }: { nombre: string; listo: boolean }) {
    return (
        <span className={cn('inline-flex items-center gap-1 text-[13px]', listo ? 'text-[#1C6B4A]' : 'text-[#8C97B3]')}>
            {listo ? <Check className="size-3.5" strokeWidth={2.5} /> : <Minus className="size-3.5" />}
            {nombre}
        </span>
    );
}

/** Solicitudes que llegaron por el formulario público y aún no son estudiantes. */
export default function Inscritos({ estado, conteos, inscritos }: Props) {
    const [filtro, setFiltro] = useState('');
    const total = Object.values(conteos).reduce((a, n) => a + Number(n), 0);

    const visibles = useMemo(() => {
        const t = plano(filtro.trim());
        if (!t) return inscritos;
        return inscritos.filter((i) => plano(`${nombreInscrito(i)} ${i.numero_documento}`).includes(t));
    }, [inscritos, filtro]);

    return (
        <PanelLayout titulo="Inscritos">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Inscritos</h1>
                    <p className="mt-1 text-[15px] text-[#56627F]">
                        Estudiantes que llegaron por el formulario de inscripción. Revisa sus datos y completa los de la madre y el padre.
                    </p>
                </div>
                <div className="relative sm:w-80">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#8C97B3]" />
                    <input
                        type="search"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        placeholder="Filtrar por nombre o documento"
                        aria-label="Filtrar inscritos"
                        className="h-11 w-full rounded-[14px] border-[1.5px] border-[#D3DDF3] bg-white pr-3 pl-10 text-sm outline-none placeholder:text-[#8C97B3] focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8]"
                    />
                </div>
            </div>

            <nav aria-label="Estado de la solicitud" className="mt-6 flex w-fit gap-1 rounded-[14px] bg-[#E6ECF8] p-1">
                {pestañas.map((p) => {
                    const n = p.clave === 'todas' ? total : Number(conteos[p.clave] ?? 0);
                    const actual = p.clave === estado;
                    return (
                        <Link
                            key={p.clave}
                            href="/inscritos"
                            data={{ estado: p.clave }}
                            preserveScroll
                            aria-current={actual ? 'page' : undefined}
                            className={cn(
                                'rounded-[10px] px-3.5 py-1.5 text-sm font-medium transition',
                                actual ? 'bg-white text-[#1E3A7B] shadow-sm' : 'text-[#56627F] hover:text-[#16223F]',
                            )}
                        >
                            {p.nombre} <span className="tabular-nums opacity-70">{n}</span>
                        </Link>
                    );
                })}
            </nav>

            <section className="mt-4 overflow-hidden rounded-[18px] border border-[#E3E9F6] bg-white">
                {visibles.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <p className="text-[17px] font-medium">
                            {filtro
                                ? `Nadie coincide con «${filtro.trim()}».`
                                : estado === 'pendiente'
                                  ? 'No hay inscripciones pendientes.'
                                  : 'No hay inscripciones aquí.'}
                        </p>
                        {!filtro && (
                            <p className="mt-1 text-sm text-[#56627F]">
                                Las familias se inscriben en{' '}
                                <a href="/inscripcion" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
                                    el formulario de inscripción
                                </a>
                                .
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-sm">
                            <thead>
                                <tr className="bg-[#F9FAFD] text-left text-xs font-medium tracking-wide text-[#56627F] uppercase">
                                    <th className="py-3 pl-5">Estudiante</th>
                                    <th className="py-3 pr-3">Ingresa a</th>
                                    <th className="py-3 pr-3">Acudiente</th>
                                    <th className="py-3 pr-3">Padres</th>
                                    <th className="py-3 pr-3">Enviada</th>
                                    <th className="w-10" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EEF2F9]">
                                {visibles.map((i) => (
                                    <tr
                                        key={i.id}
                                        onClick={() => router.visit(`/inscritos/${i.id}`)}
                                        className="group cursor-pointer transition hover:bg-[#F5F7FC]"
                                    >
                                        <td className="py-3 pl-5">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FB] text-xs font-semibold text-[#1E3A7B]">
                                                    {iniciales(nombreInscrito(i))}
                                                </span>
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/inscritos/${i.id}`}
                                                        onClick={(ev) => ev.stopPropagation()}
                                                        className="block truncate font-medium hover:text-[#1E3A7B]"
                                                    >
                                                        {nombreInscrito(i)}
                                                    </Link>
                                                    <p className="text-xs text-[#56627F] tabular-nums">
                                                        {i.tipo_documento} {i.numero_documento}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-3 font-medium">{i.grado}</td>
                                        <td className="py-3 pr-3">
                                            <p className="text-[#3E4A68]">
                                                {i.acudiente_primer_nombre} {i.acudiente_primer_apellido}
                                            </p>
                                            <p className="text-xs text-[#56627F]">
                                                {i.parentesco} · {i.acudiente_telefono_1}
                                            </p>
                                        </td>
                                        <td className="py-3 pr-3">
                                            <div className="flex gap-3">
                                                <Padre nombre="Madre" listo={i.padres.includes('madre')} />
                                                <Padre nombre="Padre" listo={i.padres.includes('padre')} />
                                            </div>
                                        </td>
                                        <td className="py-3 pr-3 text-[#56627F]">{hace(i.created_at)}</td>
                                        <td className="pr-4 text-[#B9C3DC] group-hover:text-[#1E3A7B]">
                                            <ChevronRight className="size-4" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </PanelLayout>
    );
}
