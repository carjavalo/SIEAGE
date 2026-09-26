import { Esqueleto, FilasEsqueleto } from '@/components/esqueleto';
import { Marca, Resaltado } from '@/components/estudiantes/etiquetas';
import { Tecla, Vacio, td, th } from '@/components/estudiantes/lista-estudiantes';
import { gradoCorto, telefono } from '@/lib/estudiantes';
import { type InscritoFila, hace, nombreInscrito } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { ChevronRight, X } from 'lucide-react';
import { type ReactNode, type RefObject, memo } from 'react';

type Props = {
    /** Llegando otra pestaña: se ven las columnas con filas en esqueleto. */
    cargando: boolean;
    titulo: string;
    /** Grado elegido en el tablero, si hay uno. */
    grado: { id: number; numero: number; nombre: string } | undefined;
    filas: InscritoFila[];
    /** Inscritos en el alcance (pestaña y grado), antes del filtro de texto. */
    alcance: InscritoFila[];
    buscadas: string[];
    conSituacion: boolean;
    seleccion: number | null;
    lista: RefObject<HTMLDivElement | null>;
    vacio: ReactNode;
    onQuitarGrado: () => void;
    onQuitarFiltros: () => void;
    onFila: (id: number) => void;
};

const Cifra = ({ children }: { children: ReactNode }) => <b className="font-semibold text-[#16223F] tabular-nums">{children}</b>;
const Sep = () => (
    <span aria-hidden className="mx-1 text-[#8C97B3]">
        ·
    </span>
);

/** Tercera franja: los inscritos de la pestaña (o del grado elegido). */
export function ListaInscritos(p: Props) {
    const completos = p.alcance.filter((i) => i.padres.length === 2).length;

    return (
        <section
            aria-label="Lista de inscritos"
            aria-busy={p.cargando}
            className="flex min-h-[420px] min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#E3E9F6] bg-white shadow-[0_1px_2px_rgba(22,34,63,0.04),0_12px_32px_-20px_rgba(22,34,63,0.18)] lg:min-h-0"
        >
            <div className="flex shrink-0 flex-col gap-2.5 border-b border-[#EEF2F9] px-4 py-2.5 md:h-[42px] md:flex-row md:items-center md:gap-4 md:px-5 md:py-0 [@media(min-height:860px)]:md:h-12">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 md:flex-nowrap">
                    {p.grado ? (
                        <>
                            <button
                                type="button"
                                onClick={p.onQuitarGrado}
                                title="Ver todos los grados"
                                className="cursor-pointer text-[16px] font-semibold tracking-[-0.01em] whitespace-nowrap text-[#56627F] transition hover:text-[#1E3A7B]"
                            >
                                {p.titulo}
                            </button>
                            <ChevronRight className="size-4 shrink-0 text-[#8C97B3]" />
                            <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#EEF2FB] pr-1 pl-3 text-[14px] text-[#1E3A7B] ring-1 ring-[#D3DDF3]">
                                <span className="font-semibold">{gradoCorto(p.grado)}</span>
                                <span className="text-[#3E4A68]">· {p.grado.nombre}</span>
                                <button
                                    type="button"
                                    onClick={p.onQuitarGrado}
                                    aria-label="Quitar el filtro de grado"
                                    title="Ver todos los grados"
                                    className="flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-white"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </span>
                        </>
                    ) : (
                        <h2 className="text-[16px] font-semibold tracking-[-0.01em] whitespace-nowrap">{p.titulo}</h2>
                    )}
                    {p.cargando ? (
                        <Esqueleto className="h-3 w-52" />
                    ) : (
                        p.alcance.length > 0 && (
                            <p className="min-w-0 text-[14px] text-[#56627F] md:truncate">
                                <Cifra>{p.alcance.length}</Cifra> inscrito{p.alcance.length === 1 ? '' : 's'}
                                <Sep />
                                <Cifra>{completos}</Cifra> con madre y padre
                                {completos < p.alcance.length && (
                                    <>
                                        <Sep />
                                        <Cifra>{p.alcance.length - completos}</Cifra> por completar
                                    </>
                                )}
                            </p>
                        )
                    )}
                </div>

                <p
                    className={cn(
                        'ml-auto hidden shrink-0 items-center gap-1.5 text-[12px] text-[#5E6983]',
                        (p.filas.length > 0 || p.cargando) && 'xl:flex',
                    )}
                >
                    <Tecla>↑</Tecla>
                    <Tecla>↓</Tecla>
                    <span>moverse</span>
                    <Tecla className="ml-1.5 px-1">Enter</Tecla>
                    <span>ver ficha</span>
                </p>
            </div>

            <div
                ref={p.lista}
                className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:#C4D2F1_transparent] [scrollbar-width:thin]"
            >
                {(p.filas.length > 0 || p.cargando) && (
                    <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                        <thead>
                            <tr>
                                <th scope="col" className={cn(th, 'hidden w-12 pr-2 pl-5 text-right sm:table-cell')}>
                                    <span className="sr-only">Número</span>#
                                </th>
                                <th scope="col" className={cn(th, 'max-sm:pl-4')}>
                                    Estudiante
                                </th>
                                <th scope="col" className={cn(th, 'hidden w-[172px] md:table-cell')}>
                                    Documento
                                </th>
                                <th scope="col" className={cn(th, 'w-[112px]')}>
                                    Ingresa a
                                </th>
                                <th scope="col" className={cn(th, 'hidden lg:table-cell')}>
                                    Acudiente
                                </th>
                                <th scope="col" className={cn(th, 'hidden w-[136px] sm:table-cell')}>
                                    Teléfono
                                </th>
                                <th scope="col" className={cn(th, 'w-[150px]')}>
                                    Madre y padre
                                </th>
                                <th scope="col" className={cn(th, 'hidden w-[120px] md:table-cell', !p.conSituacion && 'pr-5')}>
                                    Enviada
                                </th>
                                {p.conSituacion && (
                                    <th scope="col" className={cn(th, 'w-[120px] pr-5')}>
                                        Situación
                                    </th>
                                )}
                            </tr>
                        </thead>
                        {p.cargando ? (
                            <FilasEsqueleto
                                celdas={[
                                    { clase: cn(td, 'hidden pr-2 pl-5 text-right sm:table-cell'), barra: 'ml-auto w-4' },
                                    { clase: cn(td, 'max-sm:pl-4') },
                                    { clase: cn(td, 'hidden md:table-cell'), barra: 'w-28' },
                                    { clase: td, barra: 'w-16' },
                                    { clase: cn(td, 'hidden lg:table-cell') },
                                    { clase: cn(td, 'hidden sm:table-cell'), barra: 'w-24' },
                                    { clase: td, barra: 'w-28' },
                                    { clase: cn(td, 'hidden md:table-cell', !p.conSituacion && 'pr-5'), barra: 'w-16' },
                                    ...(p.conSituacion ? [{ clase: cn(td, 'pr-5'), barra: 'w-20' }] : []),
                                ]}
                            />
                        ) : (
                            <tbody>
                                {p.filas.map((i, n) => (
                                    <Fila
                                        key={i.id}
                                        inscrito={i}
                                        indice={n}
                                        elegida={i.id === p.seleccion}
                                        buscadas={p.buscadas}
                                        conSituacion={p.conSituacion}
                                        onFila={p.onFila}
                                    />
                                ))}
                            </tbody>
                        )}
                    </table>
                )}
                {p.filas.length === 0 &&
                    !p.cargando &&
                    (p.alcance.length === 0 ? (
                        p.vacio
                    ) : (
                        <Vacio
                            titulo="Nadie coincide con la búsqueda"
                            texto="Prueba con otro nombre o número de documento."
                            onQuitar={p.onQuitarFiltros}
                        />
                    ))}
            </div>
        </section>
    );
}

/** Memorizada: al recorrer con ↑ ↓ solo se vuelven a pintar la fila que se deja y la que se elige. */
const Fila = memo(function Fila({
    inscrito: i,
    indice,
    elegida,
    buscadas,
    conSituacion,
    onFila,
}: {
    inscrito: InscritoFila;
    indice: number;
    elegida: boolean;
    buscadas: string[];
    conSituacion: boolean;
    onFila: (id: number) => void;
}) {
    const celda = cn(td, elegida ? 'bg-[#EEF2FB]' : 'group-hover:bg-[#F7F9FD]');

    return (
        <tr
            data-fila={i.id}
            tabIndex={elegida ? 0 : -1}
            aria-selected={elegida}
            onClick={() => onFila(i.id)}
            className="group cursor-pointer scroll-mt-[30px] outline-none [@media(min-height:860px)]:scroll-mt-9"
        >
            <td
                className={cn(
                    celda,
                    'hidden pr-2 pl-5 text-right sm:table-cell',
                    elegida && 'shadow-[inset_3px_0_0_#1E3A7B]',
                    'group-focus-visible:shadow-[inset_3px_0_0_#1E3A7B]',
                )}
            >
                <span className="text-[13px] text-[#5E6983] tabular-nums">{indice + 1}</span>
            </td>
            <td className={cn(celda, 'max-sm:pl-4')}>
                <span className={cn('block truncate font-medium', elegida ? 'text-[#1E3A7B]' : 'text-[#16223F]')} title={nombreInscrito(i)}>
                    <Resaltado texto={nombreInscrito(i)} buscadas={buscadas} />
                </span>
            </td>
            <td className={cn(celda, 'hidden md:table-cell')}>
                <span className="whitespace-nowrap text-[#3E4A68] tabular-nums">
                    <span className="mr-1.5 text-[13px] text-[#56627F]">{i.tipo_documento}</span>
                    <Resaltado texto={i.numero_documento} buscadas={buscadas} />
                </span>
            </td>
            <td className={celda}>
                <span className="block truncate text-[#16223F]" title={i.grado}>
                    <b className="mr-1.5 font-semibold tabular-nums">{i.grupo_asignado ?? gradoCorto({ numero: i.grado_numero })}</b>
                    <span className="text-[13px] text-[#56627F]">{i.grado}</span>
                </span>
            </td>
            <td className={cn(celda, 'hidden lg:table-cell')}>
                <span className="block truncate text-[#3E4A68]">
                    <Resaltado texto={`${i.acudiente_primer_nombre} ${i.acudiente_primer_apellido}`} buscadas={buscadas} />
                    <span className="text-[13px] text-[#5E6983]"> · {i.parentesco}</span>
                </span>
            </td>
            <td className={cn(celda, 'hidden sm:table-cell')}>
                <a
                    href={`tel:${i.acudiente_telefono_1}`}
                    onClick={(ev) => ev.stopPropagation()} // llamar no cambia de inscrito
                    className="whitespace-nowrap text-[#3E4A68] tabular-nums decoration-[#8C97B3] underline-offset-4 hover:text-[#1E3A7B] hover:underline"
                >
                    {telefono(i.acudiente_telefono_1)}
                </a>
            </td>
            <td className={celda}>
                <span className="flex gap-3">
                    <Registro nombre="Madre" listo={i.padres.includes('madre')} />
                    <Registro nombre="Padre" listo={i.padres.includes('padre')} />
                </span>
            </td>
            <td className={cn(celda, 'hidden truncate text-[#56627F] md:table-cell', !conSituacion && 'pr-5')}>{hace(i.created_at)}</td>
            {conSituacion && (
                <td className={cn(celda, 'pr-5')}>
                    <Marca valor={i.estado} />
                </td>
            )}
        </tr>
    );
});

/** Si ya se registró la madre o el padre: punto verde; si falta, un aro gris. */
function Registro({ nombre, listo }: { nombre: string; listo: boolean }) {
    return (
        <span
            className={cn('inline-flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap', listo ? 'text-[#1C6B4A]' : 'text-[#5E6983]')}
            title={listo ? `${nombre}: registrado` : `${nombre}: falta completar`}
        >
            <span aria-hidden className={cn('size-1.5 rounded-full', listo ? 'bg-[#3BA67A]' : 'ring-1 ring-[#AEB7CC] ring-inset')} />
            {nombre}
            <span className="sr-only">{listo ? ' registrado' : ' sin registrar'}</span>
        </span>
    );
}
